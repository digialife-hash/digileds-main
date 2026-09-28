import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import checkPermission from "../middlewares/checkPermission.js";
import {
  createPayroll,
  deletePayroll,
  getAllPayrolls,
  getPayrollByEmployee,
  getPayrollById,
  updatePayroll,
  getPayrollPreviewApi,
  generateBulkPayrollApi,
  approvePayrollApi,
  recalculatePayrollApi,
} from "../controllers/payrollController.js";

const router = express.Router();

// Bulk & preview operations
router.get("/preview", protect, authorizeRoles("super_admin", "admin", "hr"), checkPermission("payroll", "view"), getPayrollPreviewApi);
router.post("/bulk-generate", protect, authorizeRoles("super_admin", "admin", "hr"), checkPermission("payroll", "create"), generateBulkPayrollApi);
router.put("/approve/:id", protect, authorizeRoles("super_admin", "admin", "hr"), checkPermission("payroll", "approve"), approvePayrollApi);
router.post("/recalculate/:id", protect, authorizeRoles("super_admin", "admin", "hr"), checkPermission("payroll", "edit"), recalculatePayrollApi);

// Existing CRUD operations
router
  .route("/")
  .get(protect, authorizeRoles("super_admin", "admin", "hr"), checkPermission("payroll", "view"), getAllPayrolls)
  .post(protect, authorizeRoles("super_admin", "admin", "hr"), checkPermission("payroll", "create"), createPayroll);

router.get(
  "/employee/:employeeId",
  protect,
  authorizeRoles("super_admin", "admin", "hr"),
  checkPermission("payroll", "view"),
  getPayrollByEmployee
);

router
  .route("/:id")
  .get(protect, authorizeRoles("super_admin", "admin", "hr"), checkPermission("payroll", "view"), getPayrollById)
  .patch(protect, authorizeRoles("super_admin", "admin", "hr"), checkPermission("payroll", "edit"), updatePayroll)
  .delete(protect, authorizeRoles("super_admin", "admin", "hr"), checkPermission("payroll", "delete"), deletePayroll);

export default router;
