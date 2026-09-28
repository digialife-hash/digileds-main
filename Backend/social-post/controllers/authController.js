const crypto = require("crypto");
const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const requireAuth = require("../middleware/auth");
const { sendPasswordResetEmail } = require("../services/email");

const router = express.Router();
const sessionDays = Number(process.env.AUTH_SESSION_DAYS) || 30;
const sessionMaxAge = sessionDays * 24 * 60 * 60 * 1000;

function createToken(user) {
  return jwt.sign({
    sub: user._id.toString(),
    role: user.role,
    sessionVersion: user.sessionVersion || 0,
  }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || `${sessionDays}d`,
  });
}

function setAuthCookie(response, token) {
  response.cookie("auth_token", token, {
    httpOnly: true,
    signed: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: sessionMaxAge,
    path: "/",
  });
}

function validatePassword(password) {
  if (!password || password.length < 8) {
    return "Password must contain at least 8 characters";
  }
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
    return "Password must include uppercase, lowercase, and a number";
  }
  return null;
}

function validateCredentials({ name, email, password }, includeName = false) {
  if (includeName && (!name || name.trim().length < 2)) {
    return "Name must contain at least 2 characters";
  }
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return "A valid email is required";
  }
  if (!password || password.length < 8) {
    return "Password must contain at least 8 characters";
  }
  return includeName ? validatePassword(password) : null;
}

router.post("/login", async (request, response, next) => {
  try {
    const { email, password } = request.body;
    const validationError = validateCredentials({ email, password });
    if (validationError) {
      return response.status(400).json({ success: false, message: validationError });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      role: { $in: ["admin", "super_admin"] },
      isActive: 1,
      ...(request.tenantId ? { tenantId: request.tenantId } : {}),
    })
      .select("+password +passwordHash");
    const passwordMatches = user ? await user.comparePassword(password) : false;
    if (!user || !passwordMatches) {
      return response.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = createToken(user);
    setAuthCookie(response, token);
    response.json({ success: true, user: user.toPublicJSON() });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", (_request, response) => {
  response.clearCookie("auth_token", {
    httpOnly: true,
    signed: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  response.json({ success: true });
});

router.post("/forgot-password", async (request, response, next) => {
  const genericResponse = {
    success: true,
    message: "If an account exists for that email, a reset link has been sent.",
  };

  try {
    const email = typeof request.body.email === "string" ? request.body.email.trim().toLowerCase() : "";
    if (!/^\S+@\S+\.\S+$/.test(email)) return response.json(genericResponse);

    const user = await User.findOne({
      email,
      ...(request.tenantId ? { tenantId: request.tenantId } : {}),
    }).select("+resetPasswordTokenHash +resetPasswordExpiresAt");
    if (!user) return response.json(genericResponse);

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const clientUrl = (process.env.CLIENT_URL || "").split(",")[0].trim();
    const resetUrl = `${clientUrl}/social-post/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail({ email: user.email, name: user.name, resetUrl });
    return response.json(genericResponse);
  } catch (error) {
    next(error);
  }
});

router.post("/reset-password", async (request, response, next) => {
  try {
    const { token, password } = request.body;
    const validationError = validatePassword(password);
    if (!token || validationError) {
      return response.status(400).json({
        success: false,
        message: validationError || "A valid reset token is required",
      });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpiresAt: { $gt: new Date() },
      ...(request.tenantId ? { tenantId: request.tenantId } : {}),
    }).select("+resetPasswordTokenHash +resetPasswordExpiresAt");

    if (!user) {
      return response.status(400).json({
        success: false,
        message: "This reset link is invalid or has expired",
      });
    }

    user.password = password;
    user.sessionVersion = (user.sessionVersion || 0) + 1;
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();
    response.json({ success: true, message: "Password updated successfully. You can now log in." });
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAuth, (request, response) => {
  response.json({ success: true, user: request.user.toPublicJSON() });
});

router.patch("/me", requireAuth, async (request, response, next) => {
  try {
    const name = typeof request.body.name === "string" ? request.body.name.trim() : "";
    const email = typeof request.body.email === "string" ? request.body.email.trim().toLowerCase() : "";
    if (name.length < 2) return response.status(400).json({ success: false, message: "Name must contain at least 2 characters" });
    if (!/^\S+@\S+\.\S+$/.test(email)) return response.status(400).json({ success: false, message: "A valid email is required" });
    const existing = await User.findOne({
      email,
      _id: { $ne: request.user._id },
      ...(request.tenantId ? { tenantId: request.tenantId } : {}),
    });
    if (existing) return response.status(409).json({ success: false, message: "That email is already in use" });
    request.user.name = name;
    request.user.email = email;
    await request.user.save();
    response.json({ success: true, user: request.user.toPublicJSON() });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
