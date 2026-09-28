import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/User.js";

dotenv.config();

const requiredEnv = [
  "SUPER_ADMIN_NAME",
  "SUPER_ADMIN_EMAIL",
  "SUPER_ADMIN_PASSWORD",
];

const createSuperAdmin = async () => {
  const missingEnv = requiredEnv.filter((key) => !process.env[key]);

  if (missingEnv.length) {
    throw new Error(`Missing required env: ${missingEnv.join(", ")}`);
  }

  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI or MONGODB_URI is not configured");
  }

  await mongoose.connect(mongoUri);
  console.log("MongoDB connected");

  const existingSuperAdmins = await User.find({ role: "super_admin" }).sort({ createdAt: 1 });
  if (existingSuperAdmins.length > 1) {
    throw new Error("Multiple super_admin accounts exist. Resolve duplicates before seeding.");
  }
  const configuredEmail = process.env.SUPER_ADMIN_EMAIL.trim().toLowerCase();
  const existingSuperAdmin = existingSuperAdmins[0];
  const existingByEmail = await User.findOne({ email: configuredEmail });
  const account = existingSuperAdmin || existingByEmail;

  if (account) {
    account.name = process.env.SUPER_ADMIN_NAME;
    account.email = configuredEmail;
    if (process.env.SUPER_ADMIN_PHONE) {
      account.phone = process.env.SUPER_ADMIN_PHONE;
    }
    account.password = process.env.SUPER_ADMIN_PASSWORD;
    account.role = "super_admin";
    account.status = "active";
    await account.save();

    console.log("Super admin updated successfully");
    return;
  }

  const userData = {
    name: process.env.SUPER_ADMIN_NAME,
    email: configuredEmail,
    password: process.env.SUPER_ADMIN_PASSWORD,
    role: "super_admin",
    status: "active",
  };
  if (process.env.SUPER_ADMIN_PHONE) {
    userData.phone = process.env.SUPER_ADMIN_PHONE;
  }

  await User.create(userData);

  console.log("Super admin created successfully");
};

createSuperAdmin()
  .catch((error) => {
    console.error("Failed to create super admin:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
