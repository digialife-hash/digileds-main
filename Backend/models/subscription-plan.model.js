import mongoose from "mongoose";

const subscriptionPlanSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    monthlyPrice: { type: Number, required: true, min: 0 },
    permanentPrice: { type: Number, required: true, min: 0 },
    features: { type: [String], default: [] },
    popular: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { collection: "subscription_plans", timestamps: true },
);

subscriptionPlanSchema.index({ tenantId: 1, name: 1 }, { unique: true });

export default mongoose.models.SubscriptionPlan ||
  mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
