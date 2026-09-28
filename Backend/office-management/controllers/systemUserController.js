import mongoose from "mongoose";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { USER_ROLES, assertSafeRoleChange } from "../utils/roles.js";
import { hasPermission, sanitizePermissions } from "../utils/permissions.js";
import Tenant from "../../models/tenant.model.js";

const safeFields = "name email phone role tenantId permissions status lastLogin createdAt updatedAt";

const canManageTarget = (actor, targetRole) => {
  if (actor.role === "super_admin") return true;
  return actor.role === "admin" && !["super_admin", "admin"].includes(targetRole);
};

const limitToActorPermissions = (actor, permissions) => {
  const sanitized = sanitizePermissions(permissions);
  if (actor.role === "super_admin") return sanitized;

  return Object.fromEntries(
    Object.entries(sanitized).flatMap(([moduleName, actions]) => {
      const allowedActions = Object.fromEntries(
        Object.entries(actions).filter(
          ([action, enabled]) =>
            enabled && hasPermission(actor, moduleName, action)
        )
      );
      return Object.keys(allowedActions).length
        ? [[moduleName, allowedActions]]
        : [];
    })
  );
};

const validatePassword = (password) => {
  if (
    typeof password !== "string" ||
    password.length < 8 ||
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/\d/.test(password) ||
    !/[^A-Za-z0-9]/.test(password)
  ) {
    throw new AppError("Password must contain at least 8 characters, uppercase, lowercase, number and special character", 400, "WEAK_PASSWORD");
  }
};

const validateTenant = async (tenantId) => {
  if (!mongoose.isValidObjectId(tenantId)) {
    throw new AppError("Invalid tenant id", 400, "INVALID_TENANT");
  }
  const tenant = await Tenant.exists({ _id: tenantId, status: "active" });
  if (!tenant) throw new AppError("Active tenant not found", 400, "INVALID_TENANT");
};

export const listSystemUsers = asyncHandler(async (req, res) => {
  const filter = req.user.role === "admin"
    ? { role: { $nin: ["super_admin", "admin"] } }
    : {};
  const users = await User.find(filter).select(safeFields).sort({ createdAt: -1 }).lean();
  res.json({ success: true, message: "Users fetched successfully", data: users, error: null });
});

export const createSystemUser = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role, tenantId, permissions } = req.body;
  if (!name?.trim() || !email?.trim() || !password || !role) {
    throw new AppError("Name, email, password and role are required", 400, "REQUIRED_FIELDS_MISSING");
  }
  if (!USER_ROLES.includes(role)) throw new AppError("Invalid user role", 400, "INVALID_ROLE");
  if (!canManageTarget(req.user, role)) {
    throw new AppError("You can only manage users below your role", 403, "ROLE_HIERARCHY_VIOLATION");
  }
  if (role === "super_admin" && req.user.role !== "super_admin") {
    throw new AppError("Only the super admin can create a super admin", 403, "SUPER_ADMIN_ROLE_REQUIRED");
  }
  validatePassword(password);
  if (tenantId) {
    if (req.user.role !== "super_admin") {
      throw new AppError("Only the super admin can assign users to tenants", 403, "TENANT_ASSIGNMENT_FORBIDDEN");
    }
    await validateTenant(tenantId);
  }

  try {
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || undefined,
      password,
      role,
      tenantId: role === "super_admin" ? null : tenantId || null,
      permissions: limitToActorPermissions(req.user, permissions),
      status: "active",
      emailVerified: true,
      emailVerifiedAt: new Date(),
    });
    res.status(201).json({ success: true, message: "User created successfully", data: user.toJSON(), error: null });
  } catch (error) {
    if (error?.code === 11000 && error?.keyPattern?.role) {
      throw new AppError("A super admin account already exists", 409, "SUPER_ADMIN_ALREADY_EXISTS");
    }
    if (error?.code === 11000) throw new AppError("A user already exists with this email", 409, "EMAIL_ALREADY_EXISTS");
    throw error;
  }
});

export const updateSystemUser = asyncHandler(async (req, res) => {
  const account = await User.findById(req.params.id).select("+password");
  if (!account) throw new AppError("User not found", 404, "USER_NOT_FOUND");
  if (!canManageTarget(req.user, account.role)) {
    throw new AppError("You can only manage users below your role", 403, "ROLE_HIERARCHY_VIOLATION");
  }

  const { name, phone, role, tenantId, status, permissions, password } = req.body;
  if (role !== undefined) {
    if (!canManageTarget(req.user, role)) {
      throw new AppError("You can only assign roles below your role", 403, "ROLE_HIERARCHY_VIOLATION");
    }
    assertSafeRoleChange({ actor: req.user, target: account, nextRole: role });
    if (account.role !== role) {
      account.role = role;
      account.tokenVersion = (account.tokenVersion || 0) + 1;
      account.sessionVersion = (account.sessionVersion || 0) + 1;
      account.refreshTokenHash = null;
    }
  }
  if (name !== undefined) account.name = name.trim();
  if (phone !== undefined) account.phone = phone.trim();
  if (tenantId !== undefined) {
    if (req.user.role !== "super_admin") {
      throw new AppError("Only the super admin can assign users to tenants", 403, "TENANT_ASSIGNMENT_FORBIDDEN");
    }
    if (tenantId) {
      await validateTenant(tenantId);
    }
    account.tenantId = account.role === "super_admin" ? null : tenantId || null;
    account.tokenVersion = (account.tokenVersion || 0) + 1;
    account.sessionVersion = (account.sessionVersion || 0) + 1;
    account.refreshTokenHash = null;
  }
  if (status !== undefined) {
    if (!["active", "inactive", "suspended"].includes(status)) {
      throw new AppError("Invalid account status", 400, "INVALID_STATUS");
    }
    if (account.role === "super_admin" && status !== "active") {
      throw new AppError("The only super admin cannot be deactivated", 403, "SUPER_ADMIN_ACCOUNT_PROTECTED");
    }
    account.status = status;
    account.tokenVersion = (account.tokenVersion || 0) + 1;
    account.sessionVersion = (account.sessionVersion || 0) + 1;
    account.refreshTokenHash = null;
  }
  if (permissions !== undefined) {
    account.permissions = limitToActorPermissions(req.user, permissions);
  }
  if (password !== undefined) {
    validatePassword(password);
    account.password = password;
    account.passwordChangedAt = new Date();
    account.tokenVersion = (account.tokenVersion || 0) + 1;
    account.sessionVersion = (account.sessionVersion || 0) + 1;
    account.refreshTokenHash = null;
  }
  await account.save();
  res.json({ success: true, message: "User updated successfully", data: account.toJSON(), error: null });
});

export const deleteSystemUser = asyncHandler(async (req, res) => {
  const account = await User.findById(req.params.id).select("role");
  if (!account) throw new AppError("User not found", 404, "USER_NOT_FOUND");
  if (!canManageTarget(req.user, account.role)) {
    throw new AppError("You can only manage users below your role", 403, "ROLE_HIERARCHY_VIOLATION");
  }
  if (account.role === "super_admin") {
    throw new AppError("The only super admin cannot be deleted", 403, "SUPER_ADMIN_ACCOUNT_PROTECTED");
  }
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "User deleted successfully", data: null, error: null });
});
