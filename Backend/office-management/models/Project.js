import mongoose from "mongoose";
export const projectStatuses = [
  "not_started",
  "in_progress",
  "on_hold",
  "completed",
  "cancelled",
];

export const projectPriorities = ["low", "medium", "high", "urgent"];

const projectSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      minlength: [2, "Project name must be at least 2 characters"],
      maxlength: [150, "Project name cannot exceed 150 characters"],
    },

    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: [true, "Client is required"],
    },

    category: {
      type: String,
      trim: true,
      maxlength: [100, "Category cannot exceed 100 characters"],
      default: "",
    },

    assignedTeam: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Employee",
        },
      ],
      default: [],
    },

    assignedTeams: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Team",
        },
      ],
      default: [],
    },

    startDate: {
      type: Date,
      default: null,
    },

    deadline: {
      type: Date,
      default: null,
    },
    github: {
      repoUrl: {
        type: String,
        default: "",
        trim: true,
      },

      owner: {
        type: String,
        default: "",
        trim: true,
      },

      repo: {
        type: String,
        default: "",
        trim: true,
      },
    },

    budget: {
      type: Number,
      min: [0, "Budget cannot be negative"],
      default: 0,
    },

    status: {
      type: String,
      enum: {
        values: projectStatuses,
        message:
          "Project status must be not_started, in_progress, on_hold, completed, or cancelled",
      },
      default: "not_started",
    },

    priority: {
      type: String,
      enum: {
        values: projectPriorities,
        message: "Project priority must be low, medium, high, or urgent",
      },
      default: "medium",
    },

    description: {
      type: String,
      trim: true,
      maxlength: [3000, "Project description cannot exceed 3000 characters"],
      default: "",
    },

    progressPercentage: {
      type: Number,
      min: [0, "Progress percentage cannot be less than 0"],
      max: [100, "Progress percentage cannot exceed 100"],
      default: 0,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [2000, "Notes cannot exceed 2000 characters"],
      default: "",
    },

    serviceRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceRequest",
      default: undefined,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

projectSchema.index({ clientId: 1 });
projectSchema.index({ category: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ priority: 1 });
projectSchema.index({ assignedTeam: 1 });
projectSchema.index({ assignedTeams: 1 });
projectSchema.index({ startDate: 1 });
projectSchema.index({ deadline: 1 });
projectSchema.index({ createdAt: -1 });
projectSchema.index(
  { serviceRequestId: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: {
      serviceRequestId: { $type: "objectId" },
    },
  },
);

projectSchema.methods.toJSON = function () {
  const project = this.toObject();
  delete project.__v;
  return project;
};

const Project = mongoose.model("Project", projectSchema);

export default Project;
