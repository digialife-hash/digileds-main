import express from "express";
import { authLimiter } from "../middleware/limiters.js";
import {
  forgotPassword,
  currentSession,
  listSessions,
  revokeSession,
  disableMfa,
  enableMfa,
  login,
  registerUser,
  logout,
  logoutAll,
  listSecurityActivityForAdmin,
  revokeCurrentSession,
  refresh,
  resetPassword,
  setupMfa,
  session,
  verifyMfaLogin,
  verifyPasskeyLogin,
  passkeyRegistrationOptions,
  verifyPasskeyRegistration,
  listPasskeys,
  deletePasskey,
} from "../controllers/auth.controller.js";
import { asyncHandler } from "../middleware/async-handler.js";
import requireAdmin from "../middleware/admin.middleware.js";
const router = express.Router();
router.post("/api/auth/login", authLimiter, asyncHandler(login));
router.post("/api/auth/register", authLimiter, asyncHandler(registerUser));
router.post("/api/auth/mfa/verify", authLimiter, asyncHandler(verifyMfaLogin));
router.post("/api/auth/passkey/verify", authLimiter, asyncHandler(verifyPasskeyLogin));
router.post("/api/auth/logout", logout);
router.post("/api/auth/refresh", asyncHandler(refresh));
router.get("/api/auth/session", session);
router.get("/api/auth/me", session);
router.post("/api/auth/logout-all", requireAdmin, asyncHandler(logoutAll));
router.get("/api/auth/sessions/current", requireAdmin, asyncHandler(currentSession));
router.get("/api/auth/sessions", requireAdmin, asyncHandler(listSessions));
router.delete(
  "/api/auth/sessions/:sessionId",
  requireAdmin,
  asyncHandler(revokeSession),
);
router.delete(
  "/api/auth/sessions/current",
  requireAdmin,
  asyncHandler(revokeCurrentSession),
);
router.post("/api/auth/mfa/setup", requireAdmin, asyncHandler(setupMfa));
router.post("/api/auth/mfa/enable", requireAdmin, asyncHandler(enableMfa));
router.post("/api/auth/mfa/disable", requireAdmin, asyncHandler(disableMfa));
router.post(
  "/api/auth/passkeys/options",
  requireAdmin,
  asyncHandler(passkeyRegistrationOptions),
);
router.post(
  "/api/auth/passkeys/register",
  requireAdmin,
  asyncHandler(verifyPasskeyRegistration),
);
router.get("/api/auth/passkeys", requireAdmin, asyncHandler(listPasskeys));
router.delete(
  "/api/auth/passkeys/:credentialId",
  requireAdmin,
  asyncHandler(deletePasskey),
);
router.get(
  "/api/auth/security-activity",
  requireAdmin,
  asyncHandler(listSecurityActivityForAdmin),
);
router.post(
  "/api/auth/forgot-password",
  authLimiter,
  asyncHandler(forgotPassword),
);
router.post(
  "/api/auth/reset-password",
  authLimiter,
  asyncHandler(resetPassword),
);
export default router;
