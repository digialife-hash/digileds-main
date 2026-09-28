import mongoose from "mongoose";

const referralAssignmentSchema = new mongoose.Schema(
  {
    referralId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Referral",
      required: [true, "Referral ID is required"],
      index: true,
    },
    assignedEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Assigned employee ID is required"],
      index: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Assigned by user ID is required"],
    },
    previousEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
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

referralAssignmentSchema.index({ referralId: 1, createdAt: -1 });

const ReferralAssignment = mongoose.model(
  "ReferralAssignment",
  referralAssignmentSchema
);

export default ReferralAssignment;
