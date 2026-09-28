import rateLimit from "express-rate-limit";

const requestKey = (req) =>
  req.ip || req.socket?.remoteAddress || req.connection?.remoteAddress || "unknown";

export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: requestKey,
});

export const createLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: requestKey,
  message: {
    success: false,
    message: "Too many demo-create requests, try again later",
  },
});

export const destructiveLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: requestKey,
  message: { success: false, message: "Too many requests, try again later" },
});

export const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: requestKey,
  message: {
    success: false,
    message: "Too many login attempts, try again later",
  },
});

export const mutateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 30,
  standardHeaders: false,
  legacyHeaders: false,
  keyGenerator: requestKey,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});
