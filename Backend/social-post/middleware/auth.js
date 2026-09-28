const jwt = require("jsonwebtoken");
const User = require("../models/User");

function getCookieToken(request) {
  const signedCookies = request.signedCookies || {};
  const token = signedCookies.auth_token || signedCookies.access_token;
  return typeof token === "string" ? token : "";
}

async function requireAuth(request, response, next) {
  try {
    const authorization = request.headers.authorization || "";
    const [scheme, bearerToken] = authorization.split(" ");
    const token = getCookieToken(request) || (scheme === "Bearer" && bearerToken ? bearerToken : "");

    if (!token) {
      return response.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const payload = jwt.verify(
      token,
      process.env.AUTH_JWT_SECRET || process.env.JWT_SECRET,
    );
    const tokenType = payload.tokenType || payload.type;
    if (tokenType && tokenType !== "access") {
      return response.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }
    const userId = payload.sub || payload.id;
    const user = await User.findOne({
      _id: userId,
      ...(request.tenantId ? { tenantId: request.tenantId } : {}),
    }).select("+password +passwordHash");

    const isActiveUser =
      user?.status === "active" ||
      user?.isActive === 1 ||
      (user?.status === undefined && user?.isActive === undefined);
    const hasDashboardRole = user?.role === "admin" || user?.role === "super_admin";
    const tenantMismatch =
      user?.role !== "super_admin" &&
      (!request.tenantId ||
        !user?.tenantId ||
        String(user.tenantId) !== String(request.tenantId));

    if (
      !user
      || !hasDashboardRole
      || tenantMismatch
      || !isActiveUser
      || (
        (payload.sessionVersion ?? payload.tokenVersion ?? 0) !==
        (user.sessionVersion ?? user.tokenVersion ?? 0)
      )
    ) {
      return response.status(401).json({
        success: false,
        message: "User account no longer exists",
      });
    }

    request.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return response.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    next(error);
  }
}

module.exports = requireAuth;
