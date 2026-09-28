import mongoose from "mongoose";

const referralActivitySchema = new mongoose.Schema(
  {
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReferralPartner",
      required: [true, "Partner ID is required"],
    },
    title: {
      type: String,
      required: [true, "Activity title is required"],
    },
    description: {
      type: String,
      required: [true, "Activity description is required"],
    },
    type: {
      type: String,
      enum: ["referral", "commission", "certificate", "id_card", "profile", "announcement"],
      default: "referral",
    },
  },
  {
    timestamps: true,
  }
);

referralActivitySchema.index({ partnerId: 1 });
referralActivitySchema.index({ type: 1 });
referralActivitySchema.index({ createdAt: -1 });

const ReferralActivity = mongoose.model("ReferralActivity", referralActivitySchema);
export default ReferralActivity;
