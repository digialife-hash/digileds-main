import mongoose from "mongoose";
import validator from "validator";

export const employmentTypes = [
  "full_time",
  "part_time",
  "intern",
  "contract",
  "freelancer",
];

export const employeeStatuses = [
  "active",
  "inactive",
  "terminated",
  "resigned",
];

const documentSchema = new mongoose.Schema(
  {
    documentType: {
      type: String,
      trim: true,
      maxlength: [80, "Document type cannot exceed 80 characters"],
      default: "",
    },

    fileName: {
      type: String,
      trim: true,
      maxlength: [255, "File name cannot exceed 255 characters"],
      default: "",
    },

    originalName: {
      type: String,
      trim: true,
      maxlength: [255, "Original file name cannot exceed 255 characters"],
      default: "",
    },

    mimeType: {
      type: String,
      trim: true,
      maxlength: [120, "MIME type cannot exceed 120 characters"],
      default: "",
    },

    size: {
      type: Number,
      min: [0, "Document size cannot be negative"],
      default: 0,
    },

    url: {
      type: String,
      trim: true,
      maxlength: [2048, "Document URL cannot exceed 2048 characters"],
      default: "",
    },

    storageKey: {
      type: String,
      trim: true,
      maxlength: [512, "Storage key cannot exceed 512 characters"],
      default: "",
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    uploadedAt: {
      type: Date,
      default: Date.now,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    _id: true,
  }
);

const emergencyContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: [100, "Emergency contact name cannot exceed 100 characters"],
      default: "",
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
      default: "",
    },

    relation: {
      type: String,
      trim: true,
      maxlength: [80, "Emergency contact relation cannot exceed 80 characters"],
      default: "",
    },
  },
  {
    _id: false,
  }
);

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Employee name is required"],
      trim: true,
      minlength: [2, "Employee name must be at least 2 characters"],
      maxlength: [100, "Employee name cannot exceed 100 characters"],
    },

    email: {
      type: String,
      required: [true, "Employee email is required"],
      lowercase: true,
      trim: true,
      validate: {
        validator: validator.isEmail,
        message: "Please provide a valid employee email",
      },
    },

    phone: {
      type: String,
      required: [true, "Employee phone is required"],
      trim: true,
      validate: {
        validator(value) {
          return /^[6-9]\d{9}$/.test(value);
        },
        message: "Please provide a valid 10-digit Indian phone number",
      },
    },

    department: {
      type: String,
      trim: true,
      maxlength: [100, "Department cannot exceed 100 characters"],
      default: "",
    },

    designation: {
      type: String,
      trim: true,
      maxlength: [100, "Designation cannot exceed 100 characters"],
      default: "",
    },

    joiningDate: {
      type: Date,
      required: [true, "Joining date is required"],
    },

    salary: {
      type: Number,
      min: [0, "Salary cannot be negative"],
      default: 0,
    },

    employmentType: {
      type: String,
      enum: {
        values: employmentTypes,
        message:
          "Employment type must be full_time, part_time, intern, contract, or freelancer",
      },
      required: [true, "Employment type is required"],
    },

    status: {
      type: String,
      enum: {
        values: employeeStatuses,
        message:
          "Employee status must be active, inactive, terminated, or resigned",
      },
      default: "active",
    },

    address: {
      type: String,
      trim: true,
      maxlength: [1000, "Address cannot exceed 1000 characters"],
      default: "",
    },

    emergencyContact: {
      type: emergencyContactSchema,
      default: () => ({}),
    },

    documents: {
      type: [documentSchema],
      default: [],
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: undefined,
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

employeeSchema.index({ name: 1 });
employeeSchema.index({ email: 1 }, { unique: true });
employeeSchema.index({ phone: 1 }, { unique: true });
employeeSchema.index({ department: 1 });
employeeSchema.index({ designation: 1 });
employeeSchema.index({ status: 1 });
employeeSchema.index({ employmentType: 1 });
employeeSchema.index({ joiningDate: 1 });
employeeSchema.index({ createdAt: -1 });
employeeSchema.index({ userId: 1 }, { unique: true, sparse: true });
employeeSchema.index({ department: 1, designation: 1, status: 1 });

employeeSchema.methods.toJSON = function () {
  const employee = this.toObject();
  delete employee.__v;
  return employee;
};

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;
