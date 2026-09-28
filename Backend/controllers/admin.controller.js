import * as store from "../services/data-repository.js";
import {
  authenticateDemo,
  clearAccessCookie,
  hasAccess,
  provisionCredentials,
  setAccessCookie,
  generateCredentials,
  decryptPassword,
} from "../services/demo-access.js";
import { increment } from "../services/metrics.js";

export async function loginDemo(req, res) {
  const demo = await store.getActiveDemo(req.params.id, req.tenantId);
  if (!demo || Date.now() >= demo.expiresAt)
    return res
      .status(404)
      .json({ success: false, message: "Demo not found or expired" });

  const { username, password } = req.body || {};
  if (!authenticateDemo(demo, String(username || ""), String(password || ""))) {
    increment("demo_manager_auth_failures_total");
    await store.audit("auth_failure", {
      demoId: demo.demoId,
      requestId: req.requestId,
    });
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  setAccessCookie(res, demo);
  increment("demo_manager_auth_success_total");
  await store.audit("auth_success", {
    demoId: demo.demoId,
    requestId: req.requestId,
  });
  return res.json({ success: true });
}

export async function logoutDemo(req, res) {
  clearAccessCookie(res, req.params.id);
  await store.audit("logout", {
    demoId: req.params.id,
    requestId: req.requestId,
  });
  return res.json({ success: true });
}

export async function getDemoAccess(req, res) {
  const demo = await store.getActiveDemo(req.params.id, req.tenantId);
  if (!demo || Date.now() >= demo.expiresAt)
    return res
      .status(404)
      .json({ success: false, message: "Demo not found or expired" });

  return res.json({
    success: true,
    authenticated: hasAccess(req, demo),
    expiresAt: new Date(demo.expiresAt).toISOString(),
  });
}

export async function getDemoCredentials(req, res) {
  const demo = await store.getActiveDemoCredentials(req.params.id, req.tenantId);
  if (!demo)
    return res.status(404).json({ success: false, message: "Demo not found" });

  return res.json({
    success: true,
    credentials: {
      username: demo.accessUsername,
      password: decryptPassword(demo.accessPasswordEncrypted),
      passwordAvailable: Boolean(demo.accessPasswordEncrypted),
      credentialVersion: demo.credentialVersion,
    },
  });
}

export async function rotateDemoCredentials(req, res) {
  const demo = await store.getActiveDemo(req.params.id, req.tenantId);
  if (!demo)
    return res.status(404).json({ success: false, message: "Demo not found" });

  const credentials = generateCredentials();
  const updated = await provisionCredentials(
    demo.demoId,
    credentials.username,
    credentials.password,
    req.tenantId,
  );
  // Rotating credentials invalidates the previous demo session immediately.
  // Force the viewer to authenticate again with the newly issued credentials.
  clearAccessCookie(res, demo.demoId);
  await store.audit("credentials_rotate", {
    demoId: demo.demoId,
    requestId: req.requestId,
  });

  return res.json({
    success: true,
    credentials: {
      username: credentials.username,
      password: credentials.password,
    },
    credentialVersion: updated.credentialVersion,
    expiresAt: new Date(updated.expiresAt).toISOString(),
  });
}
