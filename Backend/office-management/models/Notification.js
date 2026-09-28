import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    notificationId: {
      type: String,
      trim: true,
      index: true,
    },
    recipientUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    recipientClient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      default: null,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Notification title is required"],
      trim: true,
      maxlength: [200, "Notification title cannot exceed 200 characters"],
    },
    message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
      maxlength: [2000, "Notification message cannot exceed 2000 characters"],
    },
    type: {
      type: String,
      trim: true,
      default: "general",
      index: true,
    },
    category: {
      type: String,
      enum: [
        "Referral Updates",
        "Commission Updates",
        "Payment Updates",
        "Certificate Updates",
        "ID Card Updates",
        "Account Updates",
        "Document Expiry",
      ],
      default: "Account Updates",
      index: true,
    },
    deliveryChannel: {
      type: String,
      enum: ["Dashboard", "Email", "SMS", "WhatsApp"],
      default: "Dashboard",
      index: true,
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
      default: "Delivered",
      index: true,
    },
    link: {
      type: String,
      default: "",
    },
    relatedInvoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      default: null,
    },
    readAt: {
      type: Date,
      default: null,
      index: true,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
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

notificationSchema.index({ recipientUser: 1, readAt: 1, isDeleted: 1 });
notificationSchema.index({ recipientUser: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
