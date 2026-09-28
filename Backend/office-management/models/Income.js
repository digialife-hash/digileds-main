import mongoose from "mongoose";

export const incomeCategories = [
  "Client Payment",
  "Project Payment",
  "Service Payment",
  "Other Income",
];

export const paymentMethods = [
  "Bank Transfer",
  "UPI",
  "Cash",
  "Cheque",
  "Credit Card",
  "Other",
];

const incomeSchema = new mongoose.Schema(
  {
    incomeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      default: null,
    },
    clientName: {
      type: String,
      trim: true,
      default: "General Client",
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      default: null,
    },
    category: {
      type: String,
      enum: {
        values: incomeCategories,
        message: "Invalid income category: {VALUE}",
      },
      default: "Client Payment",
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    paymentMethod: {
      type: String,
      enum: {
        values: paymentMethods,
        message: "Invalid payment method: {VALUE}",
      },
      default: "Bank Transfer",
    },
    transactionReference: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      default: "",
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

incomeSchema.index({ date: 1 });
incomeSchema.index({ clientId: 1 });
incomeSchema.index({ invoiceId: 1 });
incomeSchema.index({ category: 1 });

const Income = mongoose.model("Income", incomeSchema);
export default Income;
