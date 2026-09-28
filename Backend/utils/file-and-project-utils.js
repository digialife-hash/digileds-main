import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import {
  IGNORED_FOLDERS,
  PROJECT_META_FILE,
  ZIP_MAX_COMPRESSED_BYTES,
  ZIP_MAX_DEPTH,
  ZIP_MAX_FILES,
  ZIP_MAX_RATIO,
  ZIP_MAX_UNCOMPRESSED_BYTES,
} from "../config/environment.js";

export const generateDemoId = () => crypto.randomBytes(12).toString("hex");

export const slugify = (value) =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export async function exists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

export async function hasAny(dir, filenames) {
  for (const name of filenames) {
    if (await exists(path.join(dir, name))) return true;
  }
  return false;
}

export const normalizedIgnoredFolders = new Set(
  [...IGNORED_FOLDERS].map((folder) => folder.toLowerCase()),
);

export async function findFileCaseInsensitive(dir, expectedName) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const entry = entries.find(
      (item) =>
        item.isFile() && item.name.toLowerCase() === expectedName.toLowerCase(),
    );
    return entry ? path.join(dir, entry.name) : null;
  } catch {
    return null;
  }
}

export async function findFirst(dir, filenames) {
  for (const name of filenames) {
    if (await exists(path.join(dir, name))) return name;
  }
  return null;
}

export async function findFrontendPackage(projectPath) {
  const queue = [{ absolute: projectPath, relative: "" }];
  while (queue.length > 0) {
    const current = queue.shift();
    let entries;
    try {
      entries = await fs.readdir(current.absolute, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (normalizedIgnoredFolders.has(entry.name.toLowerCase())) continue;
      const relative = current.relative
        ? path.join(current.relative, entry.name)
        : entry.name;
      const absolute = path.join(projectPath, relative);
      if (
        entry.name.toLowerCase() === "frontend" &&
        (await exists(path.join(absolute, "package.json")))
      ) {
        return { absolute, relative };
      }
      queue.push({ absolute, relative });
    }
  }
  return null;
}

export async function moveFile(source, destination) {
  try {
    await fs.rename(source, destination);
  } catch (error) {
    if (error.code === "EXDEV") {
      await fs.copyFile(source, destination);
      await fs.unlink(source);
    } else {
      throw error;
    }
  }
}

export function normalizeUploadPath(value) {
  const raw = String(value || "").replaceAll("\\", "/");
  const parts = raw.split("/").filter(Boolean);
  if (
    !raw ||
    raw.includes("\0") ||
    path.posix.isAbsolute(raw) ||
    /^[a-zA-Z]:/.test(raw) ||
    parts.some((part) => part === "." || part === "..")
  ) {
    throw new Error(`Unsafe upload path: ${raw}`);
  }
  return parts;
}

export async function removeUploadedFiles(files) {
  const entries = Array.isArray(files)
    ? files
    : Object.values(files || {}).flat();

  const errors = [];
  for (const file of entries) {
    if (!file || !file.path) continue;
    try {
      await fs.rm(file.path, { force: true });
    } catch (error) {
      errors.push(`${file.path}: ${error.message}`);
    }
  }
  return errors;
}

export async function ensureDockerignore(project, extraLines = []) {
  const ignorePath = path.join(project.path, ".dockerignore");
  if (await exists(ignorePath)) return;
  await fs.writeFile(
    ignorePath,
    [
      "node_modules",
      ".git",
      ".env",
      "*.log",
      PROJECT_META_FILE,
      ...extraLines,
    ].join("\n") + "\n",
    "utf8",
  );
}

export function validateZipArchive(zipPath, AdmZip) {
  const zip = new AdmZip(zipPath);
  const entries = zip.getEntries().filter((entry) => !entry.isDirectory);
  let compressedTotal = 0;
  let uncompressedTotal = 0;
  if (entries.length > ZIP_MAX_FILES)
    throw new Error(`Zip contains too many files (limit ${ZIP_MAX_FILES})`);
  for (const entry of entries) {
    const compressed = Number(
      entry.header?.compressedSize ?? entry.compressedSize ?? 0,
    );
    const uncompressed = Number(entry.header?.size ?? entry.size ?? 0);
    const raw = String(entry.entryName || "").replaceAll("\\", "/");
    compressedTotal += compressed;
    uncompressedTotal += uncompressed;
    if (raw.split("/").filter(Boolean).length > ZIP_MAX_DEPTH)
      throw new Error(`Zip path is too deep (limit ${ZIP_MAX_DEPTH})`);
    if (
      compressedTotal > ZIP_MAX_COMPRESSED_BYTES ||
      uncompressedTotal > ZIP_MAX_UNCOMPRESSED_BYTES
    )
      throw new Error("Zip extraction size limit exceeded");
    if (compressed > 0 && uncompressed / compressed > ZIP_MAX_RATIO)
      throw new Error("Zip compression ratio is unsafe");
    normalizeUploadPath(raw);
  }
  return entries;
}

export async function extractZipTo(zipPath, targetDir, AdmZip) {
  const entries = validateZipArchive(zipPath, AdmZip);
  const topLevels = new Set();
  let hasNestedEntry = false;
  for (const entry of entries) {
    const parts = String(entry.entryName || "")
      .replaceAll("\\", "/")
      .split("/")
      .filter(Boolean);
    if (parts.length > 1) hasNestedEntry = true;
    if (parts[0]) topLevels.add(parts[0]);
  }
  const stripRoot = topLevels.size === 1 && hasNestedEntry;
  let extractedBytes = 0;
  for (const entry of entries) {
    const rawName = String(entry.entryName || "").replaceAll("\\", "/");
    let safeParts = rawName.split("/").filter(Boolean);
    if (safeParts.length === 0) continue;
    if (stripRoot) safeParts = safeParts.slice(1);
    if (
      safeParts.length === 0 ||
      safeParts.some((part) => part === "." || part === "..") ||
      path.posix.isAbsolute(rawName) ||
      /^[a-zA-Z]:/.test(rawName) ||
      rawName.includes("\0")
    )
      throw new Error(`Unsafe zip path: ${rawName}`);
    const destination = path.resolve(targetDir, ...safeParts);
    if (
      destination !== targetDir &&
      !destination.startsWith(`${targetDir}${path.sep}`)
    )
      continue;
    const data = entry.getData();
    extractedBytes += data.length;
    if (extractedBytes > ZIP_MAX_UNCOMPRESSED_BYTES)
      throw new Error("Zip extraction size limit exceeded");
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(destination, data);
  }
}

export { fs, path };
