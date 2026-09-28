const Post = require("../models/Post");
const User = require("../models/User");
const { publishPost } = require("./publishing");
const { runAutoReplies } = require("./autoReply");

let timer = null;
let running = false;
let autoReplyTimer = null;

async function publishDuePosts() {
  if (running) return;
  running = true;
  try {
    while (true) {
      const post = await Post.findOneAndUpdate(
        {
          status: "Scheduled",
          scheduledFor: { $lte: new Date() },
          $or: [
            { scheduleLockAt: null },
            { scheduleLockAt: { $exists: false } },
            { scheduleLockAt: { $lt: new Date(Date.now() - 15 * 60 * 1000) } },
          ],
        },
        {
          $set: { scheduleLockAt: new Date() },
          $inc: { publishAttempts: 1 },
        },
        { new: true },
      ).select("+media.data +thumbnail.data");

      if (!post) break;

      try {
        const user = await User.findOne({
          _id: post.user,
          tenantId: post.tenantId,
        }).select("+socialAccounts.accessToken +socialAccounts.refreshToken");
        if (!user) throw new Error("Post owner account was not found");
        const result = await publishPost(post, user);
        post.providerResults = result.providerResults || {};
        post.publishError = result.publishError || undefined;
        post.status = result.publishError ? "Failed" : "Published";
        post.scheduleLockAt = null;
        await post.save();
      } catch (error) {
        post.status = "Failed";
        post.publishError = error.message;
        post.scheduleLockAt = null;
        await post.save();
        console.error(`Scheduled post ${post._id} failed:`, error.message);
      }
    }
  } finally {
    running = false;
  }
}

function startScheduler() {
  if (timer) return;
  publishDuePosts().catch((error) => console.error("Scheduler startup failed:", error));
  runAutoReplies().catch((error) => console.error("Auto-reply startup failed:", error));
  timer = setInterval(() => {
    publishDuePosts().catch((error) => console.error("Scheduler run failed:", error));
  }, 30_000);
  timer.unref?.();
  autoReplyTimer = setInterval(() => {
    runAutoReplies().catch((error) => console.error("Auto-reply run failed:", error));
  }, 30_000);
  autoReplyTimer.unref?.();
  console.log("Scheduled publishing worker started (30-second interval)");
  console.log("Auto-reply worker started (30-second interval)");
}

module.exports = { startScheduler, publishDuePosts };
