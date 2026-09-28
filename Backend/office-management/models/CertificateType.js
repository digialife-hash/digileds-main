import mongoose from "mongoose";

const certificateTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Certificate type name is required"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    badgeColor: {
      type: String,
      default: "blue",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const CertificateType = mongoose.model(
  "CertificateType",
  certificateTypeSchema
);

export default CertificateType;
