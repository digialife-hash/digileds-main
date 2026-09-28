import express from "express";
import requireAdmin from "../middleware/admin.middleware.js";
import { asyncHandler } from "../middleware/async-handler.js";
import {
  createCareerOpening,
  deleteCareerOpening,
  listCareerOpenings,
  listPublicCareerOpenings,
  updateCareerOpening,
} from "../controllers/career-opening.controller.js";

const router = express.Router();
router.get("/api/career-openings", asyncHandler(listPublicCareerOpenings));
router.get(
  "/api/career-openings/manage",
  requireAdmin,
  asyncHandler(listCareerOpenings),
);
router.post(
  "/api/career-openings",
  requireAdmin,
  asyncHandler(createCareerOpening),
);
router.patch(
  "/api/career-openings/:id",
  requireAdmin,
  asyncHandler(updateCareerOpening),
);
router.delete(
  "/api/career-openings/:id",
  requireAdmin,
  asyncHandler(deleteCareerOpening),
);
export default router;
