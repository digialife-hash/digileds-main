import mongoose from "mongoose";

const certificateRenewalSchema = new mongoose.Schema(
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
    previousExpiryDate: {
      type: Date,
      required: true,
    },
    newExpiryDate: {
      type: Date,
      required: [true, "New expiry date is required"],
    },
    updatedType: {
      type: String,
      trim: true,
      default: "",
    },
    renewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
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

certificateRenewalSchema.index({ certificateId: 1, createdAt: -1 });

const CertificateRenewal = mongoose.model(
  "CertificateRenewal",
  certificateRenewalSchema
);

export default CertificateRenewal;
