import mongoose from "mongoose";

const visitorActivitySchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", index: true },
    visitorId: { type: String, required: true, index: true },
    sessionId: { type: String, default: "" },
    event: {
      type: String,
      enum: ["page_view", "heartbeat", "offline"],
      default: "page_view",
    },
    isRefresh: { type: Boolean, default: false },
    path: { type: String, default: "/" },
    title: { type: String, default: "" },
    referrer: { type: String, default: "" },
    ip: { type: String, default: "" },
    ipSource: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    language: { type: String, default: "" },
    screen: { type: String, default: "" },
    browser: { type: String, default: "Unknown" },
    operatingSystem: { type: String, default: "Unknown" },
    device: { type: String, default: "Unknown" },
    timezone: { type: String, default: "" },
    platform: { type: String, default: "" },
    vendor: { type: String, default: "" },
    cpuCores: { type: Number, default: null },
    memoryGb: { type: Number, default: null },
    touchPoints: { type: Number, default: 0 },
    online: { type: Boolean, default: true },
    pagesVisited: { type: [String], default: [] },
    pageViewCounts: { type: Map, of: Number, default: {} },
    pageTimeSeconds: { type: Map, of: Number, default: {} },
    currentPageStartedAt: { type: Date, default: null },
    pageViews: { type: Number, default: 0 },
    pageViewsToday: { type: Number, default: 0 },
    pageViewsDay: { type: String, default: "" },
    firstSeen: { type: Date, default: Date.now },
    lastSeen: { type: Date, default: Date.now, index: true },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { collection: "visitor_activities", versionKey: false },
);

visitorActivitySchema.index({ createdAt: -1 });
visitorActivitySchema.index({ visitorId: 1, lastSeen: -1 });
visitorActivitySchema.index({ tenantId: 1, visitorId: 1 }, { unique: true });

export default mongoose.models.VisitorActivity ||
  mongoose.model("VisitorActivity", visitorActivitySchema);
