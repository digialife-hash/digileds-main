import express from "express";
import requireAdmin from "../middleware/admin.middleware.js";
import { asyncHandler } from "../middleware/async-handler.js";
import {
  createLeadApplication,
  deleteAllLeadApplications,
  deleteLeadApplication,
  listLeadApplications,
  updateLeadApplication,
} from "../controllers/lead.controller.js";

const router = express.Router();
router.post("/api/lead-applications", asyncHandler(createLeadApplication));
router.get(
  "/api/lead-applications",
  requireAdmin,
  asyncHandler(listLeadApplications),
);
router.delete(
  "/api/lead-applications",
  requireAdmin,
  asyncHandler(deleteAllLeadApplications),
);
router.patch(
  "/api/lead-applications/:id",
  requireAdmin,
  asyncHandler(updateLeadApplication),
);
router.delete(
  "/api/lead-applications/:id",
  requireAdmin,
  asyncHandler(deleteLeadApplication),
);
export default router;
