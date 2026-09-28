import mongoose from "mongoose";

const careerApplicationSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", index: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    opening: { type: String, required: true, trim: true },
    experience: { type: String, required: true, trim: true },
    qualification: { type: String, required: true, trim: true },
    currentCompany: { type: String, default: "", trim: true },
    currentCtc: { type: String, default: "", trim: true },
    expectedCtc: { type: String, required: true, trim: true },
    noticePeriod: { type: String, required: true, trim: true },
    linkedin: { type: String, required: true, trim: true },
    github: { type: String, default: "", trim: true },
    portfolio: { type: String, default: "", trim: true },
    skills: { type: String, required: true, trim: true },
    resumeUrl: { type: String, required: true, trim: true },
    resumeName: { type: String, required: true, trim: true },
    coverLetter: { type: String, default: "", trim: true },
    motivation: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["new", "reviewing", "shortlisted", "rejected", "hired"],
      default: "new",
      index: true,
    },
    adminNote: { type: String, default: "", trim: true },
  },
  { collection: "career_applications", timestamps: true },
);

export default mongoose.models.CareerApplication ||
  mongoose.model("CareerApplication", careerApplicationSchema);
