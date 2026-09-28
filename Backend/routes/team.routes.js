import express from "express";
import {
  createTeamMember,
  deleteTeamMember,
  getTeam,
  listTeam,
  updateTeamMember,
} from "../controllers/team.controller.js";
import requireAdmin from "../middleware/admin.middleware.js";
import { asyncHandler } from "../middleware/async-handler.js";

const router = express.Router();
router.get("/api/team", asyncHandler(getTeam));
router.get("/api/team/manage", requireAdmin, asyncHandler(listTeam));
router.post("/api/team/manage", requireAdmin, asyncHandler(createTeamMember));
router.patch(
  "/api/team/manage/:id",
  requireAdmin,
  asyncHandler(updateTeamMember),
);
router.delete(
  "/api/team/manage/:id",
  requireAdmin,
  asyncHandler(deleteTeamMember),
);
export default router;
