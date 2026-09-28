import mongoose from "mongoose";

const paymentStatusHistorySchema = new mongoose.Schema(
  {
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CommissionPayment",
      required: [true, "Payment ID is required"],
      index: true,
    },
    previousStatus: {
      type: String,
      required: true,
    },
    newStatus: {
      type: String,
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    remarks: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

paymentStatusHistorySchema.index({ paymentId: 1, createdAt: -1 });

const PaymentStatusHistory = mongoose.model(
  "PaymentStatusHistory",
  paymentStatusHistorySchema
);

export default PaymentStatusHistory;
