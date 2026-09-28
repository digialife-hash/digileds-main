import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Project from "../models/Project.js";
import { getRepositoryData } from "../services/githubService.js";
dotenv.config();

try {
  await connectDB();

  const projects = await Project.find();
  console.log(`Found ${projects.length} projects in DB.`);

  for (const p of projects) {
    console.log(`Project Name: "${p.projectName}"`);
    console.log(`GitHub Config:`, p.github);

    if (p.github?.owner && p.github?.repo) {
      try {
        const data = await getRepositoryData(p.github.owner, p.github.repo);
        console.log(
          `-> Success! Default branch: ${data.defaultBranch}, Branches count: ${data.branches.length}`
        );
      } catch (err) {
        console.error(
          `-> Failed to fetch for ${p.github.owner}/${p.github.repo}:`,
          err.message,
          `Code: ${err.statusCode || err.status || "N/A"}`
        );
      }
    } else {
      console.log("-> No GitHub owner/repo config found.");
    }
    console.log("-----------------------------------------");
  }
} catch (error) {
  console.error("Database connection or check failed:", error.message);
} finally {
  process.exit(0);
}
