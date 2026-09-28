import mongoose from "mongoose";
import Leave from "../models/Leave.js";
import Employee from "../models/Employee.js";
import Attendance from "../models/Attendance.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

const EMPLOYEE_BASIC_FIELDS = "name email phone department designation status";

const calculateDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(diffDays, 0.5);
};

// Helper: Sync approved leave to Attendance records
const syncApprovedLeaveToAttendance = async (leaveRecord) => {
  try {
    const start = new Date(leaveRecord.fromDate);
    const end = new Date(leaveRecord.toDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const isPaid = leaveRecord.leaveType !== "unpaid";
    const isUnpaid = leaveRecord.leaveType === "unpaid";

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const currentDate = new Date(d);
      currentDate.setHours(0, 0, 0, 0);

      let attendance = await Attendance.findOne({
        employeeId: leaveRecord.employeeId,
        date: currentDate,
      });

      if (attendance) {
        attendance.isPaidLeave = isPaid;
        attendance.isUnpaidLeave = isUnpaid;
        attendance.remarks = `Approved Leave (${leaveRecord.leaveType}): ${leaveRecord.reason}`;
        attendance.adminRemarks = leaveRecord.adminRemarks || "Approved by Admin";
        await attendance.save();
      } else {
        await Attendance.create({
          employeeId: leaveRecord.employeeId,
          employeeName: leaveRecord.employeeName,
          employeeEmail: leaveRecord.employeeEmail,
          date: currentDate,
          attendanceStatus: "absent",
          employeeStatus: "active",
          isPaidLeave: isPaid,
          isUnpaidLeave: isUnpaid,
          remarks: `Approved Leave (${leaveRecord.leaveType}): ${leaveRecord.reason}`,
          adminRemarks: leaveRecord.adminRemarks || "Approved by Admin",
        });
      }
    }
  } catch (err) {
    console.error("Failed to sync leave to attendance:", err);
  }
};

// POST Apply Leave (Employee)
export const applyLeave = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
  }

  const { leaveType, fromDate, toDate, reason } = req.body;

  if (!leaveType || !fromDate || !toDate || !reason || !reason.trim()) {
    throw new AppError("Leave type, from date, to date, and reason are required", 400, "MISSING_FIELDS");
  }

  const parsedFromDate = new Date(fromDate);
  const parsedToDate = new Date(toDate);

  if (Number.isNaN(parsedFromDate.getTime()) || Number.isNaN(parsedToDate.getTime())) {
    throw new AppError("Invalid date format", 400, "INVALID_DATE");
  }

  parsedFromDate.setHours(0, 0, 0, 0);
  parsedToDate.setHours(0, 0, 0, 0);

  if (parsedToDate < parsedFromDate) {
    throw new AppError("End date cannot be before start date", 400, "INVALID_DATE_RANGE");
  }

  // Find Employee record for current user
  let employee = null;
  if (req.user.role === "employee") {
    employee = await Employee.findOne({ userId: req.user._id }).lean();
  } else if (req.body.employeeId && mongoose.Types.ObjectId.isValid(req.body.employeeId)) {
    employee = await Employee.findById(req.body.employeeId).lean();
  } else {
    employee = await Employee.findOne({ $or: [{ userId: req.user._id }, { email: req.user.email }] }).lean();
  }

  if (!employee) {
    throw new AppError("Employee profile not found", 404, "EMPLOYEE_NOT_FOUND");
  }

  // Check overlapping leave for same employee
  const overlappingLeave = await Leave.findOne({
    employeeId: employee._id,
    status: { $in: ["pending", "approved"] },
    $or: [
      { fromDate: { $lte: parsedToDate }, toDate: { $gte: parsedFromDate } },
    ],
  }).lean();

  if (overlappingLeave) {
    throw new AppError("You already have an active/pending leave request overlapping these dates", 409, "OVERLAPPING_LEAVE");
  }

  const numberOfDays = calculateDaysBetween(parsedFromDate, parsedToDate);

  const leave = await Leave.create({
    employeeId: employee._id,
    employeeName: employee.name,
    employeeEmail: employee.email,
    leaveType,
    fromDate: parsedFromDate,
    toDate: parsedToDate,
    numberOfDays,
    reason: reason.trim(),
    status: "pending",
  });

  return res.status(201).json({
    success: true,
    message: "Leave request submitted successfully",
    data: { leave },
    error: null,
  });
});

// GET My Leaves (Employee)
export const getMyLeaves = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
  }

  const employee = await Employee.findOne({
    $or: [{ userId: req.user._id }, { email: req.user.email }],
  }).lean();

  if (!employee) {
    return res.status(200).json({
      success: true,
      data: { leaves: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } },
    });
  }

  const page = Math.max(1, parseInt(req.query.page || 1, 10));
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || 10, 10)));
  const skip = (page - 1) * limit;

  const query = { employeeId: employee._id };
  if (req.query.status) query.status = req.query.status;

  const [leaves, total] = await Promise.all([
    Leave.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Leave.countDocuments(query),
  ]);

  return res.status(200).json({
    success: true,
    data: {
      leaves,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

// CANCEL My Leave (Employee)
export const cancelMyLeave = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
  }

  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid leave ID", 400, "INVALID_ID");
  }

  const leave = await Leave.findById(id);
  if (!leave) {
    throw new AppError("Leave request not found", 404, "NOT_FOUND");
  }

  if (leave.status !== "pending") {
    throw new AppError("Only pending leave requests can be cancelled", 400, "CANNOT_CANCEL");
  }

  leave.status = "cancelled";
  await leave.save();

  return res.status(200).json({
    success: true,
    message: "Leave request cancelled successfully",
    data: { leave },
  });
});

// GET All Leaves (Admin)
export const getAllLeaves = asyncHandler(async (req, res) => {
  if (!["super_admin", "admin", "hr"].includes(req.user.role)) {
    throw new AppError("Admin access required", 403, "FORBIDDEN");
  }

  const {
    page = 1,
    limit = 10,
    search = "",
    status = "",
    leaveType = "",
    employeeId = "",
    startDate = "",
    endDate = "",
  } = req.query;

  const query = {};

  if (status) query.status = status;
  if (leaveType) query.leaveType = leaveType;

  if (employeeId && mongoose.Types.ObjectId.isValid(employeeId)) {
    query.employeeId = new mongoose.Types.ObjectId(employeeId);
  }

  if (startDate || endDate) {
    query.fromDate = {};
    if (startDate) query.fromDate.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.fromDate.$lte = end;
    }
  }

  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), "i");
    query.$or = [
      { employeeName: searchRegex },
      { employeeEmail: searchRegex },
      { reason: searchRegex },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [leaves, total] = await Promise.all([
    Leave.find(query)
      .populate("employeeId", EMPLOYEE_BASIC_FIELDS)
      .populate("approvedBy", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Leave.countDocuments(query),
  ]);

  return res.status(200).json({
    success: true,
    data: {
      leaves,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    },
  });
});

// PUT Update Leave Status (Admin: Approve / Reject)
export const updateLeaveStatus = asyncHandler(async (req, res) => {
  if (!["super_admin", "admin", "hr"].includes(req.user.role)) {
    throw new AppError("Admin access required", 403, "FORBIDDEN");
  }

  const { id } = req.params;
  const { status, adminRemarks } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid leave ID", 400, "INVALID_ID");
  }

  if (!["approved", "rejected"].includes(status)) {
    throw new AppError("Status must be approved or rejected", 400, "INVALID_STATUS");
  }

  const leave = await Leave.findById(id);
  if (!leave) {
    throw new AppError("Leave request not found", 404, "NOT_FOUND");
  }

  leave.status = status;
  leave.approvedBy = req.user._id;
  leave.approvalDate = new Date();
  if (adminRemarks !== undefined) leave.adminRemarks = adminRemarks;

  await leave.save();

  if (status === "approved") {
    await syncApprovedLeaveToAttendance(leave);
  }

  return res.status(200).json({
    success: true,
    message: `Leave request ${status} successfully`,
    data: { leave },
  });
});
