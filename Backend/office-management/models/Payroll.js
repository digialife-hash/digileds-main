import mongoose from "mongoose";

export const payrollPaymentStatuses = ["unpaid", "partially_paid", "paid"];

const payrollSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: [true, "Employee is required"],
    },

    month: {
      type: Number,
      required: [true, "Payroll month is required"],
      min: [1, "Payroll month must be between 1 and 12"],
      max: [12, "Payroll month must be between 1 and 12"],
    },

    year: {
      type: Number,
      required: [true, "Payroll year is required"],
      min: [2000, "Payroll year must be 2000 or later"],
      max: [2100, "Payroll year must be 2100 or earlier"],
    },

    basicSalary: {
      type: Number,
      required: [true, "Basic salary is required"],
      min: [0, "Basic salary cannot be negative"],
    },

    bonus: {
      type: Number,
      min: [0, "Bonus cannot be negative"],
      default: 0,
    },

    deduction: {
      type: Number,
      min: [0, "Deduction cannot be negative"],
      default: 0,
    },

    paidAmount: {
      type: Number,
      min: [0, "Paid amount cannot be negative"],
      default: 0,
    },

    dueAmount: {
      type: Number,
      min: [0, "Due amount cannot be negative"],
      default: 0,
    },

    paymentStatus: {
      type: String,
      enum: {
        values: payrollPaymentStatuses,
        message: "Payment status must be unpaid, partially_paid, or paid",
      },
      default: "unpaid",
    },

    paymentDate: {
      type: Date,
      default: null,
    },

    remarks: {
      type: String,
      trim: true,
      maxlength: [2000, "Remarks cannot exceed 2000 characters"],
      default: "",
    },

    status: {
      type: String,
      enum: ["draft", "generated", "approved", "rejected"],
      default: "generated",
    },

    netSalary: {
      type: Number,
      default: 0,
    },

    overtimeAmount: {
      type: Number,
      default: 0,
    },

    lateDeduction: {
      type: Number,
      default: 0,
    },

    salarySlip: {
      fileName: {
        type: String,
        trim: true,
        maxlength: [255, "Salary slip file name cannot exceed 255 characters"],
        default: "",
      },
      url: {
        type: String,
        trim: true,
        maxlength: [2048, "Salary slip URL cannot exceed 2048 characters"],
        default: "",
      },
      storageKey: {
        type: String,
        trim: true,
        maxlength: [512, "Salary slip storage key cannot exceed 512 characters"],
        default: "",
      },
      generatedAt: {
        type: Date,
        default: null,
      },
    },

    attendanceSummary: {
      workingDays: {
        type: Number,
        min: [0, "Working days cannot be negative"],
        default: 0,
      },
      presentDays: {
        type: Number,
        min: [0, "Present days cannot be negative"],
        default: 0,
      },
      leaveDays: {
        type: Number,
        min: [0, "Leave days cannot be negative"],
        default: 0,
      },
      absentDays: {
        type: Number,
        min: [0, "Absent days cannot be negative"],
        default: 0,
      },
      attendanceDeduction: {
        type: Number,
        min: [0, "Attendance deduction cannot be negative"],
        default: 0,
      },
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

payrollSchema.index({ employeeId: 1 });
payrollSchema.index({ month: 1 });
payrollSchema.index({ year: 1 });
payrollSchema.index({ paymentStatus: 1 });
payrollSchema.index({ paymentDate: 1 });
payrollSchema.index({ createdAt: -1 });
payrollSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });

payrollSchema.methods.toJSON = function () {
  const payroll = this.toObject();
  delete payroll.__v;
  return payroll;
};

const Payroll = mongoose.model("Payroll", payrollSchema);

export default Payroll;
