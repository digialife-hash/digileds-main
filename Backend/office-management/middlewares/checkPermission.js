import AppError from "../utils/AppError.js";
import { hasPermission } from "../utils/permissions.js";

const checkPermission = (moduleName, action) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
    }

    if (req.user.role === "super_admin") {
      return next();
    }

    if (!hasPermission(req.user, moduleName, action)) {
      throw new AppError(
        `You do not have permission to ${action} ${moduleName}`,
        403,
        "PERMISSION_DENIED"
      );
    }

    next();
  };
};

export default checkPermission;
