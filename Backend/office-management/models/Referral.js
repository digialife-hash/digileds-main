import mongoose from "mongoose";

const referralSchema = new mongoose.Schema(
  {
    referralId: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReferralPartner",
      required: [true, "Partner ID is required"],
      index: true,
    },
    clientName: {
      type: String,
      required: [true, "Client name is required"],
      trim: true,
    },
    companyName: {
      type: String,
      trim: true,
      default: "",
    },
    mobileNumber: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
    },
    clientPhone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Client email is required"],
      lowercase: true,
      trim: true,
    },
    clientEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    serviceRequired: {
      type: String,
      trim: true,
      default: "General Inquiry",
    },
    estimatedBudget: {
      type: Number,
      default: 0,
      min: [0, "Estimated budget cannot be negative"],
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: [
        "New",
        "Assigned",
        "Contacted",
        "Interested",
        "Follow Up",
        "Negotiation",
        "Converted",
        "Lost",
        "Cancelled",
        // Legacy fallback support
        "pending",
        "active",
        "rejected",
      ],
      default: "New",
      index: true,
    },
    assignedEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    convertedAt: {
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

// Pre-save hook to ensure fields sync and referralId is generated
referralSchema.pre("save", async function (next) {
  if (!this.clientPhone && this.mobileNumber) {
    this.clientPhone = this.mobileNumber;
  }
  if (!this.mobileNumber && this.clientPhone) {
    this.mobileNumber = this.clientPhone;
  }
  if (!this.clientEmail && this.email) {
    this.clientEmail = this.email;
  }
  if (!this.email && this.clientEmail) {
    this.email = this.clientEmail;
  }

  if (!this.referralId) {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    this.referralId = `REF-${dateStr}-${randomSuffix}`;
  }

  next();
});

referralSchema.index({ partnerId: 1, isDeleted: 1 });
referralSchema.index({ assignedEmployee: 1, isDeleted: 1 });
referralSchema.index({ status: 1, isDeleted: 1 });
referralSchema.index({ createdAt: -1 });

const Referral = mongoose.model("Referral", referralSchema);
export default Referral;
