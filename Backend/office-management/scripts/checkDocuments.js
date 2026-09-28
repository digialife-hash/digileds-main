import dotenv from "dotenv";
import connectDB from "../config/db.js";
import EmployeeDocument from "../models/EmployeeDocumentUpload.js";
import Employee from "../models/Employee.js";
import User from "../models/User.js";
dotenv.config();

try {
  await connectDB();

  const docs = await EmployeeDocument.find();
  console.log(`Total Employee Documents in DB: ${docs.length}`);

  for (const doc of docs) {
    console.log(
      `Document Title: "${doc.title}", email: "${doc.email}", name: "${doc.name}"`
    );
    console.log(`  NewEmployee_id: ${doc.NewEmployee_id}`);

    // Check if NewEmployee_id is a User ID or Employee ID
    const isEmployee = await Employee.findById(doc.NewEmployee_id);
    const isUser = await User.findById(doc.NewEmployee_id);

    console.log(`  Is linked to Employee record: ${isEmployee ? "Yes" : "No"}`);
    console.log(`  Is linked to User record: ${isUser ? "Yes" : "No"}`);
    console.log("-----------------------------------------");
  }
} catch (error) {
  console.error("Failed:", error.message);
} finally {
  process.exit(0);
}
