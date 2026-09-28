import mongoose from "mongoose";


const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: null,
      index: true,
      trim: true,
    },

    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    razorpayPaymentId: {
      type: String,
      default: null,
      index: true,
      trim: true,
    },

    razorpaySignature: {
      type: String,
      default: null,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
      trim: true,
      uppercase: true,
    },

    status: {
      type: String,
      enum: [
        "created",
        "paid",
        "failed",
        "cancelled",
      ],
      default: "created",
      index: true,
    },

    adId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ad",
      default: null,
      index: true,
    },

    productId: {
      type: String,
      default: null,
      index: true,
      trim: true,
    },

    productType: {
      type: String,
      enum: [
        "product",
        "service",
      ],
      default: "product",
      index: true,
    },

    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    error: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);


paymentSchema.index({
  userId: 1,
  status: 1,
  createdAt: -1,
});


paymentSchema.index({
  adId: 1,
  productId: 1,
});


paymentSchema.index({
  status: 1,
  createdAt: -1,
});


const Payment = mongoose.model(
  "Payment",
  paymentSchema
);


export default Payment;