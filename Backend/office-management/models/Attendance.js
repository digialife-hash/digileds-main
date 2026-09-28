import mongoose from "mongoose";

export const attendanceStatuses = ["present", "absent", "half_day"];

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: [true, "Employee ID is required"],
    },
    employeeName: {
      type: String,
      required: [true, "Employee name is required"],
      trim: true,
      maxlength: [100, "Employee name cannot exceed 100 characters"],
    },
    employeeEmail: {
      type: String,
      required: [true, "Employee email is required"],
      lowercase: true,
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    checkInTime: {
      type: Date,
      default: null,
    },
    checkOutTime: {
      type: Date,
      default: null,
    },
    totalWorkingHours: {
      type: Number,
      min: [0, "Working hours cannot be negative"],
      default: 0,
    },
    attendanceStatus: {
      type: String,
      enum: {
        values: attendanceStatuses,
        message: "Invalid attendance status: {VALUE}",
      },
      default: "present",
    },
    employeeStatus: {
      type: String,
      enum: {
        values: ["active", "inactive"],
        message: "Invalid employee status: {VALUE}",
      },
      default: "active",
    },
    lateMinutes: {
      type: Number,
      default: 0,
    },
    earlyLeavingMinutes: {
      type: Number,
      default: 0,
    },
    isHoliday: {
      type: Boolean,
      default: false,
    },
    holidayId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Holiday",
      default: null,
    },
    holidayType: {
      type: String,
      default: "",
    },
    isWeeklyOff: {
      type: Boolean,
      default: false,
    },
    isPaidLeave: {
      type: Boolean,
      default: false,
    },
    isUnpaidLeave: {
      type: Boolean,
      default: false,
    },
    remarks: {
      type: String,
      default: "",
    },
    adminRemarks: {
      type: String,
      default: "",
    },
    overtimeHours: {
      type: Number,
      default: 0,
    },
    salaryEligible: {
      type: Boolean,
      default: true,
    },
    salaryDeduction: {
      type: Number,
      default: 0,
    },
    salaryAddition: {
      type: Number,
      default: 0,
    },
    payableHours: {
      type: Number,
      default: 0,
    },
    payableDays: {
      type: Number,
      default: 1,
    },
    ipAddress: { type: String, default: "" },
    location: { type: String, default: "" },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    userAgent: { type: String, default: "" },
    browser: { type: String, default: "" },
    operatingSystem: { type: String, default: "" },
    deviceType: { type: String, default: "" },
    checkInLocation: { type: String, default: "" },
    checkOutLocation: { type: String, default: "" },
    checkInIP: { type: String, default: "" },
    checkOutIP: { type: String, default: "" },
    checkInLatitude: { type: Number, default: null },
    checkInLongitude: { type: Number, default: null },
    checkOutLatitude: { type: Number, default: null },
    checkOutLongitude: { type: Number, default: null },
    checkInBrowser: { type: String, default: "" },
    checkOutBrowser: { type: String, default: "" },
    checkInOS: { type: String, default: "" },
    checkOutOS: { type: String, default: "" },
    checkInDevice: { type: String, default: "" },
    checkOutDevice: { type: String, default: "" },
  },
  { timestamps: true }
);

attendanceSchema.index({ employeeId: 1 });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ attendanceStatus: 1 });
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ employeeId: 1, date: -1 });
attendanceSchema.index({ createdAt: -1 });

attendanceSchema.methods.toJSON = function () {
  const attendance = this.toObject();
  delete attendance.__v;
  return attendance;
};

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;
