import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Employee from "../models/Employee.js";
import User from "../models/User.js";
dotenv.config();

try {
  await connectDB();

  const employees = await Employee.find();
  console.log(`Total Employees in DB: ${employees.length}`);

  for (const emp of employees) {
    console.log(`Employee name: "${emp.name}", email: "${emp.email}"`);
    console.log(`  userId: ${emp.userId}`);
    if (emp.userId) {
      const user = await User.findById(emp.userId);
      console.log(`  Linked User found: ${user ? "Yes (" + user.email + ")" : "No"}`);
    } else {
      console.log("  No userId set!");
      // Let's see if there is a User with the same email
      const user = await User.findOne({ email: emp.email });
      console.log(`  User with same email: ${user ? "Yes (ID: " + user._id + ")" : "No"}`);
    }
    console.log("-----------------------------------------");
  }
} catch (error) {
  console.error("Failed:", error.message);
} finally {
  process.exit(0);
}
