import mongoose from "mongoose";

const referralStatusHistorySchema = new mongoose.Schema(
  {
    referralId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Referral",
      required: [true, "Referral ID is required"],
      index: true,
    },
    previousStatus: {
      type: String,
      required: [true, "Previous status is required"],
    },
    currentStatus: {
      type: String,
      required: [true, "Current status is required"],
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
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

referralStatusHistorySchema.index({ referralId: 1, createdAt: -1 });

const ReferralStatusHistory = mongoose.model(
  "ReferralStatusHistory",
  referralStatusHistorySchema
);

export default ReferralStatusHistory;
