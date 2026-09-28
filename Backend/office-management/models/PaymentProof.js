import mongoose from "mongoose";

const paymentProofSchema = new mongoose.Schema(
  {
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CommissionPayment",
      required: [true, "Payment ID is required"],
      index: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Uploaded by user ID is required"],
    },
    proofType: {
      type: String,
      enum: ["Bank Receipt", "UPI Screenshot", "Cheque Copy", "Payment Voucher"],
      default: "Bank Receipt",
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    filePath: {
      type: String,
      required: true,
      trim: true,
    },
    fileType: {
      type: String,
      required: true,
      trim: true,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

paymentProofSchema.index({ paymentId: 1, createdAt: -1 });

const PaymentProof = mongoose.model("PaymentProof", paymentProofSchema);
export default PaymentProof;
