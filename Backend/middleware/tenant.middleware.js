import { isLocalHost, resolveTenant, tenantPayload } from "../services/tenant-context.js";
import { runWithTenantContext } from "../services/office-tenant-isolation.js";

export async function tenantContext(req, res, next) {
  try {
    const tenant = await resolveTenant(req);
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Unknown tenant domain.",
        code: "UNKNOWN_TENANT",
      });
    }

    req.tenant = tenant;
    req.tenantId = String(tenant._id);
    res.locals.tenant = tenantPayload(tenant);
    return runWithTenantContext(req, next);
  } catch (error) {
    return next(error);
  }
}

export function requireTenant(req, res, next) {
  if (!req.tenant) {
    return res.status(404).json({
      success: false,
      message: "Tenant context is required.",
      code: "TENANT_REQUIRED",
    });
  }
  return next();
}
