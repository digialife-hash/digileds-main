import express from "express";
import {
  deleteAllVisitors,
  deleteVisitor,
  getPublicVisitorSummary,
  getVisitorAnalytics,
  trackVisitor,
} from "../controllers/visitor-analytics.controller.js";
import requireAdmin from "../middleware/admin.middleware.js";
import { asyncHandler } from "../middleware/async-handler.js";

const router = express.Router();

router.post("/api/analytics/track", asyncHandler(trackVisitor));
router.get(
  "/api/analytics/public-summary",
  asyncHandler(getPublicVisitorSummary),
);
router.get(
  "/api/analytics/visitors",
  requireAdmin,
  asyncHandler(getVisitorAnalytics),
);
router.delete(
  "/api/analytics/visitors/:id",
  requireAdmin,
  asyncHandler(deleteVisitor),
);
router.delete(
  "/api/analytics/visitors",
  requireAdmin,
  asyncHandler(deleteAllVisitors),
);

export default router;
