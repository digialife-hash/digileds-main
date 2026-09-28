import mongoose from "mongoose";

const commissionSchema = new mongoose.Schema(
  {
    commissionId: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    referralId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Referral",
      required: [true, "Referral ID is required"],
      index: true,
    },
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReferralPartner",
      required: [true, "Partner ID is required"],
      index: true,
    },
    projectValue: {
      type: Number,
      default: 0,
      min: [0, "Project value cannot be negative"],
    },
    commissionType: {
      type: String,
      enum: [
        "Percentage Based",
        "Fixed Amount",
        "Manual Commission",
        "Project Based",
        "Monthly Commission",
      ],
      default: "Percentage Based",
    },
    commissionPercentage: {
      type: Number,
      default: 10,
      min: [0, "Percentage cannot be negative"],
    },
    grossCommission: {
      type: Number,
      required: [true, "Gross commission is required"],
      min: [0, "Gross commission cannot be negative"],
    },
    deductions: {
      type: Number,
      default: 0,
      min: [0, "Deductions cannot be negative"],
    },
    netCommission: {
      type: Number,
      required: [true, "Net commission is required"],
      min: [0, "Net commission cannot be negative"],
    },
    status: {
      type: String,
      enum: [
        "Pending",
        "Under Review",
        "Approved",
        "Rejected",
        "Paid",
        "Cancelled",
        // Legacy fallbacks
        "pending",
        "paid",
        "rejected",
      ],
      default: "Pending",
      index: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CommissionPayment",
      default: null,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

commissionSchema.pre("save", function (next) {
  if (!this.commissionId) {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    this.commissionId = `COM-${dateStr}-${randomSuffix}`;
  }
  if (this.dueDate === null) {
    const due = new Date(this.createdAt || Date.now());
    due.setDate(due.getDate() + 15); // 15 days payment due
    this.dueDate = due;
  }
  next();
});

commissionSchema.index({ partnerId: 1, status: 1, isDeleted: 1 });
commissionSchema.index({ referralId: 1, isDeleted: 1 });
commissionSchema.index({ createdAt: -1 });

const Commission = mongoose.model("Commission", commissionSchema);
export default Commission;
