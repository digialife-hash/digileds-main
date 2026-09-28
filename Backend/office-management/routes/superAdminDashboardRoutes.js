import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import { getSuperAdminDashboardSummary } from "../controllers/superAdminDashboardController.js";

const router = express.Router();

router.get(
  "/summary",
  protect,
  authorizeRoles("super_admin", "admin"),
  getSuperAdminDashboardSummary
);

export default router;
