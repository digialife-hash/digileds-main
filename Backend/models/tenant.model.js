import mongoose from "mongoose";

const brandingSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    logo: { type: String, default: "" },
    favicon: { type: String, default: "" },
    primaryColor: { type: String, default: "#2563eb" },
    secondaryColor: { type: String, default: "#0f172a" },
    theme: { type: String, default: "light" },
    contact: { type: mongoose.Schema.Types.Mixed, default: {} },
    socialLinks: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: false },
);

const tenantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 150 },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
    domains: {
      type: [{ type: String, trim: true, lowercase: true }],
      default: [],
    },
    branding: { type: brandingSchema, default: () => ({}) },
    settings: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { timestamps: true, collection: "tenants", versionKey: false },
);

tenantSchema.index({ domains: 1 }, { unique: true, sparse: true });

export default mongoose.models.Tenant ||
  mongoose.model("Tenant", tenantSchema);
