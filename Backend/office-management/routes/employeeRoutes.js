import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import checkPermission from "../middlewares/checkPermission.js";
import {
  createEmployee,
  deleteEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
} from "../controllers/employeeController.js";

const router = express.Router();

router
  .route("/")
  .get(protect, authorizeRoles("super_admin", "admin", "hr"), checkPermission("employees", "view"), getAllEmployees)
  .post(protect, authorizeRoles("super_admin", "admin", "hr"), checkPermission("employees", "create"), createEmployee);

router
  .route("/:id")
  .get(protect, authorizeRoles("super_admin", "admin", "hr"), checkPermission("employees", "view"), getEmployeeById)
  .patch(protect, authorizeRoles("super_admin", "admin", "hr"), checkPermission("employees", "edit"), updateEmployee)
  .delete(protect, authorizeRoles("super_admin", "hr"), checkPermission("employees", "delete"), deleteEmployee);

export default router;
