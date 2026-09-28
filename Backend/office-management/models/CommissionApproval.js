import mongoose from "mongoose";

const commissionApprovalSchema = new mongoose.Schema(
  {
    commissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Commission",
      required: [true, "Commission ID is required"],
      index: true,
    },
    previousStatus: {
      type: String,
      required: true,
    },
    newStatus: {
      type: String,
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Approver user ID is required"],
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    remarks: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

commissionApprovalSchema.index({ commissionId: 1, createdAt: -1 });

const CommissionApproval = mongoose.model(
  "CommissionApproval",
  commissionApprovalSchema
);

export default CommissionApproval;
