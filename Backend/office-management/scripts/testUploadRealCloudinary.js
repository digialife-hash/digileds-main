import dotenv from "dotenv";
import connectDB from "../config/db.js";
import { uploadDocumentEmp } from "../controllers/EmpDocumentUpload.js";
import User from "../models/User.js";
import fs from "fs";

dotenv.config();

try {
  await connectDB();

  const user = await User.findOne({ role: "employee" });
  if (!user) {
    console.error("No employee user found in DB to mock upload.");
    process.exit(1);
  }

  // Write a valid 1x1 pixel PNG file
  const pngHex =
    "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c63000100000500010d0a2db40000000049454e44ae426082";
  const buffer = Buffer.from(pngHex, "hex");
  fs.writeFileSync("temp-test-real.png", buffer);

  const req = {
    user,
    body: {
      title: "Real Test Image Document",
      documentType: "identity_proof",
      description: "Testing Cloudinary and MongoDB save",
    },
    file: {
      path: "temp-test-real.png",
      originalname: "real-test.png",
      mimetype: "image/png",
      size: buffer.length,
    },
  };

  const res = {
    status(code) {
      console.log("Status code returned:", code);
      return this;
    },
    json(data) {
      console.log("JSON response returned:", JSON.stringify(data, null, 2));
      return this;
    },
  };

  await uploadDocumentEmp(req, res);
} catch (e) {
  console.error("Controller threw unhandled exception:", e);
} finally {
  if (fs.existsSync("temp-test-real.png")) {
    fs.unlinkSync("temp-test-real.png");
  }
  process.exit(0);
}
