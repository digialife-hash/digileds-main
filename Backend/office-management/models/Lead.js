import mongoose from "mongoose";

export const leadStatuses = [
  "New",
  "Contacted",
  "Follow-up",
  "Interested",
  "Qualified",
  "Converted",
  "Lost",
];

export const leadSources = [
  "Website",
  "Referral",
  "Cold Call",
  "Social Media",
  "Direct",
  "Email Campaign",
  "Other",
];

const leadSchema = new mongoose.Schema(
  {
    leadName: {
      type: String,
      required: [true, "Lead name is required"],
      trim: true,
      minlength: [2, "Lead name must be at least 2 characters"],
      maxlength: [100, "Lead name cannot exceed 100 characters"],
    },
    companyName: {
      type: String,
      trim: true,
      maxlength: [150, "Company name cannot exceed 150 characters"],
      default: "",
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
    },
    serviceInterested: {
      type: String,
      trim: true,
      default: "",
    },
    leadSource: {
      type: String,
      enum: {
        values: leadSources,
        message: "Invalid lead source: {VALUE}",
      },
      default: "Direct",
    },
    assignedEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    leadStatus: {
      type: String,
      enum: {
        values: leadStatuses,
        message: "Invalid lead status: {VALUE}",
      },
      default: "New",
    },
    expectedValue: {
      type: Number,
      min: [0, "Expected value cannot be negative"],
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    nextFollowUp: {
      type: Date,
      default: null,
    },
    convertedClientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by is required"],
    },
  },
  {
    timestamps: true,
  }
);

leadSchema.index({ leadName: 1 });
leadSchema.index({ phone: 1 });
leadSchema.index({ email: 1 });
leadSchema.index({ leadStatus: 1 });
leadSchema.index({ assignedEmployee: 1 });
leadSchema.index({ createdAt: -1 });

const Lead = mongoose.model("Lead", leadSchema);
export default Lead;
