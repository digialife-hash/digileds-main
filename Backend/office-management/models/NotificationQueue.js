import mongoose from "mongoose";

const notificationQueueSchema = new mongoose.Schema(
  {
    notificationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notification",
      required: true,
      index: true,
    },
    scheduledAt: {
      type: Date,
      default: Date.now,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Queued", "Processing", "Completed", "Failed"],
      default: "Queued",
      index: true,
    },
    lastError: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

notificationQueueSchema.index({ status: 1, scheduledAt: 1 });

const NotificationQueue = mongoose.model(
  "NotificationQueue",
  notificationQueueSchema
);

export default NotificationQueue;
