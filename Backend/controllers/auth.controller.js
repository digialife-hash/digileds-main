import crypto from "node:crypto";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import User from "../models/user.model.js";
import OfficeUser from "../office-management/models/User.js";
import PasswordResetToken from "../models/password-reset-token.model.js";
import {
  FRONTEND_URL,
  PASSWORD_RESET_DAILY_LIMIT,
  PASSWORD_RESET_TTL_MS,
  SMTP_FROM,
  SMTP_HOST,
  SMTP_PASSWORD,
  SMTP_PORT,
  SMTP_USER,
} from "../config/environment.js";
import {
  clearAuthCookie,
  clearMfaChallengeCookie,
  getMfaChallenge,
  getAuthSession,
  getRefreshSession,
  setMfaChallengeCookie,
  setPasskeyChallengeCookie,
  getPasskeyChallenge,
  clearPasskeyChallengeCookie,
  setAuthCookies,
  verifyCredentials,
} from "../services/admin-auth.js";
import { logSecurityActivity, listSecurityActivity } from "../services/security-activity.js";
import {
  createOtpAuthUri,
  generateTotpSecret,
  verifyTotp,
} from "../utils/totp.js";
import { TOTP_ISSUER } from "../config/environment.js";
import AdminSession from "../models/admin-session.model.js";
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import {
  WEBAUTHN_ALLOWED_ORIGINS,
  WEBAUTHN_RP_ID,
  WEBAUTHN_RP_NAME,
} from "../config/environment.js";

async function createAdminSession(req, user) {
  const sessionId = crypto.randomUUID();
  await AdminSession.create({
    sessionId,
    userId: String(user.id || user._id),
    tenantId:
      user.role === "super_admin"
        ? user.tenantId || null
        : user.tenantId || req.tenantId || null,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    ip: String(req.ip || req.socket?.remoteAddress || "").slice(0, 128),
    userAgent: String(req.get?.("user-agent") || "").slice(0, 512),
  });
  return sessionId;
}

function canAccessTenant(user, tenantId) {
  if (!user || user.role === "super_admin" || !user.tenantId || !tenantId) {
    return true;
  }
  return String(user.tenantId) === String(tenantId);
}

function passkeySummary(user) {
  return (user.passkeys || []).map((passkey) => ({
    id: passkey.credentialId,
    name: passkey.name,
    deviceType: passkey.deviceType,
    backedUp: Boolean(passkey.backedUp),
    createdAt: passkey.createdAt,
    lastUsedAt: passkey.lastUsedAt,
  }));
}

async function findSecurityUser(userId, select = "") {
  const officeUser = await OfficeUser.findOne({
    _id: userId,
    status: "active",
  }).select(select).lean();
  if (officeUser) return { user: officeUser, model: OfficeUser };

  const legacyUser = await User.findOne({
    _id: userId,
    role: "admin",
    isActive: 1,
  }).select(select).lean();
  return legacyUser ? { user: legacyUser, model: User } : null;
}

function getWebAuthnContext(req) {
  const requestOrigin = String(req.get?.("origin") || "").replace(/\/+$/, "");
  const origin = WEBAUTHN_ALLOWED_ORIGINS.includes(requestOrigin)
    ? requestOrigin
    : WEBAUTHN_ALLOWED_ORIGINS[0];
  let rpID = WEBAUTHN_RP_ID;
  try {
    const hostname = new URL(origin).hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      rpID = hostname;
    }
  } catch {
    // Configuration validation is handled by the WebAuthn verifier.
  }
  return { origin, rpID };
}

async function createPasskeyAuthenticationChallenge(req, res, user) {
  const { rpID } = getWebAuthnContext(req);
  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: "preferred",
    allowCredentials: (user.passkeys || []).map((passkey) => ({
      id: passkey.credentialId,
      type: "public-key",
    })),
  });
  setPasskeyChallengeCookie(res, user, options.challenge);
  return options;
}

export async function login(req, res) {
  const credentialResult = await verifyCredentials(
    req.body?.login,
    req.body?.password,
    req,
  );
  if (credentialResult.lockedUntil) {
    return res.status(429).json({
      success: false,
      message:
        "Too many incorrect login attempts. Your account is temporarily locked for security.",
      lockedUntil: credentialResult.lockedUntil.toISOString(),
    });
  }
  const user = credentialResult.user;
  const allowedRoles = new Set([
    "user",
    "admin",
    "super_admin",
    "employee",
    "client",
    "referral_partner",
    "hr",
  ]);
  if (!user || !allowedRoles.has(user.role)) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid admin credentials." });
  }
  if (!canAccessTenant(user, req.tenantId)) {
    return res.status(403).json({
      success: false,
      message: "User is not assigned to this tenant.",
    });
  }
  if (user.mfaEnabled) {
    setMfaChallengeCookie(res, user);
    await logSecurityActivity({
      req,
      event: "login_password",
      success: true,
      userId: user.id,
    });
  }

  if (user.passkeys?.length) {
    const options = await createPasskeyAuthenticationChallenge(req, res, user);
    return res.json({
      success: true,
      passkeyRequired: true,
      passkeyOptions: options,
      mfaRequired: Boolean(user.mfaEnabled),
      message: "Use your registered passkey to finish signing in.",
    });
  }
  if (user.mfaEnabled) {
    return res.json({
      success: true,
      mfaRequired: true,
      message: "Enter the six-digit code from your authenticator app.",
    });
  }
  const sessionId = await createAdminSession(req, user);
  setAuthCookies(res, {
    ...user,
    tenantId:
      user.role === "super_admin" ? user.tenantId || null : user.tenantId || req.tenantId,
    sessionId,
  });
  await logSecurityActivity({
    req,
    event: "login",
    success: true,
    userId: user.id,
  });
  return res.json({
    success: true,
    user: {
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      authSource: user.authSource,
      mfaEnabled: Boolean(user.mfaEnabled),
      permissions: user.permissions || {},
    },
    data: {
      user: {
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        authSource: user.authSource,
        mfaEnabled: Boolean(user.mfaEnabled),
        permissions: user.permissions || {},
      },
    },
  });
}

export async function registerUser(req, res) {
  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");

  if (name.length < 2) {
    return res.status(400).json({ success: false, message: "Name must contain at least 2 characters." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: "Please provide a valid email." });
  }
  if (
    password.length < 8 ||
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/[0-9]/.test(password) ||
    !/[^A-Za-z0-9]/.test(password)
  ) {
    return res.status(400).json({
      success: false,
      message: "Password must contain 8+ characters, uppercase, lowercase, number and special character.",
    });
  }

  const emailExists = await User.findOne({ emailLower: email }).select("_id").lean();
  const officeEmailExists = await OfficeUser.findOne({ email }).select("_id").lean();
  if (emailExists || officeEmailExists) {
    return res.status(409).json({ success: false, message: "An account with this email already exists." });
  }

  const username = email.split("@")[0].replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 40) || `user${Date.now()}`;
  const usernameExists = await User.findOne({ usernameLower: username.toLowerCase() }).select("_id").lean();
  const uniqueUsername = usernameExists ? `${username}-${Date.now().toString().slice(-6)}` : username;
  const user = await User.create({
    name,
    username: uniqueUsername,
    usernameLower: uniqueUsername.toLowerCase(),
    email,
    emailLower: email,
    passwordHash: await bcrypt.hash(password, 12),
    role: "user",
    tenantId: req.tenantId,
    isActive: 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  await logSecurityActivity({ req, event: "user_registration", success: true, userId: user._id });
  return res.status(201).json({
    success: true,
    message: "Account created successfully. This account does not have dashboard access.",
    data: { user: { name: user.name, email: user.email, role: user.role } },
  });
}

export async function verifyPasskeyLogin(req, res) {
  const challenge = getPasskeyChallenge(req);
  if (!challenge) {
    return res.status(401).json({ success: false, message: "Passkey challenge expired." });
  }
  const record = await findSecurityUser(challenge.sub);
  const user = record?.user;
  if (!user || (challenge.sessionVersion || 0) !== (user.sessionVersion || 0)) {
    clearPasskeyChallengeCookie(res);
    return res.status(401).json({ success: false, message: "Unauthorized." });
  }
  const credential = (user.passkeys || []).find(
    (passkey) => passkey.credentialId === req.body?.id,
  );
  if (!credential) {
    await logSecurityActivity({ req, event: "passkey_login", success: false, userId: user._id });
    return res.status(401).json({ success: false, message: "Passkey is not registered." });
  }
  try {
    const { origin, rpID } = getWebAuthnContext(req);
    const verification = await verifyAuthenticationResponse({
      response: req.body,
      expectedChallenge: challenge.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: credential.credentialId,
        publicKey: Buffer.from(credential.publicKey, "base64url"),
        counter: credential.counter,
      },
    });
    if (!verification.verified) throw new Error("Passkey verification failed.");
    await record.model.updateOne(
      { _id: user._id, "passkeys.credentialId": credential.credentialId },
      {
        $set: {
          "passkeys.$.counter": verification.authenticationInfo.newCounter,
          "passkeys.$.lastUsedAt": new Date(),
        },
      },
    );
    clearPasskeyChallengeCookie(res);
    const sessionId = await createAdminSession(req, user);
    setAuthCookies(res, {
      ...user,
      id: String(user._id),
      tenantId: user.role === "super_admin" ? user.tenantId || null : user.tenantId || req.tenantId,
      sessionId,
    });
    await logSecurityActivity({ req, event: "passkey_login", success: true, userId: user._id });
    return res.json({ success: true });
  } catch (error) {
    await logSecurityActivity({ req, event: "passkey_login", success: false, userId: user._id });
    return res.status(401).json({ success: false, message: "Passkey verification failed." });
  }
}

export async function passkeyRegistrationOptions(req, res) {
  const record = await findSecurityUser(req.user.sub);
  const user = record?.user;
  if (!user) return res.status(401).json({ success: false, message: "Unauthorized." });
  const { rpID } = getWebAuthnContext(req);
  const options = await generateRegistrationOptions({
    rpName: WEBAUTHN_RP_NAME,
    rpID,
    userID: new Uint8Array(Buffer.from(String(user._id), "utf8")),
    userName: user.email || user.username,
    userDisplayName: user.name || user.username,
    attestationType: "none",
    excludeCredentials: (user.passkeys || []).map((passkey) => ({
      id: passkey.credentialId,
      type: "public-key",
    })),
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
    },
  });
  setPasskeyChallengeCookie(res, user, options.challenge);
  return res.json({ success: true, options });
}

export async function verifyPasskeyRegistration(req, res) {
  const challenge = getPasskeyChallenge(req);
  if (!challenge) return res.status(401).json({ success: false, message: "Passkey challenge expired." });
  const record = await findSecurityUser(req.user.sub);
  const user = record?.user;
  if (!user || challenge.sub !== String(user._id)) {
    return res.status(401).json({ success: false, message: "Unauthorized." });
  }
  try {
    const { origin, rpID } = getWebAuthnContext(req);
    const verification = await verifyRegistrationResponse({
      response: req.body,
      expectedChallenge: challenge.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });
    if (!verification.verified || !verification.registrationInfo) {
      throw new Error("Passkey registration failed.");
    }
    const info = verification.registrationInfo;
    const credentialId = info.credential?.id;
    const publicKey = info.credential?.publicKey;
    if (!credentialId || !publicKey) {
      throw new Error("WebAuthn registration returned no credential data.");
    }
    await record.model.updateOne(
      { _id: user._id },
      {
        $push: {
          passkeys: {
            credentialId,
            publicKey: Buffer.from(publicKey).toString("base64url"),
            counter: info.credential.counter,
            deviceType: info.credentialDeviceType,
            backedUp: info.credentialBackedUp,
            name: String(req.body?.name || "Passkey").slice(0, 80),
          },
        },
      },
    );
    clearPasskeyChallengeCookie(res);
    await logSecurityActivity({ req, event: "passkey_register", success: true, userId: user._id });
    return res.json({ success: true, message: "Passkey registered." });
  } catch (error) {
    console.error("Passkey registration verification failed:", error.message);
    await logSecurityActivity({ req, event: "passkey_register", success: false, userId: user._id });
    return res.status(400).json({
      success: false,
      message: "Passkey registration failed.",
      detail: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
}

export async function listPasskeys(req, res) {
  const record = await findSecurityUser(req.user.sub);
  const user = record?.user;
  return res.json({ success: true, passkeys: passkeySummary(user || {}) });
}

export async function deletePasskey(req, res) {
  const credentialId = String(req.params.credentialId || "");
  const record = await findSecurityUser(req.user.sub);
  if (!record) return res.status(401).json({ success: false, message: "Unauthorized." });
  const result = await record.model.updateOne(
    { _id: req.user.sub },
    { $pull: { passkeys: { credentialId } } },
  );
  if (!result.modifiedCount) return res.status(404).json({ success: false, message: "Passkey not found." });
  await logSecurityActivity({ req, event: "passkey_revoke", success: true, userId: req.user.sub });
  return res.json({ success: true });
}

export async function verifyMfaLogin(req, res) {
  const challenge = getMfaChallenge(req);
  if (!challenge) {
    await logSecurityActivity({ req, event: "mfa_login", success: false });
    return res.status(401).json({ success: false, message: "MFA challenge expired." });
  }
  const record = await findSecurityUser(challenge.sub, "+mfaSecret +mfaEnabled");
  const user = record?.user;
  if (
    !user ||
    !user.mfaEnabled ||
    (challenge.sessionVersion || 0) !== (user.sessionVersion || 0) ||
    !verifyTotp(user.mfaSecret, req.body?.otp)
  ) {
    await logSecurityActivity({
      req,
      event: "mfa_login",
      success: false,
      userId: user?._id,
    });
    return res.status(401).json({ success: false, message: "Invalid authentication code." });
  }
  clearMfaChallengeCookie(res);
  const sessionId = await createAdminSession(req, user);
  setAuthCookies(res, {
    id: String(user._id),
    username: user.username,
    role: user.role,
    sessionVersion: user.sessionVersion || 0,
    sessionId,
  });
  await logSecurityActivity({
    req,
    event: "mfa_login",
    success: true,
    userId: user._id,
  });
  return res.json({
    success: true,
    user: {
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    data: {
      user: {
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        authSource: record.model === OfficeUser ? "office" : "admin",
        mfaEnabled: true,
        permissions: user.permissions || {},
      },
    },
  });
}

export async function logout(req, res) {
  const auth = getAuthSession(req);
  if (auth?.sessionId) {
    await AdminSession.updateOne(
      { sessionId: auth.sessionId, userId: String(auth.sub) },
      { $set: { revokedAt: new Date() } },
    );
  }
  clearAuthCookie(res);
  clearMfaChallengeCookie(res);
  await logSecurityActivity({
    req,
    event: "logout",
    success: true,
    userId: auth?.sub,
  });
  return res.json({ success: true });
}

export async function logoutAll(req, res) {
  const userId = req.user?.sub;
  const record = await findSecurityUser(userId);
  if (record) {
    await record.model.updateOne({ _id: userId }, { $inc: { sessionVersion: 1 } });
  }
  await AdminSession.updateMany(
    { userId: String(userId), revokedAt: null },
    { $set: { revokedAt: new Date() } },
  );
  clearAuthCookie(res);
  clearMfaChallengeCookie(res);
  await logSecurityActivity({ req, event: "session_revoke_all", success: true, userId });
  return res.json({ success: true, message: "All admin sessions have been revoked." });
}

export async function currentSession(req, res) {
  return res.json({
    success: true,
    session: {
      id: req.user?.jti || null,
      issuedAt: req.user?.iat ? new Date(req.user.iat * 1000).toISOString() : null,
      expiresAt: req.user?.exp ? new Date(req.user.exp * 1000).toISOString() : null,
      current: true,
    },
  });
}

export async function listSessions(req, res) {
  const sessions = await AdminSession.find({
    userId: String(req.user.sub),
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  })
    .sort({ lastSeenAt: -1 })
    .select("sessionId createdAt lastSeenAt expiresAt ip userAgent")
    .lean();
  return res.json({
    success: true,
    sessions: sessions.map((session) => ({
      ...session,
      current: session.sessionId === req.user.sessionId,
    })),
  });
}

export async function revokeSession(req, res) {
  const sessionId = String(req.params.sessionId || "");
  if (!sessionId || sessionId.length > 100) {
    return res.status(400).json({ success: false, message: "Invalid session." });
  }
  const result = await AdminSession.updateOne(
    { sessionId, userId: String(req.user.sub), revokedAt: null },
    { $set: { revokedAt: new Date() } },
  );
  if (!result.matchedCount) {
    return res.status(404).json({ success: false, message: "Session not found." });
  }
  const current = sessionId === req.user.sessionId;
  if (current) clearAuthCookie(res);
  await logSecurityActivity({
    req,
    event: "session_revoke",
    success: true,
    userId: req.user.sub,
  });
  return res.json({ success: true, current });
}

export async function revokeCurrentSession(req, res) {
  return logoutAll(req, res);
}

export async function setupMfa(req, res) {
  const record = await findSecurityUser(req.user.sub, "+pendingMfaSecret");
  const user = record?.user;
  if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });
  const secret = generateTotpSecret();
  await record.model.updateOne({ _id: user._id }, { $set: { pendingMfaSecret: secret } });
  return res.json({
    success: true,
    secret,
    otpauthUrl: createOtpAuthUri({
      secret,
      account: user.email || user.username,
      issuer: TOTP_ISSUER,
    }),
  });
}

export async function enableMfa(req, res) {
  const record = await findSecurityUser(req.user.sub, "+pendingMfaSecret");
  const user = record?.user;
  if (!user || !verifyTotp(user.pendingMfaSecret, req.body?.otp)) {
    await logSecurityActivity({ req, event: "mfa_enable", success: false, userId: req.user.sub });
    return res.status(400).json({ success: false, message: "The authentication code is invalid." });
  }
  await record.model.updateOne(
    { _id: user._id },
    {
      $set: { mfaSecret: user.pendingMfaSecret, mfaEnabled: true },
      $unset: { pendingMfaSecret: 1 },
      $inc: { sessionVersion: 1 },
    },
  );
  await AdminSession.updateMany(
    { userId: String(user._id), revokedAt: null },
    { $set: { revokedAt: new Date() } },
  );
  clearAuthCookie(res);
  await logSecurityActivity({ req, event: "mfa_enable", success: true, userId: user._id });
  return res.json({ success: true, message: "MFA is enabled." });
}

export async function disableMfa(req, res) {
  const record = await findSecurityUser(req.user.sub, "+mfaSecret +mfaEnabled");
  const user = record?.user;
  if (!user?.mfaEnabled || !verifyTotp(user.mfaSecret, req.body?.otp)) {
    await logSecurityActivity({ req, event: "mfa_disable", success: false, userId: req.user.sub });
    return res.status(400).json({ success: false, message: "The authentication code is invalid." });
  }
  await record.model.updateOne(
    { _id: user._id },
    {
      $set: { mfaEnabled: false },
      $unset: { mfaSecret: 1, pendingMfaSecret: 1 },
      $inc: { sessionVersion: 1 },
    },
  );
  await AdminSession.updateMany(
    { userId: String(user._id), revokedAt: null },
    { $set: { revokedAt: new Date() } },
  );
  clearAuthCookie(res);
  await logSecurityActivity({ req, event: "mfa_disable", success: true, userId: user._id });
  return res.json({ success: true, message: "MFA is disabled." });
}

export async function listSecurityActivityForAdmin(req, res) {
  const successParam = String(req.query?.success || "").toLowerCase();
  const result = await listSecurityActivity({
    event: req.query?.event,
    success: successParam === "true" ? true : successParam === "false" ? false : undefined,
    page: req.query?.page,
    limit: req.query?.limit,
  });
  return res.json({ success: true, ...result });
}

export async function refresh(req, res) {
  const auth = getRefreshSession(req);
  if (!auth) {
    return res.status(401).json({ success: false, message: "Refresh token is invalid or expired." });
  }

  const officeUser = await OfficeUser.findById(auth.sub).lean();
  const adminUser = officeUser ? null : await User.findById(auth.sub).lean();
  const user = officeUser || adminUser;
  const authSource = officeUser ? "office" : "admin";
  if (
    !user
    || !isActiveAuthenticatedUser(user)
    || (auth.sessionVersion || 0) !== (user.sessionVersion || 0)
  ) {
    clearAuthCookie(res);
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  if (auth.sessionId) {
    const activeSession = await AdminSession.findOne({
      sessionId: auth.sessionId,
      userId: String(user._id),
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    }).lean();
    if (!activeSession) {
      clearAuthCookie(res);
      return res.status(401).json({ success: false, message: "Session revoked." });
    }
  }

  setAuthCookies(res, {
    id: String(user._id),
    username: user.username,
    role: user.role,
    sessionVersion: user.sessionVersion || 0,
    sessionId: auth.sessionId,
  });
  if (auth.sessionId) {
    await AdminSession.updateOne(
      { sessionId: auth.sessionId, userId: String(auth.sub), revokedAt: null },
      { $set: { lastSeenAt: new Date() } },
    );
  }
  return res.json({ success: true });
}

export async function session(req, res) {
  let auth = getAuthSession(req);
  if (!auth) {
    auth = getRefreshSession(req);
    if (auth) {
      const officeUser = await OfficeUser.findById(auth.sub).lean();
      const adminUser = officeUser ? null : await User.findById(auth.sub).lean();
      const user = officeUser || adminUser;
      const authSource = officeUser ? "office" : "admin";
      if (!user || !isActiveAuthenticatedUser(user) || (auth.sessionVersion || 0) !== (user.sessionVersion || 0)) {
        clearAuthCookie(res);
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }
      if (auth.sessionId) {
        const activeSession = await AdminSession.findOne({
          sessionId: auth.sessionId,
          userId: String(user._id),
          revokedAt: null,
          expiresAt: { $gt: new Date() },
        }).lean();
        if (!activeSession) {
          clearAuthCookie(res);
          return res.status(401).json({ success: false, message: "Session revoked." });
        }
      }
      setAuthCookies(res, {
        id: auth.sub,
        username: user.username,
        role: user.role,
        sessionVersion: user.sessionVersion || 0,
        sessionId: auth.sessionId,
      });
    }
  }
  if (!auth) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const officeUser = await OfficeUser.findById(auth.sub).lean();
  const adminUser = officeUser ? null : await User.findById(auth.sub).lean();
  const user = officeUser || adminUser;
  const authSource = officeUser ? "office" : "admin";

  if (
    !user
    || !isActiveAuthenticatedUser(user)
    || (auth.sessionVersion || 0) !== (user.sessionVersion || 0)
  ) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  if (auth.sessionId) {
    const activeSession = await AdminSession.findOne({
      sessionId: auth.sessionId,
      userId: String(user._id),
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    }).lean();
    if (!activeSession) {
      clearAuthCookie(res);
      return res.status(401).json({ success: false, message: "Session revoked." });
    }
  }

  return res.json({
    success: true,
    user: {
      id: String(user._id),
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      authSource,
      mfaEnabled: Boolean(user.mfaEnabled),
      passkeyCount: Array.isArray(user.passkeys) ? user.passkeys.length : 0,
      permissions: user.permissions || {},
    },
  });
}

async function findAuthenticatedUser(userId) {
  const officeUser = await OfficeUser.findById(userId).lean();
  if (officeUser) return officeUser;
  return User.findById(userId).lean();
}

function isActiveAuthenticatedUser(user) {
  if (!user) return false;
  if (typeof user.status === "string") {
    return user.status === "active";
  }
  return user.isActive === 1;
}

export async function forgotPassword(req, res) {
  const email = String(req.body?.email || "")
    .trim()
    .toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Please enter a valid email address.",
      });
  }
  const officeUser = await OfficeUser.findOne({ email, status: "active" }).lean();
  const legacyUser = officeUser
    ? null
    : await User.findOne({
        emailLower: email,
        role: { $in: ["admin", "user"] },
        isActive: 1,
      }).lean();
  const user = officeUser || legacyUser;
  if (!user) {
    await logSecurityActivity({ req, event: "password_reset_request", success: false });
    return res
      .json({ success: true, message: "If an account exists for that email, a reset link has been sent." });
  }
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD || !SMTP_FROM) {
    return res.status(503).json({
      success: false,
      message:
        "Password reset email is not configured. Please contact the system administrator.",
    });
  }

  try {
    const today = new Date().toISOString().slice(0, 10);
    const resetModel = officeUser ? OfficeUser : User;
    const resetFilter = officeUser
      ? { _id: user._id, status: "active" }
      : {
          _id: user._id,
          role: { $in: ["admin", "user"] },
          isActive: 1,
        };
    const resetQuota = await resetModel.findOneAndUpdate(
      resetFilter,
      { $set: { passwordResetEmailDate: today }, $inc: { passwordResetEmailCount: 1 } },
      { new: true, lean: true },
    );
    if (!resetQuota) {
      return res.status(429).json({
        success: false,
        message: `Daily password reset email limit reached (${PASSWORD_RESET_DAILY_LIMIT}). Please try again tomorrow.`,
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    await PasswordResetToken.create({
      tenantId: req.tenantId || user.tenantId || null,
      userId: String(user._id),
      tokenHash: crypto.createHash("sha256").update(rawToken).digest("hex"),
      expiresAt: Date.now() + PASSWORD_RESET_TTL_MS,
      usedAt: null,
      createdAt: Date.now(),
    });
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
    });
    await transporter.sendMail({
      from: SMTP_FROM,
      to: user.email,
      subject: "Reset your password",
      text: `Reset your password: ${FRONTEND_URL}/reset-password?token=${rawToken}`,
    });
  } catch (error) {
    console.error("Password reset email failed:", error.message);
    return res.status(502).json({
      success: false,
      message:
        "Password reset email could not be sent. Please try again later.",
    });
  }
  await logSecurityActivity({
    req,
    event: "password_reset_request",
    success: true,
    userId: user._id,
  });
  return res.json({
    success: true,
    message: "Password reset link sent successfully. Check your email.",
  });
}

export async function resetPassword(req, res) {
  const token = String(req.body?.token || "");
  const password = String(req.body?.password || "");
  if (!/^[a-f0-9]{64}$/i.test(token)) {
    await logSecurityActivity({ req, event: "password_reset", success: false });
    return res
      .status(400)
      .json({ success: false, message: "Reset link is invalid." });
  }
  if (
    password.length < 8 ||
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/[0-9]/.test(password) ||
    !/[^A-Za-z0-9]/.test(password)
  ) {
    await logSecurityActivity({ req, event: "password_reset", success: false });
    return res
      .status(400)
      .json({
        success: false,
        message: "Password must contain 8+ characters, uppercase, lowercase, number and special character.",
      });
  }
  const record = await PasswordResetToken.findOneAndUpdate(
    {
      tokenHash: crypto.createHash("sha256").update(token).digest("hex"),
      usedAt: null,
      expiresAt: { $gt: Date.now() },
    },
    { $set: { usedAt: Date.now() } },
    { new: false },
  ).lean();
  if (!record) {
    await logSecurityActivity({ req, event: "password_reset", success: false });
    return res
      .status(400)
      .json({ success: false, message: "Reset link is invalid or expired." });
  }
  const officeUser = await OfficeUser.findOne({ _id: record.userId, status: "active" }).select("+password").lean();
  const updateResult = officeUser
    ? await OfficeUser.updateOne(
        { _id: record.userId, status: "active" },
        {
          $set: {
            password: await bcrypt.hash(password, 12),
            failedLoginAttempts: 0,
            failedLoginLockedUntil: null,
          },
          $inc: { sessionVersion: 1, tokenVersion: 1 },
        },
      )
    : await User.updateOne(
        { _id: record.userId, role: { $in: ["admin", "user"] }, isActive: 1 },
        {
          $set: {
            passwordHash: await bcrypt.hash(password, 12),
            updatedAt: Date.now(),
            failedLoginAttempts: 0,
            failedLoginLockedUntil: null,
          },
          $inc: { sessionVersion: 1 },
        },
      );
  if (updateResult.matchedCount !== 1) {
    await logSecurityActivity({
      req,
      event: "password_reset",
      success: false,
      userId: record.userId,
    });
    await PasswordResetToken.updateOne(
      { _id: record._id, usedAt: { $ne: null } },
      { $set: { usedAt: null } },
    );
    return res
      .status(400)
      .json({
        success: false,
        message: "Account is no longer available.",
      });
  }
  await AdminSession.updateMany(
    { userId: String(record.userId), revokedAt: null },
    { $set: { revokedAt: new Date() } },
  );
  await logSecurityActivity({ req, event: "password_reset", success: true, userId: record.userId });
  return res.json({ success: true, message: "Password reset successfully." });
}
