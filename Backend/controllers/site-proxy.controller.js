import http from "http";
import https from "https";
import { DEMO_MANAGER_URL } from "../config/environment.js";
import { createDemo, listDemos } from "./demo.controller.js";
import {
  deleteDemo,
  updateDemoDuration,
} from "./demo.controller.js";
import {
  getDemoCredentials,
  rotateDemoCredentials,
} from "./admin.controller.js";
import {
  deleteProject,
  getProjectVideo,
  listProjects,
} from "./project.controller.js";
import { listProducts } from "./products.controller.js";

function authHeaders(req, headers = {}) {
  const cookie = req.get("cookie");
  const origin = req.get("origin");
  const forwardedHeaders = { ...headers };

  if (cookie) {
    forwardedHeaders.cookie = cookie;
  }

  // The proxy calls protected routes inside this same backend. Forwarding the
  // browser origin lets the internal request pass the same CSRF validation.
  if (origin) {
    forwardedHeaders.origin = origin;
  }

  const forwardedHost = req.get("x-forwarded-host") || req.get("host");
  const forwardedProto = req.get("x-forwarded-proto") || req.protocol;
  if (forwardedHost) forwardedHeaders["x-forwarded-host"] = forwardedHost;
  if (forwardedProto) forwardedHeaders["x-forwarded-proto"] = forwardedProto;
  if (req.get("x-request-id")) {
    forwardedHeaders["x-request-id"] = req.get("x-request-id");
  }

  return forwardedHeaders;
}

async function requestJson(url, options = {}) {
  const candidates = [url];
  if (url.startsWith("http://localhost:")) {
    candidates.push(url.replace("http://localhost:", "http://127.0.0.1:"));
  }

  let lastError;
  let response;
  for (const candidate of candidates) {
    try {
      response = await fetch(candidate, {
        method: options.method || "GET",
        headers: options.headers,
        body: options.body,
        signal: AbortSignal.timeout(options.timeout || 30_000),
      });
      break;
    } catch (error) {
      lastError = error;
    }
  }
  if (!response) {
    throw new Error(
      `${lastError?.message || "Demo manager request failed"} (${url})`,
    );
  }

  const body = await response.text();
  let data;
  try {
    data = JSON.parse(body);
  } catch (error) {
    throw new Error(`Demo manager returned invalid JSON: ${error.message}`);
  }
  return { status: response.status, data };
}

function projectPath(projectId, suffix = "") {
  return `${DEMO_MANAGER_URL}/api/projects/${encodeURIComponent(projectId)}${suffix}`;
}

const RETRYABLE_SERVICE_STATUSES = new Set([502, 503, 504]);

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function forwardJson(res, url, options, message) {
  let lastError;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      console.log(
        `[PROXY] ${options.method || "GET"} ${url} | attempt ${
          attempt + 1
        }`,
      );

      const response = await requestJson(url, options);

      console.log(
        `[PROXY RESPONSE] ${response.status} ${url}`,
      );

      if (
        !RETRYABLE_SERVICE_STATUSES.has(response.status) ||
        attempt === 2
      ) {
        const setCookie = response.headers?.get?.("set-cookie");

        if (setCookie) {
          res.setHeader("set-cookie", setCookie);
        }

        return res.status(response.status).json(response.data);
      }

      const upstreamMessage =
        response.data?.message ||
        response.data?.error ||
        "no response message";

      lastError = new Error(
        `Demo service returned ${response.status}: ${upstreamMessage}`,
      );
    } catch (error) {
      lastError = error;

      console.error(
        `[PROXY ERROR] ${options.method || "GET"} ${url}`,
        error,
      );

      if (attempt === 2) {
        break;
      }
    }

    await wait(400 * (attempt + 1));
  }

  console.error(
    `[PROXY FAILED] ${url}`,
    lastError?.message,
  );

  return res.status(502).json({
    success: false,
    message,
    error: lastError?.message || "Unknown proxy error",
    upstream: url,
  });
}

export async function getProjectsProxy(req, res) {
  return listProjects(req, res);
}

export async function getSiteSettingsProxy(req, res) {
  await forwardJson(
    res,
    `${DEMO_MANAGER_URL}/api/site-settings`,
    {
      headers: authHeaders(req),
    },
    "Settings service unavailable",
  );
}

export async function getTeamProxy(req, res) {
  await forwardJson(
    res,
    `${DEMO_MANAGER_URL}/api/team/manage`,
    { headers: authHeaders(req) },
    "Team service unavailable",
  );
}

export async function createTeamProxy(req, res) {
  await forwardJson(
    res,
    `${DEMO_MANAGER_URL}/api/team/manage`,
    {
      method: "POST",
      headers: authHeaders(req, { "Content-Type": "application/json" }),
      body: JSON.stringify(req.body || {}),
    },
    "Team service unavailable",
  );
}

export async function updateTeamProxy(req, res) {
  await forwardJson(
    res,
    `${DEMO_MANAGER_URL}/api/team/manage/${encodeURIComponent(req.params.id)}`,
    {
      method: "PATCH",
      headers: authHeaders(req, { "Content-Type": "application/json" }),
      body: JSON.stringify(req.body || {}),
    },
    "Team service unavailable",
  );
}

export async function deleteTeamProxy(req, res) {
  await forwardJson(
    res,
    `${DEMO_MANAGER_URL}/api/team/manage/${encodeURIComponent(req.params.id)}`,
    { method: "DELETE", headers: authHeaders(req) },
    "Team service unavailable",
  );
}

export async function updateSiteSettingsProxy(req, res) {
  await forwardJson(
    res,
    `${DEMO_MANAGER_URL}/api/site-settings`,
    {
      method: "PUT",
      headers: authHeaders(req, { "Content-Type": "application/json" }),
      body: JSON.stringify(req.body || {}),
    },
    "Settings service unavailable",
  );
}

export function uploadSiteAssetProxy(req, res) {
  const target = new URL(`${DEMO_MANAGER_URL}/api/site-settings/assets`);
  const client = target.protocol === "https:" ? https : http;
  const headers = { ...req.headers };
  delete headers.host;
  delete headers.connection;
  headers.host = target.host;
  if (req.headers.cookie) headers.cookie = req.headers.cookie;

  const proxyRequest = client.request(
    target,
    { method: "POST", headers },
    (proxyResponse) => {
      let body = "";
      proxyResponse.setEncoding("utf8");
      proxyResponse.on("data", (chunk) => {
        body += chunk;
      });
      proxyResponse.on("end", () => {
        res
          .status(proxyResponse.statusCode || 502)
          .type("application/json")
          .send(body);
      });
    },
  );

  proxyRequest.on("error", (error) => {
    if (!res.headersSent) {
      res.status(502).json({
        success: false,
        message: error.message || "Settings service unavailable",
      });
    }
  });

  req.pipe(proxyRequest);
}

export async function getProductsProxy(req, res) {
  return listProducts(req, res, (error) => {
    console.error("PRODUCT LIST ERROR:", error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Unable to load products",
        error: error.message,
      });
    }
  });
}

export function uploadProductImageProxy(req, res) {
  const target = new URL(`${DEMO_MANAGER_URL}/api/products/image`);
  const client = target.protocol === "https:" ? https : http;
  const headers = { ...req.headers, host: target.host };
  delete headers.connection;

  const proxyRequest = client.request(
    target,
    { method: "POST", headers },
    (proxyResponse) => {
      let body = "";
      proxyResponse.setEncoding("utf8");
      proxyResponse.on("data", (chunk) => {
        body += chunk;
      });
      proxyResponse.on("end", () => {
        res
          .status(proxyResponse.statusCode || 502)
          .type("application/json")
          .send(body);
      });
    },
  );

  proxyRequest.on("error", (error) => {
    if (!res.headersSent) {
      res
        .status(502)
        .json({
          success: false,
          message: error.message || "Product image service unavailable",
        });
    }
  });
  req.pipe(proxyRequest);
}

async function productMutationProxy(req, res, method, suffix = "") {
  await forwardJson(
    res,
    `${DEMO_MANAGER_URL}/api/products${suffix}`,
    {
      method,
      headers: authHeaders(req, { "Content-Type": "application/json" }),
      body: JSON.stringify(req.body || {}),
    },
    "Product service unavailable",
  );
}

export async function createProductProxy(req, res) {
  await productMutationProxy(req, res, "POST");
}

export async function updateProductProxy(req, res) {
  await productMutationProxy(
    req,
    res,
    "PATCH",
    `/${encodeURIComponent(req.params.id)}`,
  );
}

export async function deleteProductProxy(req, res) {
  await productMutationProxy(
    req,
    res,
    "DELETE",
    `/${encodeURIComponent(req.params.id)}`,
  );
}

export async function getPortfolioManageProxy(req, res) {
  await forwardJson(
    res,
    `${DEMO_MANAGER_URL}/api/portfolio/manage`,
    {
      headers: authHeaders(req),
    },
    "Portfolio service unavailable",
  );
}

async function portfolioMutationProxy(req, res, method, suffix = "") {
  await forwardJson(
    res,
    `${DEMO_MANAGER_URL}/api/portfolio/manage${suffix}`,
    {
      method,
      headers: authHeaders(req, { "Content-Type": "application/json" }),
      body: JSON.stringify(req.body || {}),
    },
    "Portfolio service unavailable",
  );
}

export async function createPortfolioManageProxy(req, res) {
  await portfolioMutationProxy(req, res, "POST");
}

export async function updatePortfolioManageProxy(req, res) {
  await portfolioMutationProxy(
    req,
    res,
    "PATCH",
    `/${encodeURIComponent(req.params.id)}`,
  );
}

export async function deletePortfolioManageProxy(req, res) {
  await portfolioMutationProxy(
    req,
    res,
    "DELETE",
    `/${encodeURIComponent(req.params.id)}`,
  );
}

export function uploadPortfolioImageProxy(req, res) {
  const target = new URL(`${DEMO_MANAGER_URL}/api/portfolio/manage/image`);
  const client = target.protocol === "https:" ? https : http;
  const headers = { ...req.headers, host: target.host };
  delete headers.connection;
  const proxyRequest = client.request(
    target,
    { method: "POST", headers },
    (proxyResponse) => {
      let body = "";
      proxyResponse.setEncoding("utf8");
      proxyResponse.on("data", (chunk) => {
        body += chunk;
      });
      proxyResponse.on("end", () =>
        res
          .status(proxyResponse.statusCode || 502)
          .type("application/json")
          .send(body),
      );
    },
  );
  proxyRequest.on("error", (error) => {
    if (!res.headersSent)
      res
        .status(502)
        .json({
          success: false,
          message: error.message || "Portfolio image service unavailable",
        });
  });
  req.pipe(proxyRequest);
}

export async function createDemoProxy(req, res) {
  return createDemo(req, res);
}

export async function getDemosProxy(req, res) {
  return listDemos(req, res);
}

export async function getDemoCredentialsProxy(req, res) {
  return getDemoCredentials(req, res);
}

export async function rotateDemoCredentialsProxy(req, res) {
  return rotateDemoCredentials(req, res);
}

export async function deleteDemoProxy(req, res) {
  return deleteDemo(req, res);
}

export async function updateDemoDurationProxy(req, res) {
  return updateDemoDuration(req, res);
}

export function proxyUpload(req, res) {
  const target = new URL(`${DEMO_MANAGER_URL}/api/projects/upload`);
  const client = target.protocol === "https:" ? https : http;
  const headers = { ...req.headers };
  delete headers.host;
  delete headers.connection;
  headers.host = target.host;
  if (req.headers.cookie) headers.cookie = req.headers.cookie;

  const proxyRequest = client.request(
    target,
    { method: "POST", headers },
    (proxyResponse) => {
      let body = "";
      proxyResponse.setEncoding("utf8");
      proxyResponse.on("data", (chunk) => {
        body += chunk;
      });
      proxyResponse.on("end", () => {
        res
          .status(proxyResponse.statusCode || 502)
          .type("application/json")
          .send(body);
      });
    },
  );

  proxyRequest.on("error", () => {
    if (!res.headersSent)
      res
        .status(502)
        .json({ success: false, message: "Demo service unavailable" });
  });
  proxyRequest.setTimeout(5 * 60 * 1000, () =>
    proxyRequest.destroy(new Error("Demo upload request timed out")),
  );
  req.pipe(proxyRequest);
}

export function proxyProjectVideoGet(req, res) {
  return getProjectVideo(req, res);
}

export function proxyProjectVideoPost(req, res) {
  const target = new URL(
    `${DEMO_MANAGER_URL}/api/projects/${encodeURIComponent(req.params.id)}/video`,
  );
  const client = target.protocol === "https:" ? https : http;
  const headers = { ...req.headers };
  delete headers.host;
  delete headers.connection;
  headers.host = target.host;
  if (req.headers.cookie) headers.cookie = req.headers.cookie;

  const proxyRequest = client.request(
    target,
    { method: "POST", headers },
    (proxyResponse) => {
      let body = "";
      proxyResponse.setEncoding("utf8");
      proxyResponse.on("data", (chunk) => {
        body += chunk;
      });
      proxyResponse.on("end", () => {
        res
          .status(proxyResponse.statusCode || 502)
          .type("application/json")
          .send(body);
      });
    },
  );

  proxyRequest.on("error", () => {
    if (!res.headersSent)
      res
        .status(502)
        .json({ success: false, message: "Demo service unavailable" });
  });
  proxyRequest.setTimeout(5 * 60 * 1000, () =>
    proxyRequest.destroy(new Error("Demo video update request timed out")),
  );
  req.pipe(proxyRequest);
}

export async function proxyProjectVideoDelete(req, res) {
  await forwardJson(
    res,
    `${DEMO_MANAGER_URL}/api/projects/${encodeURIComponent(req.params.id)}/video`,
    {
      method: "DELETE",
      headers: authHeaders(req),
    },
    "Demo service unavailable",
  );
}

export async function patchProjectTypeProxy(req, res) {
  const { type } = req.body || {};
  if (!type)
    return res
      .status(400)
      .json({ success: false, message: "type is required" });

  await forwardJson(
    res,
    projectPath(req.params.id, "/type"),
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(req),
      },
      body: JSON.stringify({ type }),
    },
    "Demo service unavailable",
  );
}

export async function deleteProjectProxy(req, res) {
  return deleteProject(req, res);
}

export function downloadProjectProxy(req, res) {
  const target = new URL(projectPath(req.params.id, "/download"));
  const client = target.protocol === "https:" ? https : http;

  const proxyRequest = client.request(
    target,
    { method: "GET", headers: authHeaders(req) },
    (proxyResponse) => {
      const status = proxyResponse.statusCode || 502;
      res.status(status);
      Object.entries(proxyResponse.headers).forEach(([key, value]) => {
        if (value != null) res.setHeader(key, value);
      });
      if (status >= 400) {
        let body = "";
        proxyResponse.setEncoding("utf8");
        proxyResponse.on("data", (chunk) => {
          body += chunk;
        });
        proxyResponse.on("end", () => {
          try {
            res.json(JSON.parse(body || "{}"));
          } catch {
            res.send(body || "Download unavailable");
          }
        });
        return;
      }
      proxyResponse.pipe(res);
    },
  );

  proxyRequest.on("error", () => {
    if (!res.headersSent)
      res
        .status(502)
        .json({ success: false, message: "Demo service unavailable" });
  });
  proxyRequest.end();
}
