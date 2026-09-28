import mongoose from "mongoose";

const clientDocumentSchema = new mongoose.Schema(
  {
    NewClient_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    documentType: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    fileUrl: {
      type: String,
      required: true,
    },

    publicId: {
      type: String,
      required: true,
    },

    resourceType: {
      type: String,
      required: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    fileType: {
      type: String,
      required: true,
    },

    fileSize: {
      type: Number,
      required: true,
    },

    backFileUrl: {
      type: String,
      default: "",
    },

    backPublicId: {
      type: String,
      default: "",
    },

    backResourceType: {
      type: String,
      default: "",
    },

    backFileName: {
      type: String,
      default: "",
    },

    backFileType: {
      type: String,
      default: "",
    },

    backFileSize: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("ClientDocument", clientDocumentSchema);
