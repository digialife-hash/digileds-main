import mongoose from "mongoose";
import { VisitorActivity } from "../models/index.js";

const ACTIVE_WINDOW_MS = 2 * 60 * 1000;

function getClientIp(req) {
  const candidates = [
    ["CF-Connecting-IP", req.get("cf-connecting-ip")],
    ["X-Real-IP", req.get("x-real-ip")],
    ["X-Forwarded-For", req.get("x-forwarded-for")?.split(",")[0]],
    ["socket", req.socket?.remoteAddress],
    ["express", req.ip],
  ];
  const found = candidates.find(([, value]) => value && value.trim());
  return {
    value: (found?.[1] || "Unavailable").trim().replace(/^::ffff:/, ""),
    source: found?.[0] || "Unavailable",
  };
}

function getDeviceInfo(userAgent) {
  const browser = /Edg/i.test(userAgent)
    ? "Edge"
    : /Chrome/i.test(userAgent)
      ? "Chrome"
      : /Firefox/i.test(userAgent)
        ? "Firefox"
        : /Safari/i.test(userAgent)
          ? "Safari"
          : "Unknown";
  const operatingSystem = /Windows/i.test(userAgent)
    ? "Windows"
    : /Android/i.test(userAgent)
      ? "Android"
      : /iPhone|iPad|iOS/i.test(userAgent)
        ? "iOS"
        : /Mac OS/i.test(userAgent)
          ? "macOS"
          : /Linux/i.test(userAgent)
            ? "Linux"
            : "Unknown";
  const device = /Mobi|Android|iPhone|iPad/i.test(userAgent)
    ? "Mobile"
    : "Desktop";
  return { browser, operatingSystem, device };
}

export async function trackVisitor(req, res, next) {
  try {
    const body = req.body || {};
    const visitorId = String(body.visitorId || "").slice(0, 120);
    const sessionId = String(body.sessionId || "").slice(0, 120);
    if (!visitorId || !sessionId) {
      return res
        .status(400)
        .json({ success: false, message: "Visitor identity is required." });
    }
    const path = String(body.path || "/").slice(0, 500);
    const event =
      body.event === "heartbeat"
        ? "heartbeat"
        : body.event === "offline"
          ? "offline"
          : "page_view";
    const isRefresh = body.isRefresh === true;
    const now = new Date();
    const userAgent = String(req.get("user-agent") || "").slice(0, 500);
    const deviceInfo = getDeviceInfo(userAgent);
    const clientIp = getClientIp(req);
    const existing = await VisitorActivity.findOne({
      tenantId: req.tenantId,
      visitorId,
    });
    const day = now.toISOString().slice(0, 10);
    const countPageView = event === "page_view" && !isRefresh;
    const pageViewsToday = countPageView
      ? existing?.pageViewsDay === day
        ? (existing.pageViewsToday || 0) + 1
        : 1
      : existing?.pageViewsDay === day
        ? existing.pageViewsToday || 0
        : 0;
    const pageTimeSeconds = Object.fromEntries(existing?.pageTimeSeconds || []);
    const pageViewCounts = Object.fromEntries(existing?.pageViewCounts || []);
    if (
      event === "page_view" &&
      existing?.path &&
      existing.currentPageStartedAt
    ) {
      const elapsedSeconds = Math.min(
        30 * 60,
        Math.max(0, Math.round((now - existing.currentPageStartedAt) / 1000)),
      );
      pageTimeSeconds[existing.path] =
        (pageTimeSeconds[existing.path] || 0) + elapsedSeconds;
    }
    if (countPageView) {
      pageViewCounts[path] = (pageViewCounts[path] || 0) + 1;
    }

    await VisitorActivity.findOneAndUpdate(
      { tenantId: req.tenantId, visitorId },
      {
        $set: {
          tenantId: req.tenantId,
          sessionId,
          event,
          isRefresh,
          path,
          title: String(body.title || "").slice(0, 200),
          referrer: String(body.referrer || "").slice(0, 500),
          ip: clientIp.value,
          ipSource: clientIp.source,
          userAgent,
          language: String(body.language || "").slice(0, 100),
          screen: String(body.screen || "").slice(0, 50),
          timezone: String(body.timezone || "").slice(0, 100),
          platform: String(body.platform || "").slice(0, 200),
          vendor: String(body.vendor || "").slice(0, 200),
          cpuCores: Number.isFinite(Number(body.cpuCores))
            ? Number(body.cpuCores)
            : null,
          memoryGb: Number.isFinite(Number(body.memoryGb))
            ? Number(body.memoryGb)
            : null,
          touchPoints: Number.isFinite(Number(body.touchPoints))
            ? Number(body.touchPoints)
            : 0,
          online: event !== "offline" && body.online !== false,
          pageViewCounts,
          pageTimeSeconds,
          currentPageStartedAt:
            event === "page_view" ? now : existing?.currentPageStartedAt || now,
          ...deviceInfo,
          lastSeen: event === "offline" ? existing?.lastSeen || now : now,
          pageViewsToday,
          pageViewsDay: day,
        },
        $addToSet: { pagesVisited: path },
        $inc: { pageViews: countPageView ? 1 : 0 },
        $setOnInsert: { firstSeen: now, createdAt: now },
      },
      { upsert: true, new: true },
    );

    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}

export async function getVisitorAnalytics(req, res, next) {
  try {
    const activeSince = new Date(Date.now() - ACTIVE_WINDOW_MS);
    const activeVisitors = await VisitorActivity.countDocuments({
      tenantId: req.tenantId,
      lastSeen: { $gte: activeSince },
      online: { $ne: false },
    });
    const recentActivity = await VisitorActivity.find({ tenantId: req.tenantId })
      .sort({ lastSeen: -1 })
      .limit(500)
      .lean();
    const today = new Date().toISOString().slice(0, 10);
    const totalToday = recentActivity.reduce(
      (total, item) =>
        total + (item.pageViewsDay === today ? item.pageViewsToday || 0 : 0),
      0,
    );
    const browserCounts = {};
    const pageViews = {};
    const pageTimes = {};
    for (const visitor of recentActivity) {
      browserCounts[visitor.browser || "Unknown"] =
        (browserCounts[visitor.browser || "Unknown"] || 0) + 1;
      for (const [page, count] of Object.entries(
        visitor.pageViewCounts || {},
      )) {
        pageViews[page] = (pageViews[page] || 0) + count;
      }
      for (const [page, seconds] of Object.entries(
        visitor.pageTimeSeconds || {},
      )) {
        pageTimes[page] = (pageTimes[page] || 0) + seconds;
      }
    }
    const mostUsedBrowser = Object.entries(browserCounts).sort(
      (a, b) => b[1] - a[1],
    )[0] || ["Unavailable", 0];
    const mostViewedPage = Object.entries(pageViews).sort(
      (a, b) => b[1] - a[1],
    )[0] || ["Unavailable", 0];
    const longestPage = Object.entries(pageTimes).sort(
      (a, b) => b[1] - a[1],
    )[0] || ["Unavailable", 0];
    const leastViewedPages = Object.entries(pageViews)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 5)
      .map(([page, views]) => ({ page, views }));

    return res.json({
      success: true,
      data: {
        activeVisitors,
        pageViewsToday: totalToday,
        browserStats: {
          mostUsed: {
            browser: mostUsedBrowser[0],
            visitors: mostUsedBrowser[1],
          },
          breakdown: Object.entries(browserCounts).map(
            ([browser, visitors]) => ({ browser, visitors }),
          ),
        },
        pageStats: {
          mostViewed: { page: mostViewedPage[0], views: mostViewedPage[1] },
          longestTime: { page: longestPage[0], seconds: longestPage[1] },
          leastViewed: leastViewedPages,
        },
        activeWindowSeconds: ACTIVE_WINDOW_MS / 1000,
        recentActivity: recentActivity.map(({ _id, ...item }) => ({
          id: String(_id),
          ...item,
          isActive: Boolean(
            item.online !== false &&
            item.lastSeen &&
            new Date(item.lastSeen).getTime() >= activeSince.getTime(),
          ),
        })),
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getPublicVisitorSummary(req, res, next) {
  try {
    const activeSince = new Date(Date.now() - ACTIVE_WINDOW_MS);
    const [totalVisitors, activeVisitors, visitors] = await Promise.all([
      VisitorActivity.countDocuments({ tenantId: req.tenantId }),
      VisitorActivity.countDocuments({
        tenantId: req.tenantId,
        lastSeen: { $gte: activeSince },
        online: { $ne: false },
      }),
      VisitorActivity.find(
        { tenantId: req.tenantId },
        { pageViewCounts: 1, pageViews: 1 },
      ).lean(),
    ]);

    const pageViews = {};
    let totalPageViews = 0;
    for (const visitor of visitors) {
      totalPageViews += Number(visitor.pageViews || 0);
      for (const [page, count] of Object.entries(
        visitor.pageViewCounts || {},
      )) {
        pageViews[page] = (pageViews[page] || 0) + Number(count || 0);
      }
    }

    const topPages = Object.entries(pageViews)
      .sort(([, first], [, second]) => second - first)
      .slice(0, 2)
      .map(([page, views]) => ({ page, views }));

    return res.json({
      success: true,
      data: {
        totalVisitors,
        totalPageViews,
        activeVisitors,
        activities: [
          ...(activeVisitors > 0
            ? [
                {
                  type: "live",
                  label: `${activeVisitors} visitor${activeVisitors === 1 ? "" : "s"} online now`,
                },
              ]
            : []),
          ...topPages.map((item) => ({
            type: "popular",
            label: `${item.page === "/" ? "Home page" : item.page} viewed ${item.views} time${item.views === 1 ? "" : "s"}`,
          })),
        ].slice(0, 2),
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteVisitor(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid visitor id." });
    }

    const result = await VisitorActivity.deleteOne({
      _id: req.params.id,
      tenantId: req.tenantId,
    });
    if (!result.deletedCount) {
      return res
        .status(404)
        .json({ success: false, message: "Visitor record not found." });
    }
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
}

export async function deleteAllVisitors(_req, res, next) {
  try {
    const result = await VisitorActivity.deleteMany({
      tenantId: req.tenantId,
    });
    return res.json({ success: true, deletedCount: result.deletedCount });
  } catch (error) {
    return next(error);
  }
}
