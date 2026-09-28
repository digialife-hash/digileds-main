import {
  getAuthSession,
  getRefreshSession,
  setAuthCookies,
} from "../services/admin-auth.js";

import User from "../models/user.model.js";

/* =========================================================
   USER AUTH MIDDLEWARE
========================================================= */

const authMiddleware = async (req, res, next) => {
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

    if (!session.sub) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const authenticatedUser = await User.findOne({
      _id: session.sub,

      role: "user",

      isActive: 1,
    }).lean();

    if (!authenticatedUser) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (
      (session.sessionVersion || 0) !== (authenticatedUser.sessionVersion || 0)
    ) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
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

      id: String(authenticatedUser._id),

      userId: String(authenticatedUser._id),

      _id: String(authenticatedUser._id),

      username: authenticatedUser.username || authenticatedUser.email || null,

      email: authenticatedUser.email || null,

      role: authenticatedUser.role,

      sessionVersion: authenticatedUser.sessionVersion || 0,
    };

    return next();
  } catch (error) {
    console.error("USER AUTH MIDDLEWARE ERROR:", error);

    return next(error);
  }
};

export default authMiddleware;
