import mongoose from "mongoose";

const attendanceSettingsSchema = new mongoose.Schema(
  {
    officeStartTime: {
      type: String,
      default: "09:00",
      trim: true,
    },
    officeEndTime: {
      type: String,
      default: "18:00",
      trim: true,
    },
    gracePeriod: {
      type: Number,
      default: 15, // in minutes
    },
    halfDayHours: {
      type: Number,
      default: 4, // in hours
    },
    minWorkingHours: {
      type: Number,
      default: 8, // in hours
    },
    overtimeThreshold: {
      type: Number,
      default: 9, // in hours
    },
    overtimeRate: {
      type: Number,
      default: 1.5, // 1.5x multiplier
    },
    weeklyOffDays: {
      type: [Number],
      default: [0], // 0 is Sunday, 6 is Saturday
    },
    salaryCalculationMethod: {
      type: String,
      enum: ["monthly_fixed", "daily_rate", "hourly_rate"],
      default: "monthly_fixed",
    },
    defaultWorkingDaysPerMonth: {
      type: Number,
      default: 26,
    },
    autoMarkAbsent: {
      type: Boolean,
      default: true,
    },
    maxAllowedLateEntries: {
      type: Number,
      default: 3,
    },
    lateEntryDeductionRate: {
      type: Number,
      default: 0.5, // 0.5 day's salary deduction
    },
    lateEntryDeductionAfter: {
      type: Number,
      default: 3, // deduct after 3 late entries
    },
  },
  { timestamps: true }
);

const AttendanceSettings = mongoose.model("AttendanceSettings", attendanceSettingsSchema);
export default AttendanceSettings;
