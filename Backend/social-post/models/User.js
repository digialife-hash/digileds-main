const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", index: true },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      minlength: 8,
      select: false,
    },
    passwordHash: {
      type: String,
      select: false,
    },
    sessionVersion: {
      type: Number,
      default: 0,
    },
    username: String,
    usernameLower: String,
    emailLower: String,
    mobile: String,
    isActive: Number,
    role: {
      type: String,
      enum: ["admin", "super_admin"],
      default: "admin",
      immutable: true,
    },
    resetPasswordTokenHash: {
      type: String,
      select: false,
    },
    resetPasswordExpiresAt: {
      type: Date,
      select: false,
    },
    socialAccounts: [
      {
        platform: {
          type: String,
          enum: ["Instagram", "Facebook", "LinkedIn", "X", "YouTube", "Google Business"],
        },
        providerAccountId: String,
        handle: String,
        providerData: { type: mongoose.Schema.Types.Mixed, default: {} },
        accessToken: { type: String, select: false },
        refreshToken: { type: String, select: false },
        tokenExpiresAt: Date,
        connectedAt: { type: Date, default: Date.now },
      },
    ],
    autoReply: {
      enabled: { type: Boolean, default: true },
      text: {
        type: String,
        default: "Thanks for your message. We have received it and will get back to you shortly.",
        maxlength: 10000,
      },
      platforms: {
        type: [String],
        default: ["Instagram", "Facebook", "YouTube", "Google Business"],
      },
      frequency: {
        type: String,
        enum: ["once_per_conversation", "every_new"],
        default: "once_per_conversation",
      },
    },
    autoReplyHistory: [
      {
        platform: String,
        itemId: String,
        repliedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(password) {
  if (this.password) return bcrypt.compare(password, this.password);
  return this.passwordHash
    ? bcrypt.compare(password, this.passwordHash)
    : Promise.resolve(false);
};

userSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    name: this.name || this.username || "User",
    email: this.email,
  };
};

module.exports =
  mongoose.models.SocialUser ||
  mongoose.model("SocialUser", userSchema, "users");
