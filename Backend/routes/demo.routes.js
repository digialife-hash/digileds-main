import express from "express";
import { authLimiter } from "../middleware/limiters.js";
import {
  loginDemo,
  logoutDemo,
  getDemoAccess,
  getDemoCredentials,
  rotateDemoCredentials,
} from "../controllers/admin.controller.js";
import {
  createDemo,
  getDemo,
  deleteDemo,
  listDemos,
  listPublicDemos,
  getAuditLogs,
  updateDemoDuration,
} from "../controllers/demo.controller.js";
import requireAdmin from "../middleware/admin.middleware.js";
import { asyncHandler } from "../middleware/async-handler.js";

const router = express.Router();

router.post("/api/demo/:id/login", authLimiter, asyncHandler(loginDemo));
router.post("/api/demo/:id/logout", asyncHandler(logoutDemo));
router.get("/api/demo/:id/access", asyncHandler(getDemoAccess));
router.get("/api/public/demos", asyncHandler(listPublicDemos));
router.post("/api/demo/create", requireAdmin, asyncHandler(createDemo));
router.get("/api/demo/:id", requireAdmin, asyncHandler(getDemo));
router.delete("/api/demo/:id", requireAdmin, asyncHandler(deleteDemo));
router.patch(
  "/api/demo/:id/duration",
  requireAdmin,
  asyncHandler(updateDemoDuration),
);
router.get("/api/demos", requireAdmin, asyncHandler(listDemos));
router.get(
  "/api/demo/:id/credentials",
  requireAdmin,
  asyncHandler(getDemoCredentials),
);
router.post(
  "/api/demo/:id/credentials/rotate",
  requireAdmin,
  asyncHandler(rotateDemoCredentials),
);
router.get("/api/audit", requireAdmin, asyncHandler(getAuditLogs));

export default router;
