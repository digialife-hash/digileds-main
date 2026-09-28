import express from "express";
import { createLimiter, destructiveLimiter } from "../middleware/limiters.js";
import {
  listProjects,
  getProjectVideo,
  replaceProjectVideo,
  updateProjectType,
  deleteProjectVideo,
  deleteProject,
  downloadProject,
  projectUpload,
  uploadProject,
} from "../controllers/project.controller.js";
import {
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct,
  uploadProductImage,
} from "../controllers/products.controller.js";
import { assetUpload } from "../services/project-upload.js";
import requireAdmin from "../middleware/admin.middleware.js";
import { asyncHandler } from "../middleware/async-handler.js";

const router = express.Router();

router.get("/api/products", asyncHandler(listProducts));
router.post("/api/products", requireAdmin, asyncHandler(createProduct));
router.post(
  "/api/products/image",
  requireAdmin,
  assetUpload.single("image"),
  asyncHandler(uploadProductImage),
);
router.patch("/api/products/:id", requireAdmin, asyncHandler(updateProduct));
router.delete("/api/products/:id", requireAdmin, asyncHandler(deleteProduct));

router.get("/api/projects", requireAdmin, asyncHandler(listProjects));
router.get(
  "/api/projects/:id/video",
  requireAdmin,
  asyncHandler(getProjectVideo),
);
router.post(
  "/api/projects/upload",
  requireAdmin,
  createLimiter,
  projectUpload.fields([
    { name: "files", maxCount: 1000 },
    { name: "projectVideo", maxCount: 1 },
  ]),
  asyncHandler(uploadProject),
);
router.post(
  "/api/projects/:id/video",
  requireAdmin,
  createLimiter,
  projectUpload.single("projectVideo"),
  asyncHandler(replaceProjectVideo),
);
router.patch(
  "/api/projects/:id/type",
  requireAdmin,
  asyncHandler(updateProjectType),
);
router.delete(
  "/api/projects/:id/video",
  requireAdmin,
  destructiveLimiter,
  asyncHandler(deleteProjectVideo),
);
router.delete(
  "/api/projects/:id",
  requireAdmin,
  destructiveLimiter,
  asyncHandler(deleteProject),
);
router.get(
  "/api/projects/:id/download",
  requireAdmin,
  destructiveLimiter,
  asyncHandler(downloadProject),
);
export default router;
