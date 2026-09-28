import mongoose from "mongoose";

export const taskPriorities = ["low", "medium", "high", "urgent"];

export const taskStatuses = [
  "pending",
  "in_progress",
  "submitted",
  "approved",
  "rejected",
  "completed",
];

const taskCommentSchema = new mongoose.Schema(
  {
    commentText: {
      type: String,
      required: [true, "Comment text is required"],
      trim: true,
      maxlength: [3000, "Comment cannot exceed 3000 characters"],
    },

    commentedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Comment author is required"],
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  }
);

const progressUpdateSchema = new mongoose.Schema(
  {
    updateText: {
      type: String,
      required: [true, "Progress update text is required"],
      trim: true,
      maxlength: [3000, "Progress update cannot exceed 3000 characters"],
    },

    statusAtThatTime: {
      type: String,
      enum: {
        values: taskStatuses,
        message:
          "Progress update status must be pending, in_progress, submitted, approved, rejected, or completed",
      },
      required: [true, "Progress update status is required"],
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Progress update author is required"],
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  }
);

const taskSchema = new mongoose.Schema(
  {
    taskTitle: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      minlength: [2, "Task title must be at least 2 characters"],
      maxlength: [150, "Task title cannot exceed 150 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [5000, "Task description cannot exceed 5000 characters"],
      default: "",
    },

    assignedEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: [true, "Assigned employee is required"],
    },

    assignedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    relatedProject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },

    priority: {
      type: String,
      enum: {
        values: taskPriorities,
        message: "Task priority must be low, medium, high, or urgent",
      },
      default: "medium",
    },

    deadline: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: {
        values: taskStatuses,
        message:
          "Task status must be pending, in_progress, submitted, approved, rejected, or completed",
      },
      default: "pending",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by user is required"],
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    comments: {
      type: [taskCommentSchema],
      default: [],
    },

    progressUpdates: {
      type: [progressUpdateSchema],
      default: [],
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
  }
);

taskSchema.index({ assignedEmployee: 1 });
taskSchema.index({ assignedUser: 1 });
taskSchema.index({ relatedProject: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ deadline: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ createdAt: -1 });
taskSchema.index({ assignedEmployee: 1, status: 1, deadline: 1 });
taskSchema.index({ relatedProject: 1, status: 1, priority: 1 });

taskSchema.methods.toJSON = function () {
  const task = this.toObject();
  delete task.__v;
  return task;
};

const Task = mongoose.model("Task", taskSchema);

export default Task;
