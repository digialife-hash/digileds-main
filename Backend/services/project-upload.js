import crypto from "crypto";
import multer from "multer";
import { createRequire } from "module";
import { lookup as lookupMimeType } from "mime-types";

import {
  fs,
  path,
  moveFile,
  normalizeUploadPath,
  removeUploadedFiles,
  extractZipTo,
  normalizedIgnoredFolders,
  validateZipArchive,
} from "../utils/file-and-project-utils.js";

import {
  PROJECT_ROOT,
  UPLOAD_MAX_BYTES,
  UPLOAD_SCAN_COMMAND,
  UPLOAD_TEMP_DIR,
  SITE_ASSET_MAX_BYTES,
  VALID_PROJECT_TYPES,
} from "../config/environment.js";

import {
  findProjectDirectoryCaseInsensitive,
  readProjectMeta,
  writeProjectMeta,
} from "./project-discovery.js";

import { scanBuffer, scanFile } from "./upload-security.js";

import * as store from "./data-repository.js";

import { increment } from "./metrics.js";

const require = createRequire(import.meta.url);

const AdmZip = require("adm-zip");

export const projectUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => {
      (async () => {
        try {
          await fs.mkdir(UPLOAD_TEMP_DIR, { recursive: true });
          callback(null, UPLOAD_TEMP_DIR);
        } catch (error) {
          callback(error);
        }
      })();
    },

    filename: (_req, file, callback) => {
      callback(
        null,
        `${crypto.randomUUID()}-${path.basename(file.originalname)}`,
      );
    },
  }),

  limits: {
    files: 1001,
    fileSize: UPLOAD_MAX_BYTES,
  },
});

const allowedAssetMimeTypes = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
  "image/x-icon",
  "image/vnd.microsoft.icon",
  "video/mp4",
  "video/webm",
]);

const allowedAssetExtensions = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".svg",
  ".ico",
  ".mp4",
  ".webm",
]);

export const assetUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => {
      (async () => {
        try {
          await fs.mkdir(UPLOAD_TEMP_DIR, { recursive: true });
          callback(null, UPLOAD_TEMP_DIR);
        } catch (error) {
          callback(error);
        }
      })();
    },
    filename: (_req, file, callback) => {
      callback(
        null,
        `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`,
      );
    },
  }),
  limits: {
    fileSize: SITE_ASSET_MAX_BYTES,
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (
      allowedAssetMimeTypes.has(file.mimetype.toLowerCase()) &&
      allowedAssetExtensions.has(extension)
    ) {
      callback(null, true);
      return;
    }

    callback(
      new Error(
        "Only PNG, JPEG, WebP, SVG, ICO, MP4, and WebM files are allowed.",
      ),
    );
  },
});

function sanitizeVideoName(input) {
  const base = String(input || "project-video").trim() || "project-video";

  const sanitized = path.basename(base).replace(/[^a-zA-Z0-9._-]+/g, "-");

  return sanitized || "project-video";
}

function getVideoContentType(filename, fallback = "video/mp4") {
  const mime = lookupMimeType(filename || "");

  if (typeof mime === "string" && mime.startsWith("video/")) {
    return mime;
  }

  return fallback;
}

function getLocalVideoPath(projectPath, relativeVideoPath) {
  if (!projectPath || !relativeVideoPath) {
    return null;
  }

  const projectRoot = path.resolve(projectPath);

  const videoPath = path.resolve(projectRoot, relativeVideoPath);

  if (
    videoPath !== projectRoot &&
    !videoPath.startsWith(`${projectRoot}${path.sep}`)
  ) {
    return null;
  }

  return videoPath;
}

function getProjectIdFromPath(projectPath) {
  return path
    .basename(projectPath)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getProjectVideoApiUrl(projectPath) {
  const projectId = getProjectIdFromPath(projectPath);

  return `/api/demo-proxy/projects/${encodeURIComponent(projectId)}/video`;
}

export async function removeProjectVideo(projectPath) {
  const meta = await readProjectMeta(projectPath);

  const currentVideo = meta?.video;

  if (!currentVideo && !meta) {
    return false;
  }

  if (currentVideo?.storage === "cloudinary" && currentVideo.publicId) {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "";

    const apiKey = process.env.CLOUDINARY_API_KEY || "";

    const apiSecret = process.env.CLOUDINARY_API_SECRET || "";

    if (cloudName && apiKey && apiSecret) {
      const timestamp = Math.round(Date.now() / 1000);

      const toSign = `public_id=${currentVideo.publicId}&timestamp=${timestamp}`;

      const signature = crypto
        .createHash("sha1")
        .update(toSign + apiSecret)
        .digest("hex");

      let response = null;
      try {
        response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/video/destroy`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              public_id: currentVideo.publicId,
              api_key: apiKey,
              timestamp: String(timestamp),
              signature,
            }).toString(),
          },
        );
      } catch {
        response = null;
      }

      if (response && !response.ok) {
        let text = "";
        try {
          text = await response.text();
        } catch {
          text = "";
        }

        console.warn(
          `Cloudinary video cleanup warning: ${text || response.status}`,
        );
      }
    }
  }

  const localVideoPath = currentVideo?.path
    ? getLocalVideoPath(projectPath, currentVideo.path)
    : path.join(path.resolve(projectPath), ".project-video");

  if (localVideoPath) {
    try {
      await fs.rm(localVideoPath, {
        recursive: true,
        force: true,
      });
    } catch {
      // Ignore local cleanup issues.
    }
  }

  const nextMeta = {
    ...(meta || {}),
  };

  delete nextMeta.video;

  await writeProjectMeta(projectPath, nextMeta);

  return true;
}

export async function persistProjectVideo(projectPath, videoFile, storageMode) {
  if (!videoFile) {
    return null;
  }

  const mode =
    String(storageMode || "local")
      .trim()
      .toLowerCase() === "cloudinary"
      ? "cloudinary"
      : "local";

  const finalFileName = sanitizeVideoName(
    videoFile.originalname || "project-video",
  );

  const localVideoDir = path.join(projectPath, ".project-video");

  try {
    if (mode === "cloudinary") {
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "";

      const apiKey = process.env.CLOUDINARY_API_KEY || "";

      const apiSecret = process.env.CLOUDINARY_API_SECRET || "";

      if (cloudName && apiKey && apiSecret) {
        const cloudinaryPublicId = `${path.basename(
          projectPath,
        )}-${Date.now()}`;

        const buffer = await fs.readFile(videoFile.path);

        const form = new FormData();

        form.append(
          "file",
          new Blob([buffer], {
            type: videoFile.mimetype || getVideoContentType(finalFileName),
          }),
          finalFileName,
        );

        form.append("public_id", cloudinaryPublicId);

        if (process.env.CLOUDINARY_UPLOAD_PRESET) {
          form.append("upload_preset", process.env.CLOUDINARY_UPLOAD_PRESET);
        }

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
          {
            method: "POST",
            body: form,
            headers: {
              Authorization: `Basic ${Buffer.from(
                `${apiKey}:${apiSecret}`,
              ).toString("base64")}`,
            },
          },
        );

        if (!response.ok) {
          let cloudinaryText = "";
          try {
            cloudinaryText = await response.text();
          } catch {
            cloudinaryText = "";
          }

          throw new Error(
            `Cloudinary upload failed with status ${response.status}${
              cloudinaryText ? `: ${cloudinaryText}` : ""
            }`,
          );
        }

        const uploadResult = await response.json();

        return {
          storage: "cloudinary",

          url: uploadResult.secure_url || uploadResult.url || "",

          publicId: uploadResult.public_id || cloudinaryPublicId,

          filename: finalFileName,

          mimeType: videoFile.mimetype || getVideoContentType(finalFileName),

          size: videoFile.size || 0,
        };
      }

      console.warn(
        "Cloudinary selected but credentials are missing. Falling back to local storage.",
      );
    }

    await fs.mkdir(localVideoDir, {
      recursive: true,
    });

    const localVideoPath = path.join(localVideoDir, finalFileName);

    await moveFile(videoFile.path, localVideoPath);

    return {
      storage: "local",

      path: ".project-video/" + finalFileName,

      filename: finalFileName,

      mimeType: videoFile.mimetype || getVideoContentType(finalFileName),

      size: videoFile.size || 0,

      /*
       * IMPORTANT:
       * This is the same endpoint the frontend uses.
       */
      url: getProjectVideoApiUrl(projectPath),
    };
  } catch (error) {
    try {
      await fs.rm(videoFile.path, {
        force: true,
      });
    } catch {
      // Ignore cleanup errors.
    }

    throw new Error(`Failed to store project video: ${error.message}`);
  }
}

/*

* GET /api/demo-proxy/projects/:projectId/video
*
* This handler should be mounted by the route layer.
* It supports browser video playback and HTTP range requests.
  */
export async function serveProjectVideo(req, res) {
  try {
    const projectId = String(req.params?.projectId || "").trim();

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required.",
      });
    }

    const projectPath = await findProjectDirectoryCaseInsensitive(projectId);

    if (!projectPath) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    const meta = await readProjectMeta(projectPath);

    if (!meta?.video) {
      return res.status(404).json({
        success: false,
        message: "Project video not found.",
      });
    }

    if (meta.video.storage === "cloudinary" && meta.video.url) {
      return res.redirect(meta.video.url);
    }

    const relativeVideoPath = meta.video.path;

    if (typeof relativeVideoPath !== "string" || !relativeVideoPath) {
      return res.status(404).json({
        success: false,
        message: "Local video path is missing.",
      });
    }

    const videoPath = getLocalVideoPath(projectPath, relativeVideoPath);

    if (!videoPath) {
      return res.status(400).json({
        success: false,
        message: "Invalid video path.",
      });
    }

    let stat;

    try {
      stat = await fs.stat(videoPath);
    } catch {
      return res.status(404).json({
        success: false,
        message: "Video file not found.",
      });
    }

    if (!stat.isFile()) {
      return res.status(404).json({
        success: false,
        message: "Video file is invalid.",
      });
    }

    const contentType = meta.video.mimeType || getVideoContentType(videoPath);

    const fileSize = stat.size;

    res.setHeader("Content-Type", contentType);

    res.setHeader("Accept-Ranges", "bytes");

    res.setHeader("Cache-Control", "public, max-age=3600");

    const range = req.headers.range;

    if (!range) {
      res.setHeader("Content-Length", String(fileSize));

      return fs.createReadStream(videoPath).pipe(res);
    }

    const match = /^bytes=(\d*)-(\d*)$/.exec(range);

    if (!match) {
      res.setHeader("Content-Range", `bytes */${fileSize}`);

      return res.status(416).end();
    }

    const start = match[1] ? Number(match[1]) : 0;

    const requestedEnd = match[2] ? Number(match[2]) : fileSize - 1;

    const end = Math.min(requestedEnd, fileSize - 1);

    if (
      Number.isNaN(start) ||
      Number.isNaN(end) ||
      start < 0 ||
      start >= fileSize ||
      end < start
    ) {
      res.setHeader("Content-Range", `bytes */${fileSize}`);

      return res.status(416).end();
    }

    const chunkSize = end - start + 1;

    res.status(206);

    res.setHeader("Content-Range", `bytes ${start}-${end}/${fileSize}`);

    res.setHeader("Content-Length", String(chunkSize));

    return fs
      .createReadStream(videoPath, {
        start,
        end,
      })
      .pipe(res);
  } catch (error) {
    console.error("Project video serve error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to serve project video.",
    });
  }
}

export async function uploadProject(req, res) {
  const uploadedFiles = Array.isArray(req.files)
    ? req.files
    : req.files?.files || [];

  const files = uploadedFiles || [];

  const nestedVideoFiles = req.files?.projectVideo || [];

  const videoFile =
    nestedVideoFiles.find(
      (file) => file && (file.mimetype || "").startsWith("video/"),
    ) || null;

  /*

* Include video temp file in cleanup operations.
  */
  const allTempFiles = videoFile ? [...files, videoFile] : [...files];

  const requestedName = String(req.body?.projectName || "").trim();

  const projectName = path.basename(requestedName);

  const target = path.resolve(PROJECT_ROOT, projectName);

  let relativePaths = null;

  const rejectUpload = async (message, status = 400) => {
    const cleanupErrors = await removeUploadedFiles(allTempFiles);

    const suffix = cleanupErrors.length
      ? ` Upload cleanup failed: ${cleanupErrors.join("; ")}`
      : "";

    return res.status(status).json({
      success: false,
      message: `${message}${suffix}`,
    });
  };

  if (req.body?.relativePaths) {
    try {
      const parsedPaths = JSON.parse(req.body.relativePaths);

      if (
        !Array.isArray(parsedPaths) ||
        parsedPaths.length !== files.length ||
        parsedPaths.some((value) => typeof value !== "string")
      ) {
        return rejectUpload("Invalid upload file paths");
      }

      relativePaths = parsedPaths;
    } catch {
      return rejectUpload("Invalid upload file paths");
    }
  }

  const requestedType = String(req.body?.projectType || "auto").trim();

  const requestedVideoStorage = String(
    req.body?.videoStorage || "local",
  ).trim();

  const projectType = VALID_PROJECT_TYPES.includes(requestedType)
    ? requestedType
    : "auto";

  if (
    !projectName ||
    projectName === "." ||
    projectName === ".." ||
    projectName !== requestedName ||
    normalizedIgnoredFolders.has(projectName.toLowerCase())
  ) {
    return rejectUpload("Invalid project name");
  }

  if (await findProjectDirectoryCaseInsensitive(projectName)) {
    return rejectUpload("A project with this name already exists", 409);
  }

  if (files.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Select a project folder first",
    });
  }

  try {
    await fs.mkdir(PROJECT_ROOT, {
      recursive: true,
    });

    let zipExtracted = false;

    for (const [index, file] of files.entries()) {
      let relativePath = String(
        relativePaths ? relativePaths[index] : file.originalname || "",
      ).replaceAll("\\", "/");

      let safeParts = normalizeUploadPath(relativePath);

      if (
        safeParts.length > 1 &&
        safeParts[0].toLowerCase() === projectName.toLowerCase()
      ) {
        safeParts = safeParts.slice(1);

        relativePath = safeParts.join("/");
      }

      if (safeParts.length === 0) {
        throw new Error(`Unsafe upload path: ${relativePath}`);
      }

      if (safeParts[safeParts.length - 1].toLowerCase().endsWith(".zip")) {
        const zip = new AdmZip(file.path);

        validateZipArchive(file.path, AdmZip);

        const archiveScan = await scanFile(file.path, file.path);

        if (!archiveScan.clean) {
          throw new Error(
            `Upload malware scan rejected archive: ${archiveScan.reason}`,
          );
        }

        for (const entry of zip
          .getEntries()
          .filter((item) => !item.isDirectory)) {
          const scan = await scanBuffer(entry.getData(), entry.entryName, {
            skipHook: true,
          });

          if (!scan.clean) {
            throw new Error(
              `Upload malware scan rejected file: ${scan.reason}`,
            );
          }
        }

        await extractZipTo(file.path, target, AdmZip);

        const cleanupErrors = await removeUploadedFiles([file]);

        if (cleanupErrors.length) {
          throw new Error(`Upload cleanup failed: ${cleanupErrors.join("; ")}`);
        }

        zipExtracted = true;

        continue;
      }

      const scan = await scanFile(file.path, file.originalname);

      if (!scan.clean) {
        throw new Error(`Upload malware scan rejected file: ${scan.reason}`);
      }

      const destination = path.resolve(target, ...safeParts);

      if (
        destination !== target &&
        !destination.startsWith(`${target}${path.sep}`)
      ) {
        throw new Error(`Unsafe upload path: ${relativePath}`);
      }

      await fs.mkdir(path.dirname(destination), {
        recursive: true,
      });

      await moveFile(file.path, destination);
    }

    if (!zipExtracted) {
      const hasNestedPath = files.some((file, index) =>
        String(relativePaths ? relativePaths[index] : file.originalname || "")
          .replaceAll("\\", "/")
          .includes("/"),
      );

      if (
        !hasNestedPath &&
        !files.every((file) =>
          String(file.originalname || "")
            .toLowerCase()
            .endsWith(".zip"),
        )
      ) {
        console.warn(
          `Upload "${projectName}": files me nested relative path nahi mila.`,
        );
      }
    }

    let projectVideoMeta = null;

    if (videoFile) {
      const scan = await scanFile(
        videoFile.path,
        videoFile.originalname || "project-video",
      );
      if (!scan.clean) {
        throw new Error(`Upload malware scan rejected video: ${scan.reason}`);
      }

      await removeProjectVideo(target);

      projectVideoMeta = await persistProjectVideo(
        target,
        videoFile,
        requestedVideoStorage,
      );
    }

    const existingMeta = await readProjectMeta(target);

    const nextMeta = {
      ...(existingMeta || {}),
    };

    if (projectType !== "auto") {
      nextMeta.type = projectType;
    }

    if (projectVideoMeta) {
      nextMeta.video = projectVideoMeta;
    }

    await writeProjectMeta(target, nextMeta);

    increment("demo_manager_uploads_total");

    await store.audit("upload", {
      projectId: projectName.toLowerCase(),
      requestId: req.requestId,
      metadata: {
        files: files.length,
        scanner: "heuristic-or-configured",
        hasVideo: Boolean(projectVideoMeta),
        videoStorage: projectVideoMeta?.storage || null,
      },
    });

    return res.status(201).json({
      success: true,

      project: {
        id: projectName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, ""),

        name: projectName,

        type: projectType === "auto" ? undefined : projectType,

        video: projectVideoMeta || null,
      },

      security: {
        malwareScan: UPLOAD_SCAN_COMMAND
          ? "configured-command-and-heuristic"
          : "heuristic",
      },
    });
  } catch (error) {
    const cleanupErrors = [];

    try {
      await fs.rm(target, {
        recursive: true,
        force: true,
      });
    } catch (cleanupError) {
      cleanupErrors.push(`${target}: ${cleanupError.message}`);
    }

    cleanupErrors.push(...(await removeUploadedFiles(allTempFiles)));

    const suffix = cleanupErrors.length
      ? ` Upload cleanup failed: ${cleanupErrors.join("; ")}`
      : "";

    return res.status(400).json({
      success: false,
      message: `${error.message}${suffix}`,
    });
  }
}
