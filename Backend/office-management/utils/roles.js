import AppError from "./AppError.js";

export const USER_ROLES = Object.freeze([
  "super_admin",
  "admin",
  "employee",
  "client",
  "referral_partner",
  "hr",
]);

export const isSuperAdmin = (user) => user?.role === "super_admin";
export const isAdmin = (user) => user?.role === "admin";

export const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
  }

  if (!allowedRoles.includes(req.user.role)) {
    throw new AppError("You are not allowed to access this resource", 403, "FORBIDDEN");
  }

  next();
};

export const assertSafeRoleChange = ({ actor, target, nextRole }) => {
  if (!USER_ROLES.includes(nextRole)) {
    throw new AppError("Invalid user role", 400, "INVALID_ROLE");
  }

  if (!actor || !target) {
    throw new AppError("User context is required", 401, "AUTH_REQUIRED");
  }

  if (String(actor._id) === String(target._id) && actor.role !== nextRole) {
    throw new AppError("You cannot change your own role", 403, "SELF_ROLE_CHANGE_NOT_ALLOWED");
  }

  if (nextRole === "super_admin" && actor.role !== "super_admin") {
    throw new AppError("Only the super admin can assign the super admin role", 403, "SUPER_ADMIN_ROLE_REQUIRED");
  }

  if (target.role === "super_admin" && actor.role !== "super_admin") {
    throw new AppError("Only the super admin can modify the super admin account", 403, "SUPER_ADMIN_ACCOUNT_PROTECTED");
  }
};
