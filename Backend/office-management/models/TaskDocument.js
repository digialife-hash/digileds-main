import mongoose from "mongoose";

const taskDocumentSchema = new mongoose.Schema(
  {
    task_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: [true, "Task ID is required"],
      index: true,
    },

    uploaded_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Uploaded by user ID is required"],
      index: true,
    },

    user_role: {
      type: String,
      enum: {
        values: ["admin", "employee", "super_admin", "Admin", "Employee"],
        message: "Invalid user role",
      },
      required: [true, "User role is required"],
    },

    document_type: {
      type: String,
      enum: {
        values: [
          "Admin Attachment",
          "Employee Submission",
          "admin_attachment",
          "employee_submission",
        ],
        message: "Invalid document type",
      },
      required: [true, "Document type is required"],
    },

    comment: {
      type: String,
      trim: true,
      maxlength: [3000, "Comment cannot exceed 3000 characters"],
      default: "",
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

    extension: {
      type: String,
      required: [true, "File extension is required"],
      trim: true,
      lowercase: true,
    },

    mime_type: {
      type: String,
      required: [true, "MIME type is required"],
      trim: true,
    },

    file_size: {
      type: Number,
      required: [true, "File size is required"],
      min: [0, "File size must be positive"],
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

taskDocumentSchema.index({ task_id: 1, created_at: -1 });

taskDocumentSchema.methods.toJSON = function () {
  const doc = this.toObject();
  delete doc.__v;
  return {
    ...doc,
    id: doc._id,
    taskId: doc.task_id,
    uploadedBy: doc.uploaded_by,
    userRole: doc.user_role,
    documentType: doc.document_type,
    originalName: doc.original_name,
    storedName: doc.stored_name,
    filePath: doc.file_path,
    mimeType: doc.mime_type,
    fileSize: doc.file_size,
    createdAt: doc.created_at,
    updatedAt: doc.updated_at,
  };
};

const TaskDocument = mongoose.model("TaskDocument", taskDocumentSchema);

export default TaskDocument;
