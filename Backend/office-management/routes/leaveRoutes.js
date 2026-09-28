import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import checkPermission from "../middlewares/checkPermission.js";
import {
  applyLeave,
  getMyLeaves,
  cancelMyLeave,
  getAllLeaves,
  updateLeaveStatus,
} from "../controllers/leaveController.js";

const router = express.Router();

router.use(protect);

router.post("/apply", applyLeave);
router.get("/my-leaves", getMyLeaves);
router.patch("/:id/cancel", cancelMyLeave);

router.get("/all", authorizeRoles("super_admin", "admin", "hr"), checkPermission("leaves", "view"), getAllLeaves);
router.patch("/:id/status", authorizeRoles("super_admin", "admin", "hr"), checkPermission("leaves", "approve"), updateLeaveStatus);

export default router;
