import express from "express";
import {
  createReferral,
  getReferrals,
  getReferralById,
  updateReferral,
  deleteReferral,
  updateReferralStatus,
  assignEmployee,
  uploadAttachments,
  deleteAttachment,
  addComment,
  updateComment,
  deleteComment,
  addInternalNote,
  updateInternalNote,
  deleteInternalNote,
  getReferralTimeline,
  getDashboardAnalytics,
  exportReferrals,
} from "../controllers/referralClientController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

// All routes require authentication
router.use(
  protect,
  authorizeRoles("super_admin", "admin", "employee", "referral_partner"),
);

// Dashboard Analytics & Export
router.get("/dashboard/analytics", getDashboardAnalytics);
router.get("/export", exportReferrals);

// CRUD Referrals
router.post("/", upload.array("attachments", 10), createReferral);
router.get("/", getReferrals);
router.get("/:id", getReferralById);
router.put("/:id", updateReferral);
router.delete("/:id", authorizeRoles("super_admin", "admin"), deleteReferral);

// Workflow: Status & Employee Assignment
router.put("/:id/status", updateReferralStatus);
router.put("/:id/assign", authorizeRoles("super_admin", "admin"), assignEmployee);

// Attachments
router.post("/:id/attachments", upload.array("attachments", 10), uploadAttachments);
router.delete("/:id/attachments/:attachmentId", deleteAttachment);

// Comments
router.post("/:id/comments", addComment);
router.put("/:id/comments/:commentId", updateComment);
router.delete("/:id/comments/:commentId", deleteComment);

// Internal Notes (Admin Only)
router.post("/:id/internal-notes", authorizeRoles("super_admin", "admin"), addInternalNote);
router.put("/:id/internal-notes/:noteId", authorizeRoles("super_admin", "admin"), updateInternalNote);
router.delete("/:id/internal-notes/:noteId", authorizeRoles("super_admin", "admin"), deleteInternalNote);

// Timeline & Logs
router.get("/:id/timeline", getReferralTimeline);

export default router;
