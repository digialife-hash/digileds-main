import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import {
  addMembersToTeam,
  assignProjectsToTeam,
  createTeam,
  deleteTeam,
  getAllTeams,
  getTeamById,
  removeMembersFromTeam,
  removeProjectsFromTeam,
  updateTeam,
} from "../controllers/teamController.js";

const router = express.Router();

router
  .route("/")
  .get(protect, authorizeRoles("super_admin", "admin"), getAllTeams)
  .post(protect, authorizeRoles("super_admin", "admin"), createTeam);

router.patch(
  "/:id/members/add",
  protect,
  authorizeRoles("super_admin", "admin"),
  addMembersToTeam
);

router.patch(
  "/:id/members/remove",
  protect,
  authorizeRoles("super_admin", "admin"),
  removeMembersFromTeam
);

router.patch(
  "/:id/projects/assign",
  protect,
  authorizeRoles("super_admin", "admin"),
  assignProjectsToTeam
);

router.patch(
  "/:id/projects/remove",
  protect,
  authorizeRoles("super_admin", "admin"),
  removeProjectsFromTeam
);

router
  .route("/:id")
  .get(protect, authorizeRoles("super_admin", "admin"), getTeamById)
  .patch(protect, authorizeRoles("super_admin", "admin"), updateTeam)
  .delete(protect, authorizeRoles("super_admin"), deleteTeam);

export default router;
