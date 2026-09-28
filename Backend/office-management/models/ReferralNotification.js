import mongoose from "mongoose";

const referralNotificationSchema = new mongoose.Schema(
  {
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReferralPartner",
      required: [true, "Partner ID is required"],
    },
    title: {
      type: String,
      required: [true, "Notification title is required"],
    },
    message: {
      type: String,
      required: [true, "Notification message is required"],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

referralNotificationSchema.index({ partnerId: 1 });
referralNotificationSchema.index({ isRead: 1 });
referralNotificationSchema.index({ createdAt: -1 });

const ReferralNotification = mongoose.model("ReferralNotification", referralNotificationSchema);
export default ReferralNotification;
