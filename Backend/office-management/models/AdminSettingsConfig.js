import mongoose from "mongoose";

const adminSettingsConfigSchema = new mongoose.Schema(
  {
    autoPartnerIdFormat: {
      type: String,
      default: "REF-{YYYY}-{0000}",
    },
    autoCertificateNumberFormat: {
      type: String,
      default: "CERT-{YYYY}-{000000}",
    },
    autoIdCardNumberFormat: {
      type: String,
      default: "IDC-{YYYY}-{000000}",
    },
    referralCategories: {
      type: [String],
      default: ["IT Services", "Digital Marketing", "Web Development", "App Development", "Consulting"],
    },
    partnerTypes: {
      type: [String],
      default: ["Individual Affiliate", "Corporate Agency", "Strategic Consultant"],
    },
    commissionDefaultRate: {
      type: Number,
      default: 10, // 10%
    },
  },
  {
    timestamps: true,
  }
);

const AdminSettingsConfig = mongoose.model(
  "AdminSettingsConfig",
  adminSettingsConfigSchema
);

export default AdminSettingsConfig;
