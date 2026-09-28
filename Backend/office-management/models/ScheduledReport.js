import mongoose from "mongoose";

const scheduledReportSchema = new mongoose.Schema(
  {
    reportName: {
      type: String,
      required: [true, "Report name is required"],
      trim: true,
    },
    reportType: {
      type: String,
      enum: [
        "Referral",
        "Partner Performance",
        "Monthly",
        "Client Conversion",
        "Commission",
        "Payment",
        "Territory",
      ],
      required: [true, "Report type is required"],
    },
    frequency: {
      type: String,
      enum: ["Daily", "Weekly", "Monthly", "Quarterly"],
      required: [true, "Frequency is required"],
    },
    recipients: [
      {
        type: String,
        trim: true,
      },
    ],
    deliveryChannel: {
      type: String,
      enum: ["Dashboard", "Email", "Both"],
      default: "Both",
    },
    filters: {
      type: Object,
      default: {},
    },
    lastRunDate: {
      type: Date,
      default: null,
    },
    nextRunDate: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

scheduledReportSchema.index({ isActive: 1, nextRunDate: 1 });

const ScheduledReport = mongoose.model(
  "ScheduledReport",
  scheduledReportSchema
);

export default ScheduledReport;
