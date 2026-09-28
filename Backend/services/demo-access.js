import crypto from "crypto";
import * as store from "./data-repository.js";
import { SESSION_SECRET } from "../config/environment.js";

const COOKIE_NAME = "demo_access";
const PASSWORD_ITERATIONS = 120_000;

function encryptionKey() {
  return crypto
    .createHash("sha256")
    .update(String(SESSION_SECRET || ""))
    .digest();
}

export function encryptPassword(password) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(String(password), "utf8"),
    cipher.final(),
  ]);
  return `${iv.toString("base64url")}.${cipher
    .getAuthTag()
    .toString("base64url")}.${encrypted.toString("base64url")}`;
}

export function decryptPassword(value) {
  if (!value || !SESSION_SECRET) return "";
  try {
    const [ivValue, tagValue, encryptedValue] = String(value).split(".");
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      encryptionKey(),
      Buffer.from(ivValue, "base64url"),
    );
    decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
    return Buffer.concat([
      decipher.update(Buffer.from(encryptedValue, "base64url")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    return "";
  }
}

function sign(value) {
  return crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(value)
    .digest("base64url");
}

function timingSafeEqualText(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function hashPassword(
  password,
  salt = crypto.randomBytes(16).toString("hex"),
) {
  const hash = crypto
    .pbkdf2Sync(String(password), salt, PASSWORD_ITERATIONS, 32, "sha256")
    .toString("hex");
  return { hash, salt };
}

export function verifyPassword(password, hash, salt) {
  if (!hash || !salt) return false;
  const candidate = hashPassword(password, salt).hash;
  return timingSafeEqualText(candidate, hash);
}

export function generateCredentials() {
  return {
    username: `guest-${crypto.randomBytes(4).toString("hex")}`,
    password: crypto.randomBytes(12).toString("base64url"),
  };
}

export function createCredentialRecord(username, password) {
  const { hash, salt } = hashPassword(password);
  return {
    username,
    passwordHash: hash,
    passwordSalt: salt,
    passwordEncrypted: encryptPassword(password),
  };
}

export function makeSession(demo) {
  const value = `${demo.demoId}.${demo.credentialVersion || 1}.${demo.expiresAt}`;
  return `${value}.${sign(value)}`;
}

export function verifySession(token, demo) {
  if (!token || !demo || !SESSION_SECRET) return false;
  const parts = String(token).split(".");
  if (parts.length !== 4) return false;
  const [demoId, version, expiresAt, signature] = parts;
  const value = `${demoId}.${version}.${expiresAt}`;
  return (
    demoId === demo.demoId &&
    Number(version) === Number(demo.credentialVersion || 1) &&
    Number(expiresAt) >= Date.now() &&
    timingSafeEqualText(sign(value), signature)
  );
}

export function readCookie(req, name = COOKIE_NAME) {
  const header = req.get("cookie") || "";
  const match = header
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  if (!match) return "";
  try {
    return decodeURIComponent(match.slice(name.length + 1));
  } catch {
    return "";
  }
}

export function setAccessCookie(res, demo) {
  res.cookie?.(COOKIE_NAME, makeSession(demo), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: Math.max(0, demo.expiresAt - Date.now()),
    path: `/d/${demo.demoId}`,
  });
  if (!res.cookie)
    res.setHeader(
      "Set-Cookie",
      `${COOKIE_NAME}=${encodeURIComponent(makeSession(demo))}; HttpOnly; SameSite=Lax; Path=/d/${demo.demoId}; Max-Age=${Math.max(0, Math.floor((demo.expiresAt - Date.now()) / 1000))}`,
    );
}

export function clearAccessCookie(res, demoId) {
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/d/${demoId}; Max-Age=0`,
  );
}

export function hasAccess(req, demo) {
  return verifySession(readCookie(req), demo);
}

export function authenticateDemo(demo, username, password) {
  return (
    timingSafeEqualText(username, demo.accessUsername || "") &&
    verifyPassword(password, demo.accessPasswordHash, demo.accessPasswordSalt)
  );
}

export async function provisionCredentials(demoId, username, password, tenantId) {
  const credentials = createCredentialRecord(username, password);
  return await store.updateCredentials(demoId, credentials, tenantId);
}

export { COOKIE_NAME };
