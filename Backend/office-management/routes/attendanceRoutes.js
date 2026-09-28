import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import checkPermission from "../middlewares/checkPermission.js";
import {
  employeeCheckIn,
  employeeCheckOut,
  getMyAttendanceHistory,
  getTodayAttendance,
  getAllAttendance,
  getAttendanceByEmployee,
  getAttendanceByDate,
  getMonthlySummaryApi,
  getAttendanceCalendarApi,
  getAttendanceAnalyticsApi,
  updateRemarksApi,
  upsertAttendanceApi,
} from "../controllers/attendanceController.js";
import { getSettings, updateSettings } from "../controllers/attendanceSettingsController.js";
import {
  getHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
} from "../controllers/holidayController.js";

const router = express.Router();

// Settings
router.get("/settings", protect, getSettings);
router.put(
  "/settings",
  protect,
  authorizeRoles("super_admin", "admin", "hr"),
  checkPermission("settings", "edit"),
  updateSettings
);

// Holidays
router.get("/holidays", protect, checkPermission("holidays", "view"), getHolidays);
router.post("/holidays", protect, authorizeRoles("super_admin", "admin", "hr"), checkPermission("holidays", "create"), createHoliday);
router.put("/holidays/:id", protect, authorizeRoles("super_admin", "admin", "hr"), checkPermission("holidays", "edit"), updateHoliday);
router.delete("/holidays/:id", protect, authorizeRoles("super_admin", "admin", "hr"), checkPermission("holidays", "delete"), deleteHoliday);

// Upsert dynamic attendance day (weekly off, custom leaves, remarks)
router.post("/upsert", protect, authorizeRoles("super_admin", "admin", "hr"), checkPermission("attendance", "edit"), upsertAttendanceApi);

// Remarks / descriptions updates
router.put("/remarks/:id", protect, updateRemarksApi);

// Breakdown summaries
router.get("/monthly-summary", protect, getMonthlySummaryApi);
router.get("/calendar", protect, getAttendanceCalendarApi);
router.get("/analytics", protect, authorizeRoles("super_admin", "admin", "hr"), checkPermission("attendance", "view"), getAttendanceAnalyticsApi);

// Existing employee punch routes
router.post("/check-in", protect, authorizeRoles("employee"), employeeCheckIn);
router.post("/check-out", protect, authorizeRoles("employee"), employeeCheckOut);
router.get("/my-history", protect, authorizeRoles("employee"), getMyAttendanceHistory);
router.get("/my-today", protect, authorizeRoles("employee"), getTodayAttendance);

// Existing admin queries
router.get("/", protect, authorizeRoles("super_admin", "admin", "hr"), checkPermission("attendance", "view"), getAllAttendance);
router.get("/date", protect, authorizeRoles("super_admin", "admin", "hr"), checkPermission("attendance", "view"), getAttendanceByDate);
router.get(
  "/employee/:employeeId",
  protect,
  authorizeRoles("super_admin", "admin", "hr"),
  checkPermission("attendance", "view"),
  getAttendanceByEmployee
);

export default router;
