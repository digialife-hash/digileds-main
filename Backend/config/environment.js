import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

// --------------------------------------------------
// Load environment variables
// --------------------------------------------------

dotenv.config({
  path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.env"),
});

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function envStr(name, fallback = undefined) {
  const raw = process.env[name];

  if (raw === undefined || raw === null) {
    return fallback;
  }

  const value = String(raw).trim();

  return value === "" ? fallback : value;
}

function envInt(name, fallback) {
  const raw = process.env[name];

  if (raw === undefined || raw === null || String(raw).trim() === "") {
    return fallback;
  }

  const value = Number(String(raw).trim());

  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    console.error(`FATAL: env var ${name}="${raw}" is not a valid integer.`);

    process.exit(1);
  }

  return value;
}

function envPositiveInt(name, fallback) {
  const value = envInt(name, fallback);

  if (value <= 0) {
    console.error(`FATAL: env var ${name} must be greater than 0.`);

    process.exit(1);
  }

  return value;
}

function envBoolean(name, fallback = false) {
  const raw = envStr(name);

  if (raw === undefined) {
    return fallback;
  }

  const value = raw.toLowerCase();

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  console.error(`FATAL: env var ${name}="${raw}" must be true or false.`);

  process.exit(1);
}

function envList(name, fallback = []) {
  const raw = envStr(name);

  if (!raw) {
    return fallback;
  }

  return [
    ...new Set(
      raw
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  ];
}

// --------------------------------------------------
// Application environment
// --------------------------------------------------

export const NODE_ENV = envStr("NODE_ENV", "development").toLowerCase();

export const IS_PRODUCTION = NODE_ENV === "production";
export const IS_LOCAL = !IS_PRODUCTION;

// --------------------------------------------------
// MongoDB
// --------------------------------------------------

export const MONGODB_URI = envStr("MONGODB_URI") || envStr("MONGO_URI");
export const MONGODB_DB = envStr("MONGODB_DB");

if (IS_PRODUCTION && (!MONGODB_URI || !MONGODB_DB)) {
  console.error(
    "FATAL: MONGODB_URI and MONGODB_DB must be configured in production.",
  );
  process.exit(1);
}

// --------------------------------------------------
// Server
// --------------------------------------------------

export const PORT = envPositiveInt("PORT", 7000);

export const BASE_PORT = envPositiveInt("DEMO_BASE_PORT", 9000);

export const MAX_DEMO_PORTS = envPositiveInt("DEMO_MAX_PORTS", 1000);

// --------------------------------------------------
// Demo configuration
// --------------------------------------------------

export const DEMO_DURATION_MINUTES = envPositiveInt(
  "DEMO_DURATION_MINUTES",
  60,
);

export const DEMO_DURATION_MS = DEMO_DURATION_MINUTES * 60 * 1000;

// --------------------------------------------------
// Storage
// --------------------------------------------------

export const STORAGE_ROOT = path.resolve(process.cwd(), "storage");

export const PROJECT_ROOT = path.resolve(STORAGE_ROOT, "projects");

export const STORAGE_UPLOADS_ROOT = path.resolve(STORAGE_ROOT, "uploads");

// Office-management uploads are stored outside the frontend build so they
// survive rebuilds and are served from one stable absolute location.
export const OFFICE_UPLOADS_ROOT = path.resolve(process.cwd(), "uploads");

export const SITE_ASSETS_ROOT = path.resolve(
  STORAGE_UPLOADS_ROOT,
  "site-assets",
);

export const PRODUCT_ASSETS_ROOT = path.resolve(
  STORAGE_UPLOADS_ROOT,
  "product-assets",
);

export const PORTFOLIO_ASSETS_ROOT = path.resolve(
  STORAGE_UPLOADS_ROOT,
  "portfolio-assets",
);

export const SITE_ASSET_MAX_BYTES = envPositiveInt(
  "SITE_ASSET_MAX_BYTES",
  10 * 1024 * 1024,
);

export const STORAGE_VIDEOS_ROOT = path.resolve(STORAGE_ROOT, "videos");

export const UPLOAD_TEMP_DIR = path.join(STORAGE_ROOT, "temp");

// --------------------------------------------------
// Public demo host
// --------------------------------------------------

const configuredPublicDemoHost = envStr("PUBLIC_DEMO_HOST");

if (IS_PRODUCTION && !configuredPublicDemoHost) {
  console.error("FATAL: PUBLIC_DEMO_HOST must be configured in production.");

  process.exit(1);
}

export const PUBLIC_DEMO_HOST = (
  configuredPublicDemoHost || "http://localhost:7000"
).replace(/\/+$/, "");

const configuredDemoManagerUrl = envStr("DEMO_MANAGER_URL");

export const DEMO_MANAGER_URL = (() => {
  const internalUrl = `http://127.0.0.1:${PORT}`;

  if (!configuredDemoManagerUrl) {
    return internalUrl;
  }

  try {
    // The demo manager is part of this backend. Avoid sending internal proxy
    // calls back through the public reverse proxy when both URLs share origin.
    if (
      new URL(configuredDemoManagerUrl).origin ===
      new URL(PUBLIC_DEMO_HOST).origin
    ) {
      return internalUrl;
    }
  } catch {
    console.warn(
      "WARNING: DEMO_MANAGER_URL is invalid; using the local demo manager.",
    );
    return internalUrl;
  }

  return configuredDemoManagerUrl
    .replace(/^http:\/\/localhost(?=:|\/|$)/, "http://127.0.0.1")
    .replace(/\/+$/, "");
})();

// --------------------------------------------------
// Admin login
// --------------------------------------------------

export const ADMIN_USERNAME = envStr("ADMIN_USERNAME", "admin");

export const ADMIN_PASSWORD = envStr("ADMIN_PASSWORD");

if (!ADMIN_PASSWORD) {
  if (IS_PRODUCTION) {
    console.error("FATAL: ADMIN_PASSWORD must be configured in production.");

    process.exit(1);
  }

  console.warn(
    "WARNING: ADMIN_PASSWORD is not configured; no admin seed will be created.",
  );
}

if (ADMIN_USERNAME === "admin" && ADMIN_PASSWORD === "change-me-now") {
  console.warn(
    "WARNING: default admin credentials are being used. " +
      "Set ADMIN_USERNAME and ADMIN_PASSWORD.",
  );
}

// --------------------------------------------------
// Admin session
// --------------------------------------------------

export const SESSION_SECRET = envStr("DEMO_SESSION_SECRET");

if (!SESSION_SECRET) {
  if (IS_PRODUCTION) {
    console.error(
      "FATAL: DEMO_SESSION_SECRET must be configured in production.",
    );

    process.exit(1);
  }

  console.warn("WARNING: DEMO_SESSION_SECRET is not configured.");
}

export const AUTH_JWT_SECRET = envStr("AUTH_JWT_SECRET", SESSION_SECRET);

export const AUTH_JWT_TTL = envStr("AUTH_JWT_TTL", "1h");

export const AUTH_COOKIE_NAME = envStr("AUTH_COOKIE_NAME", "access_token");

export const AUTH_REFRESH_JWT_TTL = envStr(
  "AUTH_REFRESH_JWT_TTL",
  "30d",
);

export const AUTH_REFRESH_COOKIE_NAME = envStr(
  "AUTH_REFRESH_COOKIE_NAME",
  "refresh_token",
);

export const AUTH_MFA_COOKIE_NAME = envStr(
  "AUTH_MFA_COOKIE_NAME",
  "mfa_challenge",
);

export const AUTH_MFA_TTL = envStr("AUTH_MFA_TTL", "5m");

export const FRONTEND_URL = (
  envStr("FRONTEND_URL", "http://localhost:5173") || ""
).replace(/\/+$/, "");

export const TOTP_ISSUER = envStr("TOTP_ISSUER", "Digital Alife Admin");
export const WEBAUTHN_RP_NAME = envStr("WEBAUTHN_RP_NAME", "Digital Alife Admin");

const defaultWebAuthnOrigin = envStr(
  "WEBAUTHN_ORIGIN",
  FRONTEND_URL || "http://localhost:5173",
).replace(/\/+$/, "");

export const WEBAUTHN_ORIGIN = defaultWebAuthnOrigin;

const defaultWebAuthnRpId = (() => {
  try {
    return new URL(defaultWebAuthnOrigin).hostname || "localhost";
  } catch {
    return "localhost";
  }
})();

export const WEBAUTHN_RP_ID = envStr("WEBAUTHN_RP_ID", defaultWebAuthnRpId);
export const WEBAUTHN_ALLOWED_ORIGINS = [
  WEBAUTHN_ORIGIN,
  FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://localhost:5173",
  "https://127.0.0.1:5173",
].filter((origin, index, origins) => origin && origins.indexOf(origin) === index);
export const PASSKEY_COOKIE_NAME = envStr(
  "PASSKEY_COOKIE_NAME",
  "passkey_challenge",
);

export const BACKUP_DIR = path.resolve(
  process.cwd(),
  envStr("BACKUP_DIR", "backups"),
);

export const BACKUP_RETENTION_DAYS = envPositiveInt(
  "BACKUP_RETENTION_DAYS",
  14,
);

export const BACKUP_ENABLED = envBoolean("BACKUP_ENABLED", false);
export const BACKUP_INTERVAL_HOURS = envPositiveInt(
  "BACKUP_INTERVAL_HOURS",
  24,
);

export const SECURITY_ACTIVITY_RETENTION_DAYS = envPositiveInt(
  "SECURITY_ACTIVITY_RETENTION_DAYS",
  180,
);

export const COOKIE_SECRET = envStr(
  "COOKIE_SECRET",
  AUTH_JWT_SECRET || SESSION_SECRET,
);

export const PASSWORD_RESET_TTL_MS = envPositiveInt(
  "PASSWORD_RESET_TTL_MS",
  15 * 60 * 1000,
);
export const PASSWORD_RESET_DAILY_LIMIT = envPositiveInt(
  "PASSWORD_RESET_DAILY_LIMIT",
  3,
);
export const SMTP_HOST = envStr("SMTP_HOST");
export const SMTP_PORT = envPositiveInt("SMTP_PORT", 587);
export const SMTP_USER = envStr("SMTP_USER");
export const SMTP_PASSWORD = envStr("SMTP_PASSWORD");
export const SMTP_FROM = envStr("SMTP_FROM", SMTP_USER);

if (
  IS_PRODUCTION &&
  (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD || !SMTP_FROM)
) {
  console.error(
    "FATAL: SMTP_HOST, SMTP_USER, SMTP_PASSWORD and SMTP_FROM are required in production.",
  );
  process.exit(1);
}

// --------------------------------------------------
// CORS
// --------------------------------------------------

const defaultCorsOrigins = [
  FRONTEND_URL,
  PUBLIC_DEMO_HOST,
  envStr("APP_URL"),
  envStr("HOST"),
  "http://localhost:5173",
  "http://localhost:7000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:7000",
  "https://localhost:5173",
  "https://127.0.0.1:5173",
].
  map((origin) => String(origin || "").replace(/\/+$/, ""))
  .filter(Boolean);

export const CORS_ORIGINS = [...new Set(envList("CORS_ORIGINS", defaultCorsOrigins))];

if (CORS_ORIGINS.includes("*")) {
  console.error(
    "FATAL: CORS_ORIGINS cannot contain '*' when credentialed cookies are enabled.",
  );
  process.exit(1);
}

// --------------------------------------------------
// Upload configuration
// --------------------------------------------------

export const UPLOAD_SCAN_COMMAND = envStr("UPLOAD_SCAN_COMMAND", "");

export const UPLOAD_MAX_BYTES = envPositiveInt(
  "UPLOAD_MAX_BYTES",
  500 * 1024 * 1024,
);

// --------------------------------------------------
// ZIP security limits
// --------------------------------------------------

export const ZIP_MAX_COMPRESSED_BYTES = envPositiveInt(
  "ZIP_MAX_COMPRESSED_BYTES",
  50 * 1024 * 1024,
);

export const ZIP_MAX_UNCOMPRESSED_BYTES = envPositiveInt(
  "ZIP_MAX_UNCOMPRESSED_BYTES",
  250 * 1024 * 1024,
);

export const ZIP_MAX_FILES = envPositiveInt("ZIP_MAX_FILES", 5000);

export const ZIP_MAX_DEPTH = envPositiveInt("ZIP_MAX_DEPTH", 20);

export const ZIP_MAX_RATIO = envPositiveInt("ZIP_MAX_RATIO", 100);

// --------------------------------------------------
// Docker demo limits
// --------------------------------------------------

export const DEMO_MEMORY = envStr("DEMO_MEMORY", "512m");

export const DEMO_CPUS = envStr("DEMO_CPUS", "1");

export const DEMO_PIDS_LIMIT = envPositiveInt("DEMO_PIDS_LIMIT", 256);

export const DEMO_DISABLE_NETWORK_EGRESS = envBoolean(
  "DEMO_DISABLE_NETWORK_EGRESS",
  false,
);

// --------------------------------------------------
// Cleanup
// --------------------------------------------------

export const CLEANUP_INTERVAL_MS = envPositiveInt(
  "CLEANUP_INTERVAL_MS",
  30 * 1000,
);

export const IMAGE_CLEANUP_INTERVAL_MS = envPositiveInt(
  "IMAGE_CLEANUP_INTERVAL_MS",
  6 * 60 * 60 * 1000,
);

export const IMAGE_RECENT_HOURS = envPositiveInt("IMAGE_RECENT_HOURS", 24);

export const DISK_MIN_FREE_BYTES = envPositiveInt(
  "DISK_MIN_FREE_BYTES",
  1024 * 1024 * 1024,
);

// --------------------------------------------------
// Project discovery
// --------------------------------------------------

export const PROJECT_META_FILE = ".demo-manager.json";

export const IGNORED_FOLDERS = new Set([
  "manager",
  "node_modules",
  ".git",
  ".github",
  "dist",
  "build",
  "coverage",
  ".cache",
  ".next",
  ".vite",
]);

export const ALWAYS_EXCLUDE_GLOBS = [
  "node_modules/**",
  ".git/**",
  "dist/**",
  "build/**",
  "coverage/**",
  ".cache/**",
  ".next/**",
  ".vite/**",
];

// --------------------------------------------------
// Supported project types
// --------------------------------------------------

export const VALID_PROJECT_TYPES = [
  "auto",
  "react",
  "node",
  "python",
  "php",
  "java",
  "static",
  "fullstack",
  "docker",
];

// --------------------------------------------------
// Expired demo page
// --------------------------------------------------

export const EXPIRED_PAGE_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />
  <title>Demo Expired</title>

  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: Arial, sans-serif;
      background: #f5f5f5;
    }

    .box {
      background: #fff;
      padding: 40px;
      border-radius: 18px;
      text-align: center;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
      max-width: 420px;
      margin: 20px;
    }

    h1 {
      margin-top: 0;
    }

    p {
      color: #666;
    }
  </style>
</head>

<body>
  <div class="box">
    <h1>Demo Expired</h1>
    <p>
      This demo is no longer available.
    </p>
  </div>
</body>
</html>
`;
