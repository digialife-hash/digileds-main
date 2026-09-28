import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import Referral from "../models/Referral.js";
import ReferralStatusHistory from "../models/ReferralStatusHistory.js";
import ReferralAssignment from "../models/ReferralAssignment.js";
import ReferralComment from "../models/ReferralComment.js";
import ReferralInternalNote from "../models/ReferralInternalNote.js";
import ReferralAttachment from "../models/ReferralAttachment.js";
import ReferralActivityLog from "../models/ReferralActivityLog.js";
import ReferralPartner from "../models/ReferralPartner.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { autoGenerateCommissionForReferral } from "./commissionController.js";

// Helper to extract IP, browser, device from request
const getClientMeta = (req) => {
  const ipAddress =
    req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
  const userAgent = req.headers["user-agent"] || "";

  let browser = "Browser";
  if (userAgent.includes("Chrome")) browser = "Chrome";
  else if (userAgent.includes("Safari")) browser = "Safari";
  else if (userAgent.includes("Firefox")) browser = "Firefox";
  else if (userAgent.includes("Edge")) browser = "Edge";

  let device = "Desktop";
  if (/mobile/i.test(userAgent)) device = "Mobile";
  else if (/tablet|ipad/i.test(userAgent)) device = "Tablet";

  return { ipAddress, browser, device };
};

// Helper for activity logging
const logReferralActivity = async (req, referralId, action, description, metadata = {}) => {
  const { ipAddress, browser, device } = getClientMeta(req);
  await ReferralActivityLog.create({
    referralId,
    user: req.user._id,
    role: req.user.role,
    action,
    description,
    ipAddress,
    browser,
    device,
    metadata,
  });
};

// Helper: Get Referral Partner for current user if partner
const getPartnerDocForUser = async (userId) => {
  return await ReferralPartner.findOne({ userId });
};

const assertReferralAccess = async (req, referral) => {
  const role = req.user.role;
  if (role === "super_admin" || role === "admin") return;

  if (role === "employee") {
    if (String(referral.assignedEmployee || "") !== String(req.user._id)) {
      throw new AppError("You can only access referrals assigned to you", 403, "FORBIDDEN");
    }
    return;
  }

  if (role === "referral_partner") {
    const partnerDoc = await getPartnerDocForUser(req.user._id);
    const partnerId = referral.partnerId?._id || referral.partnerId;
    if (!partnerDoc || String(partnerId) !== String(partnerDoc._id)) {
      throw new AppError("You do not have permission to access this referral", 403, "FORBIDDEN");
    }
    return;
  }

  throw new AppError("You do not have permission to access referrals", 403, "FORBIDDEN");
};

// 1. CREATE REFERRAL
export const createReferral = asyncHandler(async (req, res) => {
  const {
    clientName,
    companyName,
    mobileNumber,
    email,
    address,
    serviceRequired,
    estimatedBudget,
    notes,
  } = req.body;

  if (!clientName || !mobileNumber || !email) {
    throw new AppError("Client Name, Mobile Number, and Email are required", 400, "MISSING_FIELDS");
  }

  let partnerId = null;

  if (req.user.role === "referral_partner") {
    const partnerDoc = await getPartnerDocForUser(req.user._id);
    if (!partnerDoc) {
      throw new AppError("Referral Partner profile not found", 404, "PARTNER_NOT_FOUND");
    }
    partnerId = partnerDoc._id;
  } else if (req.body.partnerId) {
    partnerId = req.body.partnerId;
  } else {
    // If admin or employee creates, find or use default partner profile
    let partnerDoc = await ReferralPartner.findOne({ userId: req.user._id });
    if (!partnerDoc) {
      partnerDoc = await ReferralPartner.create({
        userId: req.user._id,
        referralCode: `ADMIN-${Math.floor(1000 + Math.random() * 9000)}`,
        status: "active",
      });
    }
    partnerId = partnerDoc._id;
  }

  // Create Referral in MongoDB
  const referral = await Referral.create({
    partnerId,
    clientName,
    companyName: companyName || "",
    mobileNumber,
    clientPhone: mobileNumber,
    email: email.toLowerCase().trim(),
    clientEmail: email.toLowerCase().trim(),
    address: address || "",
    serviceRequired: serviceRequired || "General Service",
    estimatedBudget: Number(estimatedBudget) || 0,
    notes: notes || "",
    status: "New",
  });

  // Handle uploaded attachments if any
  const createdAttachments = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const ext = path.extname(file.originalname).replace(".", "").toLowerCase();
      const attachment = await ReferralAttachment.create({
        referralId: referral._id,
        uploadedBy: req.user._id,
        originalName: file.originalname,
        fileName: file.filename,
        filePath: `/uploads/${file.filename}`,
        fileType: ext,
        fileSize: file.size,
      });
      createdAttachments.push(attachment);
    }
  }

  // Record initial Status History
  const now = new Date();
  await ReferralStatusHistory.create({
    referralId: referral._id,
    previousStatus: "None",
    currentStatus: "New",
    changedBy: req.user._id,
    date: now.toISOString().split("T")[0],
    time: now.toTimeString().split(" ")[0],
    remarks: "Referral created",
  });

  // Log activity
  await logReferralActivity(
    req,
    referral._id,
    "Referral Created",
    `Created referral for ${clientName} (${companyName || "No Company"})`
  );

  // Notify Admins
  const adminUsers = await User.find({ role: "super_admin" }).select("_id");
  for (const admin of adminUsers) {
    await Notification.create({
      recipientUser: admin._id,
      title: "New Referral Submitted",
      message: `A new referral "${clientName}" has been submitted by ${req.user.name}.`,
      type: "referral",
    });
  }

  res.status(201).json({
    success: true,
    message: "Referral submitted successfully",
    data: {
      referral,
      attachments: createdAttachments,
    },
    error: null,
  });
});

// 2. GET REFERRAL LIST (With Global Search, Filters, Pagination & RBAC)
export const getReferrals = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    status = "",
    partnerId = "",
    assignedEmployee = "",
    service = "",
    minBudget = "",
    maxBudget = "",
    startDate = "",
    endDate = "",
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const query = { isDeleted: false };

  // RBAC Filtering
  if (req.user.role === "referral_partner") {
    const partnerDoc = await getPartnerDocForUser(req.user._id);
    if (!partnerDoc) {
      return res.status(200).json({
        success: true,
        message: "Referrals fetched",
        data: { referrals: [], pagination: { total: 0, page: 1, limit: Number(limit), totalPages: 0 } },
        error: null,
      });
    }
    query.partnerId = partnerDoc._id;
  } else if (req.user.role === "employee") {
    query.assignedEmployee = req.user._id;
  } else if (req.user.role !== "super_admin" && req.user.role !== "admin") {
    query._id = null;
  }

  // Filter by Partner ID if provided by Admin
  if (partnerId && req.user.role === "super_admin") {
    query.partnerId = partnerId;
  }

  // Filter by Assigned Employee
  if (assignedEmployee) {
    query.assignedEmployee = assignedEmployee;
  }

  // Filter by Status
  if (status) {
    query.status = status;
  }

  // Filter by Service
  if (service) {
    query.serviceRequired = { $regex: service, $options: "i" };
  }

  // Budget Filter
  if (minBudget || maxBudget) {
    query.estimatedBudget = {};
    if (minBudget) query.estimatedBudget.$gte = Number(minBudget);
    if (maxBudget) query.estimatedBudget.$lte = Number(maxBudget);
  }

  // Date Range Filter
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }

  // Global Search (Referral ID, Client Name, Company, Mobile, Email, Service)
  if (search) {
    const searchRegex = new RegExp(search, "i");
    query.$or = [
      { referralId: searchRegex },
      { clientName: searchRegex },
      { companyName: searchRegex },
      { mobileNumber: searchRegex },
      { email: searchRegex },
      { serviceRequired: searchRegex },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const skip = (pageNum - 1) * limitNum;
  const sortDirection = sortOrder === "asc" ? 1 : -1;

  const total = await Referral.countDocuments(query);
  const referrals = await Referral.find(query)
    .populate({
      path: "partnerId",
      populate: { path: "userId", select: "name email phone" },
    })
    .populate("assignedEmployee", "name email role phone")
    .sort({ [sortBy]: sortDirection })
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    message: "Referrals retrieved successfully",
    data: {
      referrals,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    },
    error: null,
  });
});

// 3. GET SINGLE REFERRAL DETAILS
export const getReferralById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const referral = await Referral.findOne({ _id: id, isDeleted: false })
    .populate({
      path: "partnerId",
      populate: { path: "userId", select: "name email phone" },
    })
    .populate("assignedEmployee", "name email role phone");

  if (!referral) {
    throw new AppError("Referral not found", 404, "REFERRAL_NOT_FOUND");
  }

  await assertReferralAccess(req, referral);

  // Fetch Associated Data
  const statusHistory = await ReferralStatusHistory.find({ referralId: id })
    .populate("changedBy", "name email role")
    .sort({ createdAt: -1 });

  const assignmentHistory = await ReferralAssignment.find({ referralId: id })
    .populate("assignedEmployee", "name email role")
    .populate("assignedBy", "name email role")
    .populate("previousEmployee", "name email role")
    .sort({ createdAt: -1 });

  const comments = await ReferralComment.find({ referralId: id, isDeleted: false })
    .populate("user", "name email role")
    .sort({ createdAt: 1 });

  const attachments = await ReferralAttachment.find({ referralId: id, isDeleted: false })
    .populate("uploadedBy", "name email role")
    .sort({ createdAt: -1 });

  const activityLogs = await ReferralActivityLog.find({ referralId: id })
    .populate("user", "name email role")
    .sort({ createdAt: -1 });

  // Internal Notes: Admin only
  let internalNotes = [];
  if (req.user.role === "super_admin") {
    internalNotes = await ReferralInternalNote.find({ referralId: id, isDeleted: false })
      .populate("adminUser", "name email role")
      .sort({ createdAt: -1 });
  }

  res.status(200).json({
    success: true,
    message: "Referral details retrieved successfully",
    data: {
      referral,
      statusHistory,
      assignmentHistory,
      comments,
      attachments,
      activityLogs,
      internalNotes,
    },
    error: null,
  });
});

// 4. UPDATE REFERRAL DETAILS
export const updateReferral = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    clientName,
    companyName,
    mobileNumber,
    email,
    address,
    serviceRequired,
    estimatedBudget,
    notes,
  } = req.body;

  const referral = await Referral.findOne({ _id: id, isDeleted: false });
  if (!referral) {
    throw new AppError("Referral not found", 404, "REFERRAL_NOT_FOUND");
  }

  await assertReferralAccess(req, referral);

  if (clientName) referral.clientName = clientName;
  if (companyName !== undefined) referral.companyName = companyName;
  if (mobileNumber) {
    referral.mobileNumber = mobileNumber;
    referral.clientPhone = mobileNumber;
  }
  if (email) {
    referral.email = email.toLowerCase().trim();
    referral.clientEmail = email.toLowerCase().trim();
  }
  if (address !== undefined) referral.address = address;
  if (serviceRequired) referral.serviceRequired = serviceRequired;
  if (estimatedBudget !== undefined) referral.estimatedBudget = Number(estimatedBudget);
  if (notes !== undefined) referral.notes = notes;

  await referral.save();

  await logReferralActivity(
    req,
    referral._id,
    "Referral Updated",
    `Updated details for referral ${referral.referralId}`
  );

  res.status(200).json({
    success: true,
    message: "Referral updated successfully",
    data: { referral },
    error: null,
  });
});

// 5. DELETE REFERRAL (Soft delete - Admin only)
export const deleteReferral = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== "super_admin") {
    throw new AppError("Only Admins can delete referrals", 403, "PERMISSION_DENIED");
  }

  const referral = await Referral.findOne({ _id: id, isDeleted: false });
  if (!referral) {
    throw new AppError("Referral not found", 404, "REFERRAL_NOT_FOUND");
  }

  referral.isDeleted = true;
  referral.deletedAt = new Date();
  await referral.save();

  await logReferralActivity(
    req,
    referral._id,
    "Referral Deleted",
    `Soft deleted referral ${referral.referralId}`
  );

  res.status(200).json({
    success: true,
    message: "Referral deleted successfully",
    data: null,
    error: null,
  });
});

// 6. UPDATE REFERRAL STATUS
export const updateReferralStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, remarks } = req.body;

  const validStatuses = [
    "New",
    "Assigned",
    "Contacted",
    "Interested",
    "Follow Up",
    "Negotiation",
    "Converted",
    "Lost",
    "Cancelled",
  ];

  if (!status || !validStatuses.includes(status)) {
    throw new AppError("Invalid referral status", 400, "INVALID_STATUS");
  }

  const referral = await Referral.findOne({ _id: id, isDeleted: false }).populate("partnerId");
  if (!referral) {
    throw new AppError("Referral not found", 404, "REFERRAL_NOT_FOUND");
  }

  await assertReferralAccess(req, referral);

  const previousStatus = referral.status;
  referral.status = status;

  if (status === "Converted") {
    referral.convertedAt = new Date();
    await autoGenerateCommissionForReferral(referral, req.user);
  }

  await referral.save();

  // Add to Status History
  const now = new Date();
  const historyEntry = await ReferralStatusHistory.create({
    referralId: referral._id,
    previousStatus,
    currentStatus: status,
    changedBy: req.user._id,
    date: now.toISOString().split("T")[0],
    time: now.toTimeString().split(" ")[0],
    remarks: remarks || `Status updated from ${previousStatus} to ${status}`,
  });

  await logReferralActivity(
    req,
    referral._id,
    "Status Changed",
    `Status changed from "${previousStatus}" to "${status}"`,
    { previousStatus, currentStatus: status, remarks }
  );

  // Send Notification to Referral Partner
  if (referral.partnerId && referral.partnerId.userId) {
    await Notification.create({
      recipientUser: referral.partnerId.userId,
      title: "Referral Status Updated",
      message: `Status of your referral "${referral.clientName}" updated to ${status}.`,
      type: "referral",
    });
  }

  res.status(200).json({
    success: true,
    message: "Referral status updated successfully",
    data: {
      referral,
      statusHistory: historyEntry,
    },
    error: null,
  });
});

// 7. ASSIGN EMPLOYEE (Admin only)
export const assignEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { employeeId, remarks } = req.body;

  if (req.user.role !== "super_admin") {
    throw new AppError("Only Admins can assign employees", 403, "PERMISSION_DENIED");
  }

  if (!employeeId) {
    throw new AppError("Employee ID is required", 400, "MISSING_EMPLOYEE_ID");
  }

  const employee = await User.findById(employeeId);
  if (!employee) {
    throw new AppError("Employee not found", 404, "EMPLOYEE_NOT_FOUND");
  }

  const referral = await Referral.findOne({ _id: id, isDeleted: false }).populate("partnerId");
  if (!referral) {
    throw new AppError("Referral not found", 404, "REFERRAL_NOT_FOUND");
  }
  await assertReferralAccess(req, referral);

  const previousEmployee = referral.assignedEmployee;
  referral.assignedEmployee = employee._id;

  // Automatically transition status to Assigned if current status is New
  if (referral.status === "New") {
    referral.status = "Assigned";
    const now = new Date();
    await ReferralStatusHistory.create({
      referralId: referral._id,
      previousStatus: "New",
      currentStatus: "Assigned",
      changedBy: req.user._id,
      date: now.toISOString().split("T")[0],
      time: now.toTimeString().split(" ")[0],
      remarks: "Status auto-updated on employee assignment",
    });
  }

  await referral.save();

  // Create Assignment record
  const assignment = await ReferralAssignment.create({
    referralId: referral._id,
    assignedEmployee: employee._id,
    assignedBy: req.user._id,
    previousEmployee: previousEmployee || null,
    remarks: remarks || "",
  });

  await logReferralActivity(
    req,
    referral._id,
    "Employee Assigned",
    `Assigned to employee ${employee.name}`,
    { employeeId: employee._id, employeeName: employee.name }
  );

  // Notify Assigned Employee
  await Notification.create({
    recipientUser: employee._id,
    title: "New Referral Assigned",
    message: `You have been assigned to handle referral "${referral.clientName}".`,
    type: "referral",
  });

  res.status(200).json({
    success: true,
    message: "Employee assigned successfully",
    data: {
      referral,
      assignment,
    },
    error: null,
  });
});

// 8. UPLOAD ATTACHMENTS
export const uploadAttachments = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const referral = await Referral.findOne({ _id: id, isDeleted: false });
  if (!referral) {
    throw new AppError("Referral not found", 404, "REFERRAL_NOT_FOUND");
  }
  await assertReferralAccess(req, referral);

  if (!req.files || req.files.length === 0) {
    throw new AppError("No files attached", 400, "NO_FILES");
  }

  const attachments = [];
  for (const file of req.files) {
    const ext = path.extname(file.originalname).replace(".", "").toLowerCase();
    const att = await ReferralAttachment.create({
      referralId: referral._id,
      uploadedBy: req.user._id,
      originalName: file.originalname,
      fileName: file.filename,
      filePath: `/uploads/${file.filename}`,
      fileType: ext,
      fileSize: file.size,
    });
    attachments.push(att);
  }

  await logReferralActivity(
    req,
    referral._id,
    "Attachment Uploaded",
    `Uploaded ${attachments.length} attachment(s)`
  );

  res.status(201).json({
    success: true,
    message: "Attachments uploaded successfully",
    data: { attachments },
    error: null,
  });
});

// 9. DELETE ATTACHMENT
export const deleteAttachment = asyncHandler(async (req, res) => {
  const { id, attachmentId } = req.params;

  const attachment = await ReferralAttachment.findOne({
    _id: attachmentId,
    referralId: id,
    isDeleted: false,
  });

  if (!attachment) {
    throw new AppError("Attachment not found", 404, "ATTACHMENT_NOT_FOUND");
  }
  const referral = await Referral.findOne({ _id: id, isDeleted: false });
  if (!referral) {
    throw new AppError("Referral not found", 404, "REFERRAL_NOT_FOUND");
  }
  await assertReferralAccess(req, referral);

  if (
    req.user.role !== "super_admin" &&
    attachment.uploadedBy.toString() !== req.user._id.toString()
  ) {
    throw new AppError("You can only delete your own attachments", 403, "FORBIDDEN");
  }

  attachment.isDeleted = true;
  await attachment.save();

  await logReferralActivity(
    req,
    id,
    "Attachment Deleted",
    `Deleted attachment "${attachment.originalName}"`
  );

  res.status(200).json({
    success: true,
    message: "Attachment deleted successfully",
    data: null,
    error: null,
  });
});

// 10. COMMENTS: ADD, EDIT, DELETE
export const addComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { comment, parentCommentId } = req.body;

  if (!comment || !comment.trim()) {
    throw new AppError("Comment text is required", 400, "MISSING_COMMENT");
  }

  const referral = await Referral.findOne({ _id: id, isDeleted: false });
  if (!referral) {
    throw new AppError("Referral not found", 404, "REFERRAL_NOT_FOUND");
  }
  await assertReferralAccess(req, referral);

  const newComment = await ReferralComment.create({
    referralId: id,
    user: req.user._id,
    comment: comment.trim(),
    parentCommentId: parentCommentId || null,
  });

  const populated = await ReferralComment.findById(newComment._id).populate("user", "name email role");

  await logReferralActivity(req, id, "Comment Added", `Added comment to referral ${referral.referralId}`);

  res.status(201).json({
    success: true,
    message: "Comment added successfully",
    data: { comment: populated },
    error: null,
  });
});

export const updateComment = asyncHandler(async (req, res) => {
  const { id, commentId } = req.params;
  const { comment } = req.body;

  const existing = await ReferralComment.findOne({ _id: commentId, referralId: id, isDeleted: false });
  if (!existing) {
    throw new AppError("Comment not found", 404, "COMMENT_NOT_FOUND");
  }
  const referral = await Referral.findOne({ _id: id, isDeleted: false });
  if (!referral) {
    throw new AppError("Referral not found", 404, "REFERRAL_NOT_FOUND");
  }
  await assertReferralAccess(req, referral);

  if (existing.user.toString() !== req.user._id.toString()) {
    throw new AppError("You can only edit your own comments", 403, "FORBIDDEN");
  }

  existing.comment = comment.trim();
  await existing.save();

  const populated = await ReferralComment.findById(existing._id).populate("user", "name email role");

  res.status(200).json({
    success: true,
    message: "Comment updated successfully",
    data: { comment: populated },
    error: null,
  });
});

export const deleteComment = asyncHandler(async (req, res) => {
  const { id, commentId } = req.params;

  const existing = await ReferralComment.findOne({ _id: commentId, referralId: id, isDeleted: false });
  if (!existing) {
    throw new AppError("Comment not found", 404, "COMMENT_NOT_FOUND");
  }
  const referral = await Referral.findOne({ _id: id, isDeleted: false });
  if (!referral) {
    throw new AppError("Referral not found", 404, "REFERRAL_NOT_FOUND");
  }
  await assertReferralAccess(req, referral);

  if (
    req.user.role !== "super_admin" &&
    existing.user.toString() !== req.user._id.toString()
  ) {
    throw new AppError("You are not allowed to delete this comment", 403, "FORBIDDEN");
  }

  existing.isDeleted = true;
  existing.deletedAt = new Date();
  await existing.save();

  res.status(200).json({
    success: true,
    message: "Comment deleted successfully",
    data: null,
    error: null,
  });
});

// 11. INTERNAL NOTES (Admin Only)
export const addInternalNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { note, category } = req.body;

  if (req.user.role !== "super_admin") {
    throw new AppError("Only Admins can manage internal notes", 403, "PERMISSION_DENIED");
  }

  if (!note || !note.trim()) {
    throw new AppError("Note content is required", 400, "MISSING_NOTE");
  }

  const referral = await Referral.findOne({ _id: id, isDeleted: false });
  if (!referral) {
    throw new AppError("Referral not found", 404, "REFERRAL_NOT_FOUND");
  }
  await assertReferralAccess(req, referral);

  const internalNote = await ReferralInternalNote.create({
    referralId: id,
    adminUser: req.user._id,
    category: category || "General",
    note: note.trim(),
  });

  const populated = await ReferralInternalNote.findById(internalNote._id).populate("adminUser", "name email role");

  await logReferralActivity(req, id, "Internal Note Added", `Added internal note under category "${category || "General"}"`);

  res.status(201).json({
    success: true,
    message: "Internal note added successfully",
    data: { internalNote: populated },
    error: null,
  });
});

export const updateInternalNote = asyncHandler(async (req, res) => {
  const { id, noteId } = req.params;
  const { note, category } = req.body;

  if (req.user.role !== "super_admin") {
    throw new AppError("Only Admins can manage internal notes", 403, "PERMISSION_DENIED");
  }

  const existingNote = await ReferralInternalNote.findOne({ _id: noteId, referralId: id, isDeleted: false });
  if (!existingNote) {
    throw new AppError("Internal note not found", 404, "NOTE_NOT_FOUND");
  }

  if (note) existingNote.note = note.trim();
  if (category) existingNote.category = category;
  await existingNote.save();

  const populated = await ReferralInternalNote.findById(existingNote._id).populate("adminUser", "name email role");

  res.status(200).json({
    success: true,
    message: "Internal note updated successfully",
    data: { internalNote: populated },
    error: null,
  });
});

export const deleteInternalNote = asyncHandler(async (req, res) => {
  const { id, noteId } = req.params;

  if (req.user.role !== "super_admin") {
    throw new AppError("Only Admins can manage internal notes", 403, "PERMISSION_DENIED");
  }

  const existingNote = await ReferralInternalNote.findOne({ _id: noteId, referralId: id, isDeleted: false });
  if (!existingNote) {
    throw new AppError("Internal note not found", 404, "NOTE_NOT_FOUND");
  }

  existingNote.isDeleted = true;
  await existingNote.save();

  res.status(200).json({
    success: true,
    message: "Internal note deleted successfully",
    data: null,
    error: null,
  });
});

// 12. GET TIMELINE (Chronological sequence of all events)
export const getReferralTimeline = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const referral = await Referral.findOne({ _id: id, isDeleted: false });
  if (!referral) {
    throw new AppError("Referral not found", 404, "REFERRAL_NOT_FOUND");
  }
  await assertReferralAccess(req, referral);

  const activityLogs = await ReferralActivityLog.find({ referralId: id })
    .populate("user", "name email role")
    .sort({ createdAt: 1 });

  const timelineEvents = activityLogs.map((log) => ({
    id: log._id,
    date: log.createdAt.toISOString().split("T")[0],
    time: log.createdAt.toTimeString().split(" ")[0],
    user: log.user ? log.user.name : "System",
    role: log.role || (log.user ? log.user.role : ""),
    activity: log.action,
    description: log.description,
    createdAt: log.createdAt,
  }));

  res.status(200).json({
    success: true,
    message: "Referral timeline retrieved successfully",
    data: { timeline: timelineEvents },
    error: null,
  });
});

// 13. DASHBOARD ANALYTICS (Section 1 Analytics & Metrics)
export const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const query = { isDeleted: false };

  // RBAC scope
  if (req.user.role === "referral_partner") {
    const partnerDoc = await getPartnerDocForUser(req.user._id);
    if (partnerDoc) query.partnerId = partnerDoc._id;
  } else if (req.user.role === "employee") {
    query.assignedEmployee = req.user._id;
  } else if (req.user.role !== "super_admin" && req.user.role !== "admin") {
    query._id = null;
  }

  const allReferrals = await Referral.find(query);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Status metrics
  const statusCounts = {
    New: 0,
    Assigned: 0,
    Contacted: 0,
    Interested: 0,
    "Follow Up": 0,
    Negotiation: 0,
    Converted: 0,
    Lost: 0,
    Cancelled: 0,
  };

  let totalReferrals = 0;
  let todayReferrals = 0;
  let monthlyReferrals = 0;
  let estimatedBusinessValue = 0;

  allReferrals.forEach((ref) => {
    totalReferrals++;
    const statusKey = statusCounts[ref.status] !== undefined ? ref.status : "New";
    statusCounts[statusKey]++;

    estimatedBusinessValue += ref.estimatedBudget || 0;

    const refDate = new Date(ref.createdAt);
    if (refDate >= startOfToday) todayReferrals++;
    if (refDate >= startOfMonth) monthlyReferrals++;
  });

  const conversionRate = totalReferrals > 0 ? ((statusCounts.Converted / totalReferrals) * 100).toFixed(1) : 0;

  // Monthly Trend (Last 6 Months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const monthlyTrendAgg = await Referral.aggregate([
    { $match: { ...query, createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        total: { $sum: 1 },
        converted: { $sum: { $cond: [{ $eq: ["$status", "Converted"] }, 1, 0] } },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyTrend = monthlyTrendAgg.map((item) => ({
    label: `${monthNames[item._id.month - 1]} ${item._id.year}`,
    total: item.total,
    converted: item.converted,
  }));

  // Employee-wise breakdown
  const employeeBreakdownAgg = await Referral.aggregate([
    { $match: { ...query, assignedEmployee: { $ne: null } } },
    {
      $group: {
        _id: "$assignedEmployee",
        total: { $sum: 1 },
        converted: { $sum: { $cond: [{ $eq: ["$status", "Converted"] }, 1, 0] } },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "employee",
      },
    },
    { $unwind: "$employee" },
    {
      $project: {
        employeeName: "$employee.name",
        total: 1,
        converted: 1,
      },
    },
  ]);

  // Partner-wise breakdown
  const partnerBreakdownAgg = await Referral.aggregate([
    { $match: query },
    {
      $group: {
        _id: "$partnerId",
        total: { $sum: 1 },
        converted: { $sum: { $cond: [{ $eq: ["$status", "Converted"] }, 1, 0] } },
        totalValue: { $sum: "$estimatedBudget" },
      },
    },
    {
      $lookup: {
        from: "referralpartners",
        localField: "_id",
        foreignField: "_id",
        as: "partner",
      },
    },
    { $unwind: { path: "$partner", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "users",
        localField: "partner.userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        partnerName: { $ifNull: ["$user.name", "Default Partner"] },
        total: 1,
        converted: 1,
        totalValue: 1,
      },
    },
  ]);

  res.status(200).json({
    success: true,
    message: "Dashboard analytics retrieved successfully",
    data: {
      metrics: {
        totalReferrals,
        newReferrals: statusCounts.New,
        assignedReferrals: statusCounts.Assigned,
        contacted: statusCounts.Contacted,
        interested: statusCounts.Interested,
        followUp: statusCounts["Follow Up"],
        negotiation: statusCounts.Negotiation,
        converted: statusCounts.Converted,
        lost: statusCounts.Lost,
        cancelled: statusCounts.Cancelled,
        todayReferrals,
        monthlyReferrals,
        conversionRate: Number(conversionRate),
        estimatedBusinessValue,
      },
      charts: {
        monthlyTrend,
        statusDistribution: Object.keys(statusCounts).map((status) => ({
          status,
          count: statusCounts[status],
        })),
        employeeBreakdown: employeeBreakdownAgg,
        partnerBreakdown: partnerBreakdownAgg,
      },
    },
    error: null,
  });
});

// 14. EXPORT REFERRALS (Excel / CSV / PDF formats with filter respect)
export const exportReferrals = asyncHandler(async (req, res) => {
  const {
    format = "csv",
    status = "",
    partnerId = "",
    assignedEmployee = "",
    service = "",
    minBudget = "",
    maxBudget = "",
    startDate = "",
    endDate = "",
    search = "",
  } = req.query;

  const query = { isDeleted: false };

  if (req.user.role === "referral_partner") {
    const partnerDoc = await getPartnerDocForUser(req.user._id);
    if (partnerDoc) query.partnerId = partnerDoc._id;
  } else if (req.user.role === "employee") {
    query.assignedEmployee = req.user._id;
  } else if (req.user.role !== "super_admin" && req.user.role !== "admin") {
    query._id = null;
  }

  if (partnerId && req.user.role === "super_admin") query.partnerId = partnerId;
  if (assignedEmployee) query.assignedEmployee = assignedEmployee;
  if (status) query.status = status;
  if (service) query.serviceRequired = { $regex: service, $options: "i" };

  if (minBudget || maxBudget) {
    query.estimatedBudget = {};
    if (minBudget) query.estimatedBudget.$gte = Number(minBudget);
    if (maxBudget) query.estimatedBudget.$lte = Number(maxBudget);
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }

  if (search) {
    const searchRegex = new RegExp(search, "i");
    query.$or = [
      { referralId: searchRegex },
      { clientName: searchRegex },
      { companyName: searchRegex },
      { mobileNumber: searchRegex },
      { email: searchRegex },
      { serviceRequired: searchRegex },
    ];
  }

  const referrals = await Referral.find(query)
    .populate({
      path: "partnerId",
      populate: { path: "userId", select: "name email" },
    })
    .populate("assignedEmployee", "name email")
    .sort({ createdAt: -1 });

  if (format === "json") {
    return res.status(200).json({
      success: true,
      message: "Referrals exported",
      data: { referrals },
      error: null,
    });
  }

  // Format as CSV
  const headers = [
    "Referral ID",
    "Client Name",
    "Company",
    "Mobile",
    "Email",
    "Service Required",
    "Budget (INR)",
    "Status",
    "Assigned Employee",
    "Partner Name",
    "Created Date",
  ];

  const rows = referrals.map((r) => [
    `"${r.referralId || ""}"`,
    `"${r.clientName || ""}"`,
    `"${r.companyName || ""}"`,
    `"${r.mobileNumber || ""}"`,
    `"${r.email || ""}"`,
    `"${r.serviceRequired || ""}"`,
    r.estimatedBudget || 0,
    `"${r.status || ""}"`,
    `"${r.assignedEmployee ? r.assignedEmployee.name : "Unassigned"}"`,
    `"${r.partnerId && r.partnerId.userId ? r.partnerId.userId.name : "N/A"}"`,
    `"${new Date(r.createdAt).toISOString().split("T")[0]}"`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=referrals-export-${Date.now()}.csv`);
  return res.status(200).send(csvContent);
});
