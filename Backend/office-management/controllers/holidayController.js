import Holiday from "../models/Holiday.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

// Get all holidays
export const getHolidays = asyncHandler(async (req, res) => {
  const holidays = await Holiday.find().sort({ date: 1 });
  return res.status(200).json({
    success: true,
    data: holidays,
  });
});

// Create a holiday
export const createHoliday = asyncHandler(async (req, res) => {
  if (!["super_admin", "admin", "hr"].includes(req.user.role)) {
    throw new AppError("Access denied. Admin privileges required.", 403, "FORBIDDEN");
  }

  const { name, date, type, description, isPaid, enabled } = req.body;
  if (!name || !date) {
    throw new AppError("Holiday name and date are required.", 400, "BAD_REQUEST");
  }

  const existingHoliday = await Holiday.findOne({ date: new Date(date) });
  if (existingHoliday) {
    throw new AppError("A holiday already exists on this date.", 409, "CONFLICT");
  }

  const holiday = await Holiday.create({
    name,
    date: new Date(date),
    type,
    description,
    isPaid: isPaid ?? true,
    enabled: enabled ?? true,
  });

  return res.status(201).json({
    success: true,
    message: "Holiday created successfully",
    data: holiday,
  });
});

// Update a holiday
export const updateHoliday = asyncHandler(async (req, res) => {
  if (!["super_admin", "admin", "hr"].includes(req.user.role)) {
    throw new AppError("Access denied. Admin privileges required.", 403, "FORBIDDEN");
  }

  const { id } = req.params;
  const { name, date, type, description, isPaid, enabled } = req.body;

  let holiday = await Holiday.findById(id);
  if (!holiday) {
    throw new AppError("Holiday not found", 404, "NOT_FOUND");
  }

  if (date && new Date(date).getTime() !== holiday.date.getTime()) {
    const existing = await Holiday.findOne({ date: new Date(date) });
    if (existing) {
      throw new AppError("A holiday already exists on this date.", 409, "CONFLICT");
    }
    holiday.date = new Date(date);
  }

  if (name) holiday.name = name;
  if (type) holiday.type = type;
  if (description !== undefined) holiday.description = description;
  if (isPaid !== undefined) holiday.isPaid = isPaid;
  if (enabled !== undefined) holiday.enabled = enabled;

  await holiday.save();

  return res.status(200).json({
    success: true,
    message: "Holiday updated successfully",
    data: holiday,
  });
});

// Delete a holiday
export const deleteHoliday = asyncHandler(async (req, res) => {
  if (!["super_admin", "admin", "hr"].includes(req.user.role)) {
    throw new AppError("Access denied. Admin privileges required.", 403, "FORBIDDEN");
  }

  const { id } = req.params;
  const holiday = await Holiday.findByIdAndDelete(id);
  if (!holiday) {
    throw new AppError("Holiday not found", 404, "NOT_FOUND");
  }

  return res.status(200).json({
    success: true,
    message: "Holiday deleted successfully",
    data: null,
  });
});
