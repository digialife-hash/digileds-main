import mongoose from "mongoose";

const referralActivityLogSchema = new mongoose.Schema(
  {
    referralId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Referral",
      required: [true, "Referral ID is required"],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    role: {
      type: String,
      trim: true,
      default: "",
    },
    action: {
      type: String,
      required: [true, "Action is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    ipAddress: {
      type: String,
      trim: true,
      default: "127.0.0.1",
    },
    browser: {
      type: String,
      trim: true,
      default: "",
    },
    device: {
      type: String,
      trim: true,
      default: "",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

referralActivityLogSchema.index({ referralId: 1, createdAt: -1 });
referralActivityLogSchema.index({ user: 1, createdAt: -1 });

const ReferralActivityLog = mongoose.model(
  "ReferralActivityLog",
  referralActivityLogSchema
);

export default ReferralActivityLog;
