import mongoose from "mongoose";
import Employee from "../models/Employee.js";
import User from "../models/User.js";
import Leave from "../models/Leave.js";
import Attendance from "../models/Attendance.js";
import Payroll from "../models/Payroll.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import logActivity from "../utils/logActivity.js";

const HR_LIST_FIELDS =
  "name email phone department designation joiningDate salary status userId createdAt updatedAt";

const HR_DETAIL_FIELDS =
  "name email phone department designation joiningDate salary employmentType status address emergencyContact documents userId createdBy updatedBy createdAt updatedAt";

const requireAuthenticatedUser = (user) => {
  if (!user) {
    throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
  }
};

const requireHRAccess = (user) => {
  requireAuthenticatedUser(user);

  if (!["hr", "super_admin"].includes(user.role)) {
    throw new AppError(
      "You are not allowed to access HR management",
      403,
      "FORBIDDEN"
    );
  }
};

// ======================== HR DASHBOARD ========================

export const getHRDashboard = asyncHandler(async (req, res) => {
  requireHRAccess(req.user);

  const [totalEmployees, activeEmployees, onLeave, pendingLeaves] = await Promise.all([
    Employee.countDocuments({}),
    Employee.countDocuments({ status: "active" }),
    Leave.countDocuments({
      status: "approved",
      fromDate: { $lte: new Date() },
      toDate: { $gte: new Date() },
    }),
    Leave.countDocuments({ status: "pending" }),
  ]);

  const recentLeaves = await Leave.find()
    .populate("employeeId", "name email")
    .sort({ createdAt: -1 })
    .limit(5);

  const attendanceRate = await Attendance.aggregate([
    {
      $group: {
        _id: null,
        totalRecords: { $sum: 1 },
        presentCount: {
          $sum: { $cond: [{ $eq: ["$attendanceStatus", "present"] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        attendancePercentage: {
          $cond: [
            { $gt: ["$totalRecords", 0] },
            { $round: [{ $multiply: [{ $divide: ["$presentCount", "$totalRecords"] }, 100] }, 2] },
            0,
          ],
        },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    message: "HR dashboard data retrieved successfully",
    data: {
      totalEmployees,
      activeEmployees,
      onLeave,
      pendingLeaves,
      attendanceRate: attendanceRate[0]?.attendancePercentage || 0,
      recentLeaves,
    },
  });
});

// ======================== EMPLOYEE MANAGEMENT ========================

export const getEmployees = asyncHandler(async (req, res) => {
  requireHRAccess(req.user);

  const { page = 1, limit = 10, search, status, department } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  if (status) query.status = status;
  if (department) query.department = department;

  const skip = (page - 1) * limit;

  const [employees, total] = await Promise.all([
    Employee.find(query)
      .select(HR_LIST_FIELDS)
      .populate("userId", "name email role")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 }),
    Employee.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    message: "Employees retrieved successfully",
    data: employees,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

export const getEmployeeById = asyncHandler(async (req, res) => {
  requireHRAccess(req.user);

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid employee ID", 400, "INVALID_ID");
  }

  const employee = await Employee.findById(id)
    .select(HR_DETAIL_FIELDS)
    .populate("userId", "name email role status")
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email");

  if (!employee) {
    throw new AppError("Employee not found", 404, "NOT_FOUND");
  }

  res.status(200).json({
    success: true,
    message: "Employee details retrieved successfully",
    data: employee,
  });
});

export const updateEmployeeByHR = asyncHandler(async (req, res) => {
  requireHRAccess(req.user);

  const { id } = req.params;
  const allowedFields = ["status", "salary", "designation", "department", "phone"];

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid employee ID", 400, "INVALID_ID");
  }

  const updates = {};
  Object.keys(req.body).forEach((key) => {
    if (allowedFields.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  updates.updatedBy = req.user._id;

  const employee = await Employee.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  }).select(HR_DETAIL_FIELDS);

  if (!employee) {
    throw new AppError("Employee not found", 404, "NOT_FOUND");
  }

  await logActivity("employee_updated_by_hr", {
    employeeId: id,
    hrId: req.user._id,
    updatedFields: updates,
  });

  res.status(200).json({
    success: true,
    message: "Employee updated successfully",
    data: employee,
  });
});

// ======================== LEAVE MANAGEMENT ========================

export const getLeaveRequests = asyncHandler(async (req, res) => {
  requireHRAccess(req.user);

  const { page = 1, limit = 10, status, employeeId } = req.query;

  const query = {};

  if (status) query.status = status;
  if (employeeId) query.employeeId = employeeId;

  const skip = (page - 1) * limit;

  const [leaves, total] = await Promise.all([
    Leave.find(query)
      .populate("employeeId", "name email department")
      .populate("approvedBy", "name email")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 }),
    Leave.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    message: "Leave requests retrieved successfully",
    data: leaves,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

export const approveLeaveRequest = asyncHandler(async (req, res) => {
  requireHRAccess(req.user);

  const { id } = req.params;
  const { remarks } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid leave request ID", 400, "INVALID_ID");
  }

  const leave = await Leave.findById(id);

  if (!leave) {
    throw new AppError("Leave request not found", 404, "NOT_FOUND");
  }

  if (leave.status !== "pending") {
    throw new AppError("Only pending leave requests can be approved", 400, "INVALID_STATUS");
  }

  leave.status = "approved";
  leave.approvedBy = req.user._id;
  leave.approvalDate = new Date();
  leave.adminRemarks = remarks || "";
  await leave.save();

  res.status(200).json({
    success: true,
    message: "Leave request approved successfully",
    data: leave,
  });
});

export const rejectLeaveRequest = asyncHandler(async (req, res) => {
  requireHRAccess(req.user);

  const { id } = req.params;
  const { remarks } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid leave request ID", 400, "INVALID_ID");
  }

  const leave = await Leave.findById(id);

  if (!leave) {
    throw new AppError("Leave request not found", 404, "NOT_FOUND");
  }

  if (leave.status !== "pending") {
    throw new AppError("Only pending leave requests can be rejected", 400, "INVALID_STATUS");
  }

  leave.status = "rejected";
  leave.approvedBy = req.user._id;
  leave.approvalDate = new Date();
  leave.adminRemarks = remarks || "";
  await leave.save();

  res.status(200).json({
    success: true,
    message: "Leave request rejected successfully",
    data: leave,
  });
});

// ======================== ATTENDANCE MANAGEMENT ========================

export const getAttendanceRecords = asyncHandler(async (req, res) => {
  requireHRAccess(req.user);

  const { page = 1, limit = 10, employeeId, startDate, endDate, status } = req.query;

  const query = {};

  if (employeeId) query.employeeId = employeeId;
  if (status) query.attendanceStatus = status;

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    Attendance.find(query)
      .populate("employeeId", "name email department")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ date: -1 }),
    Attendance.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    message: "Attendance records retrieved successfully",
    data: records,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

export const updateAttendanceRecord = asyncHandler(async (req, res) => {
  requireHRAccess(req.user);

  const { id } = req.params;
  const { status, remarks } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid attendance record ID", 400, "INVALID_ID");
  }

  if (!["present", "absent", "half_day"].includes(status)) {
    throw new AppError("Invalid attendance status", 400, "INVALID_STATUS");
  }

  const record = await Attendance.findByIdAndUpdate(
    id,
    { attendanceStatus: status, adminRemarks: remarks || "" },
    { new: true, runValidators: true }
  );

  if (!record) {
    throw new AppError("Attendance record not found", 404, "NOT_FOUND");
  }

  res.status(200).json({
    success: true,
    message: "Attendance record updated successfully",
    data: record,
  });
});

// ======================== PAYROLL MANAGEMENT ========================

export const getPayrollRecords = asyncHandler(async (req, res) => {
  requireHRAccess(req.user);

  const { page = 1, limit = 10, employeeId, month, year, status } = req.query;

  const query = {};

  if (employeeId) query.employeeId = employeeId;
  if (status) query.status = status;

  if (month && year) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    query.month = Number(month);
    query.year = Number(year);
  }

  const skip = (page - 1) * limit;

  const [payrolls, total] = await Promise.all([
    Payroll.find(query)
      .populate("employeeId", "name email department salary")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ year: -1, month: -1 }),
    Payroll.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    message: "Payroll records retrieved successfully",
    data: payrolls,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

export const getPayrollStats = asyncHandler(async (req, res) => {
  requireHRAccess(req.user);

  const { month, year } = req.query;

  const query = {};

  if (month && year) {
    query.month = Number(month);
    query.year = Number(year);
  }

  const stats = await Payroll.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalPayroll: { $sum: "$netSalary" },
        totalDeductions: { $sum: "$deduction" },
        totalEarnings: { $sum: { $add: ["$basicSalary", "$bonus", "$overtimeAmount"] } },
        recordCount: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    message: "Payroll statistics retrieved successfully",
    data: stats[0] || {
      totalPayroll: 0,
      totalDeductions: 0,
      totalEarnings: 0,
      recordCount: 0,
    },
  });
});

// ======================== HR REPORTS ========================

export const getHRReports = asyncHandler(async (req, res) => {
  requireHRAccess(req.user);

  const { reportType } = req.query;

  let data = {};

  if (reportType === "department_wise") {
    data = await Employee.aggregate([
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 },
          activeCount: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
          avgSalary: { $avg: "$salary" },
        },
      },
      { $sort: { count: -1 } },
    ]);
  } else if (reportType === "designation_wise") {
    data = await Employee.aggregate([
      {
        $group: {
          _id: "$designation",
          count: { $sum: 1 },
          totalSalary: { $sum: "$salary" },
          avgSalary: { $avg: "$salary" },
        },
      },
      { $sort: { count: -1 } },
    ]);
  } else if (reportType === "leave_summary") {
    data = await Leave.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);
  } else {
    throw new AppError("Invalid report type", 400, "INVALID_REPORT_TYPE");
  }

  res.status(200).json({
    success: true,
    message: "HR report retrieved successfully",
    data,
  });
});
