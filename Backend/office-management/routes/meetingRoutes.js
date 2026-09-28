import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import checkPermission from "../middlewares/checkPermission.js";
import {
  createMeeting,
  getAllMeetings,
  getMeetingById,
  updateMeeting,
  deleteMeeting,
} from "../controllers/meetingController.js";

const router = express.Router();

router.use(protect);

router.post("/", authorizeRoles("super_admin", "admin", "employee", "hr"), checkPermission("meetings", "create"), createMeeting);
router.get("/", checkPermission("meetings", "view"), getAllMeetings);
router.get("/:id", getMeetingById);
router.put("/:id", authorizeRoles("super_admin", "admin", "employee", "hr"), checkPermission("meetings", "edit"), updateMeeting);
router.delete("/:id", authorizeRoles("super_admin", "admin", "hr"), checkPermission("meetings", "delete"), deleteMeeting);

export default router;
