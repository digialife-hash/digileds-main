import validator from "validator";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  getDefaultHRPermissions,
  mergePermissions,
  sanitizePermissions,
} from "../utils/permissions.js";

const HR_FIELDS = "name email phone role permissions status lastLogin createdAt updatedAt";

const requireSuperAdmin = (user) => {
  if (!user || user.role !== "super_admin") {
    throw new AppError("Only super admin can manage HR accounts", 403, "FORBIDDEN");
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

export const getHRAccounts = asyncHandler(async (req, res) => {
  requireSuperAdmin(req.user);

  const users = await User.find({ role: "hr" })
    .select(HR_FIELDS)
    .sort({ createdAt: -1 })
    .lean();

  return res.status(200).json({
    success: true,
    message: "HR accounts fetched successfully",
    data: users,
    error: null,
  });
});

export const createHRAccount = asyncHandler(async (req, res) => {
  requireSuperAdmin(req.user);

  const { name, email, phone, password, permissions } = req.body;

  if (!name?.trim() || !email?.trim() || !password) {
    throw new AppError("Name, email and password are required", 400, "REQUIRED_FIELDS_MISSING");
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!validator.isEmail(normalizedEmail)) {
    throw new AppError("Please provide a valid email", 400, "INVALID_EMAIL");
  }

  validatePassword(password);

  const existing = await User.findOne({ email: normalizedEmail }).select("_id").lean();
  if (existing) {
    throw new AppError("A user already exists with this email", 409, "EMAIL_ALREADY_EXISTS");
  }

  const account = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    phone: phone?.trim() || undefined,
    password,
    role: "hr",
    status: "active",
    emailVerified: true,
    emailVerifiedAt: new Date(),
    permissions: mergePermissions(getDefaultHRPermissions(), sanitizePermissions(permissions)),
  });

  return res.status(201).json({
    success: true,
    message: "HR account created successfully",
    data: account.toJSON(),
    error: null,
  });
});

export const updateHRAccount = asyncHandler(async (req, res) => {
  requireSuperAdmin(req.user);

  const { id } = req.params;
  const account = await User.findOne({ _id: id, role: "hr" }).select("+password");

  if (!account) {
    throw new AppError("HR account not found", 404, "HR_ACCOUNT_NOT_FOUND");
  }

  const { name, phone, status, permissions, password } = req.body;

  if (name !== undefined) {
    if (!name.trim()) throw new AppError("Name cannot be empty", 400, "INVALID_NAME");
    account.name = name.trim();
  }

  if (phone !== undefined) account.phone = phone.trim();

  if (status !== undefined) {
    if (!["active", "inactive", "suspended"].includes(status)) {
      throw new AppError("Invalid account status", 400, "INVALID_STATUS");
    }
    account.status = status;
    account.tokenVersion = (account.tokenVersion || 0) + 1;
    account.sessionVersion = (account.sessionVersion || 0) + 1;
  }

  if (permissions !== undefined) {
    account.permissions = mergePermissions(
      getDefaultHRPermissions(),
      sanitizePermissions(permissions)
    );
  }

  if (password !== undefined) {
    validatePassword(password);
    account.password = password;
    account.passwordChangedAt = new Date();
    account.tokenVersion = (account.tokenVersion || 0) + 1;
    account.sessionVersion = (account.sessionVersion || 0) + 1;
  }

  await account.save();

  return res.status(200).json({
    success: true,
    message: "HR account updated successfully",
    data: account.toJSON(),
    error: null,
  });
});

export const deleteHRAccount = asyncHandler(async (req, res) => {
  requireSuperAdmin(req.user);

  if (String(req.params.id) === String(req.user._id)) {
    throw new AppError("You cannot delete your own account", 400, "SELF_DELETE_NOT_ALLOWED");
  }

  const deleted = await User.findOneAndDelete({ _id: req.params.id, role: "hr" });
  if (!deleted) {
    throw new AppError("HR account not found", 404, "HR_ACCOUNT_NOT_FOUND");
  }

  return res.status(200).json({
    success: true,
    message: "HR account deleted successfully",
    data: null,
    error: null,
  });
});
