import SecurityActivity from "../models/security-activity.model.js";

function requestIp(req) {
  return String(req?.ip || req?.socket?.remoteAddress || "").slice(0, 128);
}

function userAgent(req) {
  return String(req?.get?.("user-agent") || "").slice(0, 512);
}

export async function logSecurityActivity({
  req,
  event,
  success,
  userId = null,
}) {
  try {
    await SecurityActivity.create({
      event,
      success: Boolean(success),
      tenantId: req?.tenantId || null,
      userId: userId ? String(userId) : null,
      ip: requestIp(req),
      userAgent: userAgent(req),
      timestamp: new Date(),
    });
  } catch (error) {
    // Security logging must never turn an otherwise safe auth response into a 500.
    console.error("Security activity logging failed:", error.message);
  }
}

export async function listSecurityActivity({
  userId,
  event,
  success,
  page = 1,
  limit = 50,
} = {}) {
  const safePage = Math.min(Math.max(Number(page) || 1, 1), 10000);
  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);
  const query = {};
  if (userId) query.userId = String(userId);
  if (event) query.event = String(event).slice(0, 80);
  if (success === true || success === false) query.success = success;

  const [activities, total] = await Promise.all([
    SecurityActivity.find(query)
      .sort({ timestamp: -1, _id: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .select("-_id event success userId ip userAgent timestamp")
      .lean(),
    SecurityActivity.countDocuments(query),
  ]);

  return {
    activities,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      pages: Math.max(Math.ceil(total / safeLimit), 1),
    },
  };
}
