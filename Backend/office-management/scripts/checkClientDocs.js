import dotenv from "dotenv";
import connectDB from "../config/db.js";
import ClientDocument from "../models/ClientDocumentUpload.js";
import Client from "../models/Client.js";
import User from "../models/User.js";
dotenv.config();

try {
  await connectDB();

  const docs = await ClientDocument.find();
  console.log(`Total Client Documents in DB: ${docs.length}`);

  for (const doc of docs) {
    console.log(
      `Document Title: "${doc.title}", email: "${doc.email}", name: "${doc.name}"`
    );
    console.log(`  NewClient_id: ${doc.NewClient_id}`);

    // Check if NewClient_id is a User ID or Client ID
    const isClient = await Client.findById(doc.NewClient_id);
    const isUser = await User.findById(doc.NewClient_id);

    console.log(`  Is linked to Client record: ${isClient ? "Yes" : "No"}`);
    console.log(`  Is linked to User record: ${isUser ? "Yes" : "No"}`);
    console.log("-----------------------------------------");
  }
} catch (error) {
  console.error("Failed:", error.message);
} finally {
  process.exit(0);
}
