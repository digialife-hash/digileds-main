import express from "express";
import {
  registerPartner,
  getDashboardStats,
  getDashboardAnalytics,
  getActivities,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  referClient,
  getReferrals,
  getCommissions,
  updatePartnerProfile,
  getAllReferralPartners,
} from "../controllers/referralPartnerController.js";
import {
  getMyCompanyDocuments,
  downloadPartnerCompanyDocument,
} from "../controllers/partnerCompanyDocumentController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import { loginRateLimiter } from "../middlewares/loginRateLimiter.js";

const router = express.Router();

// Public registration route
router.post("/register", loginRateLimiter, registerPartner);

// Protected Referral Partner Dashboard routes
router.use(protect);

// Allow Admins, Employees and Referral Partners to fetch partner list
router.get(
  "/all",
  authorizeRoles("super_admin", "employee", "referral_partner"),
  getAllReferralPartners
);

// Allow Referral Partners, Admins, and Employees to access partner dashboard endpoints
router.use(authorizeRoles("referral_partner", "super_admin", "employee"));

router.get("/stats", getDashboardStats);
router.get("/analytics", getDashboardAnalytics);
router.get("/activities", getActivities);
router.get("/notifications", getNotifications);
router.put("/notifications/read-all", markAllNotificationsRead);
router.put("/notifications/:id/read", markNotificationRead);
router.post("/referral", referClient);
router.get("/referrals", getReferrals);
router.get("/commissions", getCommissions);
router.put("/profile", updatePartnerProfile);

// Company Documents for Referral Partners
router.get("/company-documents", getMyCompanyDocuments);
router.get("/company-documents/:id/download", downloadPartnerCompanyDocument);

export default router;
