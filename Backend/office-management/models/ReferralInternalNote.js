import mongoose from "mongoose";

const referralInternalNoteSchema = new mongoose.Schema(
  {
    referralId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Referral",
      required: [true, "Referral ID is required"],
      index: true,
    },
    adminUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Admin User is required"],
    },
    category: {
      type: String,
      enum: [
        "Customer Behaviour",
        "Follow-up Instructions",
        "Risk Assessment",
        "Future Opportunities",
        "General",
      ],
      default: "General",
    },
    note: {
      type: String,
      required: [true, "Note content is required"],
      trim: true,
      maxlength: [3000, "Note cannot exceed 3000 characters"],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

referralInternalNoteSchema.index({ referralId: 1, createdAt: -1 });

const ReferralInternalNote = mongoose.model(
  "ReferralInternalNote",
  referralInternalNoteSchema
);

export default ReferralInternalNote;
