const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "SocialUser", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    caption: { type: String, trim: true, maxlength: 2200 },
    platformCaptions: { type: mongoose.Schema.Types.Mixed, default: {} },
    hashtags: { type: String, trim: true },
    platform: { type: String, required: true, trim: true },
    status: { type: String, enum: ["Draft", "Scheduled", "Published", "Failed"], default: "Draft" },
    visibility: {
      type: String,
      enum: ["Public", "Private", "Followers"],
      default: "Public",
    },
    date: { type: String, default: "Not scheduled" },
    scheduledFor: { type: Date, index: true },
    scheduleLockAt: { type: Date, select: false },
    publishAttempts: { type: Number, default: 0 },
    firstComment: { type: String, trim: true },
    altText: { type: String, trim: true },
    hasMedia: { type: Boolean, default: false },
    media: {
      originalName: String,
      mimeType: String,
      data: { type: Buffer, select: false },
    },
    thumbnail: {
      originalName: String,
      mimeType: String,
      data: { type: Buffer, select: false },
    },
    providerResults: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    publishError: String,
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.SocialPost ||
  mongoose.model("SocialPost", postSchema, "social_posts");
