import mongoose from "mongoose";
import validator from "validator";

export const clientRequestStatuses = [
  "pending",
  "in_review",
  "approved",
  "rejected",
  "completed",
];

const clientRequestSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: [true, "Client name is required"],
      trim: true,
      minlength: [2, "Client name must be at least 2 characters"],
      maxlength: [100, "Client name cannot exceed 100 characters"],
    },

    email: {
      type: String,
      required: [true, "Client request email is required"],
      lowercase: true,
      trim: true,
      validate: {
        validator: validator.isEmail,
        message: "Please provide a valid email",
      },
    },

    phone: {
      type: String,
      trim: true,
      validate: {
        validator(value) {
          if (!value) return true;
          return /^[6-9]\d{9}$/.test(value);
        },
        message: "Please provide a valid 10-digit Indian phone number",
      },
    },

    serviceRequired: {
      type: String,
      required: [true, "Service required is required"],
      trim: true,
      maxlength: [120, "Service required cannot exceed 120 characters"],
    },

    message: {
      type: String,
      trim: true,
      maxlength: [2000, "Message cannot exceed 2000 characters"],
      default: "",
    },

    status: {
      type: String,
      enum: {
        values: clientRequestStatuses,
        message:
          "Client request status must be pending, in_review, approved, rejected, or completed",
      },
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

clientRequestSchema.index({ status: 1, createdAt: -1 });
clientRequestSchema.index({ createdAt: -1 });

clientRequestSchema.methods.toJSON = function () {
  const clientRequest = this.toObject();
  delete clientRequest.__v;
  return clientRequest;
};

const ClientRequest = mongoose.model("ClientRequest", clientRequestSchema);

export default ClientRequest;
