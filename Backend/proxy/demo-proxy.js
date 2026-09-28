import {
  createProxyMiddleware,
  responseInterceptor,
} from "http-proxy-middleware";
import * as store from "../services/data-repository.js";
import { EXPIRED_PAGE_HTML } from "../config/environment.js";
import { hasAccess } from "../services/demo-access.js";

const assetDirectories = new Set([
  "assets",
  "static",
  "images",
  "img",
  "css",
  "js",
  "scripts",
  "styles",
  "icons",
  "fonts",
  "media",
  "uploads",
  "videos",
]);

function rewriteDemoPath(pathString) {
  const parsed = new URL(pathString || "/", "http://demo.internal");
  let pathname = parsed.pathname.replaceAll("\\", "/");
  if (!pathname.startsWith("/")) pathname = `/${pathname}`;
  const parts = pathname.split("/").filter(Boolean);
  const assetIndex = parts.findIndex((part) =>
    assetDirectories.has(part.toLowerCase()),
  );
  if (assetIndex > 0) pathname = `/${parts.slice(assetIndex).join("/")}`;
  else if (assetIndex === -1 && parts.length > 1 && /\.[^/]+$/.test(pathname))
    pathname = `/${parts.at(-1)}`;
  return `${pathname}${parsed.search}`;
}

function expiredResponse() {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Demo Expired</title><style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;font-family:Arial,sans-serif;background:#f8fafc;color:#0f172a}.box{width:100%;max-width:500px;padding:40px;background:white;border:1px solid #e2e8f0;border-radius:24px;text-align:center;box-shadow:0 20px 60px rgba(15,23,42,.08)}.icon{width:64px;height:64px;margin:0 auto 20px;display:grid;place-items:center;border-radius:18px;background:#fef2f2;color:#dc2626;font-size:28px;font-weight:700}h1{margin:0 0 10px;font-size:28px}p{margin:0;color:#64748b;line-height:1.6}</style></head><body><div class="box"><div class="icon">!</div><h1>Demo Expired</h1><p>This demo environment is no longer available. Please create a new demo to continue.</p></div></body></html>`;
}

function unavailableResponse() {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Demo Unavailable</title><style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:Arial,sans-serif;background:#f8fafc}.box{padding:40px;max-width:500px;margin:20px;background:white;border:1px solid #e2e8f0;border-radius:24px;text-align:center}h1{margin:0 0 10px;color:#0f172a}p{color:#64748b;line-height:1.6}</style></head><body><div class="box"><h1>Demo Temporarily Unavailable</h1><p>The demo container is currently unavailable. Please try creating the demo again.</p></div></body></html>`;
}

function loginResponse(demoId) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Demo access</title><style>body{font-family:system-ui;background:#f8fafc;display:grid;place-items:center;min-height:100vh}.box{background:#fff;padding:32px;border-radius:16px;box-shadow:0 8px 30px #0001;width:min(360px,90vw)}input,button{box-sizing:border-box;width:100%;padding:12px;margin:8px 0;border:1px solid #cbd5e1;border-radius:8px}button{background:#2563eb;color:#fff;border:0;cursor:pointer}#error{color:#b91c1c}</style></head><body><form class="box" id="login"><h1>Private demo</h1><p>Enter the credentials provided by the demo owner.</p><input name="username" autocomplete="username" placeholder="Username" required><input name="password" type="password" autocomplete="current-password" placeholder="Password" required><button>Continue</button><div id="error"></div></form><script>document.getElementById("login").onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target);const r=await fetch("/api/demo/${demoId}/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:f.get("username"),password:f.get("password")})});if(r.ok)location.reload();else document.getElementById("error").textContent=(await r.json()).message||"Login failed";}</script></body></html>`;
}

export async function handleDemoProxyRoute(req, res, next) {
  let demo;
  try {
    demo = await store.getActiveDemo(req.params.id);
  } catch (error) {
    return next(error);
  }
  if (!demo) return res.status(404).send(EXPIRED_PAGE_HTML);
  if (Date.now() >= demo.expiresAt)
    return res.status(410).send(expiredResponse());
  if (!hasAccess(req, demo))
    return res.status(401).type("html").send(loginResponse(demo.demoId));

  const adaptSpaResponse = responseInterceptor(async (body, proxyRes) => {
    if (!String(proxyRes.headers["content-type"] || "").includes("text/html"))
      return body;

    const prefix = `/d/${demo.demoId}`;
    const script = `<script>(()=>{
  const PREFIX = ${JSON.stringify(prefix)};

  const stripPrefix = (path) =>
    path === PREFIX || path.startsWith(PREFIX + "/")
      ? (path.slice(PREFIX.length) || "/")
      : path;

  const addPrefix = (path) =>
    path && path.startsWith("/") && path !== PREFIX && !path.startsWith(PREFIX + "/")
      ? PREFIX + path
      : path;

  history.replaceState(history.state, "", stripPrefix(location.pathname) + location.search + location.hash);
  const nativeReplaceState = history.replaceState.bind(history);

  for (const method of ["pushState", "replaceState"]) {
    const original = history[method];
    history[method] = function (state, title, url) {
      if (typeof url === "string") {
        const target = new URL(url, location.origin);
        if (target.origin === location.origin) {
          const unprefixed = stripPrefix(target.pathname);
          const result = original.call(this, state, title, unprefixed + target.search + target.hash);
          queueMicrotask(() =>
            nativeReplaceState(history.state, "", addPrefix(unprefixed) + target.search + target.hash)
          );
          return result;
        }
      }
      return original.call(this, state, title, url);
    };
  }

  addEventListener(
    "popstate",
    (e) => {
      const unprefixed = stripPrefix(location.pathname);
      if (unprefixed !== location.pathname) {
        e.stopImmediatePropagation();
        history.replaceState(history.state, "", unprefixed + location.search + location.hash);
        dispatchEvent(new PopStateEvent("popstate", { state: history.state }));
        queueMicrotask(() =>
          history.replaceState(history.state, "", addPrefix(unprefixed) + location.search + location.hash)
        );
      }
    },
    true,
  );

  document.addEventListener(
    "click",
    (e) => {
      const link = e.target.closest("a");
      if (!link || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const target = new URL(link.href, location.origin);
      if (
        target.origin !== location.origin ||
        !target.pathname.startsWith("/") ||
        target.pathname === PREFIX ||
        target.pathname.startsWith(PREFIX + "/")
      )
        return;
      e.preventDefault();
      history.pushState({}, "", stripPrefix(target.pathname) + target.search + target.hash);
      dispatchEvent(new PopStateEvent("popstate"));
    },
    false,
  );

  addEventListener(
    "load",
    () => {
      history.replaceState(history.state, "", addPrefix(stripPrefix(location.pathname)) + location.search + location.hash);
    },
    { once: true },
  );
})();</script>`;
    return Buffer.from(
      body
        .toString("utf8")
        .replace(/<head([^>]*)>/i, `<head$1><base href="${prefix}/">${script}`),
    );
  });

  return createProxyMiddleware({
    target: `http://127.0.0.1:${demo.hostPort}`,
    changeOrigin: true,
    ws: true,
    xfwd: true,
    pathRewrite: rewriteDemoPath,
    selfHandleResponse: true,
    on: {
      proxyReq: (proxyReq, request) =>
        console.log(`PROXY REQUEST: ${request.method} ${request.path || "/"}`),
      proxyRes: adaptSpaResponse,
      error: (error, _request, response) => {
        console.error("PROXY ERROR:", demo.demoId, error.message);
        if (!response.headersSent)
          response.status(502).send(unavailableResponse());
      },
    },
  })(req, res, next);
}
