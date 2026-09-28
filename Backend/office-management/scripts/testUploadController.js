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

  // Create a temporary file to mock Multer diskStorage
  fs.writeFileSync("temp-test-upload.png", "fake-image-content");

  const req = {
    user,
    body: {
      title: "Test Image Document",
      documentType: "identity_proof",
      description: "This is a test description",
    },
    file: {
      path: "temp-test-upload.png",
      originalname: "test.png",
      mimetype: "image/png",
      size: 18,
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
  if (fs.existsSync("temp-test-upload.png")) {
    fs.unlinkSync("temp-test-upload.png");
  }
  process.exit(0);
}
