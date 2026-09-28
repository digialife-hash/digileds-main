import mongoose from "mongoose";
import validator from "validator";

export const sidebarThemes = [
  "light",
  "dark",
  "blue",
  "indigo",
  "green",
];

const urlValidator = {
  validator(value) {
    if (!value) return true;
    return validator.isURL(value, {
      protocols: ["http", "https"],
      require_protocol: true,
    });
  },
  message: "Please provide a valid URL with http or https",
};

const colorValidator = {
  validator(value) {
    if (!value) return true;
    return /^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(value);
  },
  message: "Please provide a valid hex color",
};

const settingsSchema = new mongoose.Schema(
  {
    singletonKey: {
      type: String,
      default: "office_settings",
      unique: true,
      immutable: true,
    },

    company: {
      companyName: {
        type: String,
        trim: true,
        maxlength: [150, "Company name cannot exceed 150 characters"],
        default: "",
      },
      companyEmail: {
        type: String,
        lowercase: true,
        trim: true,
        validate: {
          validator(value) {
            if (!value) return true;
            return validator.isEmail(value);
          },
          message: "Please provide a valid company email",
        },
        default: "",
      },
      companyPhone: {
        type: String,
        trim: true,
        maxlength: [25, "Company phone cannot exceed 25 characters"],
        default: "",
      },
      companyAddress: {
        type: String,
        trim: true,
        maxlength: [500, "Company address cannot exceed 500 characters"],
        default: "",
      },
      website: {
        type: String,
        trim: true,
        validate: urlValidator,
        default: "",
      },
      gstNumber: {
        type: String,
        trim: true,
        uppercase: true,
        validate: {
          validator(value) {
            if (!value) return true;
            return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(
              value
            );
          },
          message: "Please provide a valid GST number",
        },
        default: "",
      },
      companyLogo: {
        type: String,
        trim: true,
        validate: urlValidator,
        default: "",
      },
    },

    bank: {
      bankName: {
        type: String,
        trim: true,
        maxlength: [150, "Bank name cannot exceed 150 characters"],
        default: "",
      },
      accountNumber: {
        type: String,
        trim: true,
        maxlength: [50, "Account number cannot exceed 50 characters"],
        default: "",
      },
      branchName: {
        type: String,
        trim: true,
        maxlength: [150, "Branch name cannot exceed 150 characters"],
        default: "",
      },
      ifscCode: {
        type: String,
        trim: true,
        uppercase: true,
        maxlength: [20, "IFSC code cannot exceed 20 characters"],
        default: "",
      },
      accountHolderName: {
        type: String,
        trim: true,
        maxlength: [150, "Account holder name cannot exceed 150 characters"],
        default: "",
      },
      upiId: {
        type: String,
        trim: true,
        maxlength: [100, "UPI ID cannot exceed 100 characters"],
        default: "",
      },
    },

    branding: {
      primaryColor: {
        type: String,
        trim: true,
        validate: colorValidator,
        default: "#2563eb",
      },
      secondaryColor: {
        type: String,
        trim: true,
        validate: colorValidator,
        default: "#0f172a",
      },
      sidebarTheme: {
        type: String,
        enum: {
          values: sidebarThemes,
          message: "Sidebar theme is invalid",
        },
        default: "light",
      },
      logo: {
        type: String,
        trim: true,
        validate: urlValidator,
        default: "",
      },
      favicon: {
        type: String,
        trim: true,
        validate: urlValidator,
        default: "",
      },
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

settingsSchema.statics.getSingleton = function () {
  return this.findOneAndUpdate(
    { singletonKey: "office_settings" },
    { $setOnInsert: { singletonKey: "office_settings" } },
    { new: true, upsert: true, runValidators: true }
  );
};

settingsSchema.methods.toJSON = function () {
  const settings = this.toObject();
  delete settings.__v;
  delete settings.singletonKey;
  return settings;
};

const Settings = mongoose.model("Settings", settingsSchema);

export default Settings;
