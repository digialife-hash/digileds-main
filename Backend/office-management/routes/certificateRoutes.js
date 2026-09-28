import express from "express";
import {
  verifyCertificatePublic,
  getCertificateDashboardAnalytics,
  generateCertificate,
  getCertificates,
  getMyCertificates,
  getCertificateById,
  renewCertificate,
  revokeCertificate,
  deleteCertificate,
  getCertificateTypes,
} from "../controllers/certificateController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

// 1. PUBLIC ROUTES (QR Verification)
router.get("/verify-token/:token", verifyCertificatePublic);
router.get("/verify/:certificateNumber", verifyCertificatePublic);

// ALL OTHER ROUTES PROTECTED BY JWT
router.use(protect);

// My Certificates (Employee or Partner)
router.get("/my-certificates", getMyCertificates);

// Analytics & Types
router.get("/dashboard/analytics", getCertificateDashboardAnalytics);
router.get("/types", getCertificateTypes);

// Management Operations
router.post(
  "/generate",
  authorizeRoles("super_admin", "admin"),
  upload.single("partnerPhoto"),
  generateCertificate
);

router.get("/", getCertificates);
router.get("/:id", getCertificateById);

router.put(
  "/:id/renew",
  authorizeRoles("super_admin", "admin"),
  upload.single("partnerPhoto"),
  renewCertificate
);

router.put(
  "/:id/revoke",
  authorizeRoles("super_admin", "admin"),
  revokeCertificate
);

router.delete(
  "/:id",
  authorizeRoles("super_admin", "admin"),
  deleteCertificate
);

export default router;
