import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import {
  BACKUP_DIR,
  BACKUP_RETENTION_DAYS,
  MONGODB_DB,
  MONGODB_URI,
} from "../config/environment.js";

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const output = path.resolve(BACKUP_DIR, `mongo-${timestamp}`);

await fs.mkdir(BACKUP_DIR, { recursive: true });

const commandCheck = spawnSync(
  process.platform === "win32" ? "where.exe" : "which",
  ["mongodump"],
  { stdio: "ignore", shell: process.platform === "win32" },
);
if (commandCheck.status !== 0) {
  console.error("mongodump is not installed or not available on PATH. Install MongoDB Database Tools to enable backups.");
  process.exitCode = 1;
} else {

function runDump() {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "mongodump",
      ["--uri", MONGODB_URI || "mongodb://127.0.0.1:27017", "--db", MONGODB_DB || "demo_manager", "--out", output],
      { stdio: "inherit", shell: process.platform === "win32" },
    );
    child.on("error", (error) => reject(error));
    child.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(`mongodump exited with code ${code}`)),
    );
  });
}

try {
  await runDump();
  const entries = await fs.readdir(BACKUP_DIR, { withFileTypes: true });
  const cutoff = Date.now() - BACKUP_RETENTION_DAYS * 24 * 60 * 60 * 1000;
  await Promise.all(
    entries
      .filter((entry) => entry.isDirectory() && entry.name.startsWith("mongo-"))
      .map(async (entry) => {
        const directory = path.join(BACKUP_DIR, entry.name);
        const stat = await fs.stat(directory);
        if (stat.mtimeMs < cutoff) await fs.rm(directory, { recursive: true, force: true });
      }),
  );
  console.log(`MongoDB backup created at ${output}`);
} catch (error) {
  if (error.code === "ENOENT") {
    console.error("mongodump is not installed or not available on PATH.");
  } else {
    console.error(`MongoDB backup failed: ${error.message}`);
  }
  process.exitCode = 1;
}
}
