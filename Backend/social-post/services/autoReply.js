const engagementController = require("../controllers/engagementController");

async function runAutoReplies() {
  if (typeof engagementController.runAutoReplies !== "function") {
    throw new Error("Auto-reply worker is not available");
  }

  return engagementController.runAutoReplies();
}

module.exports = { runAutoReplies };
