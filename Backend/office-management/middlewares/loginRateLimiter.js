import rateLimit from "express-rate-limit";

const requestKey = (req) =>
  req.ip || req.socket?.remoteAddress || req.connection?.remoteAddress || "unknown";

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  // Keep local testing usable without disabling protection in development.
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: requestKey,
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes.",
    data: null,
    error: {
      code: "TOO_MANY_LOGIN_ATTEMPTS",
    },
  },
}); 