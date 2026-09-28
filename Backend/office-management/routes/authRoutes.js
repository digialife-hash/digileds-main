import express from "express";
import {
  register,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
} from "../controllers/authControllers.js";
import {
  login as sharedLogin,
  verifyMfaLogin as sharedVerifyMfaLogin,
  refresh as sharedRefresh,
  session as sharedSession,
  logout as sharedLogout,
  logoutAll as sharedLogoutAll,
} from "../../controllers/auth.controller.js";
import requireAdmin from "../../middleware/admin.middleware.js";
import { loginRateLimiter } from "../middlewares/loginRateLimiter.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

router.post("/register", loginRateLimiter, register);
// Use the shared authentication flow so Office users and legacy admins have
// the same MFA/passkey, lockout, session, and audit guarantees.
router.post("/login", loginRateLimiter, asyncHandler(sharedLogin));
router.post("/mfa/verify", loginRateLimiter, asyncHandler(sharedVerifyMfaLogin));
// Backward-compatible alias; this now verifies authenticator-app MFA, never email OTP.
router.post("/login/super-admin/verify-2fa", loginRateLimiter, asyncHandler(sharedVerifyMfaLogin));
router.post("/refresh", asyncHandler(sharedRefresh));
router.post("/verify-email", loginRateLimiter, verifyEmail);
router.post("/resend-verification", loginRateLimiter, resendVerificationEmail);
router.post("/forgot-password", loginRateLimiter, forgotPassword);
router.post("/reset-password", loginRateLimiter, resetPassword);
router.get("/me", asyncHandler(sharedSession));
router.post("/logout", asyncHandler(sharedLogout));
router.post("/logout-all", requireAdmin, asyncHandler(sharedLogoutAll));

// router
//   .route("/")
//   .get(protect, authorizeRoles("super_admin"), getAllInvoices)
//   .post(protect, authorizeRoles("super_admin", "employee"), createInvoice);


export default router;
