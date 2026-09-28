import mongoose from "mongoose";

const socialProfileSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      required: true,
      trim: true,
    },
    profileName: { type: String, trim: true, default: "" },
    profileUrl: { type: String, trim: true, default: "" },
    username: { type: String, trim: true, default: "" },
    accountId: { type: String, trim: true, default: "" },
    accountType: {
      type: String,
      enum: ["Personal", "Business", "Creator", "Company Page", "Brand Account", "Professional Account"],
      default: "Business",
    },
    followerCount: { type: Number, default: 0 },
    verificationStatus: { type: String, default: "Unverified" },
    isPrimary: { type: Boolean, default: false },
    accessMethod: {
      type: String,
      default: "Meta Business Manager",
    },
    accessStatus: {
      type: String,
      enum: [
        "Not Required",
        "Pending From Client",
        "Invitation Sent",
        "Access Received",
        "Verification Pending",
        "Verified",
        "Access Failed",
        "Access Revoked",
      ],
      default: "Pending From Client",
    },
    accessInvitationEmail: { type: String, trim: true, default: "" },
    businessManagerId: { type: String, trim: true, default: "" },
    pageId: { type: String, trim: true, default: "" },
    adAccountId: { type: String, trim: true, default: "" },
    notes: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

const resourceFileSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, default: "" },
    fileSize: { type: Number, default: 0 },
    resourceType: {
      type: String,
      default: "Brand Asset",
    },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    uploadedAt: { type: Date, default: Date.now },
    approvalStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    clientNote: { type: String, default: "" },
    internalNote: { type: String, default: "" },
  },
  { timestamps: true }
);

const competitorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  website: { type: String, trim: true, default: "" },
  facebookUrl: { type: String, trim: true, default: "" },
  instagramUrl: { type: String, trim: true, default: "" },
  linkedInUrl: { type: String, trim: true, default: "" },
  youTubeUrl: { type: String, trim: true, default: "" },
  otherUrl: { type: String, trim: true, default: "" },
  likes: { type: String, default: "" },
  dislikes: { type: String, default: "" },
  notes: { type: String, default: "" },
});

const campaignDateSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  description: { type: String, default: "" },
  objective: { type: String, default: "" },
  platforms: { type: [String], default: [] },
  contentType: { type: String, default: "" },
  priority: { type: String, enum: ["Low", "Medium", "High", "Urgent"], default: "Medium" },
  notes: { type: String, default: "" },
});

const personaSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  ageGroup: { type: String, default: "" },
  location: { type: String, default: "" },
  interests: { type: String, default: "" },
  problems: { type: String, default: "" },
  solution: { type: String, default: "" },
  preferredPlatform: { type: String, default: "" },
  contentPreference: { type: String, default: "" },
});

const internalNoteSchema = new mongoose.Schema({
  note: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

const activityLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  description: { type: String, default: "" },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  role: { type: String, default: "" },
  timestamp: { type: Date, default: Date.now },
});

const clientServiceDetailSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    serviceType: {
      type: String,
      enum: [
        "social_media_management",
        "website_development",
        "seo",
        "paid_advertising",
        "branding",
        "content_writing",
        "video_editing",
        "custom_service",
      ],
      required: true,
      index: true,
    },
    serviceName: {
      type: String,
      default: "Social Media Management",
    },
    status: {
      type: String,
      enum: [
        "not_started",
        "draft",
        "submitted",
        "under_review",
        "changes_requested",
        "approved",
        "in_progress",
        "completed",
      ],
      default: "not_started",
      index: true,
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    formData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    socialProfiles: { type: [socialProfileSchema], default: [] },
    resources: { type: [resourceFileSchema], default: [] },
    competitors: { type: [competitorSchema], default: [] },
    campaignDates: { type: [campaignDateSchema], default: [] },
    personas: { type: [personaSchema], default: [] },

    assignedEmployeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
      index: true,
    },

    submittedAt: { type: Date, default: null },
    reviewedAt: { type: Date, default: null },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    approvedAt: { type: Date, default: null },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    changesRequestedAt: { type: Date, default: null },
    changesRequestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    changeRequestMessage: { type: String, default: "" },

    internalNotes: { type: [internalNoteSchema], default: [] },
    activityLogs: { type: [activityLogSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

clientServiceDetailSchema.index({ clientId: 1, serviceType: 1 }, { unique: true });
clientServiceDetailSchema.index({ assignedEmployeeId: 1, status: 1 });
clientServiceDetailSchema.index({ updatedAt: -1 });

const ClientServiceDetail = mongoose.model("ClientServiceDetail", clientServiceDetailSchema);
export default ClientServiceDetail;
