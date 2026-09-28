import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", index: true, default: null },
    event: { type: String, required: true },
    demoId: { type: String, default: null },
    projectId: { type: String, default: null },
    requestId: { type: String, default: null },
    metadata: { type: String, default: "{}" },
    createdAt: { type: Number, required: true, index: true },
  },
  { collection: "audit_logs", versionKey: false },
);

export default mongoose.models.AuditLog ||
  mongoose.model("AuditLog", auditLogSchema);
