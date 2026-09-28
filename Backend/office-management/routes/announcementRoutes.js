import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import checkPermission from "../middlewares/checkPermission.js";
import {
  createAnnouncement,
  getAllAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcementController.js";

const router = express.Router();

router.use(protect);

router.post("/", authorizeRoles("super_admin", "admin", "hr"), checkPermission("announcements", "create"), createAnnouncement);
router.get("/", checkPermission("announcements", "view"), getAllAnnouncements);
router.get("/:id", getAnnouncementById);
router.put("/:id", authorizeRoles("super_admin", "admin", "hr"), checkPermission("announcements", "edit"), updateAnnouncement);
router.delete("/:id", authorizeRoles("super_admin", "admin", "hr"), checkPermission("announcements", "delete"), deleteAnnouncement);

export default router;
