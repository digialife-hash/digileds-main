import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import demoProxyRoutes from "./routes/site-proxy.routes.js";
import demoPublicRoutes from "./routes/demo-public.routes.js";
import tenantRoutes from "./routes/tenant.routes.js";
import apiRoutes from "./routes/api-routes.js";
import socialApp from "./social-post/app.js";
import officeManagementApp from "./office-management/app.js";
import adRoutes from './routes/adRoutes.js';
import paymentRoutes from './routes/payment.routes.js';
import {
  corsOptions,
  csrfProtection,
  requestLogging,
  securityHeaders,
} from "./utils/security-middleware.js";

import { removeUploadedFiles } from "./utils/file-and-project-utils.js";
import {
  COOKIE_SECRET,
  OFFICE_UPLOADS_ROOT,
  STORAGE_UPLOADS_ROOT,
} from "./config/environment.js";
import { errorHandler } from "./middleware/error-handler.js";
import { tenantContext } from "./middleware/tenant.middleware.js";
import { installOfficeTenantIsolation } from "./services/office-tenant-isolation.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendPublicDir = path.resolve(__dirname, "public");
const officeUploadsDir = OFFICE_UPLOADS_ROOT;

function setUploadHeaders(res, filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const inlineExtensions = new Set([
    ".avif",
    ".gif",
    ".jpeg",
    ".jpg",
    ".png",
    ".svg",
    ".webp",
  ]);
  res.setHeader(
    "Content-Disposition",
    inlineExtensions.has(extension) ? "inline" : "attachment",
  );
  res.setHeader("X-Content-Type-Options", "nosniff");
}

const createFrontendFallback = (frontendDir) => {
  const indexFile = path.join(frontendDir, "index.html");

  return (req, res, next) => {
    // API and demo routes must never be handled by React SPA fallback.
    if (req.path.startsWith("/api/") || req.path.startsWith("/d/")) {
      return next();
    }

    return res.sendFile(indexFile, (error) => {
      if (error) {
        return next(error);
      }
    });
  };
};

export function createApp() {
  const app = express();
  installOfficeTenantIsolation();



  // --------------------------------------------------
  // Application / proxy settings
  // --------------------------------------------------

  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  // --------------------------------------------------
  // Security & request middleware
  // --------------------------------------------------

  app.use(requestLogging);
  app.use(securityHeaders);

  app.use(cors(corsOptions()));
  app.use(cookieParser(COOKIE_SECRET));
  app.use(csrfProtection);

  // Career resumes are served only through the authenticated download route.
  app.use("/uploads/career-resumes", (_req, res) => {
    res.status(404).json({ success: false, message: "Resume not found." });
  });

  app.use(
    "/uploads",
    express.static(path.join(frontendPublicDir, "uploads"), {
      fallthrough: true,
      index: false,
    }),
    express.static(officeUploadsDir, {
      fallthrough: true,
      index: false,
      setHeaders: setUploadHeaders,
    }),
    express.static(STORAGE_UPLOADS_ROOT, {
      fallthrough: false,
      index: false,
      setHeaders: setUploadHeaders,
    }),
  );

  app.use(
    express.json({
      limit: "1mb",
    }),
  );

  // --------------------------------------------------
  // Frontend static files
  // --------------------------------------------------

  if (fs.existsSync(frontendPublicDir)) {
    app.use(express.static(frontendPublicDir));

    // React/Vite SPA fallback
    app.get(
      /^\/(?!api(?:\/|$)|d(?:\/|$)).*/,
      createFrontendFallback(frontendPublicDir),
    );
  }

  // --------------------------------------------------
  // Routes
  // --------------------------------------------------

  app.use(tenantContext);

  app.use("/", demoProxyRoutes);

  app.use(demoPublicRoutes);

  app.use(apiRoutes);
  app.use(tenantRoutes);

  // Office management is isolated under its own API namespace so its auth
  // contract does not collide with the public site or social-post module.
  app.use("/api/office-management", officeManagementApp);

  // Social-post backend is mounted separately so it cannot override the
  // existing public/admin API routes.
  app.use("/api/social-app", socialApp);
  // Keep callback URLs from the standalone social app working after it was
  // mounted into the main backend.
  app.use("/api/v1", socialApp);

  app.use("/api/ads/" , adRoutes)
  app.use( "/api/payments", paymentRoutes);
  // --------------------------------------------------
  // Global error handler
  // --------------------------------------------------

  app.use((error, req, res, next) => {
    const uploadedFiles = Array.isArray(req.files)
      ? req.files
      : Object.values(req.files || {}).flat();

    if (uploadedFiles.length > 0) {
      (async () => {
        try {
          await removeUploadedFiles(uploadedFiles);
        } catch (cleanupError) {
          console.error("Upload error cleanup failed:", cleanupError.message);
        }
      })();
    }
    if (
      error?.code === "LIMIT_FILE_SIZE" ||
      error?.code === "LIMIT_FILE_COUNT"
    ) {
      error.statusCode = 413;
    }
    return errorHandler(error, req, res, next);
  });

  return app;
}

export default createApp;
