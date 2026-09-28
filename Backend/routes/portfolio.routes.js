import express from "express";
import {
  createPortfolioItem,
  deletePortfolioItem,
  getPortfolioItems,
  listPortfolioItems,
  updatePortfolioItem,
  uploadPortfolioImage,
} from "../controllers/portfolio.controller.js";
import {
  getSiteSettings,
  uploadSiteAsset,
  updateSiteSettings,
} from "../controllers/site-settings.controller.js";
import { assetUpload } from "../services/project-upload.js";
import requireAdmin from "../middleware/admin.middleware.js";
import { asyncHandler } from "../middleware/async-handler.js";

const router = express.Router();

router.get("/api/portfolio_items", asyncHandler(getPortfolioItems));
router.get(
  "/api/portfolio/manage",
  requireAdmin,
  asyncHandler(listPortfolioItems),
);
router.post(
  "/api/portfolio/manage",
  requireAdmin,
  asyncHandler(createPortfolioItem),
);
router.patch(
  "/api/portfolio/manage/:id",
  requireAdmin,
  asyncHandler(updatePortfolioItem),
);
router.delete(
  "/api/portfolio/manage/:id",
  requireAdmin,
  asyncHandler(deletePortfolioItem),
);
router.post(
  "/api/portfolio/manage/image",
  requireAdmin,
  assetUpload.single("image"),
  asyncHandler(uploadPortfolioImage),
);
router.get("/api/site-settings", asyncHandler(getSiteSettings));
router.put(
  "/api/site-settings",
  requireAdmin,
  asyncHandler(updateSiteSettings),
);
router.post(
  "/api/site-settings/assets",
  requireAdmin,
  assetUpload.single("asset"),
  asyncHandler(uploadSiteAsset),
);

export default router;
