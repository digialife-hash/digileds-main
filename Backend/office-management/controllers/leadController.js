import mongoose from "mongoose";
import Lead, { leadStatuses, leadSources } from "../models/Lead.js";
import Client from "../models/Client.js";
import Employee from "../models/Employee.js";
import FollowUp from "../models/FollowUp.js";
import Quotation from "../models/Quotation.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

const EMPLOYEE_BASIC_FIELDS = "name email phone department designation";

export const createLead = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
  }

  const {
    leadName,
    companyName,
    phone,
    email,
    serviceInterested,
    leadSource,
    assignedEmployee,
    expectedValue,
    notes,
    nextFollowUp,
  } = req.body;

  if (!leadName || !leadName.trim() || !phone || !phone.trim()) {
    throw new AppError("Lead name and phone number are required", 400, "MISSING_FIELDS");
  }

  if (assignedEmployee && !mongoose.Types.ObjectId.isValid(assignedEmployee)) {
    throw new AppError("Invalid assigned employee ID", 400, "INVALID_ID");
  }

  const lead = await Lead.create({
    leadName: leadName.trim(),
    companyName: companyName ? companyName.trim() : "",
    phone: phone.trim(),
    email: email ? email.trim().toLowerCase() : "",
    serviceInterested: serviceInterested ? serviceInterested.trim() : "",
    leadSource: leadSource || "Direct",
    assignedEmployee: assignedEmployee || null,
    expectedValue: Number(expectedValue || 0),
    notes: notes ? notes.trim() : "",
    nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : null,
    createdBy: req.user._id,
  });

  const populatedLead = await Lead.findById(lead._id)
    .populate("assignedEmployee", EMPLOYEE_BASIC_FIELDS)
    .lean();

  return res.status(201).json({
    success: true,
    message: "Lead created successfully",
    data: { lead: populatedLead },
  });
});

export const getAllLeads = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
  }

  const {
    page = 1,
    limit = 10,
    search = "",
    status = "",
    source = "",
    assignedEmployee = "",
  } = req.query;

  const query = {};

  if (status) query.leadStatus = status;
  if (source) query.leadSource = source;

  if (assignedEmployee && mongoose.Types.ObjectId.isValid(assignedEmployee)) {
    query.assignedEmployee = new mongoose.Types.ObjectId(assignedEmployee);
  }

  // RBAC scope for employee
  if (req.user.role === "employee") {
    const emp = await Employee.findOne({ userId: req.user._id }).select("_id").lean();
    if (emp) {
      query.assignedEmployee = emp._id;
    }
  }

  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), "i");
    query.$or = [
      { leadName: searchRegex },
      { companyName: searchRegex },
      { phone: searchRegex },
      { email: searchRegex },
      { serviceInterested: searchRegex },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [leads, total] = await Promise.all([
    Lead.find(query)
      .populate("assignedEmployee", EMPLOYEE_BASIC_FIELDS)
      .populate("convertedClientId", "clientName companyName email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Lead.countDocuments(query),
  ]);

  return res.status(200).json({
    success: true,
    data: {
      leads,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    },
  });
});

export const getLeadById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid lead ID", 400, "INVALID_ID");
  }

  const lead = await Lead.findById(id)
    .populate("assignedEmployee", EMPLOYEE_BASIC_FIELDS)
    .populate("convertedClientId", "clientName companyName email phone")
    .lean();

  if (!lead) {
    throw new AppError("Lead not found", 404, "NOT_FOUND");
  }

  const followUps = await FollowUp.find({ leadId: id })
    .populate("assignedEmployee", EMPLOYEE_BASIC_FIELDS)
    .sort({ followUpDate: -1 })
    .lean();

  const quotations = await Quotation.find({ leadId: id })
    .sort({ createdAt: -1 })
    .lean();

  return res.status(200).json({
    success: true,
    data: { lead, followUps, quotations },
  });
});

export const updateLead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid lead ID", 400, "INVALID_ID");
  }

  const lead = await Lead.findById(id);
  if (!lead) {
    throw new AppError("Lead not found", 404, "NOT_FOUND");
  }

  const allowedUpdates = [
    "leadName",
    "companyName",
    "phone",
    "email",
    "serviceInterested",
    "leadSource",
    "assignedEmployee",
    "leadStatus",
    "expectedValue",
    "notes",
    "nextFollowUp",
  ];

  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      lead[field] = req.body[field];
    }
  });

  await lead.save();

  const updatedLead = await Lead.findById(lead._id)
    .populate("assignedEmployee", EMPLOYEE_BASIC_FIELDS)
    .populate("convertedClientId", "clientName companyName email phone")
    .lean();

  return res.status(200).json({
    success: true,
    message: "Lead updated successfully",
    data: { lead: updatedLead },
  });
});

export const deleteLead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid lead ID", 400, "INVALID_ID");
  }

  const lead = await Lead.findByIdAndDelete(id);
  if (!lead) {
    throw new AppError("Lead not found", 404, "NOT_FOUND");
  }

  return res.status(200).json({
    success: true,
    message: "Lead deleted successfully",
  });
});

// POST Convert Lead to Client
export const convertLeadToClient = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid lead ID", 400, "INVALID_ID");
  }

  const lead = await Lead.findById(id);
  if (!lead) {
    throw new AppError("Lead not found", 404, "NOT_FOUND");
  }

  if (lead.convertedClientId) {
    const existingClient = await Client.findById(lead.convertedClientId).lean();
    if (existingClient) {
      return res.status(200).json({
        success: true,
        message: "Lead is already converted to a client",
        data: { client: existingClient, lead },
      });
    }
  }

  // Check if client with matching phone/email already exists
  let client = await Client.findOne({
    $or: [
      ...(lead.phone ? [{ phone: lead.phone }] : []),
      ...(lead.email ? [{ email: lead.email }] : []),
    ],
  });

  if (!client) {
    client = await Client.create({
      clientName: lead.leadName,
      companyName: lead.companyName || lead.leadName,
      email: lead.email || `client_${Date.now()}@example.com`,
      phone: lead.phone,
      businessCategory: lead.serviceInterested || "General",
      status: "active",
      createdBy: req.user._id,
    });
  }

  lead.leadStatus = "Converted";
  lead.convertedClientId = client._id;
  await lead.save();

  return res.status(200).json({
    success: true,
    message: "Lead converted to client successfully",
    data: { client, lead },
  });
});
