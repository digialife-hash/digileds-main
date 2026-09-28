import { createApp } from "./app.js";
import { promisify } from "node:util";
import { spawn } from "node:child_process";
import path from "node:path";

import {
  CLEANUP_INTERVAL_MS,
  DEMO_DURATION_MS,
  DEMO_DURATION_MINUTES,
  IMAGE_CLEANUP_INTERVAL_MS,
  PORT,
  PROJECT_ROOT,
  PUBLIC_DEMO_HOST,
  BACKUP_ENABLED,
  BACKUP_INTERVAL_HOURS,
  SECURITY_ACTIVITY_RETENTION_DAYS,
} from "./config/environment.js";

import {
  cleanupExpiredDemos,
  cleanupUnusedImages,
  reconcileOnBoot,
} from "./services/demo-lifecycle.js";

import { discoverProjects } from "./services/project-discovery.js";
import { warmProjectImages } from "./services/docker-service.js";
import AdminSession from "./models/admin-session.model.js";
import SecurityActivity from "./models/security-activity.model.js";

import * as store from "./services/data-repository.js";
import { ensureDefaultTenant } from "./services/tenant-context.js";
import { installOfficeTenantIsolation } from "./services/office-tenant-isolation.js";

export async function initializeServer() {
  // The social-post app uses these legacy names while the main backend uses
  // the shared environment names.
  process.env.MONGO_URI ||= process.env.MONGODB_URI;
  process.env.JWT_SECRET ||= process.env.AUTH_JWT_SECRET || process.env.DEMO_SESSION_SECRET;
  process.env.CLIENT_URL ||= process.env.FRONTEND_URL;
  installOfficeTenantIsolation();

  // --------------------------------------------------
  // Validate required configuration
  // --------------------------------------------------

  await store.connect();
  await ensureDefaultTenant();

  // --------------------------------------------------
  // Create Express application
  // --------------------------------------------------

  const app = createApp();

  // --------------------------------------------------
  // Start HTTP server
  // --------------------------------------------------

  const server = app.listen(PORT, () => {
    console.log("");
    console.log("========================================");
    console.log("        Demo Manager Started");
    console.log("========================================");
    console.log(`Server       : http://localhost:${PORT}`);
    console.log(`Project root : ${PROJECT_ROOT}`);
    console.log(`Demo duration: ${DEMO_DURATION_MINUTES} minutes`);
    console.log(`Demo host    : ${PUBLIC_DEMO_HOST || "not configured"}`);
    console.log("========================================");
    console.log("");

    // Warm Docker images after server starts.
    (async () => {
      try {
        await warmProjectImages(discoverProjects);
      } catch (error) {
        console.error("Project image warmup failed:", error.message);
      }
    })();
  });

  let shuttingDown = false;

  // --------------------------------------------------
  // Background cleanup jobs
  // --------------------------------------------------

  const cleanupTimer = setInterval(async () => {
    try {
      await cleanupExpiredDemos();
    } catch (error) {
      console.error("Cleanup interval error:", error.message);
    }
  }, CLEANUP_INTERVAL_MS);

  const imageCleanupTimer = setInterval(async () => {
    try {
      await cleanupUnusedImages();
    } catch (error) {
      console.error("Image cleanup interval error:", error.message);
    }
  }, IMAGE_CLEANUP_INTERVAL_MS);

  const cleanupExpiredAdminSessions = async () => {
    try {
      await AdminSession.deleteMany({
        expiresAt: { $lte: new Date() },
      });
    } catch (error) {
      console.error("Admin session cleanup error:", error.message);
    }
  };

  await cleanupExpiredAdminSessions();
  const adminSessionCleanupTimer = setInterval(
    cleanupExpiredAdminSessions,
    60 * 60 * 1000,
  );

  const cleanupSecurityActivity = async () => {
    try {
      const cutoff = new Date(
        Date.now() - SECURITY_ACTIVITY_RETENTION_DAYS * 24 * 60 * 60 * 1000,
      );
      await SecurityActivity.deleteMany({ timestamp: { $lt: cutoff } });
    } catch (error) {
      console.error("Security activity cleanup error:", error.message);
    }
  };

  await cleanupSecurityActivity();
  const securityActivityCleanupTimer = setInterval(
    cleanupSecurityActivity,
    24 * 60 * 60 * 1000,
  );

  let backupTimer = null;
  const runBackup = () => {
    const script = path.resolve(process.cwd(), "scripts", "backup-mongodb.js");
    const child = spawn(process.execPath, [script], {
      stdio: "inherit",
      windowsHide: true,
    });
    child.on("error", (error) => {
      console.error("Scheduled MongoDB backup failed to start:", error.message);
    });
  };
  if (BACKUP_ENABLED) {
    runBackup();
    backupTimer = setInterval(runBackup, BACKUP_INTERVAL_HOURS * 60 * 60 * 1000);
    console.log(`Automated MongoDB backups enabled every ${BACKUP_INTERVAL_HOURS} hour(s).`);
  }

  // --------------------------------------------------
  // Graceful shutdown
  // --------------------------------------------------

  async function shutdown(signal) {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;

    console.log(`${signal} received; shutting down gracefully...`);

    clearInterval(cleanupTimer);
    clearInterval(imageCleanupTimer);
    clearInterval(adminSessionCleanupTimer);
    clearInterval(securityActivityCleanupTimer);
    if (backupTimer) clearInterval(backupTimer);

    try {
      await cleanupExpiredDemos();
    } catch (error) {
      console.error("Shutdown cleanup error:", error.message);
    }

    try {
      await promisify(server.close.bind(server))();
    } catch (error) {
      console.error("HTTP server shutdown error:", error.message);
    }

    try {
      await store.close();
    } catch (error) {
      console.error("Database shutdown error:", error.message);
    }

    console.log("Demo Manager shutdown complete.");
  }

  // --------------------------------------------------
  // Process signals
  // --------------------------------------------------

  process.once("SIGTERM", async () => {
    try {
      await shutdown("SIGTERM");
    } finally {
      process.exit(0);
    }
  });

  process.once("SIGINT", async () => {
    try {
      await shutdown("SIGINT");
    } finally {
      process.exit(0);
    }
  });

  // --------------------------------------------------
  // Boot reconciliation
  // --------------------------------------------------

  (async () => {
    try {
      await reconcileOnBoot();
    } catch (error) {
      console.error("Boot reconciliation failed:", error.message);
    }
  })();

  // --------------------------------------------------
  // HTTP server errors
  // --------------------------------------------------

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(
        `FATAL: Port ${PORT} is already in use. ` +
          "Set a different PORT in .env.",
      );
    } else {
      console.error("FATAL: Demo Manager could not start:", error.message);
    }

    process.exitCode = 1;
  });

  return server;
}

export default initializeServer;
