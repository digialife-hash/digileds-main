import crypto from "crypto";
import { CORS_ORIGINS } from "../config/environment.js";
import Tenant from "../models/tenant.model.js";

function normalizeOrigin(value) {
  if (!value) return "";

  try {
    return new URL(String(value).trim()).origin.toLowerCase();
  } catch {
    return "";
  }
}

const allowedOrigins = new Set(
  CORS_ORIGINS.map(normalizeOrigin).filter(Boolean),
);

async function isTenantOriginAllowed(origin) {
  const normalizedOrigin = normalizeOrigin(origin);
  if (!normalizedOrigin) return false;

  if (allowedOrigins.has(normalizedOrigin)) {
    return true;
  }

  try {
    const hostname = new URL(normalizedOrigin).hostname;
    return Boolean(
      await Tenant.exists({
        status: "active",
        domains: hostname,
      }),
    );
  } catch {
    return false;
  }
}

/**
 * Request Logger
 *
 * Logs API/application requests.
 * Static asset requests such as:
 *   /files/*
 *   /favicon.ico
 *   /robots.txt
 *   /assets/*
 *
 * are ignored to keep the backend console clean.
 */
export function requestLogging(req, res, next) {
  const requestId = req.get("x-request-id") || crypto.randomUUID();

  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);

  const started = Date.now();

  res.on("finish", () => {
    const requestPath = req.path || "/";

    // Ignore browser/static asset noise.
    const ignoredPaths = [
      "/files/",
      "/assets/",
      "/favicon.ico",
      "/robots.txt",
      "/sitemap.xml",
      "/.well-known/",
    ];

    const shouldIgnore = ignoredPaths.some((prefix) =>
      requestPath.startsWith(prefix),
    );

    if (shouldIgnore) {
      return;
    }

    const statusCode = res.statusCode;

    const level =
      statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "info";

    console.log(
      JSON.stringify({
        level,
        event: "http.request",
        requestId,
        method: req.method,
        path: requestPath,
        status: statusCode,
        durationMs: Date.now() - started,
      }),
    );
  });

  next();
}

/**
 * Security Headers
 */
export function securityHeaders(req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");

  res.setHeader("X-Frame-Options", "DENY");

  res.setHeader("Referrer-Policy", "no-referrer");

  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );

  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");

  /**
   * Demo pages need different handling because
   * their HTML/CSS/JS can belong to the uploaded project.
   *
   * The demo proxy itself handles the demo content.
   */
  if (!req.path.startsWith("/d/")) {
    res.setHeader(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' https://digitalalife.in https://digitalalife.com https://images.unsplash.com https://ui-avatars.com data: blob:",
        "font-src 'self' data: blob:",
        "connect-src 'self'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join("; "),
    );
  }

  next();
}

/**
 * CORS
 */
export function corsOptions() {
  return {
    origin(origin, callback) {
      // Browser requests without Origin
      // such as curl/server-to-server requests.
      if (!origin) {
        return callback(null, true);
      }

      // Credentialed requests must never use a wildcard origin.
      if (CORS_ORIGINS.includes("*")) {
        return callback(new Error("Wildcard CORS is not allowed for credentialed requests"));
      }

      isTenantOriginAllowed(origin)
        .then((allowed) => {
          if (allowed) {
            return callback(null, true);
          }

          return callback(new Error("Origin is not allowed by CORS"));
        })
        .catch(() => callback(new Error("Origin is not allowed by CORS")));
    },

    credentials: true,
  };
}

const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function requestOrigin(req) {
  const origin = req.get("origin");
  if (origin) return normalizeOrigin(origin);

  const referer = req.get("referer");
  if (!referer) return "";

  try {
    return normalizeOrigin(referer);
  } catch {
    return "";
  }
}

function requestServerOrigin(req) {
  const forwardedProto = req.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const forwardedHost = req.get("x-forwarded-host")?.split(",")[0]?.trim();
  const protocol = (forwardedProto || req.protocol || "").toLowerCase();
  const host = forwardedHost || req.get("host");

  return normalizeOrigin(`${protocol}://${host}`);
}

export async function csrfProtection(req, res, next) {
  if (!unsafeMethods.has(req.method) || !req.path.startsWith("/api/")) {
    return next();
  }

  const origin = requestOrigin(req);
  const sameOrigin =
    origin &&
    (origin === requestServerOrigin(req) ||
      (await isTenantOriginAllowed(origin)));

  if (!sameOrigin) {
    return res.status(403).json({
      success: false,
      message: "CSRF validation failed.",
    });
  }

  return next();
}
