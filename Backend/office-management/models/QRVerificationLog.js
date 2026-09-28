import mongoose from "mongoose";

const qrVerificationLogSchema = new mongoose.Schema(
  {
    cardNumber: {
      type: String,
      required: true,
      index: true,
    },
    statusAtScan: {
      type: String,
      default: "Active",
    },
    ipAddress: {
      type: String,
      default: "127.0.0.1",
    },
    userAgent: {
      type: String,
      default: "",
    },
    scannedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

qrVerificationLogSchema.index({ cardNumber: 1, scannedAt: -1 });

const QRVerificationLog = mongoose.model(
  "QRVerificationLog",
  qrVerificationLogSchema
);

export default QRVerificationLog;
