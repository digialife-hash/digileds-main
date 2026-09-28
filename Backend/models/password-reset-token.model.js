import mongoose from "mongoose";

const passwordResetTokenSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", index: true, default: null },
    userId: { type: String, required: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Number, required: true, index: true },
    usedAt: { type: Number, default: null },
    createdAt: { type: Number, required: true },
  },
  { collection: "password_reset_tokens", versionKey: false },
);

export default mongoose.models.PasswordResetToken ||
  mongoose.model("PasswordResetToken", passwordResetTokenSchema);
