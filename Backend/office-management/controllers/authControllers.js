import validator from "validator";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import AdminSession from "../../models/admin-session.model.js";
import { clearAuthCookie as clearSharedAuthCookie } from "../../services/admin-auth.js";
import Client from "../models/Client.js";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  accessTokenCookieOptions,
  clearAuthCookies,
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  refreshTokenCookieOptions,
} from "../utils/generateToken.js";
import {
  createEmailVerificationForUser,
  createPasswordResetForUser,
  getDevSecurityPayload,
  hashToken,
} from "../utils/accountSecurity.js";
import {
  revokeAllTrustedDevices,
} from "../services/trustedDeviceService.js";


const isStrongPassword = (password) => {
  return validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  });
};

const issueAuthCookies = async (req, res, user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshTokenHash = hashRefreshToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, accessTokenCookieOptions(req));
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, refreshTokenCookieOptions(req));

  return accessToken;
};

const sendAuthResponse = async (req, res, statusCode, message, user) => {
  const accessToken = await issueAuthCookies(req, res, user);
  user.password = undefined;
  user.refreshTokenHash = undefined;
  user.permissions = user.permissions || {};

  return res.status(statusCode).json({
    success: true,
    message,
    data: {
      user,
      token: accessToken,
    },
    error: null,
  });
};

const requiresVerifiedEmail = (user) => {
  return user.role === "client" && user.emailVerified === false;
};

const getRefreshSecret = () => {
  if (process.env.JWT_REFRESH_SECRET) return process.env.JWT_REFRESH_SECRET;
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_REFRESH_SECRET is required in production");
  }
  return process.env.JWT_SECRET;
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
 
  
  if (!name || !email || !password || !phone) {
    throw new AppError("Name, email, phone and password are required", 400, "REQUIRED_FIELDS_MISSING");
  }

  if (!validator.isEmail(email)) {
    throw new AppError("Please provide a valid email", 400, "INVALID_EMAIL");
  }

  if (!isStrongPassword(password)) {
    throw new AppError(
      "Password must contain at least 8 characters, uppercase, lowercase, number and special character",
      400,
      "WEAK_PASSWORD"
    );
  }

  if (!/^[6-9]\d{9}$/.test(phone)) {
    throw new AppError("Please provide a valid 10-digit Indian phone number", 400, "INVALID_PHONE");
  }

  const normalizedEmail = email.toLowerCase().trim();
  const normalizedPhone = phone.trim();

  const [existingUser, emailClient, phoneClient] = await Promise.all([
    User.findOne({ email: normalizedEmail }).select("_id").lean(),
    Client.findOne({ email: normalizedEmail }).select("_id email phone").lean(),
    Client.findOne({ phone: normalizedPhone }).select("_id email phone").lean(),
  ]);

  if (existingUser) {
    throw new AppError("Email already registered", 409, "EMAIL_ALREADY_EXISTS");
  }

  if (
    emailClient &&
    phoneClient &&
    String(emailClient._id) !== String(phoneClient._id)
  ) {
    throw new AppError(
      "Email and phone are linked to different clients",
      409,
      "CLIENT_CONTACT_CONFLICT"
    );
  }

  if (phoneClient && phoneClient.email !== normalizedEmail) {
    throw new AppError("Phone already linked to another client", 409, "CLIENT_PHONE_EXISTS");
  }


  const user = await User.create({
    name,
    email: normalizedEmail,
    password,
    phone: normalizedPhone,
    role: "client",
    status: "active",
    emailVerified: false,
  });

  const existingClient = emailClient || phoneClient;

  if (existingClient) {
    await Client.findByIdAndUpdate(
      existingClient._id,
      {
        clientName: name,
        email: normalizedEmail,
        phone: normalizedPhone,
        status: "active",
        updatedBy: user._id,
      },
      { runValidators: true }
    );
  } else {
    await Client.create({
      clientName: name,
      companyName: name,
      email: normalizedEmail,
      phone: normalizedPhone,
      businessCategory: "Registered Client",
      status: "active",
      notes: "Auto-created from client account registration.",
      createdBy: user._id,
      updatedBy: user._id,
    });
  }

  const verification = await createEmailVerificationForUser(user);
  user.emailVerificationTokenHash = undefined;

  return res.status(201).json({
    success: true,
    message: "Client registered successfully. Please verify your email before login.",
    data: {
      user,
      emailVerification: getDevSecurityPayload(verification),
    },
    error: null,
  });
});

export const login = asyncHandler(async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    throw new AppError(
      "Authentication service is temporarily unavailable. Please try again shortly.",
      503,
      "DATABASE_UNAVAILABLE"
    );
  }

  const { email, password, partnerId, identifier, username } = req.body;
  const loginInput = (identifier || email || partnerId || username || "").trim();

  if (!loginInput || !password) {
    throw new AppError("Email/Partner ID and password are required", 400, "LOGIN_FIELDS_REQUIRED");
  }

  let user = null;
  const cleanInput = loginInput.toLowerCase();

  if (cleanInput.includes("@")) {
    user = await User.findOne({ email: cleanInput }).select("+password");
  } else {
    // 1. Attempt lookup by Partner ID (referralCode) in ReferralPartner model
    try {
      const ReferralPartner = (await import("../models/ReferralPartner.js")).default;
      const partner = await ReferralPartner.findOne({
        referralCode: new RegExp(`^${loginInput.trim()}$`, "i"),
        isDeleted: false,
      });

      if (partner) {
        user = await User.findById(partner.userId).select("+password");
      }
    } catch {
      // Ignore if ReferralPartner lookup fails
    }

    // 2. Attempt lookup by Email
    if (!user) {
      user = await User.findOne({ email: cleanInput }).select("+password");
    }

    // 3. Attempt lookup by Phone or Name
    if (!user) {
      user = await User.findOne({
        $or: [
          { phone: loginInput.trim() },
          { name: new RegExp(`^${loginInput.trim()}$`, "i") },
        ],
      }).select("+password");
    }
  }

  

  /**
   * Keep same error message for wrong email/password.
   * This avoids revealing whether an email exists or not.
   */
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
  }

  if (user.status !== "active") {
    throw new AppError("Your account is not active. Please contact administrator.", 403, "ACCOUNT_INACTIVE");
  }

  // If user is a referral partner, also verify ReferralPartner model status and record login history
  if (user.role === "referral_partner") {
    const ReferralPartner = (await import("../models/ReferralPartner.js")).default;
    const partner = await ReferralPartner.findOne({ userId: user._id, isDeleted: false });
    if (partner) {
      if (partner.status !== "active") {
        throw new AppError(
          `Your Referral Partner account is currently ${partner.status}. Please contact administrator.`,
          403,
          "ACCOUNT_NOT_ACTIVE"
        );
      }
      partner.lastLoginAt = new Date();
      await partner.save({ validateBeforeSave: false });
    }
  }

  if (requiresVerifiedEmail(user)) {
    if (user.passwordChangedAt) {
      user.emailVerified = true;
      user.emailVerifiedAt = user.emailVerifiedAt || user.passwordChangedAt;
      user.emailVerificationTokenHash = null;
      user.emailVerificationOtpHash = null;
      user.emailVerificationExpires = null;
      user.emailVerificationOtpAttempts = 0;
    } else {
      throw new AppError(
        "Please verify your email before logging in",
        403,
        "EMAIL_NOT_VERIFIED"
      );
    }
  }

  if (requiresVerifiedEmail(user)) {
    throw new AppError(
      "Please verify your email before logging in",
      403,
      "EMAIL_NOT_VERIFIED"
    );
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  await sendAuthResponse(req, res, 200, "Login successful", user);
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const token = req.body.token || req.query.token;
  const { email, otp } = req.body;

  if (!token && (!email || !otp)) {
    throw new AppError(
      "Verification token or email and OTP are required",
      400,
      "VERIFICATION_FIELDS_REQUIRED"
    );
  }

  let user;

  if (token) {
    user = await User.findOne({
      emailVerificationTokenHash: hashToken(token),
      emailVerificationExpires: { $gt: new Date() },
    }).select("+emailVerificationTokenHash +emailVerificationOtpHash +emailVerificationOtpAttempts");
  } else {
    if (!validator.isEmail(email)) {
      throw new AppError("Please provide a valid email", 400, "INVALID_EMAIL");
    }

    user = await User.findOne({
      email: email.toLowerCase().trim(),
      role: "client",
      emailVerificationExpires: { $gt: new Date() },
    }).select("+emailVerificationOtpHash +emailVerificationOtpAttempts");
  }

  if (!user) {
    throw new AppError(
      "Verification code is invalid or expired",
      400,
      "INVALID_VERIFICATION_TOKEN"
    );
  }

  if (!token) {
    if ((user.emailVerificationOtpAttempts || 0) >= 5) {
      user.emailVerificationTokenHash = null;
      user.emailVerificationOtpHash = null;
      user.emailVerificationExpires = null;
      user.emailVerificationOtpAttempts = 0;
      await user.save({ validateBeforeSave: false });

      throw new AppError("Too many verification attempts. Please request a new code.", 429, "VERIFICATION_ATTEMPTS_EXCEEDED");
    }

    if (!user.emailVerificationOtpHash || user.emailVerificationOtpHash !== hashToken(String(otp).trim())) {
      user.emailVerificationOtpAttempts = (user.emailVerificationOtpAttempts || 0) + 1;
      await user.save({ validateBeforeSave: false });

      throw new AppError("Verification code is invalid or expired", 400, "INVALID_VERIFICATION_TOKEN");
    }
  }

  user.emailVerified = true;
  user.emailVerifiedAt = new Date();
  user.emailVerificationTokenHash = null;
  user.emailVerificationOtpHash = null;
  user.emailVerificationExpires = null;
  user.emailVerificationOtpAttempts = 0;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json({
    success: true,
    message: "Email verified successfully. You can now login.",
    data: null,
    error: null,
  });
});

export const resendVerificationEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email || !validator.isEmail(email)) {
    throw new AppError("Please provide a valid email", 400, "INVALID_EMAIL");
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user || user.role !== "client") {
    return res.status(200).json({
      success: true,
      message: "If the account exists, a verification email has been sent.",
      data: null,
      error: null,
    });
  }

  if (user.emailVerified) {
    return res.status(200).json({
      success: true,
      message: "Email is already verified.",
      data: null,
      error: null,
    });
  }

  const verification = await createEmailVerificationForUser(user);

  return res.status(200).json({
    success: true,
    message: "If the account exists, a verification email has been sent.",
    data: {
      emailVerification: getDevSecurityPayload(verification),
    },
    error: null,
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // console.log("===== forgotPassword request received =====");

  if (!email || !validator.isEmail(email)) {
    throw new AppError("Please provide a valid email", 400, "INVALID_EMAIL");
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user) {
    return res.status(200).json({
      success: true,
      message: "If the account exists, password reset instructions have been sent.",
      data: null,
      error: null,
    });
  }

  const reset = await createPasswordResetForUser(user);
  

  return res.status(200).json({
    success: true,
    message: "If the account exists, password reset instructions have been sent.",
    data: {
      passwordReset: getDevSecurityPayload(reset),
    },
    error: null,
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, email, otp, password } = req.body;

  if (!password) {
    throw new AppError("New password is required", 400, "PASSWORD_REQUIRED");
  }

  if (!isStrongPassword(password)) {
    throw new AppError(
      "Password must contain at least 8 characters, uppercase, lowercase, number and special character",
      400,
      "WEAK_PASSWORD"
    );
  }

  const resetFilter = {
    passwordResetExpires: { $gt: new Date() },
  };
  const isOtpReset = Boolean(!token && email && otp);

  if (token) {
    resetFilter.passwordResetTokenHash = hashToken(token);
  } else if (email && otp) {
    resetFilter.email = email.toLowerCase().trim();
  } else {
    throw new AppError("Reset token or email and OTP are required", 400, "RESET_TOKEN_REQUIRED");
  }

  const user = await User.findOne(resetFilter).select(
    "+passwordResetTokenHash +passwordResetOtpHash +passwordResetOtpAttempts"
  );

  if (!user) {
    throw new AppError("Reset token or OTP is invalid or expired", 400, "INVALID_RESET_TOKEN");
  }

  if (isOtpReset) {
    if ((user.passwordResetOtpAttempts || 0) >= 5) {
      user.passwordResetTokenHash = null;
      user.passwordResetOtpHash = null;
      user.passwordResetExpires = null;
      user.passwordResetOtpAttempts = 0;
      await user.save({ validateBeforeSave: false });

      throw new AppError("Too many reset attempts. Please request a new code.", 429, "RESET_ATTEMPTS_EXCEEDED");
    }

    if (!user.passwordResetOtpHash || user.passwordResetOtpHash !== hashToken(String(otp).trim())) {
      user.passwordResetOtpAttempts = (user.passwordResetOtpAttempts || 0) + 1;
      await user.save({ validateBeforeSave: false });

      throw new AppError("Reset token or OTP is invalid or expired", 400, "INVALID_RESET_TOKEN");
    }
  }

  user.password = password;
  user.passwordChangedAt = new Date();
  user.passwordResetTokenHash = null;
  user.passwordResetOtpHash = null;
  user.passwordResetExpires = null;
  user.passwordResetOtpAttempts = 0;
  user.emailVerified = true;
  user.emailVerifiedAt = user.emailVerifiedAt || new Date();
  user.emailVerificationTokenHash = null;
  user.emailVerificationOtpHash = null;
  user.emailVerificationExpires = null;
  user.emailVerificationOtpAttempts = 0;
  user.refreshTokenHash = null;
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  user.sessionVersion = (user.sessionVersion || 0) + 1;
  user.failedLoginAttempts = 0;
  user.failedLoginLockedUntil = null;
  await user.save();
  await AdminSession.updateMany(
    { userId: String(user._id), revokedAt: null },
    { $set: { revokedAt: new Date() } },
  );

  clearAuthCookies(res, req);
  clearSharedAuthCookie(res);

  return res.status(200).json({
    success: true,
    message: "Password reset successfully. Please login with your new password.",
    data: null,
    error: null,
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];

  if (!refreshToken) {
    throw new AppError("Refresh token is required", 401, "REFRESH_TOKEN_MISSING");
  }

  let decoded;

  try {
    decoded = jwt.verify(
      refreshToken,
      getRefreshSecret()
    );
  } catch {
    clearAuthCookies(res, req);
    throw new AppError("Invalid or expired refresh token", 401, "INVALID_REFRESH_TOKEN");
  }

  if (decoded.type !== "refresh") {
    clearAuthCookies(res, req);
    throw new AppError("Invalid refresh token", 401, "INVALID_REFRESH_TOKEN");
  }

  const user = await User.findById(decoded.id).select("+refreshTokenHash");

  if (!user || user.status !== "active") {
    clearAuthCookies(res, req);
    throw new AppError("Invalid or expired session", 401, "INVALID_SESSION");
  }

  if ((user.tokenVersion || 0) !== (decoded.tokenVersion || 0)) {
    clearAuthCookies(res, req);
    throw new AppError("Session has been invalidated", 401, "SESSION_INVALIDATED");
  }

  if (user.refreshTokenHash !== hashRefreshToken(refreshToken)) {
    user.refreshTokenHash = null;
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save({ validateBeforeSave: false });
    clearAuthCookies(res, req);
    throw new AppError("Refresh token reuse detected", 401, "REFRESH_REUSE_DETECTED");
  }

  const accessToken = await issueAuthCookies(req, res, user);
  user.refreshTokenHash = undefined;
  user.password = undefined;

  return res.status(200).json({
    success: true,
    message: "Session refreshed successfully",
    data: {
      user,
      token: accessToken,
    },
    error: null,
  });
});

export const getMe = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "User profile fetched successfully",
    data: {
      user: req.user,
    },
    error: null,
  });
});

export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];

  if (refreshToken) {
    try {
        const decoded = jwt.verify(
          refreshToken,
          getRefreshSecret()
        );

      if (decoded?.id) {
        await User.findByIdAndUpdate(decoded.id, {
          refreshTokenHash: null,
          $inc: { tokenVersion: 1 },
        });
      }
    } catch {
      // Invalid refresh cookies are cleared below.
    }
  } else if (req.user?._id) {
    await User.findByIdAndUpdate(req.user._id, {
      refreshTokenHash: null,
      $inc: { tokenVersion: 1 },
    });
  }

  clearAuthCookies(res, req);

  return res.status(200).json({
    success: true,
    message: "Logout successful",
    data: null,
    error: null,
  });
});

export const logoutAll = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (userId) {
    // Revoke all trusted devices for this admin and clear the cookie
    await revokeAllTrustedDevices(userId, res);

    // Perform normal logout database updates
    await User.findByIdAndUpdate(userId, {
      refreshTokenHash: null,
      $inc: { tokenVersion: 1 },
    });
  }

  // Clear standard auth cookies (accessToken and refreshToken)
  clearAuthCookies(res, req);

  return res.status(200).json({
    success: true,
    message: "Logged out from all devices successfully",
    data: null,
    error: null,
  });
});
