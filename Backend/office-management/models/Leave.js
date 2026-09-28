import mongoose from "mongoose";

export const leaveTypes = ["casual", "sick", "paid", "unpaid", "emergency"];
export const leaveStatuses = ["pending", "approved", "rejected", "cancelled"];

const leaveSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: [true, "Employee is required"],
    },
    employeeName: {
      type: String,
      required: [true, "Employee name is required"],
      trim: true,
    },
    employeeEmail: {
      type: String,
      required: [true, "Employee email is required"],
      lowercase: true,
      trim: true,
    },
    leaveType: {
      type: String,
      enum: {
        values: leaveTypes,
        message: "Invalid leave type: {VALUE}",
      },
      required: [true, "Leave type is required"],
    },
    fromDate: {
      type: Date,
      required: [true, "From date is required"],
    },
    toDate: {
      type: Date,
      required: [true, "To date is required"],
    },
    numberOfDays: {
      type: Number,
      required: [true, "Number of days is required"],
      min: [0.5, "Minimum leave duration is 0.5 days"],
    },
    reason: {
      type: String,
      required: [true, "Reason is required"],
      trim: true,
      maxlength: [1000, "Reason cannot exceed 1000 characters"],
    },
    status: {
      type: String,
      enum: {
        values: leaveStatuses,
        message: "Invalid leave status: {VALUE}",
      },
      default: "pending",
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvalDate: {
      type: Date,
      default: null,
    },
    adminRemarks: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

leaveSchema.index({ employeeId: 1, fromDate: 1, toDate: 1 });
leaveSchema.index({ status: 1 });
leaveSchema.index({ fromDate: 1, toDate: 1 });

const Leave = mongoose.model("Leave", leaveSchema);
export default Leave;
