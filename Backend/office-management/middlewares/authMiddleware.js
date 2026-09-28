import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ACCESS_TOKEN_COOKIE } from "../utils/generateToken.js";
import {
  getAuthSession,
} from "../../services/admin-auth.js";
import AdminSession from "../../models/admin-session.model.js";

export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]?.trim()
    : "";
  // Refresh tokens may only mint a new session at /auth/refresh; they must
  // never authorize dashboard requests directly.
  const sharedSession = getAuthSession(req);
  const token = sharedSession || req.cookies?.[ACCESS_TOKEN_COOKIE] || bearerToken;

  if (!token) {
    throw new AppError(
      "Authentication token is required",
      401,
      "TOKEN_MISSING"
    );
  }

  if (sharedSession) {
    const user = await User.findById(sharedSession.sub).select("-password");
    if (
      !user ||
      user.status !== "active" ||
      (sharedSession.sessionVersion || 0) !== (user.sessionVersion || 0)
    ) {
      throw new AppError("Invalid or expired session", 401, "INVALID_SESSION");
    }
    if (
      user.role !== "super_admin" &&
      req.tenantId &&
      user.tenantId &&
      String(user.tenantId) !== String(req.tenantId)
    ) {
      throw new AppError("Tenant access denied", 403, "TENANT_FORBIDDEN");
    }
    if (sharedSession.sessionId) {
      const activeSession = await AdminSession.findOne({
        sessionId: sharedSession.sessionId,
        userId: String(user._id),
        revokedAt: null,
        expiresAt: { $gt: new Date() },
      }).lean();
      if (!activeSession) {
        throw new AppError("Session has been revoked", 401, "SESSION_REVOKED");
      }
    }
    req.user = user;
    req.auth = { id: sharedSession.sub, role: user.role };
    return next();
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new AppError("Token expired, please login again", 401, "TOKEN_EXPIRED");
    }
    throw new AppError("Invalid authentication token", 401, "INVALID_TOKEN");
  }

  if (decoded.type && decoded.type !== "access") {
    throw new AppError("Invalid authentication token", 401, "INVALID_TOKEN");
  }

  const user = await User.findById(decoded.id).select("-password");

  if (!user) {
    throw new AppError(
      "Invalid or expired session",
      401,
      "INVALID_SESSION"
    );
  }

  if (
    user.role !== "super_admin" &&
    req.tenantId &&
    user.tenantId &&
    String(user.tenantId) !== String(req.tenantId)
  ) {
    throw new AppError("Tenant access denied", 403, "TENANT_FORBIDDEN");
  }

  if (user.status && user.status === "inactive") {
    throw new AppError(
      "Your account is inactive",
      403,
      "ACCOUNT_INACTIVE"
    );
  }

  if ((user.tokenVersion || 0) !== (decoded.tokenVersion || 0)) {
    throw new AppError(
      "Session has been invalidated",
      401,
      "SESSION_INVALIDATED"
    );
  }

  req.user = user;
  req.auth = {
    id: decoded.id,
    role: decoded.role,
  };

  next();
});

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
    }

    const databaseRole = req.user?.role;

    const isAuthorized = databaseRole && allowedRoles.includes(databaseRole);

    if (!isAuthorized) {
      throw new AppError(
        "You are not allowed to access this resource",
        403,
        "FORBIDDEN"
      );
    }

    next();
  };
};
