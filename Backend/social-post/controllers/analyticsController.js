const express = require("express");
const requireAuth = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();
const graphVersion = () => process.env.META_GRAPH_VERSION || "v23.0";

function accountFor(user, platform) {
  return (user.socialAccounts || []).find((account) => account.platform === platform);
}

async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error?.message || data.error_description || "Provider analytics request failed");
    return data;
  } catch (error) {
    if (error.name === "AbortError") throw new Error("Analytics provider request timed out");
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function refreshGoogleToken(account, platform) {
  if (!account.refreshToken) return account.accessToken;
  if (account.tokenExpiresAt && account.tokenExpiresAt.getTime() > Date.now() + 60_000) return account.accessToken;
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: account.refreshToken,
      client_id: platform === "YouTube" ? process.env.YOUTUBE_CLIENT_ID : process.env.GOOGLE_BUSINESS_CLIENT_ID,
      client_secret: platform === "YouTube" ? process.env.YOUTUBE_CLIENT_SECRET : process.env.GOOGLE_BUSINESS_CLIENT_SECRET,
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.access_token) throw new Error(data.error_description || `${platform} authorization expired. Reconnect it.`);
  account.accessToken = data.access_token;
  account.tokenExpiresAt = new Date(Date.now() + (data.expires_in || 3600) * 1000);
  return account.accessToken;
}

function rangeDates(range) {
  const days = range === "7" ? 7 : 30;
  const end = new Date();
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - days + 1);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

function emptyMetrics() {
  return {
    views: 0,
    reach: 0,
    impressions: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    followers: null,
    engagementRate: null,
  };
}

async function fetchYouTubeAnalytics(account, range) {
  const token = await refreshGoogleToken(account, "YouTube");
  const { start, end } = rangeDates(range);
  const data = await fetchJson(
    `https://youtubeanalytics.googleapis.com/v2/reports?dimensions=day&startDate=${start}&endDate=${end}&metrics=views,likes,comments,shares,estimatedMinutesWatched,subscribersGained&ids=channel==${encodeURIComponent(account.providerAccountId)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const metrics = emptyMetrics();
  const rows = (data.rows || []).map((row) => ({
    date: row[0],
    views: row[1] || 0,
    likes: row[2] || 0,
    comments: row[3] || 0,
    shares: row[4] || 0,
    watchMinutes: row[5] || 0,
    subscribersGained: row[6] || 0,
  }));
  rows.forEach((row) => {
    metrics.views += row.views;
    metrics.likes += row.likes;
    metrics.comments += row.comments;
    metrics.shares += row.shares;
  });
  metrics.engagementRate = metrics.views
    ? Number((((metrics.likes + metrics.comments + metrics.shares) / metrics.views) * 100).toFixed(2))
    : 0;
  return { platform: "YouTube", supported: true, metrics, series: rows };
}

async function fetchMetaAnalytics(account, platform, range) {
  const token = account.providerData?.pageAccessToken || account.accessToken;
  const objectId = platform === "Instagram"
    ? account.providerAccountId
    : account.providerData?.pageId || account.providerAccountId;
  const { start, end } = rangeDates(range);
  const metrics = emptyMetrics();
  const metricNames = platform === "Instagram"
    ? "impressions,reach,likes,comments,saved,shares"
    : "page_impressions,page_post_engagements,page_fans";
  const data = await fetchJson(
    `https://graph.facebook.com/${graphVersion()}/${objectId}/insights?metric=${metricNames}&period=day&since=${start}&until=${end}&access_token=${encodeURIComponent(token)}`,
  );
  const seriesMap = new Map();
  for (const metric of data.data || []) {
    const values = metric.values || [];
    for (const value of values) {
      const date = value.end_time?.slice(0, 10) || "unknown";
      const row = seriesMap.get(date) || { date, impressions: 0, reach: 0, engagement: 0 };
      const amount = Number(value.value || 0);
      if (metric.name.includes("impression")) {
        metrics.impressions += amount;
        row.impressions += amount;
      } else if (metric.name === "reach") {
        metrics.reach += amount;
        row.reach += amount;
      } else if (metric.name === "page_post_engagements" || ["likes", "comments", "saved", "shares"].includes(metric.name)) {
        metrics.likes += metric.name === "likes" ? amount : 0;
        metrics.comments += metric.name === "comments" ? amount : 0;
        metrics.shares += ["shares", "saved", "page_post_engagements"].includes(metric.name) ? amount : 0;
        row.engagement += amount;
      } else if (metric.name === "page_fans") {
        metrics.followers = amount;
      }
      seriesMap.set(date, row);
    }
  }
  const denominator = metrics.reach || metrics.impressions;
  metrics.engagementRate = denominator
    ? Number((((metrics.likes + metrics.comments + metrics.shares) / denominator) * 100).toFixed(2))
    : null;
  return { platform, supported: true, metrics, series: [...seriesMap.values()] };
}

router.get("/", requireAuth, async (request, response, next) => {
  try {
    const range = request.query.range === "7" ? "7" : "30";
    const user = await User.findById(request.user._id).select("+socialAccounts.accessToken +socialAccounts.refreshToken");
    const platforms = ["Facebook", "Instagram", "YouTube", "X", "LinkedIn", "Google Business"];
    const results = await Promise.all(platforms.map(async (platform) => {
      const account = accountFor(user, platform);
      if (!account) return { platform, connected: false, supported: false, metrics: emptyMetrics(), series: [], error: "Account not connected" };
      try {
        if (platform === "Facebook" || platform === "Instagram") {
          return { connected: true, ...(await fetchMetaAnalytics(account, platform, range)) };
        }
        if (platform === "YouTube") return { connected: true, ...(await fetchYouTubeAnalytics(account, range)) };
        return {
          platform,
          connected: true,
          supported: false,
          metrics: emptyMetrics(),
          series: [],
          error: "Official analytics API is not configured for this platform.",
        };
      } catch (error) {
        return { platform, connected: true, supported: true, metrics: emptyMetrics(), series: [], error: error.message };
      }
    }));
    const supported = results.filter((item) => item.supported && !item.error);
    const totals = supported.reduce((sum, item) => {
      for (const key of ["views", "reach", "impressions", "likes", "comments", "shares"]) sum[key] += item.metrics[key] || 0;
      return sum;
    }, emptyMetrics());
    const denominator = totals.reach || totals.impressions || totals.views;
    totals.engagementRate = denominator
      ? Number((((totals.likes + totals.comments + totals.shares) / denominator) * 100).toFixed(2))
      : null;
    if (user.isModified?.("socialAccounts")) await user.save();
    response.json({ success: true, range, refreshedAt: new Date().toISOString(), totals, providers: results });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
