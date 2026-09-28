import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import {
  getClientDashboardSummary,
  getEmployeeDashboardSummary,
} from "../controllers/dashboardController.js";

const router = express.Router();

router.get(
  "/client",
  protect,
  authorizeRoles("client"),
  getClientDashboardSummary
);

router.get(
  "/employee",
  protect,
  authorizeRoles("employee"),
  getEmployeeDashboardSummary
);

export default router;
