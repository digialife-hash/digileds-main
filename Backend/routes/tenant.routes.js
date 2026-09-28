import express from "express";
import { asyncHandler } from "../middleware/async-handler.js";
import requireAdmin, {
  requireSuperAdmin,
} from "../middleware/admin.middleware.js";
import {
  createTenant,
  currentTenant,
  listTenants,
  updateTenant,
} from "../controllers/tenant.controller.js";

const router = express.Router();

router.get("/api/tenant/current", asyncHandler(currentTenant));
router.get("/api/tenants", requireAdmin, requireSuperAdmin, asyncHandler(listTenants));
router.post("/api/tenants", requireAdmin, requireSuperAdmin, asyncHandler(createTenant));
router.patch("/api/tenants/:id", requireAdmin, requireSuperAdmin, asyncHandler(updateTenant));

export default router;
