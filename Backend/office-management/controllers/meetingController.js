import mongoose from "mongoose";
import Meeting, { meetingTypes, meetingStatuses } from "../models/Meeting.js";
import Employee from "../models/Employee.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

const EMPLOYEE_BASIC_FIELDS = "name email phone department designation";

export const createMeeting = asyncHandler(async (req, res) => {
  const { title, description, meetingDate, startTime, endTime, location, meetingType, attendees, targetDepartment, status } = req.body;

  if (!title || !title.trim() || !meetingDate) {
    throw new AppError("Meeting title and date are required", 400, "MISSING_FIELDS");
  }

  const validAttendees = Array.isArray(attendees)
    ? attendees.filter((id) => mongoose.Types.ObjectId.isValid(id))
    : [];

  const meeting = await Meeting.create({
    title: title.trim(),
    description: description ? description.trim() : "",
    meetingDate: new Date(meetingDate),
    startTime: startTime || "10:00 AM",
    endTime: endTime || "11:00 AM",
    location: location || "Main Conference Room / Google Meet",
    meetingType: meetingTypes.includes(meetingType) ? meetingType : "Online",
    organizer: req.user._id,
    attendees: validAttendees,
    targetDepartment: targetDepartment || "All Departments",
    status: meetingStatuses.includes(status) ? status : "Scheduled",
    createdBy: req.user._id,
  });

  const populatedMeeting = await Meeting.findById(meeting._id)
    .populate("organizer", "name email role")
    .populate("attendees", EMPLOYEE_BASIC_FIELDS)
    .lean();

  return res.status(201).json({
    success: true,
    message: "Meeting scheduled successfully",
    data: { meeting: populatedMeeting },
  });
});

export const getAllMeetings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = "", status = "", filterDate = "", department = "" } = req.query;

  const query = {};
  if (status) query.status = status;
  if (department) query.targetDepartment = department;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  if (filterDate === "today") {
    query.meetingDate = { $gte: startOfToday, $lte: endOfToday };
  } else if (filterDate === "upcoming") {
    query.meetingDate = { $gt: endOfToday };
  } else if (filterDate === "past") {
    query.meetingDate = { $lt: startOfToday };
  }

  if (req.user.role === "employee") {
    const emp = await Employee.findOne({ userId: req.user._id }).select("_id department").lean();
    if (emp) {
      query.$or = [
        { attendees: emp._id },
        { targetDepartment: "All Departments" },
        { targetDepartment: emp.department },
      ];
    }
  }

  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), "i");
    query.$or = [{ title: regex }, { description: regex }, { location: regex }];
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [meetings, total] = await Promise.all([
    Meeting.find(query)
      .populate("organizer", "name email role")
      .populate("attendees", EMPLOYEE_BASIC_FIELDS)
      .sort({ meetingDate: 1, startTime: 1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Meeting.countDocuments(query),
  ]);

  return res.status(200).json({
    success: true,
    data: {
      meetings,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    },
  });
});

export const getMeetingById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid meeting ID", 400, "INVALID_ID");
  }

  const meeting = await Meeting.findById(id)
    .populate("organizer", "name email role")
    .populate("attendees", EMPLOYEE_BASIC_FIELDS)
    .lean();

  if (!meeting) {
    throw new AppError("Meeting not found", 404, "NOT_FOUND");
  }

  return res.status(200).json({
    success: true,
    data: { meeting },
  });
});

export const updateMeeting = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid meeting ID", 400, "INVALID_ID");
  }

  const meeting = await Meeting.findById(id);
  if (!meeting) {
    throw new AppError("Meeting not found", 404, "NOT_FOUND");
  }

  const allowedFields = [
    "title",
    "description",
    "meetingDate",
    "startTime",
    "endTime",
    "location",
    "meetingType",
    "attendees",
    "targetDepartment",
    "status",
    "minutesOfMeeting",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      meeting[field] = req.body[field];
    }
  });

  await meeting.save();

  const updatedMeeting = await Meeting.findById(meeting._id)
    .populate("organizer", "name email role")
    .populate("attendees", EMPLOYEE_BASIC_FIELDS)
    .lean();

  return res.status(200).json({
    success: true,
    message: "Meeting details updated successfully",
    data: { meeting: updatedMeeting },
  });
});

export const deleteMeeting = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid meeting ID", 400, "INVALID_ID");
  }

  const meeting = await Meeting.findByIdAndDelete(id);
  if (!meeting) {
    throw new AppError("Meeting not found", 404, "NOT_FOUND");
  }

  return res.status(200).json({
    success: true,
    message: "Meeting deleted successfully",
  });
});
