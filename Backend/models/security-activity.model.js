import mongoose from "mongoose";

const securityActivitySchema = new mongoose.Schema(
  {
    event: { type: String, required: true, index: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", index: true, default: null },
    success: { type: Boolean, required: true },
    userId: { type: String, default: null, index: true },
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { collection: "security_activity", versionKey: false },
);

export default mongoose.models.SecurityActivity ||
  mongoose.model("SecurityActivity", securityActivitySchema);
