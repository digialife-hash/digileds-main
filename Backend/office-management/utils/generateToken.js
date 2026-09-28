import crypto from "node:crypto";
import jwt from "jsonwebtoken";

export const ACCESS_TOKEN_COOKIE = "accessToken";
export const REFRESH_TOKEN_COOKIE = "refreshToken";

const isProduction = () => process.env.NODE_ENV === "production";

const getRefreshSecret = () => {
  if (process.env.JWT_REFRESH_SECRET) return process.env.JWT_REFRESH_SECRET;
  if (isProduction()) {
    throw new Error("JWT_REFRESH_SECRET is required in production");
  }
  return process.env.JWT_SECRET;
};

export const accessTokenCookieOptions = (req = null) => {
  const isSecure = req
    ? (req.secure || req.headers["x-forwarded-proto"] === "https")
    : isProduction();
  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? "none" : "lax",
    maxAge: 15 * 60 * 1000,
    path: "/",
  };
};

export const refreshTokenCookieOptions = (req = null) => {
  const isSecure = req
    ? (req.secure || req.headers["x-forwarded-proto"] === "https")
    : isProduction();
  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  };
};

export const clearAuthCookies = (res, req = null) => {
  res.clearCookie(ACCESS_TOKEN_COOKIE, accessTokenCookieOptions(req));
  res.clearCookie(REFRESH_TOKEN_COOKIE, refreshTokenCookieOptions(req));
};

export const hashRefreshToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      tokenVersion: user.tokenVersion || 0,
      type: "access",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      tokenVersion: user.tokenVersion || 0,
      type: "refresh",
    },
    getRefreshSecret(),
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    }
  );
};

const generateToken = generateAccessToken;

export default generateToken;
