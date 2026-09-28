import mongoose from "mongoose";

const reportActivityLogSchema = new mongoose.Schema(
  {
    reportType: {
      type: String,
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: [
        "Report Generated",
        "Report Exported",
        "Report Printed",
        "Report Scheduled",
        "Report Downloaded",
      ],
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      default: "",
    },
    ipAddress: {
      type: String,
      default: "127.0.0.1",
    },
    userAgent: {
      type: String,
      default: "",
    },
    details: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

reportActivityLogSchema.index({ performedBy: 1, createdAt: -1 });

const ReportActivityLog = mongoose.model(
  "ReportActivityLog",
  reportActivityLogSchema
);

export default ReportActivityLog;
