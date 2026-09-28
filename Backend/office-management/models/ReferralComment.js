import mongoose from "mongoose";

const referralCommentSchema = new mongoose.Schema(
  {
    referralId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Referral",
      required: [true, "Referral ID is required"],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    comment: {
      type: String,
      required: [true, "Comment text is required"],
      trim: true,
      maxlength: [2000, "Comment cannot exceed 2000 characters"],
    },
    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReferralComment",
      default: null,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
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

referralCommentSchema.index({ referralId: 1, createdAt: 1 });

const ReferralComment = mongoose.model(
  "ReferralComment",
  referralCommentSchema
);

export default ReferralComment;
