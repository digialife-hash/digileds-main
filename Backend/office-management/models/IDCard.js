import mongoose from "mongoose";
import crypto from "crypto";

const idCardSchema = new mongoose.Schema(
  {
    // Global entity support: 'employee' or 'referral_partner'
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

    // Card identifiers
    cardNumber: {
      type: String,
      required: [true, "Card number is required"],
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

    // Holder Details
    partnerPhoto: {
      type: String,
      default: "",
    },
    partnerName: {
      type: String,
      required: [true, "Holder name is required"],
      trim: true,
    },
    partnerCode: {
      type: String,
      required: [true, "Code or ID is required"],
      trim: true,
    },
    designation: {
      type: String,
      default: "Authorized Referral Partner",
      trim: true,
    },
    department: {
      type: String,
      default: "",
      trim: true,
    },

    // Dates
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: [true, "Expiry date is required"],
    },

    // Status
    status: {
      type: String,
      enum: ["Active", "Expired", "Renewed", "Revoked", "Suspended"],
      default: "Active",
      index: true,
    },

    // Secure Verification
    verificationToken: {
      type: String,
      default: () => crypto.randomBytes(16).toString("hex"),
      index: true,
    },
    qrCodeData: {
      type: String,
      default: "",
    },
    qrCodeImage: {
      type: String,
      default: "",
    },

    // Company Settings Snapshot
    companyName: {
      type: String,
      default: "Digital Alife Pvt Ltd",
    },
    companyAddress: {
      type: String,
      default: "Tech Park, Building 4B, Silicon Valley, India",
    },
    companyPhone: {
      type: String,
      default: "+91 9876543210",
    },
    companyEmail: {
      type: String,
      default: "info@digitalalife.com",
    },
    companyWebsite: {
      type: String,
      default: "www.digitalalife.com",
    },
    authorizedSignature: {
      type: String,
      default: "",
    },

    // Customization & Specs
    cardOrientation: {
      type: String,
      enum: ["Landscape", "Portrait"],
      default: "Portrait",
    },
    cardSize: {
      type: String,
      enum: ["PVC Card", "Aadhar Size", "Standard"],
      default: "PVC Card",
    },
    bloodGroup: {
      type: String,
      default: "",
    },
    emergencyContact: {
      type: String,
      default: "",
    },
    url: {
      type: String,
      default: "",
    },

    // Audit metadata
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    revokedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    revocationReason: {
      type: String,
      default: "",
    },
    renewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    renewedAt: {
      type: Date,
      default: null,
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

idCardSchema.index({ entityType: 1, entityId: 1, status: 1 });
idCardSchema.index({ partnerId: 1, status: 1, isDeleted: 1 });
idCardSchema.index({ employeeId: 1, status: 1, isDeleted: 1 });
idCardSchema.index({ partnerCode: 1 });
idCardSchema.index({ createdAt: -1 });

const IDCard = mongoose.model("IDCard", idCardSchema);
export default IDCard;
