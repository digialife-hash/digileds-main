import crypto from "node:crypto";
import AdminTrustedDevice from "../models/AdminTrustedDevice.js";

const COOKIE_NAME = "admin_trusted_device";

// Cookie options for 72 hours
export const getTrustedDeviceCookieOptions = () => ({
  httpOnly: true,
  secure: true, // Always secure as per user request
  sameSite: "Strict",
  maxAge: 72 * 60 * 60 * 1000, // 72 hours in ms
});

/**
 * Parses user agent to extract basic browser and device info.
 */
export const parseUserAgent = (userAgentString = "") => {
  let browser = "Unknown Browser";
  let deviceName = "Unknown Device";

  if (!userAgentString) return { browser, deviceName };

  // Simple Browser detection
  if (userAgentString.includes("Firefox/")) {
    browser = "Firefox";
  } else if (userAgentString.includes("Edg/")) {
    browser = "Edge";
  } else if (userAgentString.includes("Chrome/")) {
    browser = "Chrome";
  } else if (userAgentString.includes("Safari/")) {
    browser = "Safari";
  } else if (userAgentString.includes("MSIE") || userAgentString.includes("Trident/")) {
    browser = "Internet Explorer";
  }

  // Simple OS / Device detection
  if (userAgentString.includes("Windows NT")) {
    deviceName = "Windows PC";
  } else if (userAgentString.includes("Macintosh")) {
    deviceName = "Mac";
  } else if (userAgentString.includes("iPhone")) {
    deviceName = "iPhone";
  } else if (userAgentString.includes("iPad")) {
    deviceName = "iPad";
  } else if (userAgentString.includes("Android")) {
    deviceName = "Android Device";
  } else if (userAgentString.includes("Linux")) {
    deviceName = "Linux PC";
  }

  return { browser, deviceName };
};

/**
 * Hash a plain text token with SHA-256
 */
export const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

/**
 * Generate a cryptographically secure random token (at least 64 random bytes)
 */
export const generateSecureToken = () => {
  return crypto.randomBytes(64).toString("hex");
};

/**
 * Create a new trusted device record and set the secure cookie on response.
 */
export const createTrustedDevice = async (adminId, req, res) => {
  // Generate secure random token
  const token = generateSecureToken();
  const tokenHash = hashToken(token);

  // Parse request metadata
  const userAgent = req.headers["user-agent"] || "";
  const { browser, deviceName } = parseUserAgent(userAgent);
  const ipAddress =
    req.headers["x-forwarded-for"] ||
    req.ip ||
    req.socket.remoteAddress ||
    "";

  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours

  // Save to MongoDB
  await AdminTrustedDevice.create({
    adminId,
    tokenHash,
    userAgent,
    browser,
    ipAddress,
    deviceName,
    expiresAt,
    lastUsedAt: new Date(),
  });

  // Set the cookie on response
  res.cookie(COOKIE_NAME, token, getTrustedDeviceCookieOptions());

  return token;
};

/**
 * Validate the trusted device token cookie for a given admin user.
 */
export const validateTrustedDevice = async (user, token, req) => {
  if (!token) return false;

  const tokenHash = hashToken(token);

  // Look up in MongoDB
  const record = await AdminTrustedDevice.findOne({
    tokenHash,
    adminId: user._id,
  });

  if (!record) return false;

  // Verify not expired
  if (record.expiresAt < new Date()) {
    return false;
  }

  // Verify not revoked
  if (record.revoked) {
    return false;
  }

  // Verify if password changed since token was created
  if (user.passwordChangedAt && record.createdAt < user.passwordChangedAt) {
    record.revoked = true;
    await record.save();
    return false;
  }

  // Update lastUsedAt timestamp
  record.lastUsedAt = new Date();
  await record.save();

  return true;
};


/**
 * Delete any expired trusted device records for that admin.
 */
export const cleanExpiredTrustedDevices = async (adminId) => {
  await AdminTrustedDevice.deleteMany({
    adminId,
    $or: [
      { expiresAt: { $lt: new Date() } },
      { revoked: true }
    ]
  });
};

/**
 * Delete all trusted device documents for the admin and clear the cookie.
 */
export const revokeAllTrustedDevices = async (adminId, res = null) => {
  await AdminTrustedDevice.deleteMany({ adminId });
  if (res) {
    res.clearCookie(COOKIE_NAME, getTrustedDeviceCookieOptions());
  }
};
