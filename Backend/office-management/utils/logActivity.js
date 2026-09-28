import ActivityLog from "../models/ActivityLog.js";

const sensitiveKeys = new Set([
  "password",
  "currentPassword",
  "newPassword",
  "confirmPassword",
  "token",
  "accessToken",
  "refreshToken",
  "authorization",
  "cookie",
]);

const sanitizeMetadata = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeMetadata(item));
  }

  if (value && typeof value === "object") {
    return Object.entries(value).reduce((cleaned, [key, nestedValue]) => {
      if (sensitiveKeys.has(key)) return cleaned;

      cleaned[key] = sanitizeMetadata(nestedValue);
      return cleaned;
    }, {});
  }

  return value;
};

const logActivity = async ({
  req,
  action,
  module,
  targetId = null,
  targetModel = "",
  description = "",
  metadata = {},
} = {}) => {
  try {
    if (!action || !module) return;

    await ActivityLog.create({
      actor: req?.user?._id || null,
      actorRole: req?.user?.role || "",
      action,
      module,
      targetId: targetId || null,
      targetModel,
      description,
      metadata: sanitizeMetadata(metadata),
      ipAddress: req?.ip || "",
      userAgent: req?.headers?.["user-agent"] || "",
    });
  } catch (error) {
    console.error("Activity logging failed:", error.message);
  }
};

export default logActivity;
