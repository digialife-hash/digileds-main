import mongoose from "mongoose";

const siteSettingSchema = new mongoose.Schema(
  {
    key_name: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      index: true,
      default: null,
    },
    value: { type: String, required: true },
    updated_at: { type: Date, default: Date.now },
  },
  { collection: "site_settings", versionKey: false },
);

siteSettingSchema.index({ tenantId: 1, key_name: 1 }, { unique: true });

export default mongoose.models.SiteSetting ||
  mongoose.model("SiteSetting", siteSettingSchema);
