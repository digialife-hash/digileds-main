import mongoose from "mongoose";

const subscriptionOrderSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", index: true },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      required: true,
    },
    planName: { type: String, required: true, trim: true },
    billing: { type: String, enum: ["monthly", "permanent"], required: true },
    amount: { type: Number, required: true, min: 0 },
    customerName: { type: String, required: true, trim: true },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    customerPhone: { type: String, default: "", trim: true },
    message: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedAt: { type: Date, default: null },
  },
  { collection: "subscription_orders", timestamps: true },
);

export default mongoose.models.SubscriptionOrder ||
  mongoose.model("SubscriptionOrder", subscriptionOrderSchema);
