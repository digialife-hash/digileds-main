const express = require("express");
const requireAuth = require("../middleware/auth");
const User = require("../models/User");
const Post = require("../models/Post");
const multer = require("multer");
const {
  publishPost,
  deletePublishedPost,
  updatePublishedVisibility,
  setPublishedThumbnail,
  reconcileProviderResults,
} = require("../services/publishing");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

router.get("/", requireAuth, async (request, response, next) => {
  try {
    const storedPosts = await Post.find({ user: request.user._id, tenantId: request.tenantId }).sort({ createdAt: -1 });
    response.json({ success: true, posts: storedPosts });
  } catch (error) {
    next(error);
  }
});

router.post("/reconcile", requireAuth, async (request, response, next) => {
  try {
    const user = await User.findById(request.user._id)
      .select("+socialAccounts.accessToken +socialAccounts.refreshToken");
    const storedPosts = await Post.find({ user: request.user._id, tenantId: request.tenantId }).sort({ createdAt: -1 });

    for (const post of storedPosts) {
      if (!post.providerResults?.YouTube?.id) continue;
      try {
        const providerResults = await reconcileProviderResults(post, user);
        if (!providerResults.YouTube) {
          post.providerResults = providerResults;
          if (!Object.keys(providerResults).length && post.status === "Published") {
            await post.deleteOne();
            continue;
          }
          await post.save();
        }
      } catch (error) {
        console.warn(`Could not reconcile post ${post._id} with YouTube:`, error.message);
      }
    }

    const posts = await Post.find({ user: request.user._id, tenantId: request.tenantId }).sort({ createdAt: -1 }).lean();
    response.json({ success: true, posts });
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAuth, upload.fields([
  { name: "media", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
]), async (request, response, next) => {
  try {
    const { title, platform } = request.body;
    if (!title?.trim() || !platform?.trim()) {
      return response.status(400).json({ success: false, message: "Title and platform are required" });
    }
    const mediaFile = request.files?.media?.[0];
    const thumbnailFile = request.files?.thumbnail?.[0];
    const scheduledFor = request.body.status === "Scheduled" && request.body.date
      ? new Date(request.body.date)
      : null;
    if (request.body.status === "Scheduled" && (!scheduledFor || Number.isNaN(scheduledFor.getTime()))) {
      return response.status(400).json({ success: false, message: "A valid future schedule date is required." });
    }
    if (scheduledFor && scheduledFor.getTime() <= Date.now()) {
      return response.status(400).json({ success: false, message: "Scheduled date must be in the future." });
    }
    const post = await Post.create({
      ...request.body,
      user: request.user._id,
      tenantId: request.tenantId,
      scheduledFor,
      hasMedia: Boolean(mediaFile) || request.body.hasMedia === "true",
      media: mediaFile
        ? { originalName: mediaFile.originalname, mimeType: mediaFile.mimetype, data: mediaFile.buffer }
        : undefined,
      thumbnail: thumbnailFile
        ? { originalName: thumbnailFile.originalname, mimeType: thumbnailFile.mimetype, data: thumbnailFile.buffer }
        : undefined,
    });
    const shouldPublish = request.body.status === "Published";
    if (shouldPublish) {
      const publishingUser = await User.findById(request.user._id).select("+socialAccounts.accessToken +socialAccounts.refreshToken");
      const result = await publishPost(post, publishingUser);
      post.providerResults = result.providerResults;
      post.publishError = result.publishError;
      post.status = result.publishError ? "Failed" : "Published";
      await post.save();
      if (result.publishError) {
        return response.status(502).json({ success: false, message: result.publishError, post });
      }
    }
    response.status(201).json({ success: true, post });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/repost", requireAuth, async (request, response, next) => {
  try {
    const post = await Post.findOneAndUpdate({
      _id: request.params.id,
      user: request.user._id,
      tenantId: request.tenantId,
      status: "Failed",
    }, {
      $set: {
        status: "Draft",
        providerResults: {},
        publishError: "",
        scheduledFor: null,
        scheduleLockAt: null,
      },
      $inc: { publishAttempts: 1 },
    }, {
      new: true,
    }).select("+media.data +thumbnail.data");
    if (!post) {
      const existingPost = await Post.exists({ _id: request.params.id, user: request.user._id, tenantId: request.tenantId });
      return response.status(existingPost ? 409 : 404).json({
        success: false,
        message: existingPost
          ? "This post is already being reposted or is no longer failed."
          : "Post not found",
      });
    }

    const publishingUser = await User.findById(request.user._id)
      .select("+socialAccounts.accessToken +socialAccounts.refreshToken");

    const result = await publishPost(post, publishingUser);
    post.providerResults = result.providerResults;
    post.publishError = result.publishError;
    post.status = result.publishError ? "Failed" : "Published";
    await post.save();

    if (result.publishError) {
      return response.status(502).json({ success: false, message: result.publishError, post });
    }
    response.json({ success: true, post });
  } catch (error) {
    next(error);
  }
});

router.get("/:id/media", requireAuth, async (request, response, next) => {
  try {
    const post = await Post.findOne({
      _id: request.params.id,
      user: request.user._id,
      tenantId: request.tenantId,
    }).select("+media.data");
    if (!post?.media?.data) {
      return response.status(404).json({ success: false, message: "Media not found" });
    }
    response.type(post.media.mimeType || "application/octet-stream");
    response.set("Content-Disposition", `inline; filename="${encodeURIComponent(post.media.originalName || "media")}"`);
    response.send(post.media.data);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id/media", requireAuth, async (request, response, next) => {
  try {
    const post = await Post.findOne({ _id: request.params.id, user: request.user._id, tenantId: request.tenantId });
    if (!post) return response.status(404).json({ success: false, message: "Post not found" });
    post.media = undefined;
    post.hasMedia = false;
    await post.save();
    response.json({ success: true, post });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id/provider/:platform", requireAuth, async (request, response, next) => {
  try {
    const post = await Post.findOne({ _id: request.params.id, user: request.user._id, tenantId: request.tenantId }).select("+media.data");
    if (!post) return response.status(404).json({ success: false, message: "Post not found" });
    const publishingUser = await User.findById(request.user._id).select("+socialAccounts.accessToken +socialAccounts.refreshToken");
    await deletePublishedPost(post, publishingUser, request.params.platform);
    post.providerResults = { ...(post.providerResults || {}) };
    delete post.providerResults[request.params.platform];
    await post.save();
    response.json({ success: true, post });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/provider/:platform/visibility", requireAuth, async (request, response, next) => {
  try {
    const { visibility } = request.body || {};
    const post = await Post.findOne({ _id: request.params.id, user: request.user._id, tenantId: request.tenantId });
    if (!post) return response.status(404).json({ success: false, message: "Post not found" });
    const publishingUser = await User.findById(request.user._id).select("+socialAccounts.accessToken +socialAccounts.refreshToken");
    await updatePublishedVisibility(post, publishingUser, request.params.platform, visibility);
    post.visibility = visibility;
    await post.save();
    response.json({ success: true, post });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/provider/:platform/thumbnail", requireAuth, upload.single("thumbnail"), async (request, response, next) => {
  try {
    if (request.params.platform !== "YouTube") {
      return response.status(400).json({ success: false, message: "Thumbnail editing is only supported for YouTube." });
    }
    if (!request.file) {
      return response.status(400).json({ success: false, message: "Choose a thumbnail image." });
    }
    if (!request.file.mimetype.startsWith("image/")) {
      return response.status(400).json({ success: false, message: "YouTube thumbnails must be an image." });
    }
    const post = await Post.findOne({ _id: request.params.id, user: request.user._id, tenantId: request.tenantId });
    if (!post) return response.status(404).json({ success: false, message: "Post not found" });
    const publishingUser = await User.findById(request.user._id).select("+socialAccounts.accessToken +socialAccounts.refreshToken");
    const thumbnailResult = await setPublishedThumbnail(
      post,
      publishingUser,
      request.params.platform,
      request.file,
    );
    if (!thumbnailResult?.thumbnailUrl) {
      throw new Error("YouTube did not confirm the new thumbnail.");
    }
    post.providerResults = {
      ...(post.providerResults || {}),
      YouTube: {
        ...(post.providerResults?.YouTube || {}),
        thumbnailUrl: thumbnailResult.thumbnailUrl,
      },
    };
    post.thumbnail = {
      originalName: request.file.originalname,
      mimeType: request.file.mimetype,
      data: request.file.buffer,
    };
    await post.save();
    response.json({ success: true, post });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", requireAuth, async (request, response, next) => {
  try {
    const changes = { ...request.body };
    if (changes.status === "Scheduled") {
      const scheduledFor = new Date(changes.date);
      if (!changes.date || Number.isNaN(scheduledFor.getTime()) || scheduledFor.getTime() <= Date.now()) {
        return response.status(400).json({ success: false, message: "A valid future schedule date is required." });
      }
      changes.scheduledFor = scheduledFor;
    } else if (changes.status) {
      changes.scheduledFor = null;
      changes.scheduleLockAt = null;
    }
    const post = await Post.findOneAndUpdate(
      { _id: request.params.id, user: request.user._id, tenantId: request.tenantId },
      { $set: changes },
      { new: true, runValidators: true },
    );
    if (!post) return response.status(404).json({ success: false, message: "Post not found" });
    response.json({ success: true, post });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", requireAuth, async (request, response, next) => {
  try {
    const result = await Post.deleteOne({ _id: request.params.id, user: request.user._id, tenantId: request.tenantId });
    if (!result.deletedCount) return response.status(404).json({ success: false, message: "Post not found" });
    response.json({ success: true });
  } catch (error) {
    next(error);
  }
});



router.get("/instagram/videos", async (request, response, next) => {
  try {
    const posts = await Post.find({
      "providerResults.Instagram": { $exists: true },
      "media.mimeType": { $regex: /^video\//i },
    })
      .sort({ createdAt: -1 })
      .limit(4)
      .select("-media.data -thumbnail.data")
      .lean();

    return response.json({
      success: true,
      posts,
    });
  } catch (error) {
    next(error);
  }
});
module.exports = router;
