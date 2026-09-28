import mongoose from "mongoose";

const certificateRevocationSchema = new mongoose.Schema(
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
      required: [true, "Partner ID is required"],
    },
    reason: {
      type: String,
      enum: [
        "Partner Left",
        "Policy Violation",
        "Expired",
        "Duplicate",
        "Fraud",
        "Other",
      ],
      required: [true, "Revocation reason is required"],
    },
    revokedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Revoked by user ID is required"],
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

certificateRevocationSchema.index({ certificateId: 1, createdAt: -1 });

const CertificateRevocation = mongoose.model(
  "CertificateRevocation",
  certificateRevocationSchema
);

export default CertificateRevocation;
