import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multer.js";
import {
  addDailyWorkReportComment,
  createDailyWorkReport,
  downloadDailyWorkReportPdf,
  exportDailyWorkReports,
  getDailyReportAnalytics,
  getDailyWorkReportById,
  getDailyWorkReports,
  getMonthlyReportAnalytics,
  getMyTodayReport,
  respondToClarification,
  reviewDailyWorkReport,
  submitDailyWorkReport,
  updateDailyWorkReport,
} from "../controllers/dailyWorkReportController.js";

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Daily work report routes are available",
    data: { module: "daily-work-reports" },
    error: null,
  });
});

router.use(protect);

router.get("/me/today", authorizeRoles("employee"), getMyTodayReport);
router.get("/analytics/daily", authorizeRoles("super_admin"), getDailyReportAnalytics);
router.get("/analytics/monthly", authorizeRoles("super_admin"), getMonthlyReportAnalytics);
router.get("/export", authorizeRoles("super_admin"), exportDailyWorkReports);
router.get("/", authorizeRoles("super_admin", "employee"), getDailyWorkReports);
router.post("/", authorizeRoles("super_admin", "employee"), upload.array("attachments", 10), createDailyWorkReport);
router.get("/:id/download-pdf", authorizeRoles("super_admin", "employee"), downloadDailyWorkReportPdf);
router.get("/:id", authorizeRoles("super_admin", "employee"), getDailyWorkReportById);
router.put("/:id", authorizeRoles("super_admin", "employee"), upload.array("attachments", 10), updateDailyWorkReport);
router.post("/:id/submit", authorizeRoles("super_admin", "employee"), submitDailyWorkReport);
router.post("/:id/comments", authorizeRoles("super_admin"), addDailyWorkReportComment);
router.patch("/:id/review", authorizeRoles("super_admin"), reviewDailyWorkReport);
router.post("/:id/clarifications/:clarificationId/respond", authorizeRoles("employee"), respondToClarification);

export default router;
