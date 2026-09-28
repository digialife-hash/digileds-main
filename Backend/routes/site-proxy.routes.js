import express from "express";
import { createLimiter, mutateLimiter } from "../middleware/limiters.js";
import {
  getProjectsProxy,
  createDemoProxy,
  getDemosProxy,
  getDemoCredentialsProxy,
  rotateDemoCredentialsProxy,
  deleteDemoProxy,
  updateDemoDurationProxy,
  proxyUpload,
  proxyProjectVideoGet,
  proxyProjectVideoPost,
  proxyProjectVideoDelete,
  patchProjectTypeProxy,
  deleteProjectProxy,
  downloadProjectProxy,
  getSiteSettingsProxy,
  updateSiteSettingsProxy,
  uploadSiteAssetProxy,
  getProductsProxy,
  createProductProxy,
  updateProductProxy,
  deleteProductProxy,
  uploadProductImageProxy,
  getPortfolioManageProxy,
  createPortfolioManageProxy,
  updatePortfolioManageProxy,
  deletePortfolioManageProxy,
  uploadPortfolioImageProxy,
  getTeamProxy,
  createTeamProxy,
  updateTeamProxy,
  deleteTeamProxy,
} from "../controllers/site-proxy.controller.js";
import requireAdmin from "../middleware/admin.middleware.js";

const router = express.Router();

router.use("/api/demo-proxy", requireAdmin);

router.get("/api/demo-proxy/projects", getProjectsProxy);
router.post("/api/demo-proxy/create", createLimiter, createDemoProxy);
router.get("/api/demo-proxy/demos", getDemosProxy);
router.get(
  "/api/demo-proxy/demo/:id/credentials",
  mutateLimiter,
  getDemoCredentialsProxy,
);
router.post(
  "/api/demo-proxy/demo/:id/credentials/rotate",
  mutateLimiter,
  rotateDemoCredentialsProxy,
);
router.delete("/api/demo-proxy/demo/:id", mutateLimiter, deleteDemoProxy);
router.patch(
  "/api/demo-proxy/demo/:id/duration",
  mutateLimiter,
  updateDemoDurationProxy,
);
router.post("/api/demo-proxy/upload", createLimiter, proxyUpload);
router.get("/api/demo-proxy/projects/:id/video", proxyProjectVideoGet);
router.post(
  "/api/demo-proxy/projects/:id/video",
  createLimiter,
  proxyProjectVideoPost,
);
router.delete(
  "/api/demo-proxy/projects/:id/video",
  mutateLimiter,
  proxyProjectVideoDelete,
);
router.patch(
  "/api/demo-proxy/projects/:id/type",
  mutateLimiter,
  patchProjectTypeProxy,
);
router.delete(
  "/api/demo-proxy/projects/:id",
  mutateLimiter,
  deleteProjectProxy,
);
router.get(
  "/api/demo-proxy/projects/:id/download",
  mutateLimiter,
  downloadProjectProxy,
);
router.get("/api/demo-proxy/settings", getSiteSettingsProxy);
router.put("/api/demo-proxy/settings", mutateLimiter, updateSiteSettingsProxy);
router.post(
  "/api/demo-proxy/settings/assets",
  createLimiter,
  uploadSiteAssetProxy,
);
router.get("/api/demo-proxy/products", getProductsProxy);
router.post("/api/demo-proxy/products", createLimiter, createProductProxy);
router.post(
  "/api/demo-proxy/products/image",
  createLimiter,
  uploadProductImageProxy,
);
router.patch("/api/demo-proxy/products/:id", mutateLimiter, updateProductProxy);
router.delete(
  "/api/demo-proxy/products/:id",
  mutateLimiter,
  deleteProductProxy,
);
router.get("/api/demo-proxy/portfolio", getPortfolioManageProxy);
router.post(
  "/api/demo-proxy/portfolio",
  createLimiter,
  createPortfolioManageProxy,
);
router.patch(
  "/api/demo-proxy/portfolio/:id",
  mutateLimiter,
  updatePortfolioManageProxy,
);
router.delete(
  "/api/demo-proxy/portfolio/:id",
  mutateLimiter,
  deletePortfolioManageProxy,
);
router.post(
  "/api/demo-proxy/portfolio/image",
  createLimiter,
  uploadPortfolioImageProxy,
);
router.get("/api/demo-proxy/team", getTeamProxy);
router.post("/api/demo-proxy/team", createLimiter, createTeamProxy);
router.patch("/api/demo-proxy/team/:id", mutateLimiter, updateTeamProxy);
router.delete("/api/demo-proxy/team/:id", mutateLimiter, deleteTeamProxy);

export default router;
