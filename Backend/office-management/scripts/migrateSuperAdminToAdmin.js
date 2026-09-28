import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";

const migrate = async () => {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required");
  mongoose.set("autoIndex", false);
  await mongoose.connect(process.env.MONGO_URI);

  const result = await User.updateMany(
    { role: "super_admin" },
    {
      $set: { role: "admin", refreshTokenHash: null },
      $inc: { tokenVersion: 1 },
    }
  );

  console.log(`Migrated ${result.modifiedCount} existing super_admin account(s) to admin.`);
  await User.collection.createIndex(
    { role: 1 },
    {
      unique: true,
      partialFilterExpression: { role: "super_admin" },
      name: "unique_super_admin_role",
    }
  );
  console.log("Single-super-admin unique index ensured.");
};

migrate()
  .catch((error) => {
    console.error("Role migration failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
