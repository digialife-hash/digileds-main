import mongoose from "mongoose";

const referralPartnerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      unique: true,
      index: true,
    },
    referralCode: {
      type: String,
      required: [true, "Referral code is required"],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended", "pending"],
      default: "active",
      index: true,
    },
    partnerLevel: {
      type: String,
      enum: ["Authorized", "Verified", "Gold", "Platinum"],
      default: "Authorized",
    },
    territory: {
      type: String,
      trim: true,
      default: "",
    },
    profilePicture: {
      type: String,
      default: "",
    },
    kycStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "verified",
      index: true,
    },
    profileCompletion: {
      type: Number,
      default: 80,
    },
    dob: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", ""],
      default: "",
    },
    occupation: {
      type: String,
      trim: true,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      country: { type: String, default: "India" },
      postalCode: { type: String, default: "" },
    },
    alternateMobile: {
      type: String,
      trim: true,
      default: "",
    },
    emergencyContact: {
      type: String,
      trim: true,
      default: "",
    },
    bankDetails: {
      accountHolderName: { type: String, default: "" },
      bankName: { type: String, default: "" },
      accountNumber: { type: String, default: "" },
      ifscCode: { type: String, default: "" },
      branchName: { type: String, default: "" },
      upiId: { type: String, default: "" },
    },
    kycDocuments: [
      {
        documentType: { type: String, required: true },
        fileUrl: { type: String, required: true },
        status: { type: String, enum: ["pending", "verified", "rejected"], default: "pending" },
        remarks: { type: String, default: "" },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    lastLoginAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

referralPartnerSchema.index({ createdAt: -1 });

const ReferralPartner = mongoose.model("ReferralPartner", referralPartnerSchema);
export default ReferralPartner;
