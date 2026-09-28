import Tenant from "../models/tenant.model.js";
import { PUBLIC_DEMO_HOST } from "../config/environment.js";

const DEFAULT_TENANT_SLUG = "default";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function normalizeHost(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .split(":")[0]
    .replace(/^www\./, "");
}

function normalizeDomain(value) {
  return normalizeHost(value).replace(/\.$/, "");
}

export function getRequestHost(req) {
  return normalizeHost(
    req.get("x-forwarded-host")?.split(",")[0]?.trim() || req.get("host"),
  );
}

export function isLocalHost(host) {
  return LOCAL_HOSTS.has(host) || host.endsWith(".localhost");
}

export async function ensureDefaultTenant() {
  const configuredDomain = normalizeConfiguredDomain(PUBLIC_DEMO_HOST);
  const update = {
    $setOnInsert: {
      name: "Default tenant",
      slug: DEFAULT_TENANT_SLUG,
      status: "active",
    },
  };

  if (configuredDomain) {
    update.$addToSet = { domains: configuredDomain };
  }

  return Tenant.findOneAndUpdate(
    { slug: DEFAULT_TENANT_SLUG },
    update,
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean();
}

function normalizeConfiguredDomain(value) {
  if (!value) return "";

  try {
    const url = new URL(value);
    return normalizeDomain(url.hostname);
  } catch {
    return normalizeDomain(value);
  }
}

export async function resolveTenant(req) {
  const host = getRequestHost(req);
  const tenant = host
    ? await Tenant.findOne({
        status: "active",
        domains: normalizeDomain(host),
      }).lean()
    : null;

  if (tenant) return tenant;
  if (isLocalHost(host)) return ensureDefaultTenant();
  return null;
}

export function tenantPayload(tenant) {
  if (!tenant) return null;
  return {
    id: String(tenant._id),
    name: tenant.name,
    slug: tenant.slug,
    status: tenant.status,
    domains: tenant.domains || [],
    branding: tenant.branding || {},
    settings: tenant.settings || {},
  };
}

export { DEFAULT_TENANT_SLUG, normalizeDomain };
