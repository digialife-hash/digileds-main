import { SiteSetting } from "../models/index.js";
import {
  SITE_ASSETS_ROOT,
  STORAGE_UPLOADS_ROOT,
} from "../config/environment.js";
import { getAuthSession } from "../services/admin-auth.js";
import { fs, path, moveFile } from "../utils/file-and-project-utils.js";
import { scanFile } from "../services/upload-security.js";

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function parseSettingValue(value) {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function isAuthorizedRequest(req) {
  return ["admin", "super_admin"].includes(getAuthSession(req)?.role);
}

function sanitizePublicConfig(config) {
  const copy = structuredClone(config || {});
  if (copy.payments) delete copy.payments.razorpay_key_secret;
  return copy;
}

function mergeConfig(existing, incoming) {
  const current = isObject(existing) ? existing : {};
  const next = isObject(incoming) ? incoming : {};
  const merged = { ...current, ...next };

  for (const section of [
    "site",
    "assets",
    "contact",
    "social",
    "external",
    "payments",
    "manual_payment",
    "popup",
  ]) {
    if (isObject(current[section]) || isObject(next[section])) {
      merged[section] = {
        ...(isObject(current[section]) ? current[section] : {}),
        ...(isObject(next[section]) ? next[section] : {}),
      };
    }
  }

  return merged;
}

function managedAssetPath(url) {
  if (typeof url !== "string" || !url.startsWith("/uploads/site-assets/")) {
    return null;
  }

  const relative = url.slice("/uploads/".length).replaceAll("/", path.sep);
  const resolved = path.resolve(STORAGE_UPLOADS_ROOT, relative);
  return resolved.startsWith(`${SITE_ASSETS_ROOT}${path.sep}`)
    ? resolved
    : null;
}

export async function getSiteSettings(req, res, next) {
  try {
    const rows = await SiteSetting.find({ tenantId: req.tenantId })
      .sort({ key_name: 1 })
      .lean();
    const authorized = isAuthorizedRequest(req);

    return res.json({
      success: true,
      data: rows.map(({ _id, ...row }) => ({
        ...row,
        value:
          row.key_name === "site_config" && !authorized
            ? sanitizePublicConfig(parseSettingValue(row.value))
            : parseSettingValue(row.value),
      })),
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateSiteSettings(req, res, next) {
  const keyName = String(req.body?.key_name || "site_config").trim();
  const value = req.body?.value;

  if (!keyName || value === undefined) {
    return res.status(400).json({
      success: false,
      message: "key_name and value are required",
    });
  }

  try {
    const existingRecord = await SiteSetting.findOne({
      key_name: keyName,
      tenantId: req.tenantId,
    }).lean();
    const existing = parseSettingValue(existingRecord?.value);
    const incoming =
      typeof value === "string" ? parseSettingValue(value) : value;
    const savedValue =
      keyName === "site_config" ? mergeConfig(existing, incoming) : incoming;
    const serializedValue =
      typeof savedValue === "string"
        ? savedValue
        : JSON.stringify(savedValue, null, 4);

    await SiteSetting.updateOne(
      { key_name: keyName, tenantId: req.tenantId },
      {
        $set: { value: serializedValue, updated_at: new Date(), tenantId: req.tenantId },
        $setOnInsert: { tenantId: req.tenantId },
      },
      { upsert: true },
    );

    if (keyName === "site_config" && isObject(savedValue)) {
      const oldAssets = isObject(existing) ? existing.assets || {} : {};
      const newAssets = savedValue.assets || {};
      for (const field of [
        "favicon",
        "logo_light",
        "logo_dark",
        "og_image",
        "hero_image",
        "hero_video",
        "team_image",
      ]) {
        if (oldAssets[field] && oldAssets[field] !== newAssets[field]) {
          const oldPath = managedAssetPath(oldAssets[field]);
          if (oldPath) await fs.rm(oldPath, { force: true });
        }
      }

      const oldQr = existing?.manual_payment?.qr_image;
      const newQr = savedValue.manual_payment?.qr_image;
      if (oldQr && oldQr !== newQr) {
        const oldPath = managedAssetPath(oldQr);
        if (oldPath) await fs.rm(oldPath, { force: true });
      }
    }

    return res.json({
      success: true,
      message: "Site settings saved successfully",
      data: { key_name: keyName, value: savedValue },
    });
  } catch (error) {
    return next(error);
  }
}

export async function uploadSiteAsset(req, res, next) {
  const field = String(req.body?.field || "").trim();
  const allowedFields = new Set([
    "favicon",
    "logo_light",
    "logo_dark",
    "og_image",
    "hero_image",
    "hero_video",
    "team_image",
    "qr_image",
  ]);

  if (!allowedFields.has(field)) {
    return res.status(400).json({
      success: false,
      message: "Unsupported asset field",
    });
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "An asset file is required",
    });
  }

  try {
    const scan = await scanFile(req.file.path, req.file.originalname);
    if (!scan.clean) {
      await fs.rm(req.file.path, { force: true });
      return res.status(400).json({
        success: false,
        message: "Asset failed security validation",
      });
    }

    await fs.mkdir(SITE_ASSETS_ROOT, { recursive: true });
    const filename = `${crypto.randomUUID()}${path.extname(req.file.originalname).toLowerCase()}`;
    await moveFile(req.file.path, path.join(SITE_ASSETS_ROOT, filename));

    return res.status(201).json({
      success: true,
      field,
      url: `/uploads/site-assets/${filename}`,
    });
  } catch (error) {
    try {
      await fs.rm(req.file.path, { force: true });
    } catch (cleanupError) {
      console.warn("Site asset cleanup failed:", cleanupError.message);
    }
    return next(error);
  }
}
