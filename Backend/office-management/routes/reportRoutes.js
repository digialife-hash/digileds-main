import express from "express";
import {
  getReportsDashboardAnalytics,
  getReferralReport,
  getPartnerPerformanceReport,
  getMonthlyReferralReport,
  getClientConversionReport,
  getCommissionReport,
  getPaymentReport,
  getTerritoryReport,
  getScheduledReports,
  createScheduledReport,
  getReportHistory,
  getEmployeeReport,
  getSalesReport,
  getClientReport,
} from "../controllers/reportController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import checkPermission from "../middlewares/checkPermission.js";

const router = express.Router();

router.use(protect);

router.get("/dashboard/analytics", getReportsDashboardAnalytics);
router.get("/referrals", getReferralReport);
router.get("/partner-performance", getPartnerPerformanceReport);
router.get("/monthly", getMonthlyReferralReport);
router.get("/client-conversion", getClientConversionReport);
router.get("/commissions", getCommissionReport);
router.get("/payments", getPaymentReport);
router.get("/territory", getTerritoryReport);
router.get(
  "/employee",
  authorizeRoles("super_admin", "admin", "hr"),
  checkPermission("reports", "view"),
  getEmployeeReport
);
router.get("/sales", authorizeRoles("super_admin", "admin"), getSalesReport);
router.get("/client", authorizeRoles("super_admin", "admin"), getClientReport);

router.get("/schedules", getScheduledReports);
router.post("/schedules", authorizeRoles("super_admin"), createScheduledReport);
router.get("/history", getReportHistory);

export default router;
