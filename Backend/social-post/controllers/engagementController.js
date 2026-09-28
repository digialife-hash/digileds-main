const express = require("express");
const requireAuth = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();

const graphVersion = () => process.env.META_GRAPH_VERSION || "v23.0";

const COMMENT_PLATFORMS = [
  "Facebook",
  "Instagram",
  "YouTube",
  "Google Business",
];

const ALL_PLATFORMS = [
  "Instagram",
  "Facebook",
  "LinkedIn",
  "X",
  "YouTube",
  "Google Business",
];

const autoReplyBlockedUntil = new Map();

function autoReplyBlockKey(user, platform) {
  return `${user._id}:${canonicalPlatformName(platform)}`;
}

function isAutoReplyBlocked(user, platform) {
  const blockedUntil = autoReplyBlockedUntil.get(autoReplyBlockKey(user, platform)) || 0;
  return blockedUntil > Date.now();
}

function blockAutoReply(user, platform, durationMs = 10 * 60 * 1000) {
  autoReplyBlockedUntil.set(
    autoReplyBlockKey(user, platform),
    Date.now() + durationMs,
  );
}

/* =========================================================
   PLATFORM HELPERS
========================================================= */

function normalizePlatformName(platform) {
  return decodeURIComponent(String(platform || ""))
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function canonicalPlatformName(platform) {
  const normalized = normalizePlatformName(platform);

  if (normalized === "google business") return "Google Business";
  if (normalized === "facebook") return "Facebook";
  if (normalized === "instagram") return "Instagram";
  if (normalized === "youtube") return "YouTube";
  if (normalized === "linkedin") return "LinkedIn";
  if (normalized === "x" || normalized === "twitter") return "X";

  return String(platform || "").trim();
}

function accountFor(user, platform) {
  const targetPlatform = canonicalPlatformName(platform);

  return (user.socialAccounts || []).find(
    (account) =>
      canonicalPlatformName(account.platform) === targetPlatform,
  );
}

function graphToken(account) {
  return (
    account?.providerData?.pageAccessToken ||
    account?.accessToken
  );
}

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

/* =========================================================
   PROVIDER REQUEST HELPERS
========================================================= */

async function providerRequest(url, options = {}) {
  const response = await fetch(url, options);

  const responseText = await response.text();

  let data = {};

  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    data = {};
  }

  if (!response.ok) {
    if (
      data.error?.code === 200 &&
      /permission/i.test(data.error?.message || "")
    ) {
      throw new Error(
        "Facebook Page comment permission is missing. Disconnect and reconnect Facebook, then approve pages_manage_engagement and pages_read_engagement.",
      );
    }
    if (
      data.error?.code === 100 &&
      /missing permission/i.test(
        data.error?.message || "",
      )
    ) {
      throw new Error(
        "Instagram auto-reply permission is missing. Disconnect and reconnect Instagram/Facebook, and approve instagram_manage_comments.",
      );
    }
    throw new Error(
      data.error?.message ||
        data.error_description ||
        data.message ||
        responseText?.slice(0, 500) ||
        `Provider request failed (${response.status})`,
    );
  }

  return data;
}

async function jsonFetch(url, options = {}) {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 10000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    const responseText = await response.text();

    let data = {};

    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      data = {};
    }

    if (!response.ok) {
      throw new Error(
        data.error?.message ||
          data.error_description ||
          data.message ||
          responseText?.slice(0, 500) ||
          `Provider request failed (${response.status})`,
      );
    }

    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Provider request timed out after 10 seconds");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchGraphPages(url, maxPages = 25) {
  const rows = [];

  let nextUrl = url;

  for (
    let page = 0;
    nextUrl && page < maxPages;
    page += 1
  ) {
    const data = await jsonFetch(nextUrl);

    rows.push(...safeArray(data.data));

    nextUrl = data.paging?.next || null;
  }

  return rows;
}

async function fetchYouTubePages(url, token, maxPages = 10) {
  const rows = [];

  let nextPageToken = "";

  for (let page = 0; page < maxPages; page += 1) {
    const separator = url.includes("?") ? "&" : "?";

    const requestUrl =
      nextPageToken
        ? `${url}${separator}pageToken=${encodeURIComponent(
            nextPageToken,
          )}`
        : url;

    const data = await jsonFetch(requestUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    rows.push(...safeArray(data.items));

    nextPageToken = data.nextPageToken || "";

    if (!nextPageToken) {
      break;
    }
  }

  return rows;
}

/* =========================================================
   GOOGLE TOKEN REFRESH
========================================================= */

async function refreshGoogleAccount(account, platform) {
  if (!account) {
    throw new Error(`${platform} account is not connected`);
  }

  const expiresAt = account.tokenExpiresAt
    ? new Date(account.tokenExpiresAt).getTime()
    : 0;

  if (
    account.accessToken &&
    expiresAt > Date.now() + 60_000
  ) {
    return account.accessToken;
  }

  if (!account.refreshToken) {
    if (account.accessToken) {
      return account.accessToken;
    }

    throw new Error(
      `${platform} authorization expired. Disconnect and reconnect it.`,
    );
  }

  const clientId =
    platform === "YouTube"
      ? process.env.YOUTUBE_CLIENT_ID
      : process.env.GOOGLE_BUSINESS_CLIENT_ID;

  const clientSecret =
    platform === "YouTube"
      ? process.env.YOUTUBE_CLIENT_SECRET
      : process.env.GOOGLE_BUSINESS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      `${platform} OAuth configuration is missing on the server.`,
    );
  }

  const response = await fetch(
    "https://oauth2.googleapis.com/token",
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },

      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: account.refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    },
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.access_token) {
    throw new Error(
      data.error_description ||
        `${platform} authorization expired. Disconnect and reconnect it.`,
    );
  }

  account.accessToken = data.access_token;

  account.tokenExpiresAt = new Date(
    Date.now() +
      (Number(data.expires_in) || 3600) * 1000,
  );

  return account.accessToken;
}

/* =========================================================
   OWNER DETECTION
========================================================= */

function isFacebookOwner(account, from = {}) {
  const pageId =
    String(
      account.providerData?.pageId ||
        account.providerAccountId ||
        "",
    );

  const fromId = String(from?.id || "");

  return Boolean(
    pageId &&
      fromId &&
      pageId === fromId,
  );
}

function isInstagramOwner(account, username = "") {
  const ownUsername =
    String(
      account.providerData?.username ||
        account.providerData?.instagramUsername ||
        account.username ||
        "",
    )
      .trim()
      .toLowerCase();

  return Boolean(
    ownUsername &&
      String(username || "")
        .trim()
        .toLowerCase() === ownUsername,
  );
}

function isYouTubeOwner(account, snippet = {}) {
  const ownChannelId =
    String(
      account.providerData?.channelId ||
        account.providerAccountId ||
        "",
    );

  const authorChannelId =
    String(
      snippet.authorChannelId?.value ||
        snippet.authorChannelId ||
        "",
    );

  return Boolean(
    ownChannelId &&
      authorChannelId &&
      ownChannelId === authorChannelId,
  );
}

/* =========================================================
   NORMALIZE COMMENT ITEM
========================================================= */

function buildItem({
  id,
  platform,
  type = "Comment",
  author = "",
  text = "",
  createdAt = null,
  postId = "",
  postUrl = "",
  parentId = null,
  likes = 0,
  rating = null,
  ownerReply = "",
  ownerReplyCreatedAt = null,
  locationTitle = "",
  isOwner = false,
  canReply = true,
  canEdit = false,
  canDelete = false,
}) {
  return {
    id: String(id || ""),
    platform,
    type,
    author,
    text,
    createdAt,
    postId,
    postUrl,
    parentId,
    likes: Number(likes || 0),
    rating,
    ownerReply,
    ownerReplyCreatedAt,
    locationTitle,

    isOwner: Boolean(isOwner),
    isMine: Boolean(isOwner),
    fromMe: Boolean(isOwner),
    authorIsOwner: Boolean(isOwner),

    canReply: Boolean(canReply),
    canEdit: Boolean(canEdit),
    canDelete: Boolean(canDelete),
  };
}

/* =========================================================
   FACEBOOK FETCH
========================================================= */

async function fetchFacebookReplies(
  account,
  parentComment,
) {
  const token = graphToken(account);

  if (!token) {
    throw new Error(
      "Facebook Page access token is missing",
    );
  }

  const replies = await fetchGraphPages(
    `https://graph.facebook.com/${graphVersion()}/${encodeURIComponent(
      parentComment.id,
    )}/comments?fields=id,message,from,created_time,like_count&limit=100&access_token=${encodeURIComponent(
      token,
    )}`,
    5,
  );

  return replies.map((reply) => {
    const isOwner = isFacebookOwner(
      account,
      reply.from,
    );

    return buildItem({
      id: reply.id,
      platform: "Facebook",
      type: "Reply",
      author:
        reply.from?.name ||
        "Facebook user",
      text: reply.message || "",
      createdAt: reply.created_time,
      postId: parentComment.postId,
      postUrl: parentComment.postUrl || "",
      parentId: parentComment.id,
      likes: reply.like_count || 0,
      isOwner,
      canReply: true,
      canEdit: isOwner,
      canDelete: isOwner,
    });
  });
}

async function fetchFacebookComments(account) {
  const pageId =
    account.providerData?.pageId ||
    account.providerAccountId;

  const token = graphToken(account);

  if (!pageId) {
    throw new Error(
      "Facebook Page ID is missing",
    );
  }

  if (!token) {
    throw new Error(
      "Facebook Page access token is missing",
    );
  }

  const posts = await fetchGraphPages(
    `https://graph.facebook.com/${graphVersion()}/${encodeURIComponent(
      pageId,
    )}/feed?fields=id,message,created_time,permalink_url&limit=100&access_token=${encodeURIComponent(
      token,
    )}`,
    2,
  );

  const results = await Promise.all(
    posts.slice(0, 25).map(async (post) => {
      try {
        const comments = await fetchGraphPages(
          `https://graph.facebook.com/${graphVersion()}/${encodeURIComponent(
            post.id,
          )}/comments?fields=id,message,from,created_time,like_count&limit=100&access_token=${encodeURIComponent(
            token,
          )}`,
          5,
        );

        const rows = [];

        for (const comment of comments) {
          const isOwner = isFacebookOwner(
            account,
            comment.from,
          );

          const topLevel = buildItem({
            id: comment.id,
            platform: "Facebook",
            type: "Comment",
            author:
              comment.from?.name ||
              "Facebook user",
            text: comment.message || "",
            createdAt: comment.created_time,
            postId: post.id,
            postUrl:
              post.permalink_url || "",
            likes: comment.like_count || 0,
            isOwner,
            canReply: true,
            canEdit: isOwner,
            canDelete: isOwner,
          });

          rows.push(topLevel);

          try {
            const replies =
              await fetchFacebookReplies(
                account,
                topLevel,
              );

            rows.push(...replies);
          } catch (error) {
            console.error(
              `Facebook replies fetch failed for ${comment.id}:`,
              error.message,
            );
          }
        }

        return rows;
      } catch (error) {
        if (
          /missing permission|missing permissions/i.test(
            error.message || "",
          )
        ) {
          throw error;
        }
        console.error(
          `Facebook comments fetch failed for ${post.id}:`,
          error.message,
        );

        return [];
      }
    }),
  );

  return results.flat();
}

/* =========================================================
   INSTAGRAM FETCH
========================================================= */

async function fetchInstagramReplies(
  account,
  parentComment,
) {
  const token = graphToken(account);

  if (!token) {
    throw new Error(
      "Instagram access token is missing",
    );
  }

  const replies = await fetchGraphPages(
    `https://graph.facebook.com/${graphVersion()}/${encodeURIComponent(
      parentComment.id,
    )}/replies?fields=id,text,username,timestamp,like_count&limit=100&access_token=${encodeURIComponent(
      token,
    )}`,
    5,
  );

  return replies.map((reply) => {
    const isOwner = isInstagramOwner(
      account,
      reply.username,
    );

    return buildItem({
      id: reply.id,
      platform: "Instagram",
      type: "Reply",
      author:
        reply.username ||
        "Instagram user",
      text: reply.text || "",
      createdAt: reply.timestamp,
      postId: parentComment.postId,
      postUrl: parentComment.postUrl,
      parentId: parentComment.id,
      likes: reply.like_count || 0,
      isOwner,

      canReply: true,

      // Official API does not support editing Instagram comments
      canEdit: false,

      canDelete: isOwner,
    });
  });
}

async function fetchInstagramComments(account) {
  const instagramId =
    account.providerData?.instagramBusinessAccountId ||
    account.providerData?.instagramAccountId ||
    account.providerAccountId;

  const token = graphToken(account);

  if (!instagramId) {
    throw new Error(
      "Instagram account ID is missing",
    );
  }

  if (!token) {
    throw new Error(
      "Instagram access token is missing",
    );
  }

  const media = await fetchGraphPages(
    `https://graph.facebook.com/${graphVersion()}/${encodeURIComponent(
      instagramId,
    )}/media?fields=id,permalink,timestamp&limit=100&access_token=${encodeURIComponent(
      token,
    )}`,
    2,
  );

  const results = await Promise.all(
    media.slice(0, 25).map(async (post) => {
      try {
        const comments = await fetchGraphPages(
          `https://graph.facebook.com/${graphVersion()}/${encodeURIComponent(
            post.id,
          )}/comments?fields=id,text,username,timestamp,like_count&limit=100&access_token=${encodeURIComponent(
            token,
          )}`,
          5,
        );

        const rows = [];

        for (const comment of comments) {
          const isOwner = isInstagramOwner(
            account,
            comment.username,
          );

          const topLevel = buildItem({
            id: comment.id,
            platform: "Instagram",
            type: "Comment",
            author:
              comment.username ||
              "Instagram user",
            text: comment.text || "",
            createdAt: comment.timestamp,
            postId: post.id,
            postUrl: post.permalink || "",
            likes: comment.like_count || 0,
            isOwner,
            canReply: true,
            canEdit: false,
            canDelete: isOwner,
          });

          rows.push(topLevel);

          try {
            const replies =
              await fetchInstagramReplies(
                account,
                topLevel,
              );

            rows.push(...replies);
          } catch (error) {
            console.error(
              `Instagram replies fetch failed for ${comment.id}:`,
              error.message,
            );
          }
        }

        return rows;
      } catch (error) {
        if (
          /missing permission|missing permissions/i.test(
            error.message || "",
          )
        ) {
          throw error;
        }
        console.error(
          `Instagram comments fetch failed for ${post.id}:`,
          error.message,
        );

        return [];
      }
    }),
  );

  return results.flat();
}

/* =========================================================
   YOUTUBE FETCH
========================================================= */

async function fetchYouTubeComments(account) {
  const token =
    await refreshGoogleAccount(
      account,
      "YouTube",
    );

  const channelId =
    account.providerData?.channelId ||
    account.providerAccountId;

  if (!channelId) {
    throw new Error(
      "YouTube channel ID is missing",
    );
  }

  const channelData = await jsonFetch(
    `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${encodeURIComponent(channelId)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const uploadsPlaylistId =
    channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsPlaylistId) {
    throw new Error("YouTube uploads playlist was not found");
  }

  const videos = await fetchYouTubePages(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${encodeURIComponent(
      uploadsPlaylistId,
    )}&maxResults=15`,
    token,
    1,
  );

  const videoItems = videos
    .map((video) => video.contentDetails?.videoId)
    .filter(Boolean)
    .slice(0, 15);

  const results = await Promise.all(
    videoItems.map(async (videoId) => {
      try {
        const threads =
          await fetchYouTubePages(
            `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet,replies&videoId=${encodeURIComponent(
              videoId,
            )}&maxResults=100&order=time`,
            token,
            10,
          );

        const rows = [];

        for (const thread of threads) {
          const topComment =
            thread.snippet?.topLevelComment;

          if (!topComment?.id) {
            continue;
          }

          const snippet =
            topComment.snippet || {};

          const isOwner =
            isYouTubeOwner(
              account,
              snippet,
            );

          /*
            IMPORTANT:
            top-level comment ID = topComment.id

            thread.id ko reply/edit/delete ID ke liye
            use nahi karna chahiye.
          */

          const topLevel = buildItem({
            id: topComment.id,
            platform: "YouTube",
            type: "Comment",
            author:
              snippet.authorDisplayName ||
              "YouTube user",
            text:
              snippet.textDisplay ||
              snippet.textOriginal ||
              "",
            createdAt: snippet.publishedAt,
            postId: videoId,
            postUrl: `https://www.youtube.com/watch?v=${videoId}`,
            likes: snippet.likeCount || 0,
            isOwner,
            canReply: true,
            canEdit: isOwner,
            canDelete: isOwner,
          });

          rows.push(topLevel);

          let replies =
            safeArray(
              thread.replies?.comments,
            );

          const totalReplies =
            Number(
              thread.snippet?.totalReplyCount ||
                0,
            );

          /*
            Embedded replies API kabhi incomplete ho sakti hai.
          */

          if (
            totalReplies > replies.length
          ) {
            try {
              replies =
                await fetchYouTubePages(
                  `https://www.googleapis.com/youtube/v3/comments?part=snippet&parentId=${encodeURIComponent(
                    topComment.id,
                  )}&maxResults=100`,
                  token,
                  10,
                );
            } catch (error) {
              console.error(
                `YouTube replies fetch failed for ${topComment.id}:`,
                error.message,
              );
            }
          }

          for (const reply of replies) {
            const replySnippet =
              reply.snippet || {};

            const replyIsOwner =
              isYouTubeOwner(
                account,
                replySnippet,
              );

            rows.push(
              buildItem({
                id: reply.id,
                platform: "YouTube",
                type: "Reply",
                author:
                  replySnippet.authorDisplayName ||
                  "YouTube user",
                text:
                  replySnippet.textDisplay ||
                  replySnippet.textOriginal ||
                  "",
                createdAt:
                  replySnippet.publishedAt,
                postId: videoId,
                postUrl: `https://www.youtube.com/watch?v=${videoId}`,
                parentId: topComment.id,
                likes:
                  replySnippet.likeCount || 0,
                isOwner: replyIsOwner,
                canReply: true,
                canEdit: replyIsOwner,
                canDelete: replyIsOwner,
              }),
            );
          }
        }

        return rows;
      } catch (error) {
        if (
          error.message
            .toLowerCase()
            .includes("disabled")
        ) {
          return [];
        }

        throw error;
      }
    }),
  );

  return results.flat();
}

/* =========================================================
   GOOGLE BUSINESS FETCH
========================================================= */

async function fetchGoogleBusinessReviewsForAccount(
  account,
) {
  const token =
    await refreshGoogleAccount(
      account,
      "Google Business",
    );

  const locations =
    safeArray(
      account.providerData?.locations,
    ).length > 0
      ? account.providerData.locations
      : [
          {
            name:
              account.providerData
                ?.locationName,
            title:
              account.providerData
                ?.locationTitle,
          },
        ];

  const result = await Promise.all(
    locations
      .filter(
        (location) =>
          cleanText(location?.name),
      )
      .map(async (location) => {
        const locationName =
          cleanText(location.name);

        const data = await jsonFetch(
          `https://mybusiness.googleapis.com/v4/${locationName}/reviews?pageSize=50&orderBy=updateTime%20desc`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        return safeArray(
          data.reviews,
        ).map((review) => {
          const reviewName =
            review.name || "";

          return buildItem({
            id: reviewName,
            platform: "Google Business",
            type: "Review",
            author:
              review.reviewer
                ?.displayName ||
              "Google user",
            text: review.comment || "",
            createdAt:
              review.createTime ||
              review.updateTime,
            postId: locationName,
            parentId: null,
            rating: review.starRating || null,
            ownerReply:
              review.reviewReply
                ?.comment || "",
            ownerReplyCreatedAt:
              review.reviewReply
                ?.updateTime || null,
            locationTitle:
              location.title || "",

            /*
              Google Business review:
              Customer review ko edit/delete nahi.
            */

            isOwner: false,
            canReply: true,
            canEdit: false,
            canDelete: false,
          });
        });
      }),
  );

  return result.flat();
}

/* =========================================================
   MUTATE COMMENT / REPLY
========================================================= */

async function mutateComment(
  user,
  platform,
  commentId,
  action,
  text = "",
) {
  const resolvedPlatform =
    canonicalPlatformName(platform);

  const account =
    accountFor(
      user,
      resolvedPlatform,
    );

  if (!account) {
    throw new Error(
      `${resolvedPlatform || platform} account is not connected`,
    );
  }

  const resourceId =
    cleanText(commentId);

  if (!resourceId) {
    throw new Error(
      "Comment or reply id is required",
    );
  }

  /* =========================
     FACEBOOK
  ========================= */

  if (
    resolvedPlatform === "Facebook"
  ) {
    const token =
      graphToken(account);

    if (!token) {
      throw new Error(
        "Facebook Page access token is missing",
      );
    }

    if (action === "reply") {
      return providerRequest(
        `https://graph.facebook.com/${graphVersion()}/${encodeURIComponent(
          resourceId,
        )}/comments`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },

          body: new URLSearchParams({
            message: text,
            access_token: token,
          }),
        },
      );
    }

    if (action === "edit") {
      return providerRequest(
        `https://graph.facebook.com/${graphVersion()}/${encodeURIComponent(
          resourceId,
        )}`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },

          body: new URLSearchParams({
            message: text,
            access_token: token,
          }),
        },
      );
    }

    if (action === "delete") {
      const response =
        await fetch(
          `https://graph.facebook.com/${graphVersion()}/${encodeURIComponent(
            resourceId,
          )}?access_token=${encodeURIComponent(
            token,
          )}`,
          {
            method: "DELETE",
          },
        );

      if (!response.ok) {
        const data =
          await response
            .json()
            .catch(() => ({}));

        throw new Error(
          data.error?.message ||
            "Facebook comment deletion failed",
        );
      }

      return {
        success: true,
      };
    }
  }

  /* =========================
     INSTAGRAM
  ========================= */

  if (
    resolvedPlatform === "Instagram"
  ) {
    const token =
      graphToken(account);

    if (!token) {
      throw new Error(
        "Instagram access token is missing",
      );
    }

    if (action === "reply") {
      const query = new URLSearchParams({
        message: text,
        access_token: token,
      });
      return providerRequest(
        `https://graph.facebook.com/${graphVersion()}/${encodeURIComponent(
          resourceId,
        )}/replies?${query.toString()}`,
        {
          method: "POST",
        },
      );
    }

    if (action === "edit") {
      throw new Error(
        "Instagram comment editing is not supported by the official API.",
      );
    }

    if (action === "delete") {
      const response =
        await fetch(
          `https://graph.facebook.com/${graphVersion()}/${encodeURIComponent(
            resourceId,
          )}?access_token=${encodeURIComponent(
            token,
          )}`,
          {
            method: "DELETE",
          },
        );

      if (!response.ok) {
        const data =
          await response
            .json()
            .catch(() => ({}));

        throw new Error(
          data.error?.message ||
            "Instagram comment deletion failed",
        );
      }

      return {
        success: true,
      };
    }
  }

  /* =========================
     YOUTUBE
  ========================= */

  if (
    resolvedPlatform === "YouTube"
  ) {
    const token =
      await refreshGoogleAccount(
        account,
        "YouTube",
      );

    if (action === "reply") {
      return providerRequest(
        "https://www.googleapis.com/youtube/v3/comments?part=snippet",
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            snippet: {
              parentId: resourceId,
              textOriginal: text,
            },
          }),
        },
      );
    }

    if (action === "edit") {
      return providerRequest(
        "https://www.googleapis.com/youtube/v3/comments?part=snippet",
        {
          method: "PUT",

          headers: {
            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            id: resourceId,

            snippet: {
              textOriginal: text,
            },
          }),
        },
      );
    }

    if (action === "delete") {
      const response =
        await fetch(
          `https://www.googleapis.com/youtube/v3/comments?id=${encodeURIComponent(
            resourceId,
          )}`,
          {
            method: "DELETE",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          },
        );

      if (!response.ok) {
        const data =
          await response
            .json()
            .catch(() => ({}));

        throw new Error(
          data.error?.message ||
            "YouTube comment deletion failed",
        );
      }

      return {
        success: true,
      };
    }
  }

  /* =========================
     GOOGLE BUSINESS
  ========================= */

  if (
    resolvedPlatform ===
    "Google Business"
  ) {
    const token =
      await refreshGoogleAccount(
        account,
        "Google Business",
      );

    const replyUrl =
      `https://mybusiness.googleapis.com/v4/${resourceId}/reply`;

    /*
      Google Business API:
      PUT /reply
      - new owner reply
      - existing owner reply update
    */

    if (
      action === "reply" ||
      action === "edit"
    ) {
      return providerRequest(
        replyUrl,
        {
          method: "PUT",

          headers: {
            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            comment: text,
          }),
        },
      );
    }

    if (action === "delete") {
      const response =
        await fetch(
          replyUrl,
          {
            method: "DELETE",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          },
        );

      if (!response.ok) {
        const data =
          await response
            .json()
            .catch(() => ({}));

        throw new Error(
          data.error?.message ||
            `Google Business reply deletion failed (${response.status})`,
        );
      }

      return {
        success: true,
      };
    }
  }

  throw new Error(
    `${resolvedPlatform || platform} comment actions are not supported.`,
  );
}

/* =========================================================
   AUTH USER
========================================================= */

async function getUserWithTokens(request) {
  const user =
    await User.findById(
      request.user._id,
    ).select(
      "+socialAccounts.accessToken +socialAccounts.refreshToken",
    );

  if (!user) {
    throw new Error(
      "User not found",
    );
  }

  return user;
}

async function saveUserIfChanged(user) {
  if (
    user.isModified?.(
      "socialAccounts",
    ) ||
    user.isModified?.(
      "autoReplyHistory",
    )
  ) {
    await user.save();
  }
}

/* =========================================================
   GET ENGAGEMENT
========================================================= */

router.get(
  "/",
  requireAuth,
  async (
    request,
    response,
    next,
  ) => {
    try {
      response.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate",
      );

      response.set(
        "Pragma",
        "no-cache",
      );

      response.set(
        "Expires",
        "0",
      );

      const user =
        await getUserWithTokens(
          request,
        );

      const providerResults =
        await Promise.all(
          ALL_PLATFORMS.map(
            async (platform) => {
              const account =
                accountFor(
                  user,
                  platform,
                );

              if (!account) {
                return {
                  platform,
                  connected: false,
                  supported:
                    COMMENT_PLATFORMS.includes(
                      platform,
                    ),
                  items: [],
                  error:
                    "Account not connected",
                };
              }

              try {
                let providerItems =
                  [];

                if (
                  platform ===
                  "Facebook"
                ) {
                  providerItems =
                    await fetchFacebookComments(
                      account,
                    );
                } else if (
                  platform ===
                  "Instagram"
                ) {
                  providerItems =
                    await fetchInstagramComments(
                      account,
                    );
                } else if (
                  platform ===
                  "YouTube"
                ) {
                  providerItems =
                    await fetchYouTubeComments(
                      account,
                    );
                } else if (
                  platform ===
                  "Google Business"
                ) {
                  providerItems =
                    await fetchGoogleBusinessReviewsForAccount(
                      account,
                    );
                } else {
                  throw new Error(
                    "Official comment inbox integration is not available for this platform.",
                  );
                }

                return {
                  platform,
                  connected: true,
                  supported: true,
                  items:
                    providerItems,
                };
              } catch (error) {
                return {
                  platform,
                  connected: true,

                  supported:
                    COMMENT_PLATFORMS.includes(
                      platform,
                    ),

                  items: [],

                  error:
                    error.message,
                };
              }
            },
          ),
        );

      const items =
        providerResults.flatMap(
          (provider) =>
            safeArray(
              provider.items,
            ),
        );

      await saveUserIfChanged(
        user,
      );

      items.sort(
        (a, b) =>
          new Date(
            b.createdAt || 0,
          ) -
          new Date(
            a.createdAt || 0,
          ),
      );

      response.json({
        success: true,

        refreshedAt:
          new Date().toISOString(),

        items,

        providers:
          providerResults,

        capabilities: {
          comments:
            COMMENT_PLATFORMS,

          mentions: [],

          messages: [],

          notifications: [],
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

/* =========================================================
   REPLY
   POST /engagement/:platform/:commentId/reply

   commentId can be:
   - original comment ID
   - reply ID

   This allows replying to comments and replies.
========================================================= */

router.post(
  "/:platform/:commentId/reply",
  requireAuth,
  async (
    request,
    response,
    next,
  ) => {
    try {
      const text =
        cleanText(
          request.body?.text,
        );

      if (!text) {
        return response
          .status(400)
          .json({
            success: false,
            message:
              "Reply text is required",
          });
      }

      if (text.length > 10000) {
        return response
          .status(400)
          .json({
            success: false,
            message:
              "Reply is too long",
          });
      }

      const user =
        await getUserWithTokens(
          request,
        );

      const result =
        await mutateComment(
          user,
          request.params.platform,
          request.params.commentId,
          "reply",
          text,
        );

      await saveUserIfChanged(
        user,
      );

      response.json({
        success: true,
        result,
      });
    } catch (error) {
      next(error);
    }
  },
);

/* =========================================================
   EDIT
   PATCH /engagement/:platform/:commentId
========================================================= */

router.patch(
  "/:platform/:commentId",
  requireAuth,
  async (
    request,
    response,
    next,
  ) => {
    try {
      const text =
        cleanText(
          request.body?.text,
        );

      if (!text) {
        return response
          .status(400)
          .json({
            success: false,
            message:
              "Comment text is required",
          });
      }

      if (text.length > 10000) {
        return response
          .status(400)
          .json({
            success: false,
            message:
              "Comment is too long",
          });
      }

      const user =
        await getUserWithTokens(
          request,
        );

      const result =
        await mutateComment(
          user,
          request.params.platform,
          request.params.commentId,
          "edit",
          text,
        );

      await saveUserIfChanged(
        user,
      );

      response.json({
        success: true,
        result,
      });
    } catch (error) {
      next(error);
    }
  },
);

/* =========================================================
   DELETE
   DELETE /engagement/:platform/:commentId
========================================================= */

router.delete(
  "/:platform/:commentId",
  requireAuth,
  async (
    request,
    response,
    next,
  ) => {
    try {
      const user =
        await getUserWithTokens(
          request,
        );

      const result =
        await mutateComment(
          user,
          request.params.platform,
          request.params.commentId,
          "delete",
        );

      await saveUserIfChanged(
        user,
      );

      response.json({
        success: true,
        result,
      });
    } catch (error) {
      next(error);
    }
  },
);

/* =========================================================
   AUTO REPLY
========================================================= */

async function fetchPlatformItems(
  account,
  platform,
) {
  if (
    platform ===
    "Facebook"
  ) {
    return fetchFacebookComments(
      account,
    );
  }

  if (
    platform ===
    "Instagram"
  ) {
    return fetchInstagramComments(
      account,
    );
  }

  if (
    platform ===
    "YouTube"
  ) {
    return fetchYouTubeComments(
      account,
    );
  }

  if (
    platform ===
    "Google Business"
  ) {
    return fetchGoogleBusinessReviewsForAccount(
      account,
    );
  }

  return [];
}

async function runAutoReplies() {
  if (
    runAutoReplies.running
  ) {
    return;
  }

  runAutoReplies.running =
    true;

  try {
    const users =
      await User.find({
        "autoReply.enabled": true,
      }).select(
        "+socialAccounts.accessToken +socialAccounts.refreshToken",
      );

    for (const user of users) {
      const settings =
        user.autoReply || {};

      const replyText =
        cleanText(
          settings.text,
        );

      if (!replyText) {
        continue;
      }

      if (
        !Array.isArray(
          user.autoReplyHistory,
        )
      ) {
        user.autoReplyHistory = [];
      }

      const platforms =
        Array.isArray(
          settings.platforms,
        ) &&
        settings.platforms.length
          ? settings.platforms
          : COMMENT_PLATFORMS;

      const historyKeys =
        new Set(
          user.autoReplyHistory.map(
            (entry) =>
              `${canonicalPlatformName(
                entry.platform,
              )}:${entry.itemId}`,
          ),
        );

      for (const rawPlatform of platforms) {
        const platform =
          canonicalPlatformName(
            rawPlatform,
          );

        if (
          !COMMENT_PLATFORMS.includes(
            platform,
          )
        ) {
          continue;
        }

        if (isAutoReplyBlocked(user, platform)) {
          continue;
        }

        const account =
          accountFor(
            user,
            platform,
          );

        if (!account) {
          continue;
        }

        let items = [];

        try {
          items =
            await fetchPlatformItems(
              account,
              platform,
            );
        } catch (error) {
          console.error(
            `Auto-reply fetch failed for ${platform}:`,
            error.message,
          );
          if (
            /missing permission|missing permissions|quota exceeded|quota metric/i.test(
              error.message,
            )
          ) {
            blockAutoReply(user, platform);
            console.error(
              `Auto-reply paused for ${platform} for 10 minutes:`,
              error.message,
            );
          }

          continue;
        }


        for (const item of items) {
          const itemId =
            cleanText(item.id);

          const itemText =
            cleanText(item.text);

          if (
            !itemId ||
            !itemText
          ) {
            continue;
          }

          /*
            Instagram only supports replies to top-level
            comments. Replying to an existing reply causes
            the Graph API response-format error.
          */
          if (
            platform === "Instagram" &&
            item.parentId
          ) {
            continue;
          }

          /*
            Never reply to ourselves
          */

          if (
            item.isOwner ||
            item.isMine ||
            item.fromMe ||
            item.authorIsOwner
          ) {
            continue;
          }

          /*
            Google Business:
            existing owner reply means already answered.
          */

          if (
            platform ===
              "Google Business" &&
            cleanText(
              item.ownerReply,
            )
          ) {
            continue;
          }

          const key =
            `${platform}:${itemId}`;

          /*
            Prevent duplicate reply.

            every_new:
            still prevents same ID in the
            current persisted history.
          */

          if (
            historyKeys.has(key)
          ) {
            continue;
          }

          try {
            await mutateComment(
              user,
              platform,
              itemId,
              "reply",
              replyText,
            );

            user.autoReplyHistory.push({
              platform,
              itemId,
              repliedAt:
                new Date(),
            });

            historyKeys.add(
              key,
            );
          } catch (error) {
            console.error(
              `Auto-reply failed for ${platform} ${itemId}:`,
              error.message,
            );
            if (
              /permission is missing|missing permissions|quota exceeded|quota metric/i.test(
                error.message,
              )
            ) {
              blockAutoReply(user, platform);
              console.error(
                `Auto-reply paused for ${platform} for 10 minutes:`,
                error.message,
              );
              break;
            }
          }
        }
      }

      await saveUserIfChanged(
        user,
      );
    }
  } catch (error) {
    console.error(
      "Auto-reply worker failed:",
      error.message,
    );
  } finally {
    runAutoReplies.running =
      false;
  }
}

router.runAutoReplies =
  runAutoReplies; 

module.exports = router;