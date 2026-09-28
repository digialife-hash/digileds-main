import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import {
  createFollowUp,
  getAllFollowUps,
  getFollowUpById,
  updateFollowUp,
  deleteFollowUp,
  getFollowUpStats,
} from "../controllers/followUpController.js";

const router = express.Router();

router.use(protect);

router.post("/", authorizeRoles("super_admin", "admin", "employee"), createFollowUp);
router.get("/", getAllFollowUps);
router.get("/stats", getFollowUpStats);
router.get("/:id", getFollowUpById);
router.put("/:id", authorizeRoles("super_admin", "admin", "employee"), updateFollowUp);
router.delete("/:id", authorizeRoles("super_admin", "admin"), deleteFollowUp);

export default router;
