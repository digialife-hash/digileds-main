import Tenant from "../models/tenant.model.js";
import { normalizeDomain, tenantPayload } from "../services/tenant-context.js";
import SiteSetting from "../models/site-setting.model.js";

function cleanDomains(domains) {
  return [
    ...new Set(
      (Array.isArray(domains) ? domains : [])
        .map(normalizeDomain)
        .filter(Boolean),
    ),
  ];
}

function cleanBranding(branding) {
  if (!branding || typeof branding !== "object" || Array.isArray(branding)) {
    return {};
  }
  return branding;
}

export async function currentTenant(req, res) {
  const tenant = tenantPayload(req.tenant);
  const legacyConfig = await SiteSetting.findOne({
    key_name: "site_config",
    tenantId: req.tenantId,
  }).lean();
  const existingConfig = legacyConfig
    ? (() => {
        try {
          return JSON.parse(legacyConfig.value);
        } catch {
          return {};
        }
      })()
    : {};

  return res.json({
    success: true,
    tenant: {
      ...tenant,
      branding: {
        name: existingConfig.site?.name || "",
        title: existingConfig.site?.title || existingConfig.site?.name || "",
        description: existingConfig.site?.description || "",
        logo:
          existingConfig.assets?.logo_light ||
          existingConfig.assets?.logo_dark ||
          "",
        favicon: existingConfig.assets?.favicon || "",
        contact: existingConfig.contact || {},
        socialLinks: existingConfig.social || {},
        ...(tenant?.branding || {}),
      },
    },
  });
}

export async function listTenants(_req, res) {
  const tenants = await Tenant.find({}).sort({ createdAt: 1 }).lean();
  return res.json({ success: true, tenants: tenants.map(tenantPayload) });
}

export async function createTenant(req, res) {
  const name = String(req.body?.name || "").trim();
  const slug = String(req.body?.slug || "")
    .trim()
    .toLowerCase();
  if (!name || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return res.status(400).json({
      success: false,
      message: "A valid tenant name and slug are required.",
    });
  }

  const tenant = await Tenant.create({
    name,
    slug,
    status: req.body?.status === "inactive" ? "inactive" : "active",
    domains: cleanDomains(req.body?.domains),
    branding: cleanBranding(req.body?.branding),
    settings: req.body?.settings || {},
    createdBy: req.user?.sub || req.user?._id || req.user?.id || null,
  });
  return res.status(201).json({ success: true, tenant: tenantPayload(tenant.toObject()) });
}

export async function updateTenant(req, res) {
  const updates = {};
  if (req.body?.name !== undefined) updates.name = String(req.body.name).trim();
  if (req.body?.status !== undefined) updates.status = req.body.status;
  if (req.body?.domains !== undefined) updates.domains = cleanDomains(req.body.domains);
  if (req.body?.branding !== undefined) updates.branding = cleanBranding(req.body.branding);
  if (req.body?.settings !== undefined) updates.settings = req.body.settings || {};

  const tenant = await Tenant.findByIdAndUpdate(
    req.params.id,
    { $set: updates },
    { new: true, runValidators: true },
  ).lean();
  if (!tenant) return res.status(404).json({ success: false, message: "Tenant not found." });
  return res.json({ success: true, tenant: tenantPayload(tenant) });
}
