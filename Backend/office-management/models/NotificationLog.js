import mongoose from "mongoose";

const notificationLogSchema = new mongoose.Schema(
  {
    notificationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notification",
      required: true,
      index: true,
    },
    recipientUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    channel: {
      type: String,
      enum: ["Dashboard", "Email", "SMS", "WhatsApp"],
      required: true,
    },
    status: {
      type: String,
      enum: [
        "Pending",
        "Queued",
        "Sending",
        "Delivered",
        "Failed",
        "Read",
        "Archived",
      ],
      required: true,
    },
    responseMetaData: {
      type: String,
      default: "",
    },
    errorDetails: {
      type: String,
      default: "",
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

notificationLogSchema.index({ notificationId: 1, createdAt: -1 });

const NotificationLog = mongoose.model(
  "NotificationLog",
  notificationLogSchema
);

export default NotificationLog;
