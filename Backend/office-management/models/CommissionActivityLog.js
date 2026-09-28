import mongoose from "mongoose";

const commissionActivityLogSchema = new mongoose.Schema(
  {
    commissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Commission",
      default: null,
      index: true,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CommissionPayment",
      default: null,
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

commissionActivityLogSchema.index({ commissionId: 1, createdAt: -1 });
commissionActivityLogSchema.index({ paymentId: 1, createdAt: -1 });

const CommissionActivityLog = mongoose.model(
  "CommissionActivityLog",
  commissionActivityLogSchema
);

export default CommissionActivityLog;
