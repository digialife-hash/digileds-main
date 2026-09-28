import * as store from "../services/data-repository.js";
import {
  DEMO_DISABLE_NETWORK_EGRESS,
  PUBLIC_DEMO_HOST,
} from "../config/environment.js";
import { generateDemoId, slugify } from "../utils/file-and-project-utils.js";
import {
  buildProjectImage,
  containerIsolationArgs,
  getNextFreePort,
  isAlreadyRemovedDockerResource,
  runDocker,
  verifyContainerRunning,
  inspectContainerStatus,
} from "../services/docker-service.js";
import {
  generateCredentials,
  provisionCredentials,
} from "../services/demo-access.js";
import { destroyDemo } from "../services/demo-lifecycle.js";
import { findProject } from "../services/project-discovery.js";
import { increment } from "../services/metrics.js";

const asDemo = (demo, containerHealth) => ({
  id: demo.demoId,
  projectId: demo.projectId,
  projectName: demo.projectName,
  projectType: demo.projectType,
  url: `${PUBLIC_DEMO_HOST}/d/${demo.demoId}/`,
  createdAt: new Date(demo.createdAt).toISOString(),
  expiresAt: new Date(demo.expiresAt).toISOString(),
  durationMinutes:
    demo.durationMinutes ||
    Math.max(1, Math.round((demo.expiresAt - demo.createdAt) / 60000)),
  status: Date.now() >= demo.expiresAt ? "expired" : demo.status,
  hostPort: demo.hostPort,
  accessUsername: demo.accessUsername || null,
  accessConfigured: Boolean(demo.accessUsername && demo.accessPasswordHash),
  passwordAvailable: false,
  credentialVersion: demo.credentialVersion,
  containerHealth: containerHealth || { status: "unknown", health: "unknown" },
});

function parseDurationMinutes(value) {
  const durationMinutes =
    value === undefined || value === null || value === "" ? 60 : Number(value);
  if (
    !Number.isInteger(durationMinutes) ||
    durationMinutes < 1 ||
    durationMinutes > 10080
  ) {
    const error = new Error(
      "durationMinutes must be an integer between 1 and 10080.",
    );
    error.statusCode = 400;
    throw error;
  }
  return durationMinutes;
}

export async function createDemo(req, res) {
  try {
    const { projectId } = req.body || {};
    const durationMinutes = parseDurationMinutes(req.body?.durationMinutes);
    if (!projectId)
      return res
        .status(400)
        .json({ success: false, message: "projectId is required" });

    const project = await findProject(projectId);
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });

    const demo = await createDemoForProject(project, durationMinutes, req.tenantId);
    res.status(201).json({
      success: true,
      demo: {
        id: demo.demoId,
        projectId: demo.projectId,
        projectName: demo.projectName,
        projectType: demo.projectType,
        url: `${PUBLIC_DEMO_HOST}/d/${demo.demoId}/`,
        expiresAt: new Date(demo.expiresAt).toISOString(),
        durationMinutes: demo.durationMinutes,
        accessUsername: demo.accessUsername || null,
        credentialVersion: demo.credentialVersion,
        credentials: demo.credentials
          ? {
              username: demo.credentials.username,
              password: demo.credentials.password,
            }
          : undefined,
      },
    });
    await store.audit("create_response", {
      demoId: demo.demoId,
      projectId: demo.projectId,
      requestId: req.requestId,
    });
    increment("demo_manager_creates_total");
  } catch (error) {
    console.error("CREATE DEMO ERROR:", error);
    const statusCode =
      error.statusCode ||
      (error.code === "DOCKER_UNAVAILABLE"
        ? 503
        : /docker|container|image|network|port/i.test(error.message || "")
          ? 503
          : 500);
    res
      .status(statusCode)
      .json({
        success: false,
        message:
          statusCode === 503
            ? "Demo runtime is unavailable. Check Docker, image build, and container logs."
            : "Unable to create demo",
        error: error.message,
      });
  }
}

export async function updateDemoDuration(req, res) {
  const durationMinutes = parseDurationMinutes(req.body?.durationMinutes);
  const demo = await store.getActiveDemo(req.params.id, req.tenantId);
  if (!demo) {
    return res
      .status(404)
      .json({ success: false, message: "Demo not found or expired" });
  }

  const updated = await store.updateDemoExpiry(
    req.params.id,
    Date.now() + durationMinutes * 60 * 1000,
    durationMinutes,
    req.tenantId,
  );
  await store.audit("extend", {
    demoId: req.params.id,
    metadata: { durationMinutes },
    requestId: req.requestId,
  });
  return res.json({
    success: true,
    demo: {
      id: updated.demoId,
      expiresAt: new Date(updated.expiresAt).toISOString(),
      durationMinutes: updated.durationMinutes,
    },
  });
}

export async function getDemo(req, res) {
  const demo = await store.getActiveDemo(req.params.id, req.tenantId);
  if (!demo)
    return res
      .status(404)
      .json({ success: false, message: "Demo not found or expired" });
  if (Date.now() >= demo.expiresAt)
    return res.status(410).json({ success: false, message: "Demo expired" });

  return res.json({
    success: true,
    demo: asDemo(demo, await inspectContainerStatus(demo.appContainer)),
  });
}

export async function deleteDemo(req, res) {
  try {
    const demo = await store.getActiveDemo(req.params.id, req.tenantId);
    if (!demo)
      return res
        .status(404)
        .json({ success: false, message: "Demo not found" });

    const cleanupErrors = await destroyDemo(demo);
    if (cleanupErrors.length) {
      return res.status(500).json({
        success: false,
        message: "Demo resources could not be fully cleaned up.",
        error: cleanupErrors.join("; "),
      });
    }
    await store.deleteDemoRecord(req.params.id);
    await store.audit("delete", {
      demoId: req.params.id,
      requestId: req.requestId,
    });
    return res.json({ success: true, message: "Demo destroyed" });
  } catch (error) {
    console.error("DELETE DEMO ERROR:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to destroy demo",
        error: error.message,
      });
  }
}

export async function listDemos(req, res) {
  const demos = [];
  const activeDemos = await store.listActiveDemos(req.tenantId);
  for (const demo of activeDemos) {
    const status = await inspectContainerStatus(demo.appContainer);
    demos.push(asDemo(demo, status));
  }
  return res.json({ success: true, count: demos.length, demos });
}

export async function listPublicDemos(req, res) {
  const demos = [];
  const activeDemos = await store.listActiveDemos(req.tenantId);

  for (const demo of activeDemos) {
    const status = await inspectContainerStatus(demo.appContainer);
    const publicDemo = asDemo(demo, status);
    const project = await findProject(demo.projectId);
    const projectVideo = project?.video;

    if (projectVideo) {
      const videoUrl =
        projectVideo.url ||
        `/api/demo-proxy/projects/${encodeURIComponent(demo.projectId)}/video`;

      publicDemo.videoUrl = videoUrl;
      publicDemo.video = {
        url: videoUrl,
        filename: projectVideo.filename || "",
        mimeType: projectVideo.mimeType || "video/mp4",
      };
    }

    delete publicDemo.accessUsername;
    delete publicDemo.accessConfigured;
    delete publicDemo.passwordAvailable;
    demos.push(publicDemo);
  }

  return res.json({ success: true, count: demos.length, demos });
}

export async function getAuditLogs(req, res) {
  return res.json({
    success: true,
    logs: await store.listAuditLogs(req.query.limit),
  });
}

async function createDemoForProject(project, durationMinutes, tenantId) {
  const reusableDemo = await store.getLatestActiveDemo(project.id, tenantId);
  if (reusableDemo && Date.now() < reusableDemo.expiresAt) {
    try {
      const running = await runDocker([
        "ps",
        "-q",
        "--filter",
        `name=^${reusableDemo.appContainer}$`,
      ]);
      if (running) {
        const refreshed = await store.updateDemoExpiry(
          reusableDemo.demoId,
          Date.now() + durationMinutes * 60 * 1000,
          durationMinutes,
        );
        if (reusableDemo.accessUsername && reusableDemo.accessPasswordHash)
          return refreshed;
        const credentials = generateCredentials();
        return {
          ...(await provisionCredentials(
            reusableDemo.demoId,
            credentials.username,
            credentials.password,
            tenantId,
          )),
          ...refreshed,
          credentials,
        };
      }
    } catch (error) {
      console.error("ACTIVE DEMO CHECK ERROR:", error.message);
    }
  }

  const demoId = generateDemoId();
  const safeProjectId = slugify(project.id);
  const appContainer = `demo_app_${safeProjectId}_${demoId}`;
  const networkName = `demo_net_${demoId}`;
  const mongoContainer = `demo_mongo_${safeProjectId}_${demoId}`;
  const mongoDbName = `demo_${safeProjectId}_${demoId}`;
  const partial = { appContainer, mongoContainer: null, networkName: null };

  try {
    const imageName = await buildProjectImage(project);
    const hostPort = await getNextFreePort();
    if (project.type === "fullstack") {
      await runDocker([
        "network",
        "create",
        ...(DEMO_DISABLE_NETWORK_EGRESS ? ["--internal"] : []),
        networkName,
      ]);
      partial.networkName = networkName;
      await runDocker([
        "run",
        "-d",
        ...containerIsolationArgs(),
        "--name",
        mongoContainer,
        "--network",
        networkName,
        "--label",
        "demo=true",
        "--label",
        `demo_id=${demoId}`,
        "--label",
        `project_id=${safeProjectId}`,
        "mongo:8",
      ]);
      partial.mongoContainer = mongoContainer;
    }

    const containerPort =
      project.type === "fullstack" ||
      project.type === "node" ||
      project.type === "python"
        ? 5000
        : project.type === "java"
          ? 8080
          : 80;
    const dockerArgs = [
      "run",
      "-d",
      ...containerIsolationArgs(),
      "--name",
      appContainer,
      "-p",
      `127.0.0.1:${hostPort}:${containerPort}`,
      "--label",
      "demo=true",
      "--label",
      `demo_id=${demoId}`,
      "--label",
      `project_id=${safeProjectId}`,
    ];
    if (project.type === "fullstack")
      dockerArgs.push(
        "--network",
        networkName,
        "-e",
        "PORT=5000",
        "-e",
        `MONGO_URI=mongodb://${mongoContainer}:27017/${mongoDbName}`,
      );
    else if (project.type === "node" || project.type === "python")
      dockerArgs.push("-e", "PORT=5000");
    else if (DEMO_DISABLE_NETWORK_EGRESS) dockerArgs.push("--network", "none");
    dockerArgs.push(imageName);

    await runDocker(dockerArgs);
    await verifyContainerRunning(appContainer);
    const createdAt = Date.now();
    const record = {
      demoId,
      projectId: project.id,
      projectName: project.name,
      projectType: project.type,
      appContainer,
      mongoContainer: partial.mongoContainer,
      networkName: partial.networkName,
      hostPort,
      createdAt,
      durationMinutes,
      expiresAt: createdAt + durationMinutes * 60 * 1000,
      tenantId,
    };
    await store.insertDemo(record);
    const credentials = generateCredentials();
    const stored = await provisionCredentials(
      demoId,
      credentials.username,
      credentials.password,
      tenantId,
    );
    await store.audit("create", {
      demoId,
      projectId: project.id,
      metadata: { projectType: project.type },
    });
    console.log(
      "DEMO CREATED:",
      project.name,
      "| PORT:",
      hostPort,
      "| URL:",
      `${PUBLIC_DEMO_HOST}/d/${demoId}/`,
    );
    return { ...stored, credentials };
  } catch (error) {
    const cleanupErrors = await destroyDemo(partial);
    if (cleanupErrors.length)
      error.message += ` Cleanup incomplete: ${cleanupErrors.join("; ")}`;
    throw error;
  }
}
