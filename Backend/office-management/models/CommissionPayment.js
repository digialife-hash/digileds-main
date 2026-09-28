import mongoose from "mongoose";

const commissionPaymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    receiptNumber: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    commissionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Commission",
      },
    ],
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReferralPartner",
      required: [true, "Partner ID is required"],
      index: true,
    },
    amountPaid: {
      type: Number,
      required: [true, "Amount paid is required"],
      min: [0, "Amount paid cannot be negative"],
    },
    paymentMode: {
      type: String,
      enum: ["Bank Transfer", "UPI", "Cash", "Cheque"],
      required: [true, "Payment mode is required"],
      default: "Bank Transfer",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Processing", "Paid", "Failed", "Cancelled"],
      default: "Paid",
      index: true,
    },
    transactionNumber: {
      type: String,
      trim: true,
      default: "",
    },
    referenceNumber: {
      type: String,
      trim: true,
      default: "",
    },
    bankName: {
      type: String,
      trim: true,
      default: "",
    },
    upiId: {
      type: String,
      trim: true,
      default: "",
    },
    chequeNumber: {
      type: String,
      trim: true,
      default: "",
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    paymentRemarks: {
      type: String,
      trim: true,
      default: "",
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

commissionPaymentSchema.pre("save", function (next) {
  if (!this.paymentId) {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    this.paymentId = `PAY-${dateStr}-${randomSuffix}`;
  }
  if (!this.receiptNumber) {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    this.receiptNumber = `REC-${dateStr}-${randomSuffix}`;
  }
  next();
});

commissionPaymentSchema.index({ partnerId: 1, paymentStatus: 1, isDeleted: 1 });
commissionPaymentSchema.index({ createdAt: -1 });

const CommissionPayment = mongoose.model(
  "CommissionPayment",
  commissionPaymentSchema
);

export default CommissionPayment;
