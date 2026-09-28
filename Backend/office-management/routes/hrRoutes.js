import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import checkPermission from "../middlewares/checkPermission.js";
import {
  getHRDashboard,
  getEmployees,
  getEmployeeById,
  updateEmployeeByHR,
  getLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
  getAttendanceRecords,
  updateAttendanceRecord,
  getPayrollRecords,
  getPayrollStats,
  getHRReports,
} from "../controllers/hrController.js";

const router = express.Router();

// ======================== HR DASHBOARD ========================
router.get("/dashboard", protect, authorizeRoles("hr", "super_admin"), checkPermission("reports", "view"), getHRDashboard);

// ======================== EMPLOYEE MANAGEMENT ========================
router.get(
  "/employees",
  protect,
  authorizeRoles("hr", "super_admin"),
  checkPermission("employees", "view"),
  getEmployees
);

router.get(
  "/employees/:id",
  protect,
  authorizeRoles("hr", "super_admin"),
  checkPermission("employees", "view"),
  getEmployeeById
);

router.patch(
  "/employees/:id",
  protect,
  authorizeRoles("hr", "super_admin"),
  checkPermission("employees", "edit"),
  updateEmployeeByHR
);

// ======================== LEAVE MANAGEMENT ========================
router.get(
  "/leaves",
  protect,
  authorizeRoles("hr", "super_admin"),
  checkPermission("leaves", "view"),
  getLeaveRequests
);

router.patch(
  "/leaves/:id/approve",
  protect,
  authorizeRoles("hr", "super_admin"),
  checkPermission("leaves", "approve"),
  approveLeaveRequest
);

router.patch(
  "/leaves/:id/reject",
  protect,
  authorizeRoles("hr", "super_admin"),
  checkPermission("leaves", "approve"),
  rejectLeaveRequest
);

// ======================== ATTENDANCE MANAGEMENT ========================
router.get(
  "/attendance",
  protect,
  authorizeRoles("hr", "super_admin"),
  checkPermission("attendance", "view"),
  getAttendanceRecords
);

router.patch(
  "/attendance/:id",
  protect,
  authorizeRoles("hr", "super_admin"),
  checkPermission("attendance", "edit"),
  updateAttendanceRecord
);

// ======================== PAYROLL MANAGEMENT ========================
router.get(
  "/payroll",
  protect,
  authorizeRoles("hr", "super_admin"),
  checkPermission("payroll", "view"),
  getPayrollRecords
);

router.get(
  "/payroll/stats",
  protect,
  authorizeRoles("hr", "super_admin"),
  checkPermission("payroll", "view"),
  getPayrollStats
);

// ======================== HR REPORTS ========================
router.get(
  "/reports",
  protect,
  authorizeRoles("hr", "super_admin"),
  checkPermission("reports", "view"),
  getHRReports
);

export default router;
