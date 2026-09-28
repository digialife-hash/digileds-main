import mongoose from "mongoose";

const adminTrustedDeviceSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Admin/User reference is required"],
    },
    tokenHash: {
      type: String,
      required: [true, "Token hash is required"],
    },
    userAgent: {
      type: String,
      default: "",
    },
    browser: {
      type: String,
      default: "",
    },
    ipAddress: {
      type: String,
      default: "",
    },
    deviceName: {
      type: String,
      default: "",
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiration date is required"],
    },
    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
    revoked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes as requested
adminTrustedDeviceSchema.index({ adminId: 1 });
adminTrustedDeviceSchema.index({ tokenHash: 1 });
adminTrustedDeviceSchema.index({ expiresAt: 1 });

const AdminTrustedDevice = mongoose.model(
  "AdminTrustedDevice",
  adminTrustedDeviceSchema
);

export default AdminTrustedDevice;
