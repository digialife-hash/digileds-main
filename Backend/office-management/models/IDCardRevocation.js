import mongoose from "mongoose";

const idCardRevocationSchema = new mongoose.Schema(
  {
    idCardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IDCard",
      required: [true, "ID Card ID is required"],
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
        "Suspended",
        "Expired",
        "Misuse",
        "Duplicate",
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

idCardRevocationSchema.index({ idCardId: 1, createdAt: -1 });

const IDCardRevocation = mongoose.model(
  "IDCardRevocation",
  idCardRevocationSchema
);

export default IDCardRevocation;
