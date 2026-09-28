import mongoose from "mongoose";

const reportHistorySchema = new mongoose.Schema(
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
        "Overview",
      ],
      required: [true, "Report type is required"],
      index: true,
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    format: {
      type: String,
      enum: ["PDF", "Excel", "CSV"],
      default: "CSV",
    },
    status: {
      type: String,
      enum: ["Completed", "Processing", "Failed"],
      default: "Completed",
    },
    filters: {
      type: Object,
      default: {},
    },
    fileUrl: {
      type: String,
      default: "",
    },
    recordCount: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

reportHistorySchema.index({ generatedBy: 1, createdAt: -1 });

const ReportHistory = mongoose.model("ReportHistory", reportHistorySchema);

export default ReportHistory;
