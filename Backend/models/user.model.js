import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, trim: true },
    usernameLower: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    emailLower: { type: String, required: true, unique: true, index: true },
    mobile: { type: String, default: "" },
    passwordHash: { type: String, required: true },
    sessionVersion: { type: Number, default: 0 },
    failedLoginAttempts: { type: Number, default: 0, select: false },
    failedLoginLockedUntil: { type: Date, default: null, select: false },
    lastFailedLoginAt: { type: Date, default: null, select: false },
    mfaEnabled: { type: Boolean, default: false },
    mfaSecret: { type: String, select: false, default: null },
    pendingMfaSecret: { type: String, select: false, default: null },
    passkeys: {
      type: [
        {
          credentialId: { type: String, required: true },
          publicKey: { type: String, required: true },
          counter: { type: Number, default: 0 },
          deviceType: { type: String, default: "unknown" },
          backedUp: { type: Boolean, default: false },
          name: { type: String, default: "Passkey" },
          createdAt: { type: Date, default: Date.now },
          lastUsedAt: { type: Date, default: null },
        },
      ],
      default: [],
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      default: null,
      index: true,
    },
    isActive: { type: Number, default: 1 },
    createdAt: { type: Number, required: true },
    updatedAt: { type: Number, required: true },
    passwordResetEmailDate: { type: String, default: "" },
    passwordResetEmailCount: { type: Number, default: 0 },
  },
  { collection: "users", versionKey: false },
);

export default mongoose.models.User || mongoose.model("User", userSchema);
