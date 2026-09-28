import mongoose from "mongoose";
import validator from "validator";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sanitizePermissions } from "../utils/permissions.js";
import Tenant from "../../models/tenant.model.js";

const ADMIN_FIELDS = "name email phone role tenantId permissions status lastLogin createdAt updatedAt";

const requireSuperAdmin = (user) => {
  if (!user || user.role !== "super_admin") {
    throw new AppError("Only super admin can manage admin accounts", 403, "FORBIDDEN");
  }
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
    throw new AppError(
      "Password must contain at least 8 characters, uppercase, lowercase, number and special character",
      400,
      "WEAK_PASSWORD"
    );
  }
};

const validateTenant = async (tenantId) => {
  if (!mongoose.isValidObjectId(tenantId)) {
    throw new AppError("Invalid tenant id", 400, "INVALID_TENANT");
  }
  const tenant = await Tenant.exists({ _id: tenantId, status: "active" });
  if (!tenant) throw new AppError("Active tenant not found", 400, "INVALID_TENANT");
};

export const getAdminAccounts = asyncHandler(async (req, res) => {
  requireSuperAdmin(req.user);
  const users = await User.find({ role: "admin" })
    .select(ADMIN_FIELDS)
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    success: true,
    message: "Admin accounts fetched successfully",
    data: users,
    error: null,
  });
});

export const createAdminAccount = asyncHandler(async (req, res) => {
  requireSuperAdmin(req.user);
  const { name, email, phone, password, tenantId, permissions } = req.body;

  if (!name?.trim() || !email?.trim() || !password) {
    throw new AppError("Name, email and password are required", 400, "REQUIRED_FIELDS_MISSING");
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!validator.isEmail(normalizedEmail)) {
    throw new AppError("Please provide a valid email", 400, "INVALID_EMAIL");
  }
  validatePassword(password);
  if (tenantId) {
    await validateTenant(tenantId);
  }

  const existing = await User.findOne({ email: normalizedEmail }).select("_id").lean();
  if (existing) {
    throw new AppError("A user already exists with this email", 409, "EMAIL_ALREADY_EXISTS");
  }

  const account = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    phone: phone?.trim() || undefined,
    password,
    role: "admin",
    tenantId: tenantId || null,
    status: "active",
    emailVerified: true,
    emailVerifiedAt: new Date(),
    permissions: sanitizePermissions(permissions),
  });

  res.status(201).json({
    success: true,
    message: "Admin account created successfully",
    data: account.toJSON(),
    error: null,
  });
});

export const updateAdminAccount = asyncHandler(async (req, res) => {
  requireSuperAdmin(req.user);
  const account = await User.findOne({ _id: req.params.id, role: "admin" }).select("+password");
  if (!account) {
    throw new AppError("Admin account not found", 404, "ADMIN_ACCOUNT_NOT_FOUND");
  }

  const { name, phone, tenantId, status, permissions, password } = req.body;
  if (name !== undefined) {
    if (!name.trim()) throw new AppError("Name cannot be empty", 400, "INVALID_NAME");
    account.name = name.trim();
  }
  if (phone !== undefined) account.phone = phone.trim();
  if (tenantId !== undefined) {
    if (tenantId) {
      await validateTenant(tenantId);
    }
    account.tenantId = tenantId || null;
    account.tokenVersion = (account.tokenVersion || 0) + 1;
    account.sessionVersion = (account.sessionVersion || 0) + 1;
    account.refreshTokenHash = null;
  }
  if (status !== undefined) {
    if (!["active", "inactive", "suspended"].includes(status)) {
      throw new AppError("Invalid account status", 400, "INVALID_STATUS");
    }
    account.status = status;
    account.tokenVersion = (account.tokenVersion || 0) + 1;
    account.sessionVersion = (account.sessionVersion || 0) + 1;
    account.refreshTokenHash = null;
  }
  if (permissions !== undefined) {
    account.permissions = sanitizePermissions(permissions);
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
  res.json({
    success: true,
    message: "Admin account updated successfully",
    data: account.toJSON(),
    error: null,
  });
});

export const deleteAdminAccount = asyncHandler(async (req, res) => {
  requireSuperAdmin(req.user);
  const deleted = await User.findOneAndDelete({ _id: req.params.id, role: "admin" });
  if (!deleted) {
    throw new AppError("Admin account not found", 404, "ADMIN_ACCOUNT_NOT_FOUND");
  }

  res.json({
    success: true,
    message: "Admin account deleted successfully",
    data: null,
    error: null,
  });
});
