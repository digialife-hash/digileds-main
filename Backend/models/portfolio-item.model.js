import mongoose from "mongoose";

const portfolioItemSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    image_path: { type: String, default: null },
    project_link: { type: String, required: true, trim: true },
    is_featured: { type: Number, default: 1 },
    is_active: { type: Number, default: 1 },
    created_at: { type: Number, required: true, index: true },
  },
  { collection: "portfolio_items", versionKey: false },
);

export default mongoose.models.PortfolioItem ||
  mongoose.model("PortfolioItem", portfolioItemSchema);
