import { initializeServer } from "./startup.js";

async function start() {
  try {
    await initializeServer();
  } catch (error) {
    console.error("FATAL: Database initialization failed:", error.message);
    process.exitCode = 1;
  }
}

await start();
