import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import {
  createProject,
  deleteProject,
  getAllProjectsForSuperAdmin,
  getEmployeeProjects,
  getClientProjects,
  getProjectById,
  updateProject,
} from "../controllers/projectController.js";

const router = express.Router();

router.get(
  "/client/my-projects",
  protect,
  authorizeRoles("client"),
  getClientProjects
);

router.get(
  "/client/my-projects/:id",
  protect,
  authorizeRoles("client"),
  getProjectById
);

router.get(
  "/employee/my-projects",
  protect,
  authorizeRoles("employee"),
  getEmployeeProjects
);

router.get(
  "/employee/my-projects/:id",
  protect,
  authorizeRoles("employee"),
  getProjectById
);

router
  .route("/")
  .get(protect, authorizeRoles("super_admin", "admin"), getAllProjectsForSuperAdmin)
  .post(protect, authorizeRoles("super_admin", "admin"), createProject);

router
  .route("/:id")
  .get(protect, authorizeRoles("super_admin", "admin"), getProjectById)
  .patch(protect, authorizeRoles("super_admin", "admin"), updateProject)
  .delete(protect, authorizeRoles("super_admin"), deleteProject);

export default router;
