import mongoose from "mongoose";

const adminSessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", index: true, default: null },
    createdAt: { type: Date, default: Date.now },
    lastSeenAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    revokedAt: { type: Date, default: null },
  },
  { collection: "admin_sessions", versionKey: false },
);

export default mongoose.models.AdminSession ||
  mongoose.model("AdminSession", adminSessionSchema);
