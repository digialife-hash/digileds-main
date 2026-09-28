import {
  getAuthSession,
  getRefreshSession,
  setAuthCookies,
} from "../services/admin-auth.js";
import User from "../models/user.model.js";
import OfficeUser from "../office-management/models/User.js";
import AdminSession from "../models/admin-session.model.js";

const ADMIN_ROLES = new Set(["super_admin", "admin"]);

export async function requireAdmin(req, res, next) {
  try {
    let session = getAuthSession(req);
    let refreshed = false;
    if (!session) {
      const refreshSession = getRefreshSession(req);
      if (refreshSession) {
        session = refreshSession;
        refreshed = true;
      }
    }

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const officeUser = await OfficeUser.findOne({
      _id: session.sub,
      status: "active",
      role: { $in: [...ADMIN_ROLES] },
    }).lean();
    const legacyUser = officeUser
      ? null
      : await User.findOne({
          _id: session.sub,
          role: "admin",
          isActive: 1,
        }).lean();
    const authenticatedUser = officeUser || legacyUser;

    if (
      !authenticatedUser ||
      (session.sessionVersion || 0) !==
        (authenticatedUser.sessionVersion || 0)
    ) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (session.sessionId) {
      const activeSession = await AdminSession.findOne({
        sessionId: session.sessionId,
        userId: String(authenticatedUser._id),
        revokedAt: null,
        expiresAt: { $gt: new Date() },
      }).lean();
      if (!activeSession) {
        return res.status(401).json({ success: false, message: "Session revoked." });
      }
    }

    if (!ADMIN_ROLES.has(authenticatedUser.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const sessionTenantId = session.tenantId ? String(session.tenantId) : null;
    const userTenantId = authenticatedUser.tenantId
      ? String(authenticatedUser.tenantId)
      : null;
    const isCrossTenantAdmin = authenticatedUser.role === "super_admin";
    if (
      !isCrossTenantAdmin &&
      (sessionTenantId !== String(req.tenantId) ||
        userTenantId !== String(req.tenantId))
    ) {
      return res.status(403).json({
        success: false,
        message: "User is not assigned to this tenant.",
      });
    }

    if (refreshed) {
      setAuthCookies(res, {
        id: String(authenticatedUser._id),
        username: authenticatedUser.username || authenticatedUser.email,
        role: authenticatedUser.role,
        sessionVersion: authenticatedUser.sessionVersion || 0,
      });
    }

    req.user = {
      ...session,
      role: authenticatedUser.role,
      sessionVersion: authenticatedUser.sessionVersion || 0,
    };
    return next();
  } catch (error) {
    return next(error);
  }
}

export function requireSuperAdmin(req, res, next) {
  if (req.user?.role !== "super_admin") {
    return res.status(403).json({
      success: false,
      message: "Super-admin access is required.",
      code: "SUPER_ADMIN_REQUIRED",
    });
  }
  return next();
}

export default requireAdmin;
