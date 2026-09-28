import mongoose from "mongoose";

export const meetingTypes = ["Online", "In-Person", "Hybrid"];
export const meetingStatuses = [
  "Scheduled",
  "Completed",
  "Cancelled",
  "Rescheduled",
];

const meetingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Meeting title is required"],
      trim: true,
      minlength: [2, "Title must be at least 2 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    meetingDate: {
      type: Date,
      required: [true, "Meeting date is required"],
    },
    startTime: {
      type: String,
      trim: true,
      default: "10:00 AM",
    },
    endTime: {
      type: String,
      trim: true,
      default: "11:00 AM",
    },
    location: {
      type: String,
      trim: true,
      default: "Main Conference Room / Google Meet",
    },
    meetingType: {
      type: String,
      enum: {
        values: meetingTypes,
        message: "Invalid meeting type: {VALUE}",
      },
      default: "Online",
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
      },
    ],
    targetDepartment: {
      type: String,
      trim: true,
      default: "All Departments",
    },
    status: {
      type: String,
      enum: {
        values: meetingStatuses,
        message: "Invalid meeting status: {VALUE}",
      },
      default: "Scheduled",
    },
    minutesOfMeeting: {
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

meetingSchema.index({ meetingDate: 1 });
meetingSchema.index({ status: 1 });
meetingSchema.index({ organizer: 1 });

const Meeting = mongoose.model("Meeting", meetingSchema);
export default Meeting;
