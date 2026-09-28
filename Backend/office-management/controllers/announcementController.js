import mongoose from "mongoose";
import Announcement, { announcementTypes, announcementPriorities, announcementStatuses, targetAudiences } from "../models/Announcement.js";
import Employee from "../models/Employee.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createAnnouncement = asyncHandler(async (req, res) => {
  if (!["super_admin", "admin", "hr"].includes(req.user.role)) {
    throw new AppError("Admin access required", 403, "FORBIDDEN");
  }

  const { title, description, announcementType, priority, publishDate, expiryDate, targetAudience, status, attachment } = req.body;

  if (!title || !title.trim() || !description || !description.trim()) {
    throw new AppError("Title and description are required", 400, "MISSING_FIELDS");
  }

  const announcement = await Announcement.create({
    title: title.trim(),
    description: description.trim(),
    announcementType: announcementTypes.includes(announcementType) ? announcementType : "General",
    priority: announcementPriorities.includes(priority) ? priority : "Normal",
    publishDate: publishDate ? new Date(publishDate) : new Date(),
    expiryDate: expiryDate ? new Date(expiryDate) : null,
    targetAudience: targetAudiences.includes(targetAudience) ? targetAudience : "All Employees",
    status: announcementStatuses.includes(status) ? status : "Published",
    attachment: attachment ? attachment.trim() : "",
    createdBy: req.user._id,
  });

  return res.status(201).json({
    success: true,
    message: "Announcement created successfully",
    data: { announcement },
  });
});

export const getAllAnnouncements = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = "", status = "", priority = "", type = "", audience = "" } = req.query;
  const now = new Date();

  const query = {};

  if (req.user.role === "employee") {
    query.status = "Published";
    query.$or = [
      { expiryDate: null },
      { expiryDate: { $gte: now } },
    ];

    const emp = await Employee.findOne({ userId: req.user._id }).lean();
    const userDept = emp?.department || "";

    query.targetAudience = {
      $in: ["All Employees", userDept, req.user.role],
    };
  } else {
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (type) query.announcementType = type;
    if (audience) query.targetAudience = audience;
  }

  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), "i");
    query.$or = [{ title: regex }, { description: regex }];
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [announcements, total] = await Promise.all([
    Announcement.find(query)
      .populate("createdBy", "name email role")
      .sort({ publishDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Announcement.countDocuments(query),
  ]);

  return res.status(200).json({
    success: true,
    data: {
      announcements,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    },
  });
});

export const getAnnouncementById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid announcement ID", 400, "INVALID_ID");
  }

  const announcement = await Announcement.findById(id)
    .populate("createdBy", "name email role")
    .lean();

  if (!announcement) {
    throw new AppError("Announcement not found", 404, "NOT_FOUND");
  }

  return res.status(200).json({
    success: true,
    data: { announcement },
  });
});

export const updateAnnouncement = asyncHandler(async (req, res) => {
  if (!["super_admin", "admin", "hr"].includes(req.user.role)) {
    throw new AppError("Admin access required", 403, "FORBIDDEN");
  }

  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid announcement ID", 400, "INVALID_ID");
  }

  const announcement = await Announcement.findById(id);
  if (!announcement) {
    throw new AppError("Announcement not found", 404, "NOT_FOUND");
  }

  const allowedFields = ["title", "description", "announcementType", "priority", "publishDate", "expiryDate", "targetAudience", "status", "attachment"];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      announcement[field] = req.body[field];
    }
  });

  await announcement.save();

  return res.status(200).json({
    success: true,
    message: "Announcement updated successfully",
    data: { announcement },
  });
});

export const deleteAnnouncement = asyncHandler(async (req, res) => {
  if (!["super_admin", "admin", "hr"].includes(req.user.role)) {
    throw new AppError("Admin access required", 403, "FORBIDDEN");
  }

  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid announcement ID", 400, "INVALID_ID");
  }

  const announcement = await Announcement.findByIdAndDelete(id);
  if (!announcement) {
    throw new AppError("Announcement not found", 404, "NOT_FOUND");
  }

  return res.status(200).json({
    success: true,
    message: "Announcement deleted successfully",
  });
});
