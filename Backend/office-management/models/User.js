import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";
import { USER_ROLES } from "../utils/roles.js";

export const userStatuses = ["active", "inactive", "suspended"];

const modulePermissionSchema = new mongoose.Schema(
  {
    view: Boolean,
    create: Boolean,
    edit: Boolean,
    delete: Boolean,
    approve: Boolean,
    convertToProject: Boolean,
    assign: Boolean,
  },
  {
    _id: false,
    strict: false,
  }
);

const userPermissionsSchema = new mongoose.Schema(
  {
    clients: modulePermissionSchema,
    serviceRequests: modulePermissionSchema,
    projects: modulePermissionSchema,
    employees: modulePermissionSchema,
    teams: modulePermissionSchema,
    tasks: modulePermissionSchema,
    payroll: modulePermissionSchema,
    reports: modulePermissionSchema,
    dailyWorkReports: modulePermissionSchema,
    settings: modulePermissionSchema,
    leaves: modulePermissionSchema,
    attendance: modulePermissionSchema,
  },
  {
    _id: false,
    strict: false,
  }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [80, "Name cannot exceed 80 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: validator.isEmail,
        message: "Please provide a valid email",
      },
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },

    phone: {
      type: String,
      trim: true,
      validate: {
        validator(value) {
          if (!value) return true;
          return /^[6-9]\d{9}$/.test(value);
        },
        message: "Please provide a valid 10-digit Indian phone number",
      },
    },

    role: {
      type: String,
      enum: USER_ROLES,
      default: "client",
    },

    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      default: null,
      index: true,
    },

    permissions: {
      type: userPermissionsSchema,
      default: {},
    },

    status: {
      type: String,
      enum: {
        values: userStatuses,
        message: "User status must be active, inactive, or suspended",
      },
      default: "active",
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    passwordChangedAt: {
      type: Date,
      default: null,
    },

    sessionVersion: {
      type: Number,
      default: 0,
    },

    failedLoginAttempts: {
      type: Number,
      select: false,
      default: 0,
    },

    failedLoginLockedUntil: {
      type: Date,
      select: false,
      default: null,
    },

    lastFailedLoginAt: {
      type: Date,
      select: false,
      default: null,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerifiedAt: {
      type: Date,
      default: null,
    },

    emailVerificationTokenHash: {
      type: String,
      select: false,
      default: null,
    },

    emailVerificationOtpHash: {
      type: String,
      select: false,
      default: null,
    },

    emailVerificationExpires: {
      type: Date,
      default: null,
    },

    emailVerificationOtpAttempts: {
      type: Number,
      select: false,
      default: 0,
    },

    passwordResetTokenHash: {
      type: String,
      select: false,
      default: null,
    },

    passwordResetOtpHash: {
      type: String,
      select: false,
      default: null,
    },

    passwordResetExpires: {
      type: Date,
      default: null,
    },

    passwordResetOtpAttempts: {
      type: Number,
      select: false,
      default: 0,
    },

    mfaSecret: {
      type: String,
      select: false,
      default: null,
    },

    pendingMfaSecret: {
      type: String,
      select: false,
      default: null,
    },

    mfaEnabled: {
      type: Boolean,
      default: false,
    },

    passkeys: {
      type: [
        {
          credentialId: String,
          publicKey: String,
          counter: Number,
          deviceType: String,
          backedUp: Boolean,
          name: String,
          createdAt: { type: Date, default: Date.now },
          lastUsedAt: Date,
        },
      ],
      default: [],
    },

    tokenVersion: {
      type: Number,
      default: 0,
    },

    refreshTokenHash: {
      type: String,
      select: false,
      default: null,
    },

    passwordResetEmailDate: {
      type: String,
      default: "",
    },

    passwordResetEmailCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
 
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.index({ role: 1 });
userSchema.index(
  { role: 1 },
  {
    unique: true,
    partialFilterExpression: { role: "super_admin" },
    name: "unique_super_admin_role",
  }
);
userSchema.index({ status: 1 });
userSchema.index({ createdAt: -1 });

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const user = this.toObject();

  delete user.password;
  delete user.refreshTokenHash;
  delete user.emailVerificationTokenHash;
  delete user.emailVerificationOtpHash;
  delete user.emailVerificationOtpAttempts;
  delete user.passwordResetTokenHash;
  delete user.passwordResetOtpHash;
  delete user.passwordResetOtpAttempts;
  delete user.mfaSecret;
  delete user.pendingMfaSecret;
  delete user.__v;

  return user;
};

// Keep the office-management schema isolated from the public site and
// social-post User models while reading the same users collection.
const User =
  mongoose.models.OfficeUser ||
  mongoose.model("OfficeUser", userSchema, "users");

export default User;
