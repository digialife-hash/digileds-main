import mongoose from "mongoose";

const certificateHistorySchema = new mongoose.Schema(
  {
    certificateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Certificate",
      required: [true, "Certificate ID is required"],
      index: true,
    },
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReferralPartner",
      required: false,
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
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
  },
  {
    timestamps: true,
  }
);

certificateHistorySchema.index({ certificateId: 1, createdAt: -1 });

const CertificateHistory = mongoose.model(
  "CertificateHistory",
  certificateHistorySchema
);

export default CertificateHistory;
