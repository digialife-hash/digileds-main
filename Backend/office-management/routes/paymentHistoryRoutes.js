import express from "express";
import {
  getPaymentDashboardAnalytics,
  getPaymentHistory,
  getPaymentById,
  updatePaymentStatus,
  generatePaymentReceipt,
  exportPaymentHistory,
} from "../controllers/paymentHistoryController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/dashboard/analytics", getPaymentDashboardAnalytics);
router.get("/export", exportPaymentHistory);
router.get("/", getPaymentHistory);
router.get("/:id", getPaymentById);
router.put("/:id/status", authorizeRoles("super_admin"), updatePaymentStatus);
router.get("/:id/receipt", generatePaymentReceipt);

export default router;
