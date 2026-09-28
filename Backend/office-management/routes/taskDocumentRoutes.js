import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multer.js";
import {
  uploadTaskDocuments,
  getTaskDocuments,
  updateTaskDocument,
  deleteTaskDocument,
  downloadTaskDocument,
  getTaskTimeline,
} from "../controllers/taskDocumentController.js";

const router = express.Router();

// Routes mounted at /api/documents
router.put("/:id", protect, upload.single("file"), updateTaskDocument);
router.delete("/:id", protect, deleteTaskDocument);
router.get("/:id/download", protect, downloadTaskDocument);

export default router;
