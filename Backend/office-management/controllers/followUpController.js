import mongoose from "mongoose";
import FollowUp from "../models/FollowUp.js";
import Lead from "../models/Lead.js";
import Client from "../models/Client.js";
import Employee from "../models/Employee.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

const EMPLOYEE_BASIC_FIELDS = "name email phone department designation";

export const createFollowUp = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
  }

  const {
    leadId,
    clientId,
    followUpDate,
    followUpTime,
    type,
    assignedEmployee,
    notes,
    status,
  } = req.body;

  if (!followUpDate) {
    throw new AppError("Follow-up date is required", 400, "MISSING_DATE");
  }

  if (!leadId && !clientId) {
    throw new AppError("Either Lead or Client must be specified", 400, "MISSING_TARGET");
  }

  const parsedDate = new Date(followUpDate);
  if (Number.isNaN(parsedDate.getTime())) {
    throw new AppError("Invalid follow-up date", 400, "INVALID_DATE");
  }

  const followUp = await FollowUp.create({
    leadId: leadId && mongoose.Types.ObjectId.isValid(leadId) ? leadId : null,
    clientId: clientId && mongoose.Types.ObjectId.isValid(clientId) ? clientId : null,
    followUpDate: parsedDate,
    followUpTime: followUpTime || "10:00 AM",
    type: type || "Call",
    assignedEmployee: assignedEmployee && mongoose.Types.ObjectId.isValid(assignedEmployee) ? assignedEmployee : null,
    notes: notes ? notes.trim() : "",
    status: status || "Pending",
    createdBy: req.user._id,
  });

  // Update Lead's nextFollowUp field if linked to a lead
  if (leadId) {
    await Lead.findByIdAndUpdate(leadId, { nextFollowUp: parsedDate });
  }

  const populatedFollowUp = await FollowUp.findById(followUp._id)
    .populate("leadId", "leadName companyName phone email leadStatus")
    .populate("clientId", "clientName companyName phone email")
    .populate("assignedEmployee", EMPLOYEE_BASIC_FIELDS)
    .lean();

  return res.status(201).json({
    success: true,
    message: "Follow-up created successfully",
    data: { followUp: populatedFollowUp },
  });
});

export const getAllFollowUps = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
  }

  const {
    page = 1,
    limit = 10,
    status = "",
    type = "",
    leadId = "",
    clientId = "",
    assignedEmployee = "",
    filterDate = "",
  } = req.query;

  const query = {};

  if (status) query.status = status;
  if (type) query.type = type;
  if (leadId && mongoose.Types.ObjectId.isValid(leadId)) query.leadId = new mongoose.Types.ObjectId(leadId);
  if (clientId && mongoose.Types.ObjectId.isValid(clientId)) query.clientId = new mongoose.Types.ObjectId(clientId);
  if (assignedEmployee && mongoose.Types.ObjectId.isValid(assignedEmployee)) query.assignedEmployee = new mongoose.Types.ObjectId(assignedEmployee);

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  if (filterDate === "today") {
    query.followUpDate = { $gte: startOfToday, $lte: endOfToday };
  } else if (filterDate === "upcoming") {
    query.followUpDate = { $gt: endOfToday };
  } else if (filterDate === "overdue") {
    query.followUpDate = { $lt: startOfToday };
    query.status = "Pending";
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [followUps, total] = await Promise.all([
    FollowUp.find(query)
      .populate("leadId", "leadName companyName phone email leadStatus")
      .populate("clientId", "clientName companyName phone email")
      .populate("assignedEmployee", EMPLOYEE_BASIC_FIELDS)
      .sort({ followUpDate: 1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    FollowUp.countDocuments(query),
  ]);

  return res.status(200).json({
    success: true,
    data: {
      followUps,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    },
  });
});

export const getFollowUpById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid follow-up ID", 400, "INVALID_ID");
  }

  const followUp = await FollowUp.findById(id)
    .populate("leadId", "leadName companyName phone email leadStatus")
    .populate("clientId", "clientName companyName phone email")
    .populate("assignedEmployee", EMPLOYEE_BASIC_FIELDS)
    .lean();

  if (!followUp) {
    throw new AppError("Follow-up not found", 404, "NOT_FOUND");
  }

  return res.status(200).json({
    success: true,
    data: { followUp },
  });
});

export const updateFollowUp = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid follow-up ID", 400, "INVALID_ID");
  }

  const followUp = await FollowUp.findById(id);
  if (!followUp) {
    throw new AppError("Follow-up not found", 404, "NOT_FOUND");
  }

  const allowedUpdates = [
    "followUpDate",
    "followUpTime",
    "type",
    "assignedEmployee",
    "notes",
    "outcome",
    "nextFollowUpDate",
    "status",
  ];

  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      followUp[field] = req.body[field];
    }
  });

  await followUp.save();

  // If nextFollowUpDate is provided and status is Completed, optionally create next follow-up
  if (req.body.createNextFollowUp && req.body.nextFollowUpDate) {
    await FollowUp.create({
      leadId: followUp.leadId,
      clientId: followUp.clientId,
      followUpDate: new Date(req.body.nextFollowUpDate),
      followUpTime: followUp.followUpTime,
      type: followUp.type,
      assignedEmployee: followUp.assignedEmployee,
      notes: `Follow-up following up on: ${followUp.outcome || "previous meeting"}`,
      status: "Pending",
      createdBy: req.user._id,
    });
  }

  const updatedFollowUp = await FollowUp.findById(followUp._id)
    .populate("leadId", "leadName companyName phone email leadStatus")
    .populate("clientId", "clientName companyName phone email")
    .populate("assignedEmployee", EMPLOYEE_BASIC_FIELDS)
    .lean();

  return res.status(200).json({
    success: true,
    message: "Follow-up updated successfully",
    data: { followUp: updatedFollowUp },
  });
});

export const deleteFollowUp = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid follow-up ID", 400, "INVALID_ID");
  }

  const followUp = await FollowUp.findByIdAndDelete(id);
  if (!followUp) {
    throw new AppError("Follow-up not found", 404, "NOT_FOUND");
  }

  return res.status(200).json({
    success: true,
    message: "Follow-up deleted successfully",
  });
});

export const getFollowUpStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const [today, upcoming, overdue, pending] = await Promise.all([
    FollowUp.countDocuments({ followUpDate: { $gte: startOfToday, $lte: endOfToday } }),
    FollowUp.countDocuments({ followUpDate: { $gt: endOfToday } }),
    FollowUp.countDocuments({ followUpDate: { $lt: startOfToday }, status: "Pending" }),
    FollowUp.countDocuments({ status: "Pending" }),
  ]);

  return res.status(200).json({
    success: true,
    data: { today, upcoming, overdue, pending },
  });
});
