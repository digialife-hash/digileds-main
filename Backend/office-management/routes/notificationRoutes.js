import express from "express";
import {
  getNotificationDashboardAnalytics,
  getNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  archiveNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
  getNotificationTemplates,
  createOrUpdateNotificationTemplate,
  resendNotification,
  exportNotifications,
} from "../controllers/notificationController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

// Analytics & Export
router.get("/dashboard/analytics", getNotificationDashboardAnalytics);
router.get("/export", exportNotifications);

// Preferences
router.get("/preferences", getNotificationPreferences);
router.put("/preferences", updateNotificationPreferences);

// Templates (Admin)
router.get("/templates", getNotificationTemplates);
router.post("/templates", authorizeRoles("super_admin"), createOrUpdateNotificationTemplate);

// In-App Bell & Notifications
router.get("/", getNotifications);
router.put("/read-all", markAllAsRead);
router.get("/:id", getNotificationById);
router.put("/:id/read", markAsRead);
router.put("/:id/archive", archiveNotification);
router.post("/:id/resend", authorizeRoles("super_admin"), resendNotification);
router.delete("/:id", deleteNotification);

export default router;
