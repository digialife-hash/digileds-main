import mongoose from "mongoose";

const demoSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    demoId: { type: String, required: true, unique: true, trim: true },
    projectId: { type: String, required: true, index: true },
    projectName: { type: String, required: true },
    projectType: { type: String, required: true },
    appContainer: { type: String, required: true },
    mongoContainer: { type: String, default: null },
    networkName: { type: String, default: null },
    hostPort: { type: Number, required: true },
    createdAt: { type: Number, required: true },
    expiresAt: { type: Number, required: true },
    durationMinutes: { type: Number, required: true, default: 60 },
    status: {
      type: String,
      enum: ["active", "destroyed"],
      default: "active",
      index: true,
    },
    accessUsername: { type: String, default: null },
    accessPasswordHash: { type: String, default: null },
    accessPasswordSalt: { type: String, default: null },
    accessPasswordEncrypted: { type: String, default: null, select: false },
    credentialVersion: { type: Number, default: 1 },
  },
  { collection: "demos", versionKey: false },
);

demoSchema.index({ status: 1, expiresAt: 1 });
demoSchema.index({ projectId: 1, status: 1, createdAt: -1 });

export default mongoose.models.Demo || mongoose.model("Demo", demoSchema);
