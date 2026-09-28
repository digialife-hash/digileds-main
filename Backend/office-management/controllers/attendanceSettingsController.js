import AttendanceSettings from "../models/AttendanceSettings.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

// Get attendance settings
export const getSettings = asyncHandler(async (req, res) => {
  let settings = await AttendanceSettings.findOne();
  if (!settings) {
    settings = await AttendanceSettings.create({ weeklyOffDays: [0] });
  } else {
    // Force Sunday weekly off
    settings.weeklyOffDays = [0];
    await settings.save();
  }
  return res.status(200).json({
    success: true,
    data: settings,
  });
});

// Update attendance settings
export const updateSettings = asyncHandler(async (req, res) => {
  if (req.user.role !== "super_admin" && req.user.role !== "admin") {
    throw new AppError("Access denied. Admin privileges required.", 403, "FORBIDDEN");
  }

  // Force weeklyOffDays to be [0] (Sunday)
  const updateData = {
    ...req.body,
    weeklyOffDays: [0],
  };

  let settings = await AttendanceSettings.findOne();
  if (!settings) {
    settings = await AttendanceSettings.create(updateData);
  } else {
    settings = await AttendanceSettings.findByIdAndUpdate(settings._id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  return res.status(200).json({
    success: true,
    message: "Attendance settings updated successfully (Weekly off set to Sunday)",
    data: settings,
  });
});
