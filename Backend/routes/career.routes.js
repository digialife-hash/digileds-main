import express from "express";
import multer from "multer";
import requireAdmin from "../middleware/admin.middleware.js";
import { asyncHandler } from "../middleware/async-handler.js";
import {
  createCareerApplication,
  deleteCareerApplication,
  downloadCareerResume,
  listCareerApplications,
  updateCareerApplication,
} from "../controllers/career.controller.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    const extension = file.originalname.toLowerCase().split(".").pop();
    const allowed = new Set([
      "pdf",
      "doc",
      "docx",
    ]);
    callback(null, allowed.has(extension));
  },
});
const router = express.Router();
router.post(
  "/api/career-applications",
  upload.single("resume"),
  asyncHandler(createCareerApplication),
);
router.get(
  "/api/career-applications",
  requireAdmin,
  asyncHandler(listCareerApplications),
);
router.get(
  "/api/career-applications/:id/resume",
  requireAdmin,
  asyncHandler(downloadCareerResume),
);
router.patch(
  "/api/career-applications/:id",
  requireAdmin,
  asyncHandler(updateCareerApplication),
);
router.delete(
  "/api/career-applications/:id",
  requireAdmin,
  asyncHandler(deleteCareerApplication),
);
export default router;
