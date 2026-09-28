import * as store from "./data-repository.js";
import {
  DEMO_DURATION_MS,
  DEMO_DISABLE_NETWORK_EGRESS,
  IMAGE_RECENT_HOURS,
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
} from "./docker-service.js";
import { generateCredentials, provisionCredentials } from "./demo-access.js";

export async function destroyDemo(demo) {
  const cleanupErrors = [];
  const remove = async (args, label) => {
    try {
      await runDocker(args);
    } catch (error) {
      if (!isAlreadyRemovedDockerResource(error)) {
        cleanupErrors.push(`${label}: ${error.message}`);
        console.error(`CLEANUP ${label}:`, error.message);
      }
    }
  };
  if (demo.appContainer)
    await remove(["rm", "-f", "-v", demo.appContainer], "app");
  if (demo.mongoContainer)
    await remove(["rm", "-f", "-v", demo.mongoContainer], "mongo");
  if (demo.networkName)
    await remove(["network", "rm", demo.networkName], "network");
  return cleanupErrors;
}

export async function cleanupExpiredDemos() {
  for (const demo of await store.listExpiredDemos(Date.now())) {
    const cleanupErrors = await destroyDemo(demo);
    if (cleanupErrors.length === 0) await store.markDestroyed(demo.demoId);
    else
      console.error(
        "Cleanup incomplete:",
        demo.demoId,
        cleanupErrors.join("; "),
      );
  }
}

export async function destroyDemosForProject(projectId) {
  const activeDemos = (await store.listActiveDemos()).filter(
    (demo) => demo.projectId === projectId,
  );
  const cleanupErrors = [];
  let count = 0;
  for (const demo of activeDemos) {
    const errors = await destroyDemo(demo);
    if (errors.length === 0) {
      count += 1;
    } else cleanupErrors.push(`${demo.demoId}: ${errors.join("; ")}`);
  }
  if (cleanupErrors.length === 0) {
    await store.deleteDemoRecordsForProject(projectId);
  }
  return { count, cleanupErrors };
}

export async function reconcileOnBoot() {
  console.log("Reconciling demo state with Docker on boot...");
  let dockerDemoContainers = [];
  try {
    const stdout = await runDocker([
      "ps",
      "-a",
      "--filter",
      "label=demo=true",
      "--format",
      "{{.Names}}",
    ]);
    dockerDemoContainers = stdout ? stdout.split("\n").filter(Boolean) : [];
  } catch (error) {
    console.error("Could not list docker demo containers:", error.message);
    return;
  }
  const dbDemos = await store.listActiveDemos();
  const dbAppContainers = new Set(dbDemos.map((demo) => demo.appContainer));
  for (const containerName of dockerDemoContainers) {
    if (!dbAppContainers.has(containerName)) {
      try {
        await runDocker(["rm", "-f", "-v", containerName]);
      } catch (error) {
        console.error("Orphan cleanup failed:", error.message);
      }
    }
  }
  for (const demo of dbDemos) {
    if (!dockerDemoContainers.includes(demo.appContainer)) {
      const cleanupErrors = await destroyDemo(demo);
      if (cleanupErrors.length === 0) await store.markDestroyed(demo.demoId);
      else
        console.error(
          "Stale demo cleanup incomplete:",
          demo.demoId,
          cleanupErrors.join("; "),
        );
    }
  }
  await cleanupExpiredDemos();
  console.log("Reconciliation complete.");
}

export async function createDemo(project) {
  const reusableDemo = await store.getLatestActiveDemo(project.id);
  if (reusableDemo && Date.now() < reusableDemo.expiresAt) {
    try {
      const running = await runDocker([
        "ps",
        "-q",
        "--filter",
        `name=^${reusableDemo.appContainer}$`,
      ]);
      if (running) {
        if (reusableDemo.accessUsername && reusableDemo.accessPasswordHash)
          return reusableDemo;
        const credentials = generateCredentials();
        return {
          ...(await provisionCredentials(
            reusableDemo.demoId,
            credentials.username,
            credentials.password,
          )),
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
      expiresAt: createdAt + DEMO_DURATION_MS,
    };
    await store.insertDemo(record);
    const credentials = generateCredentials();
    const stored = await provisionCredentials(
      demoId,
      credentials.username,
      credentials.password,
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

export async function cleanupUnusedImages() {
  const cutoff = Date.now() - IMAGE_RECENT_HOURS * 60 * 60 * 1000;
  const activeProjects = new Set(
    (await store.listActiveDemos()).map(
      (demo) => `${demo.projectId}-demo:latest`,
    ),
  );
  let images = "";
  try {
    images = await runDocker([
      "images",
      "--filter",
      "label=demo-manager=true",
      "--format",
      "{{.Repository}}:{{.Tag}}|{{.CreatedAt}}",
    ]);
  } catch (error) {
    if (error.code !== "DOCKER_UNAVAILABLE") throw error;
    return;
  }
  for (const line of images.split("\n").filter(Boolean)) {
    const [image] = line.split("|");
    if (!image || activeProjects.has(image)) continue;
    try {
      const created = await runDocker([
        "image",
        "inspect",
        image,
        "--format",
        "{{.Created}}",
      ]);
      if (Date.parse(created) < cutoff) await runDocker(["image", "rm", image]);
    } catch (error) {
      if (!isAlreadyRemovedDockerResource(error))
        console.error("Image cleanup skipped:", image, error.message);
    }
  }
}
