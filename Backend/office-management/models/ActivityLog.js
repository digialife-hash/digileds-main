import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    actorRole: {
      type: String,
      trim: true,
      maxlength: [50, "Actor role cannot exceed 50 characters"],
      default: "",
    },

    action: {
      type: String,
      required: [true, "Action is required"],
      trim: true,
      maxlength: [100, "Action cannot exceed 100 characters"],
    },

    module: {
      type: String,
      required: [true, "Module is required"],
      trim: true,
      maxlength: [100, "Module cannot exceed 100 characters"],
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    targetModel: {
      type: String,
      trim: true,
      maxlength: [100, "Target model cannot exceed 100 characters"],
      default: "",
    },

    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default: "",
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    ipAddress: {
      type: String,
      trim: true,
      maxlength: [100, "IP address cannot exceed 100 characters"],
      default: "",
    },

    userAgent: {
      type: String,
      trim: true,
      maxlength: [500, "User agent cannot exceed 500 characters"],
      default: "",
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  }
);

activityLogSchema.index({ actor: 1 });
activityLogSchema.index({ actorRole: 1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ module: 1 });
activityLogSchema.index({ targetId: 1 });
activityLogSchema.index({ targetModel: 1 });
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ module: 1, action: 1, createdAt: -1 });
activityLogSchema.index({ actor: 1, createdAt: -1 });

activityLogSchema.methods.toJSON = function () {
  const activityLog = this.toObject();
  delete activityLog.__v;
  return activityLog;
};

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

export default ActivityLog;
