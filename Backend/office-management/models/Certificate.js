import mongoose from "mongoose";
import crypto from "crypto";

const certificateSchema = new mongoose.Schema(
  {
    entityType: {
      type: String,
      enum: ["employee", "referral_partner", "client"],
      default: "referral_partner",
      index: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      index: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
      index: true,
    },
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReferralPartner",
      default: null,
      index: true,
    },

    certificateNumber: {
      type: String,
      required: [true, "Certificate number is required"],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    displayId: {
      type: String,
      default: "",
      trim: true,
    },
    certificateType: {
      type: String,
      default: "Certificate of Excellence",
      trim: true,
      index: true,
    },
    partnerName: {
      type: String,
      required: [true, "Holder name is required"],
      trim: true,
    },
    partnerCode: {
      type: String,
      default: "",
      trim: true,
    },
    partnerPhoto: {
      type: String,
      default: "",
    },
    designation: {
      type: String,
      default: "",
      trim: true,
    },
    department: {
      type: String,
      default: "",
      trim: true,
    },
    achievement: {
      type: String,
      default: "Excellence in Professional Performance & Business Contribution",
    },
    description: {
      type: String,
      default:
        "This is to certify that the holder has successfully fulfilled all professional standards, achievements, and compliance requirements.",
    },
    companyName: {
      type: String,
      default: "Digital Alife Pvt Ltd",
    },
    authorizedSignatory: {
      type: String,
      default: "Managing Director",
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: [true, "Expiry date is required"],
    },
    status: {
      type: String,
      enum: ["Active", "Expired", "Renewed", "Revoked"],
      default: "Active",
      index: true,
    },
    verificationToken: {
      type: String,
      default: () => crypto.randomBytes(16).toString("hex"),
      index: true,
    },
    qrCodeData: {
      type: String,
      default: "",
    },
    orientation: {
      type: String,
      enum: ["Landscape", "Portrait"],
      default: "Landscape",
    },
    paperSize: {
      type: String,
      enum: ["A4", "Letter"],
      default: "A4",
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    remarks: {
      type: String,
      default: "",
    },
    url: {
      type: String,
      default: "",
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

certificateSchema.index({ entityType: 1, entityId: 1, status: 1 });
certificateSchema.index({ partnerId: 1, status: 1, isDeleted: 1 });
certificateSchema.index({ employeeId: 1, status: 1, isDeleted: 1 });
certificateSchema.index({ createdAt: -1 });

const Certificate = mongoose.model("Certificate", certificateSchema);
export default Certificate;
