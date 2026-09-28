import mongoose from "mongoose";

export const teamStatuses = ["active", "inactive", "archived"];

const teamSchema = new mongoose.Schema(
  {
    teamName: {
      type: String,
      required: [true, "Team name is required"],
      trim: true,
      minlength: [2, "Team name must be at least 2 characters"],
      maxlength: [120, "Team name cannot exceed 120 characters"],
    },

    teamLead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: [true, "Team lead is required"],
    },

    members: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Employee",
        },
      ],
      default: [],
    },

    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
      maxlength: [100, "Department cannot exceed 100 characters"],
    },

    assignedProjects: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Project",
        },
      ],
      default: [],
    },

    status: {
      type: String,
      enum: {
        values: teamStatuses,
        message: "Team status must be active, inactive, or archived",
      },
      default: "active",
    },

    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
      default: "",
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
  },
  {
    timestamps: true,
  }
);

teamSchema.index({ teamName: 1 });
teamSchema.index({ teamLead: 1 });
teamSchema.index({ members: 1 });
teamSchema.index({ department: 1 });
teamSchema.index({ assignedProjects: 1 });
teamSchema.index({ status: 1 });
teamSchema.index({ createdAt: -1 });
teamSchema.index({ department: 1, status: 1 });

teamSchema.methods.toJSON = function () {
  const team = this.toObject();
  delete team.__v;
  return team;
};

const Team = mongoose.model("Team", teamSchema);

export default Team;
