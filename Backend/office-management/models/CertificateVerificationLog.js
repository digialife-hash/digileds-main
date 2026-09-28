import mongoose from "mongoose";

const certificateVerificationLogSchema = new mongoose.Schema(
  {
    certificateNumber: {
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

certificateVerificationLogSchema.index({
  certificateNumber: 1,
  scannedAt: -1,
});

const CertificateVerificationLog = mongoose.model(
  "CertificateVerificationLog",
  certificateVerificationLogSchema
);

export default CertificateVerificationLog;
