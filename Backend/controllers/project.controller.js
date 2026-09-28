import { createRequire } from "module";
import { statfs } from "fs/promises";
import {
  ALWAYS_EXCLUDE_GLOBS,
  DISK_MIN_FREE_BYTES,
  PROJECT_META_FILE,
  PROJECT_ROOT,
  PUBLIC_DEMO_HOST,
  VALID_PROJECT_TYPES,
} from "../config/environment.js";
import {
  fs,
  path,
  findFileCaseInsensitive,
} from "../utils/file-and-project-utils.js";
import {
  discoverProjects,
  findProject,
  readProjectMeta,
  writeProjectMeta,
} from "../services/project-discovery.js";
import {
  persistProjectVideo,
  projectUpload,
  removeProjectVideo,
  uploadProject,
} from "../services/project-upload.js";
import {
  destroyDemosForProject,
  createDemo,
} from "../services/demo-lifecycle.js";
import {
  isAlreadyRemovedDockerResource,
  runDocker,
} from "../services/docker-service.js";
import * as store from "../services/data-repository.js";

const require = createRequire(import.meta.url);
const archiverModule = require("archiver");
const archiver =
  typeof archiverModule === "function"
    ? archiverModule
    : archiverModule.default;

export async function listProjects(_req, res) {
  try {
    const projects = await discoverProjects();
    
    return res.json({
      success: true,
      count: projects.length,
      projects: projects.map(({ path: projectPath, ...project }) => project),
    });
  } catch (error) {
    console.error("PROJECT DISCOVERY ERROR:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Unable to discover projects",
        error: error.message,
      });
  }
}

export async function getProjectVideo(req, res) {
  try {
    const project = await findProject(req.params.id);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    const meta = await readProjectMeta(project.path);
    const videoMeta = meta?.video;
    if (!videoMeta || videoMeta.storage !== "local" || !videoMeta.path) {
      return res
        .status(404)
        .json({ success: false, message: "Project video not found" });
    }

    const videoPath = path.resolve(project.path, videoMeta.path);
    if (!videoPath.startsWith(project.path)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid video path" });
    }

    return res.sendFile(videoPath);
  } catch (error) {
    console.error("PROJECT VIDEO ERROR:", error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to read project video" });
  }
}

export async function replaceProjectVideo(req, res) {
  try {
    const project = await findProject(req.params.id);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }
    if (!req.file || !req.file.mimetype.startsWith("video/")) {
      return res
        .status(400)
        .json({ success: false, message: "Please upload a valid video file." });
    }

    await removeProjectVideo(project.path);
    const meta = await readProjectMeta(project.path);
    const newVideo = await persistProjectVideo(
      project.path,
      req.file,
      String(req.body?.videoStorage || "local"),
    );
    const nextMeta = { ...(meta || {}), video: newVideo };
    await writeProjectMeta(project.path, nextMeta);

    return res.json({
      success: true,
      message: "Project video updated successfully.",
      video: newVideo,
    });
  } catch (error) {
    console.error("REPLACE PROJECT VIDEO ERROR:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: error.message || "Failed to replace project video",
      });
  }
}

export async function updateProjectType(req, res) {
  try {
    const requestedType = String(req.body?.type || "").trim();
    if (!VALID_PROJECT_TYPES.includes(requestedType)) {
      return res
        .status(400)
        .json({
          success: false,
          message: `Invalid type. Allowed: ${VALID_PROJECT_TYPES.join(", ")}`,
        });
    }

    const project = await findProject(req.params.id);
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });

    if (requestedType === "auto")
      await fs.rm(path.join(project.path, PROJECT_META_FILE), { force: true });
    else await writeProjectMeta(project.path, { type: requestedType });

    if (requestedType !== "docker" && requestedType !== "fullstack") {
      const generatedDockerfile = await findFileCaseInsensitive(
        project.path,
        "Dockerfile",
      );
      if (generatedDockerfile)
        await fs.rm(generatedDockerfile, { force: true });
    }

    await store.audit("project_type_change", {
      projectId: project.id,
      requestId: req.requestId,
      metadata: { type: requestedType },
    });

    let warning = "";
    try {
      await runDocker(["image", "rm", "-f", `${project.id}-demo:latest`]);
    } catch (error) {
      if (!isAlreadyRemovedDockerResource(error))
        warning = ` Cached image cleanup failed: ${error.message}`;
    }

    return res.json({
      success: true,
      message:
        "Project type updated. Next 'View Live Demo' click will rebuild it fresh.",
      warning: warning || undefined,
    });
  } catch (error) {
    console.error("UPDATE PROJECT TYPE ERROR:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to update project type",
        error: error.message,
      });
  }
}

export async function deleteProjectVideo(req, res) {
  try {
    const project = await findProject(req.params.id);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    const removed = await removeProjectVideo(project.path);
    return res.json({
      success: true,
      removed,
      message: removed
        ? "Project video removed successfully."
        : "No project video was found to remove.",
    });
  } catch (error) {
    console.error("DELETE PROJECT VIDEO ERROR:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: error.message || "Failed to delete project video",
      });
  }
}

export async function deleteProject(req, res) {
  try {
    const project = await findProject(req.params.id);
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });

    const cleanupResult = await destroyDemosForProject(project.id);
    if (cleanupResult.cleanupErrors.length)
      return res
        .status(500)
        .json({
          success: false,
          message: "Project demos could not be fully cleaned up",
          error: cleanupResult.cleanupErrors.join("; "),
        });

    let warning = "";
    try {
      await runDocker(["image", "rm", "-f", `${project.id}-demo:latest`]);
    } catch (error) {
      if (!isAlreadyRemovedDockerResource(error))
        warning = ` Cached image cleanup failed: ${error.message}`;
    }

    await removeProjectVideo(project.path);
    await fs.rm(project.path, { recursive: true, force: true });
    await store.audit("project_delete", {
      projectId: project.id,
      requestId: req.requestId,
    });

    return res.json({
      success: true,
      message:
        cleanupResult.count > 0
          ? `"${project.name}" deleted (${cleanupResult.count} active demo bhi band kiya gaya)`
          : `"${project.name}" deleted`,
      warning: warning || undefined,
    });
  } catch (error) {
    console.error("DELETE PROJECT ERROR:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete project",
        error: error.message,
      });
  }
}

export async function downloadProject(req, res) {
  try {
    const project = await findProject(req.params.id);
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });

    res.attachment(`${project.folder}.zip`);
    res.setHeader("Content-Type", "application/zip");
    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.on("error", (error) =>
      res.headersSent
        ? res.destroy(error)
        : res
            .status(500)
            .json({
              success: false,
              message: "Failed to build zip",
              error: error.message,
            }),
    );
    archive.pipe(res);
    archive.glob("**/*", {
      cwd: project.path,
      dot: true,
      ignore: [...ALWAYS_EXCLUDE_GLOBS, PROJECT_META_FILE],
    });
    await archive.finalize();
  } catch (error) {
    console.error("DOWNLOAD PROJECT ERROR:", error);
    if (!res.headersSent)
      return res
        .status(500)
        .json({
          success: false,
          message: "Failed to download project",
          error: error.message,
        });
  }
}

export { projectUpload, uploadProject };
