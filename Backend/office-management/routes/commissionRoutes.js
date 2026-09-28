import express from "express";
import {
  getCommissionDashboardAnalytics,
  getCommissionRules,
  createOrUpdateCommissionRule,
  previewCommission,
  autoGenerateCommission,
  getCommissions,
  getCommissionById,
  approveOrRejectCommission,
  adjustCommission,
  processPayment,
  uploadPaymentProof,
  exportCommissions,
} from "../controllers/commissionController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.use(protect);

// Analytics & Export
router.get("/dashboard/analytics", authorizeRoles("super_admin", "admin", "referral_partner"), getCommissionDashboardAnalytics);
router.get("/export", authorizeRoles("super_admin", "admin", "referral_partner"), exportCommissions);

// Rules Configuration
router.get("/rules", authorizeRoles("super_admin", "admin", "referral_partner"), getCommissionRules);
router.post("/rules", authorizeRoles("super_admin"), createOrUpdateCommissionRule);

// Preview & Auto Generation
router.post("/preview", authorizeRoles("super_admin", "admin", "referral_partner"), previewCommission);
router.post("/auto-generate", authorizeRoles("super_admin", "admin"), autoGenerateCommission);

// CRUD & Workflow
router.get("/", authorizeRoles("super_admin", "admin", "referral_partner"), getCommissions);
router.get("/:id", authorizeRoles("super_admin", "admin", "referral_partner"), getCommissionById);
router.put("/:id/approve", authorizeRoles("super_admin"), approveOrRejectCommission);
router.post("/:id/adjust", authorizeRoles("super_admin"), adjustCommission);

// Payment Processing & Proof Upload
router.post("/process-payment", authorizeRoles("super_admin"), processPayment);
router.post("/payments/:paymentId/proof", authorizeRoles("super_admin", "admin"), upload.array("proofs", 10), uploadPaymentProof);

export default router;
