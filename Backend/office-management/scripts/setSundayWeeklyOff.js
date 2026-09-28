import dotenv from "dotenv";
import connectDB from "../config/db.js";
import AttendanceSettings from "../models/AttendanceSettings.js";

dotenv.config();

try {
  await connectDB();

  let settings = await AttendanceSettings.findOne();
  if (!settings) {
    settings = await AttendanceSettings.create({
      weeklyOffDays: [0], // Sunday
    });
    console.log("Created new settings with weeklyOffDays as [0] (Sunday).");
  } else {
    settings.weeklyOffDays = [0]; // Sunday
    await settings.save();
    console.log("Updated existing settings with weeklyOffDays as [0] (Sunday).");
  }
} catch (e) {
  console.error("Error setting weekly off day:", e);
} finally {
  process.exit(0);
}
