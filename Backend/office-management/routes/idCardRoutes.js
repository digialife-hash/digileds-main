import express from "express";
import {
  verifyQRCodePublic,
  getIDCardDashboardAnalytics,
  generateIDCard,
  getIDCards,
  getMyIDCard,
  getIDCardById,
  renewIDCard,
  revokeIDCard,
  suspendIDCard,
  regenerateQRToken,
  updateIDCard,
  deleteIDCard,
  exportIDCards,
} from "../controllers/idCardController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

// 1. PUBLIC ROUTES: QR Code Verification (NO AUTH REQUIRED FOR QR SCANNERS)
router.get("/verify-token/:token", verifyQRCodePublic);
router.get("/verify/:cardNumber", verifyQRCodePublic);

// ALL OTHER ROUTES PROTECTED BY JWT
router.use(protect);

// My ID Card (Employee or Referral Partner)
router.get("/my-card", getMyIDCard);

// Analytics & Export
router.get("/dashboard/analytics", getIDCardDashboardAnalytics);
router.get("/export", exportIDCards);

// Management Operations
router.post(
  "/generate",
  authorizeRoles("super_admin", "admin"),
  upload.single("partnerPhoto"),
  generateIDCard
);

router.get("/", getIDCards);
router.get("/:id", getIDCardById);
router.put("/:id", upload.single("partnerPhoto"), updateIDCard);

router.put(
  "/:id/renew",
  authorizeRoles("super_admin", "admin"),
  upload.single("partnerPhoto"),
  renewIDCard
);

router.put(
  "/:id/revoke",
  authorizeRoles("super_admin", "admin"),
  revokeIDCard
);

router.put(
  "/:id/suspend",
  authorizeRoles("super_admin", "admin"),
  suspendIDCard
);

router.post(
  "/:id/regenerate-qr",
  authorizeRoles("super_admin", "admin"),
  regenerateQRToken
);

router.delete(
  "/:id",
  authorizeRoles("super_admin", "admin"),
  deleteIDCard
);

export default router;
