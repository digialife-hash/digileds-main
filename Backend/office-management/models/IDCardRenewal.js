import mongoose from "mongoose";

const idCardRenewalSchema = new mongoose.Schema(
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
    previousExpiryDate: {
      type: Date,
      required: true,
    },
    newExpiryDate: {
      type: Date,
      required: [true, "New expiry date is required"],
    },
    updatedDesignation: {
      type: String,
      trim: true,
      default: "",
    },
    updatedPhoto: {
      type: String,
      default: "",
    },
    updatedEmergencyContact: {
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

idCardRenewalSchema.index({ idCardId: 1, createdAt: -1 });

const IDCardRenewal = mongoose.model("IDCardRenewal", idCardRenewalSchema);
export default IDCardRenewal;
