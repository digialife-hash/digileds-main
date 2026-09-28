import mongoose from "mongoose";

export const followUpTypes = [
  "Call",
  "Email",
  "WhatsApp",
  "Meeting",
  "Visit",
  "Other",
];

export const followUpStatuses = [
  "Pending",
  "Completed",
  "Rescheduled",
  "Cancelled",
];

const followUpSchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      default: null,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      default: null,
    },
    followUpDate: {
      type: Date,
      required: [true, "Follow-up date is required"],
    },
    followUpTime: {
      type: String,
      trim: true,
      default: "10:00 AM",
    },
    type: {
      type: String,
      enum: {
        values: followUpTypes,
        message: "Invalid follow-up type: {VALUE}",
      },
      default: "Call",
    },
    assignedEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    outcome: {
      type: String,
      trim: true,
      default: "",
    },
    nextFollowUpDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: followUpStatuses,
        message: "Invalid follow-up status: {VALUE}",
      },
      default: "Pending",
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

followUpSchema.index({ leadId: 1 });
followUpSchema.index({ clientId: 1 });
followUpSchema.index({ followUpDate: 1 });
followUpSchema.index({ status: 1 });
followUpSchema.index({ assignedEmployee: 1 });

const FollowUp = mongoose.model("FollowUp", followUpSchema);
export default FollowUp;
