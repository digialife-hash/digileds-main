import mongoose from "mongoose";

const notificationPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      unique: true,
      index: true,
    },
    channels: {
      dashboard: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      whatsApp: { type: Boolean, default: true },
    },
    categories: {
      referralUpdates: { type: Boolean, default: true },
      commissionUpdates: { type: Boolean, default: true },
      paymentUpdates: { type: Boolean, default: true },
      certificateUpdates: { type: Boolean, default: true },
      idCardUpdates: { type: Boolean, default: true },
      accountUpdates: { type: Boolean, default: true },
      documentExpiry: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

const NotificationPreference = mongoose.model(
  "NotificationPreference",
  notificationPreferenceSchema
);

export default NotificationPreference;
