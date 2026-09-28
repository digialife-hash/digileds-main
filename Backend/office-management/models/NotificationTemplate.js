import mongoose from "mongoose";

const notificationTemplateSchema = new mongoose.Schema(
  {
    templateCode: {
      type: String,
      required: [true, "Template code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: "Account Updates",
    },
    emailSubject: {
      type: String,
      default: "",
    },
    emailTemplate: {
      type: String,
      default: "",
    },
    smsTemplate: {
      type: String,
      default: "",
    },
    whatsAppTemplate: {
      type: String,
      default: "",
    },
    dashboardTemplate: {
      type: String,
      default: "",
    },
    channelsEnabled: {
      dashboard: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      whatsApp: { type: Boolean, default: false },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const NotificationTemplate = mongoose.model(
  "NotificationTemplate",
  notificationTemplateSchema
);

export default NotificationTemplate;
