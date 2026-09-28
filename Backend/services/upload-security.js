import { execFile } from "child_process";

import { promisify } from "util";

import path from "path";

import { UPLOAD_SCAN_COMMAND } from "../config/environment.js";

const execFileAsync = promisify(execFile);

const blockedExtensions = new Set([
  ".exe",
  ".dll",
  ".scr",
  ".msi",
  ".com",
  ".bat",
  ".cmd",
  ".ps1",
  ".vbs",
  ".vbe",
  ".wsf",
  ".wsh",
  ".jar",
  ".apk",
  ".app",
  ".run",
  ".bin",
]);

const signatures = [Buffer.from("4d5a", "hex"), Buffer.from("7f454c46", "hex")];

function hasShebang(buffer) {
  const text = buffer.subarray(0, 256).toString("utf8");

  return /^\uFEFF?\s*#!\s*(?:\/usr\/bin\/env\s+)?(?:ba)?sh(?:\s|$)/i.test(text);
}

export async function scanBuffer(
  buffer,
  filename = "",
  { skipHook = false } = {},
) {
  const extension = path.extname(filename).toLowerCase();

  if (blockedExtensions.has(extension)) {
    return {
      clean: false,
      reason: `Executable file type is not allowed: ${extension}`,
    };
  }

  const suspiciousSignature = signatures.some((signature) =>
    buffer.subarray(0, signature.length).equals(signature),
  );

  if (suspiciousSignature || hasShebang(buffer)) {
    return {
      clean: false,
      reason: `Suspicious executable/script signature in ${filename}`,
    };
  }

  if (UPLOAD_SCAN_COMMAND && !skipHook) {
    try {
      await execFileAsync(UPLOAD_SCAN_COMMAND, [filename], {
        timeout: 60_000,
        windowsHide: true,
      });
    } catch (error) {
      return {
        clean: false,
        reason: `Configured malware scanner rejected ${filename}: ${error.message}`,
      };
    }
  }

  return {
    clean: true,
    scanner: UPLOAD_SCAN_COMMAND ? "command" : "heuristic",
  };
}

export async function scanFile(filePath, filename = filePath) {
  const fs = await import("fs/promises");

  return scanBuffer(await fs.readFile(filePath), filename);
}
