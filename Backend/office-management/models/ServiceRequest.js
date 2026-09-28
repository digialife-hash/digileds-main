import mongoose from "mongoose";
import validator from "validator";

export const serviceRequestPriorities = ["low", "medium", "high", "urgent"];

export const serviceRequestStatuses = [
  "submitted",
  "reviewed",
  "approved",
  "in_progress",
  "completed",
  "closed",
];

const attachmentSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      trim: true,
      maxlength: [180, "File name cannot exceed 180 characters"],
    },
    fileUrl: {
      type: String,
      trim: true,
      validate: {
        validator(value) {
          if (!value) return true;
          return validator.isURL(value, {
            require_protocol: true,
          });
        },
        message: "Attachment URL must be valid",
      },
    },
    fileType: {
      type: String,
      trim: true,
      maxlength: [80, "File type cannot exceed 80 characters"],
    },
    fileSize: {
      type: Number,
      min: [0, "File size cannot be negative"],
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: serviceRequestStatuses,
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [1000, "Status history remarks cannot exceed 1000 characters"],
      default: "",
    },
  },
  {
    _id: false,
  }
);

const serviceRequestSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Client is required"],
    },

    clientName: {
      type: String,
      required: [true, "Client name is required"],
      trim: true,
      minlength: [2, "Client name must be at least 2 characters"],
      maxlength: [100, "Client name cannot exceed 100 characters"],
    },

    clientEmail: {
      type: String,
      required: [true, "Client email is required"],
      lowercase: true,
      trim: true,
      validate: {
        validator: validator.isEmail,
        message: "Please provide a valid client email",
      },
    },

    clientPhone: {
      type: String,
      trim: true,
      validate: {
        validator(value) {
          if (!value) return true;
          return /^[6-9]\d{9}$/.test(value);
        },
        message: "Please provide a valid 10-digit Indian phone number",
      },
      default: "",
    },

    companyName: {
      type: String,
      trim: true,
      maxlength: [150, "Company name cannot exceed 150 characters"],
      default: "",
    },

    address: {
      type: String,
      trim: true,
      maxlength: [500, "Address cannot exceed 500 characters"],
      default: "",
    },

    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
      validate: {
        validator(value) {
          if (!value) return true;
          return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(
            value
          );
        },
        message: "Please provide a valid GST number",
      },
    },

    serviceRequired: {
      type: String,
      required: [true, "Service required is required"],
      trim: true,
      minlength: [2, "Service required must be at least 2 characters"],
      maxlength: [150, "Service required cannot exceed 150 characters"],
    },

    projectTitle: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
      minlength: [2, "Project title must be at least 2 characters"],
      maxlength: [150, "Project title cannot exceed 150 characters"],
    },

    projectDescription: {
      type: String,
      required: [true, "Project description is required"],
      trim: true,
      minlength: [10, "Project description must be at least 10 characters"],
      maxlength: [3000, "Project description cannot exceed 3000 characters"],
    },

    budgetRange: {
      type: String,
      trim: true,
      maxlength: [80, "Budget range cannot exceed 80 characters"],
      default: "",
    },

    deadline: {
      type: Date,
      default: null,
    },

    priority: {
      type: String,
      enum: {
        values: serviceRequestPriorities,
        message: "Priority must be low, medium, high, or urgent",
      },
      default: "medium",
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      maxlength: [100, "Category cannot exceed 100 characters"],
    },

    referenceLinks: {
      type: [
        {
          type: String,
          trim: true,
          validate: {
            validator(value) {
              if (!value) return true;
              return validator.isURL(value, {
                require_protocol: true,
              });
            },
            message: "Reference link must be a valid URL",
          },
        },
      ],
      default: [],
    },

    attachments: {
      type: [attachmentSchema],
      default: [],
    },

    status: {
      type: String,
      enum: {
        values: serviceRequestStatuses,
        message:
          "Status must be submitted, reviewed, approved, in_progress, completed, or closed",
      },
      default: "submitted",
    },

    statusHistory: {
      type: [statusHistorySchema],
      default() {
        return [
          {
            status: "submitted",
            changedAt: new Date(),
          },
        ];
      },
    },

    adminRemarks: {
      type: String,
      trim: true,
      maxlength: [2000, "Admin remarks cannot exceed 2000 characters"],
      default: "",
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    convertedToProject: {
      type: Boolean,
      default: false,
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

serviceRequestSchema.index({ clientId: 1 });
serviceRequestSchema.index({ status: 1 });
serviceRequestSchema.index({ priority: 1 });
serviceRequestSchema.index({ category: 1 });
serviceRequestSchema.index({ deadline: 1 });
serviceRequestSchema.index({ createdAt: -1 });
serviceRequestSchema.index({ convertedToProject: 1 });

serviceRequestSchema.methods.toJSON = function () {
  const serviceRequest = this.toObject();
  delete serviceRequest.__v;
  return serviceRequest;
};

const ServiceRequest = mongoose.model("ServiceRequest", serviceRequestSchema);

export default ServiceRequest;
