const crypto = require("crypto");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const User = require("../social-post/models/User");

dotenv.config();

const email = "ashishshen20@gmail.com";
const name = "Admin";
const password = `Sly!${crypto.randomBytes(8).toString("base64url")}9`;

async function createAdmin() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is not configured");

  await mongoose.connect(process.env.MONGO_URI);
  const existingUser = await User.findOne({ email }).select("+password");

  if (existingUser) {
    existingUser.name = name;
    existingUser.password = password;
    existingUser.role = "admin";
    existingUser.resetPasswordTokenHash = undefined;
    existingUser.resetPasswordExpiresAt = undefined;
    await existingUser.save({ validateBeforeSave: false });
  } else {
    await User.create({
      name,
      email,
      password,
      role: "admin",
    });
  }

  console.log(JSON.stringify({ email, temporaryPassword: password }, null, 2));
  await mongoose.disconnect();
}

createAdmin().catch(async (error) => {
  console.error("Unable to create admin:", error.message);
  await mongoose.disconnect().catch(() => {});
  process.exitCode = 1;
});
