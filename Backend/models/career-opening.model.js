import mongoose from "mongoose";

const careerOpeningSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    location: { type: String, default: "Noida / Hybrid", trim: true },
    employmentType: { type: String, default: "Full-time", trim: true },
    description: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },
  },
  { collection: "career_openings", timestamps: true },
);

export default mongoose.models.CareerOpening ||
  mongoose.model("CareerOpening", careerOpeningSchema);
