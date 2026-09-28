import bcrypt from "bcrypt";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import {
  AUTH_COOKIE_NAME,
  AUTH_JWT_SECRET,
  AUTH_JWT_TTL,
  AUTH_MFA_COOKIE_NAME,
  AUTH_MFA_TTL,
  AUTH_REFRESH_COOKIE_NAME,
  AUTH_REFRESH_JWT_TTL,
  PASSKEY_COOKIE_NAME,
  IS_PRODUCTION,
} from "../config/environment.js";
import User from "../models/user.model.js";
import OfficeUser from "../office-management/models/User.js";
import { logSecurityActivity } from "./security-activity.js";

const LOGIN_FAILURE_LIMIT = 5;
const LOGIN_LOCKOUT_MS = 15 * 60 * 1000;

function writeCookie(res, cookieName, value, maxAge) {
  res.cookie(cookieName, value, {
    httpOnly: true,
    signed: true,
    secure: IS_PRODUCTION,
    sameSite: "lax",
    maxAge,
    path: "/",
  });
}

export async function verifyCredentials(login, password, req) {
  const value = String(login ?? "")
    .trim()
    .toLowerCase();
  const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const officeUser = await OfficeUser.findOne({
    $or: [
      { email: value },
      { name: new RegExp(`^${escapedValue}$`, "i") },
      { phone: value },
    ],
    status: "active",
    role: { $in: ["super_admin", "admin", "employee", "client", "referral_partner", "hr"] },
  })
    .select("+password +failedLoginAttempts +failedLoginLockedUntil +lastFailedLoginAt")
    .lean();

  // Keep legacy public-admin accounts readable during migration, but office
  // accounts remain the primary authentication source.
  const legacyUser = officeUser
    ? null
    : await User.findOne({
        role: { $in: ["admin", "user"] },
        isActive: 1,
        $or: [{ usernameLower: value }, { emailLower: value }],
      })
        .select("+mfaSecret +mfaEnabled +failedLoginAttempts +failedLoginLockedUntil +lastFailedLoginAt")
        .lean();
  const candidate = officeUser || legacyUser;
  const model = officeUser ? OfficeUser : User;
  const passwordHash = officeUser?.password || legacyUser?.passwordHash;

  if (!candidate || !passwordHash) {
    await logSecurityActivity({ req, event: "login_failed", success: false });
    return { user: null };
  }

  const userId = String(candidate._id);
  const lockedUntil = candidate.failedLoginLockedUntil
    ? new Date(candidate.failedLoginLockedUntil)
    : null;
  if (lockedUntil && lockedUntil.getTime() > Date.now()) {
    await logSecurityActivity({
      req,
      event: "login_locked",
      success: false,
      userId,
    });
    return { user: null, lockedUntil };
  }
  if (lockedUntil) {
    await model.updateOne(
      { _id: candidate._id },
      { $set: { failedLoginAttempts: 0, failedLoginLockedUntil: null } },
    );
  }

  const valid = await bcrypt.compare(String(password), passwordHash);
  if (!valid) {
    const attempts = (candidate.failedLoginAttempts || 0) + 1;
    const update = {
      $set: { lastFailedLoginAt: new Date() },
      $inc: { failedLoginAttempts: 1 },
    };
    let newLockedUntil = null;
    if (attempts >= LOGIN_FAILURE_LIMIT) {
      newLockedUntil = new Date(Date.now() + LOGIN_LOCKOUT_MS);
      update.$set.failedLoginLockedUntil = newLockedUntil;
    }
    await model.updateOne({ _id: candidate._id }, update);
    await logSecurityActivity({
      req,
      event: newLockedUntil ? "login_lockout" : "login_failed",
      success: false,
      userId,
    });
    return { user: null, lockedUntil: newLockedUntil };
  }

  if ((candidate.failedLoginAttempts || 0) > 0 || lockedUntil) {
    await model.updateOne(
      { _id: candidate._id },
      {
        $set: { failedLoginAttempts: 0, failedLoginLockedUntil: null },
        $unset: { lastFailedLoginAt: 1 },
      },
    );
  }

  if (officeUser) {
    return {
      user: {
        ...officeUser,
        id: userId,
        username: officeUser.username || officeUser.email,
        authSource: "office",
        isActive: 1,
      },
    };
  }
  return { user: { ...legacyUser, id: userId, authSource: "admin" } };
}

function signToken(user, expiresIn, tokenType) {
  return jwt.sign(
    {
      sub: String(user.id),
      username: user.username,
      role: user.role,
      sessionVersion: user.sessionVersion || 0,
      tenantId: user.tenantId ? String(user.tenantId) : null,
      sessionId: user.sessionId || null,
      tokenType,
      jti: crypto.randomUUID(),
    },
    AUTH_JWT_SECRET,
    { expiresIn, issuer: "demo-manager", audience: "app" },
  );
}

export function setAuthCookies(res, user) {
  writeCookie(
    res,
    AUTH_COOKIE_NAME,
    signToken(user, AUTH_JWT_TTL, "access"),
    60 * 60 * 1000,
  );
  writeCookie(
    res,
    AUTH_REFRESH_COOKIE_NAME,
    signToken(user, AUTH_REFRESH_JWT_TTL, "refresh"),
    30 * 24 * 60 * 60 * 1000,
  );
}

export function clearAuthCookie(res) {
  writeCookie(res, AUTH_COOKIE_NAME, "", 0);
  writeCookie(res, AUTH_REFRESH_COOKIE_NAME, "", 0);
}

export function setMfaChallengeCookie(res, user) {
  writeCookie(
    res,
    AUTH_MFA_COOKIE_NAME,
    signToken(user, AUTH_MFA_TTL, "mfa"),
    5 * 60 * 1000,
  );
}

export function setPasskeyChallengeCookie(res, user, challenge) {
  writeCookie(
    res,
    PASSKEY_COOKIE_NAME,
    jwt.sign(
      {
        sub: String(user.id || user._id),
        sessionVersion: user.sessionVersion || 0,
        challenge,
        tokenType: "passkey",
      },
      AUTH_JWT_SECRET,
      { expiresIn: "5m", issuer: "demo-manager", audience: "app" },
    ),
    5 * 60 * 1000,
  );
}

export function getPasskeyChallenge(req) {
  const token =
    req.signedCookies?.[PASSKEY_COOKIE_NAME] ||
    req.cookies?.[PASSKEY_COOKIE_NAME];
  if (!token) return null;
  try {
    const session = jwt.verify(token, AUTH_JWT_SECRET, {
      issuer: "demo-manager",
      audience: "app",
    });
    return session.tokenType === "passkey" ? session : null;
  } catch {
    return null;
  }
}

export function clearPasskeyChallengeCookie(res) {
  writeCookie(res, PASSKEY_COOKIE_NAME, "", 0);
}

export function clearMfaChallengeCookie(res) {
  writeCookie(res, AUTH_MFA_COOKIE_NAME, "", 0);
}

export function getMfaChallenge(req) {
  const token =
    req.signedCookies?.[AUTH_MFA_COOKIE_NAME] ||
    req.cookies?.[AUTH_MFA_COOKIE_NAME];
  if (!token) return null;
  try {
    const session = jwt.verify(token, AUTH_JWT_SECRET, {
      issuer: "demo-manager",
      audience: "app",
    });
    return session.tokenType === "mfa" ? session : null;
  } catch {
    return null;
  }
}

export function getAuthSession(req) {
  const token =
    req.signedCookies?.[AUTH_COOKIE_NAME] ||
    req.cookies?.[AUTH_COOKIE_NAME];
  if (!token) return null;
  try {
    const session = jwt.verify(token, AUTH_JWT_SECRET, {
      issuer: "demo-manager",
      audience: "app",
    });
    return session.tokenType && session.tokenType !== "access" ? null : session;
  } catch {
    return null;
  }
}

export function getRefreshSession(req) {
  const token =
    req.signedCookies?.[AUTH_REFRESH_COOKIE_NAME] ||
    req.cookies?.[AUTH_REFRESH_COOKIE_NAME];
  if (!token) return null;
  try {
    const session = jwt.verify(token, AUTH_JWT_SECRET, {
      issuer: "demo-manager",
      audience: "app",
    });
    return session.tokenType === "refresh" ? session : null;
  } catch {
    return null;
  }
}
