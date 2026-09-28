import mongoose from "mongoose";

export const announcementTypes = [
  "General",
  "Policy",
  "Event",
  "Holiday",
  "Urgent Notice",
];

export const announcementPriorities = ["Normal", "Important", "Urgent"];
export const announcementStatuses = ["Draft", "Published", "Expired", "Archived"];
export const targetAudiences = [
  "All Employees",
  "Management",
  "Developers",
  "Designers",
  "HR",
  "Sales",
];

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Announcement title is required"],
      trim: true,
      minlength: [2, "Title must be at least 2 characters"],
    },
    description: {
      type: String,
      required: [true, "Announcement description is required"],
      trim: true,
    },
    announcementType: {
      type: String,
      enum: {
        values: announcementTypes,
        message: "Invalid announcement type: {VALUE}",
      },
      default: "General",
    },
    priority: {
      type: String,
      enum: {
        values: announcementPriorities,
        message: "Invalid priority: {VALUE}",
      },
      default: "Normal",
    },
    publishDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    targetAudience: {
      type: String,
      enum: {
        values: targetAudiences,
        message: "Invalid target audience: {VALUE}",
      },
      default: "All Employees",
    },
    status: {
      type: String,
      enum: {
        values: announcementStatuses,
        message: "Invalid status: {VALUE}",
      },
      default: "Published",
    },
    attachment: {
      type: String,
      trim: true,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

announcementSchema.index({ status: 1 });
announcementSchema.index({ publishDate: 1 });
announcementSchema.index({ priority: 1 });

const Announcement = mongoose.model("Announcement", announcementSchema);
export default Announcement;
