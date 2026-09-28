import { statfs } from "fs/promises";
import { DISK_MIN_FREE_BYTES, PROJECT_ROOT } from "../config/environment.js";
import { runDocker } from "../services/docker-service.js";

export async function getHealth(_req, res) {
  let docker = "unavailable";
  try {
    await runDocker(["info", "--format", "{{.ServerVersion}}"]);
    docker = "ok";
  } catch (error) {
    docker = error.code === "DOCKER_UNAVAILABLE" ? "unavailable" : "error";
  }

  let disk = { status: "unknown" };
  try {
    const info = await statfs(PROJECT_ROOT);
    const freeBytes = Number(info.bavail) * Number(info.bsize);
    disk = {
      status: freeBytes >= DISK_MIN_FREE_BYTES ? "ok" : "low",
      freeBytes,
    };
  } catch (error) {
    disk = { status: "error", message: error.message };
  }

  const healthy =
    docker === "ok" && disk.status !== "low" && disk.status !== "error";

  res.status(healthy ? 200 : 503).json({
    success: healthy,
    service: "demo-manager",
    projectRoot: PROJECT_ROOT,
    checks: { docker, disk },
  });
}
