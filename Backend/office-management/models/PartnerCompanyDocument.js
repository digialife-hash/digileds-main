import mongoose from "mongoose";

const partnerCompanyDocumentSchema = new mongoose.Schema(
  {
    partner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReferralPartner",
      required: [true, "Partner ID is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Document title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    category: {
      type: String,
      default: "General",
      trim: true,
    },
    version: {
      type: String,
      default: "1.0",
      trim: true,
    },
    original_name: {
      type: String,
      required: [true, "Original file name is required"],
      trim: true,
    },
    stored_name: {
      type: String,
      required: [true, "Stored file name is required"],
      trim: true,
    },
    file_path: {
      type: String,
      required: [true, "File path is required"],
      trim: true,
    },
    mime_type: {
      type: String,
      required: [true, "MIME type is required"],
      trim: true,
    },
    extension: {
      type: String,
      required: [true, "File extension is required"],
      trim: true,
      lowercase: true,
    },
    file_size: {
      type: Number,
      required: [true, "File size is required"],
      min: [0, "File size must be positive"],
    },
    uploaded_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Uploaded by user ID is required"],
      index: true,
    },
    uploaded_at: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

partnerCompanyDocumentSchema.index({ partner_id: 1, status: 1, createdAt: -1 });

partnerCompanyDocumentSchema.methods.toJSON = function () {
  const doc = this.toObject();
  delete doc.__v;
  return {
    ...doc,
    id: doc._id,
    partnerId: doc.partner_id,
    originalName: doc.original_name,
    storedName: doc.stored_name,
    filePath: doc.file_path,
    mimeType: doc.mime_type,
    fileSize: doc.file_size,
    uploadedBy: doc.uploaded_by,
    uploadedAt: doc.uploaded_at || doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

const PartnerCompanyDocument = mongoose.model(
  "PartnerCompanyDocument",
  partnerCompanyDocumentSchema
);

export default PartnerCompanyDocument;
