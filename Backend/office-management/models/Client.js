import mongoose from "mongoose";
import validator from "validator";

export const clientStatuses = ["active", "inactive"];

const clientSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: [true, "Client name is required"],
      trim: true,
      minlength: [2, "Client name must be at least 2 characters"],
      maxlength: [100, "Client name cannot exceed 100 characters"],
    },

    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      minlength: [2, "Company name must be at least 2 characters"],
      maxlength: [150, "Company name cannot exceed 150 characters"],
    },

    email: {
      type: String,
      required: [true, "Client email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: validator.isEmail,
        message: "Please provide a valid client email",
      },
    },

    phone: {
      type: String,
      required: [true, "Client phone number is required"],
      unique: true,
      trim: true,
      validate: {
        validator(value) {
          return /^[6-9]\d{9}$/.test(value);
        },
        message: "Please provide a valid 10-digit Indian phone number",
      },
    },

    address: {
      type: String,
      trim: true,
      maxlength: [500, "Address cannot exceed 500 characters"],
      default: "",
    },

    city: {
      type: String,
      trim: true,
      default: "",
    },

    state: {
      type: String,
      trim: true,
      default: "",
    },

    pincode: {
      type: String,
      trim: true,
      default: "",
    },

    businessCategory: {
      type: String,
      required: [true, "Business category is required"],
      trim: true,
      maxlength: [100, "Business category cannot exceed 100 characters"],
    },

    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,
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

    status: {
      type: String,
      enum: {
        values: clientStatuses,
        message: "Client status must be active or inactive",
      },
      default: "active",
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [2000, "Notes cannot exceed 2000 characters"],
      default: "",
    },

    assignedServices: {
      type: [String],
      default: ["social_media_management"],
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
  },
  {
    timestamps: true,
  }
);

clientSchema.index({ clientName: 1 });
clientSchema.index({ companyName: 1 });
clientSchema.index({ businessCategory: 1 });
clientSchema.index({ status: 1 });
clientSchema.index({ createdAt: -1 });

clientSchema.methods.toJSON = function () {
  const client = this.toObject();
  delete client.__v;
  return client;
};

const Client = mongoose.model("Client", clientSchema);

export default Client;
