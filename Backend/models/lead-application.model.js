import mongoose from "mongoose";

const leadApplicationSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phoneCode: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    companyName: { type: String, required: true, trim: true },
    companyEmail: { type: String, required: true, trim: true, lowercase: true },
    companyPhone: { type: String, required: true, trim: true },
    website: { type: String, default: "", trim: true },
    companyAddress: { type: String, required: true, trim: true },
    productName: { type: String, required: true, trim: true },
    productCategory: { type: String, required: true, trim: true },
    estimatedBudget: { type: String, default: "", trim: true },
    expectedTimeline: { type: String, default: "", trim: true },
    requirements: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "converted", "closed"],
      default: "new",
      index: true,
    },
    adminNote: { type: String, default: "", trim: true },
  },
  { collection: "lead_applications", timestamps: true },
);

export default mongoose.models.LeadApplication ||
  mongoose.model("LeadApplication", leadApplicationSchema);
