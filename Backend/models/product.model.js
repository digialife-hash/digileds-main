import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: String, required: true },
    image_path: { type: String, default: null },
    file_link: { type: String, default: null },
    download_path: { type: String, default: null },
    is_active: { type: Number, default: 1 },
    created_at: { type: Number, required: true, index: true },
  },
  { collection: "products", versionKey: false },
);

export default mongoose.models.Product ||
  mongoose.model("Product", productSchema);
