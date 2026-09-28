import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multer.js";
import {
  addTaskComment,
  addTaskProgressUpdate,
  createTask,
  deleteTask,
  getAllTasksForSuperAdmin,
  getMyAssignedTasks,
  getTaskById,
  updateMyTaskStatus,
  updateTask,
} from "../controllers/taskController.js";
import {
  uploadTaskDocuments,
  getTaskDocuments,
  updateTaskDocument,
  deleteTaskDocument,
  downloadTaskDocument,
  getTaskTimeline,
} from "../controllers/taskDocumentController.js";

const router = express.Router();

// Document & Timeline APIs
router.post(
  "/:id/documents/upload",
  protect,
  upload.array("files", 10),
  uploadTaskDocuments
);

router.get("/:id/documents", protect, getTaskDocuments);
router.get("/:id/timeline", protect, getTaskTimeline);

// Direct Document Operations
router.put("/documents/:id", protect, upload.single("file"), updateTaskDocument);
router.delete("/documents/:id", protect, deleteTaskDocument);
router.get("/documents/:id/download", protect, downloadTaskDocument);

// Employee Assigned Tasks
router.get(
  "/my-tasks",
  protect,
  authorizeRoles("employee"),
  getMyAssignedTasks
);

router.get(
  "/my-tasks/:id",
  protect,
  authorizeRoles("employee"),
  getTaskById
);

router.patch(
  "/my-tasks/:id/status",
  protect,
  authorizeRoles("employee"),
  updateMyTaskStatus
);

router.post(
  "/my-tasks/:id/progress",
  protect,
  authorizeRoles("employee"),
  addTaskProgressUpdate
);

router.post(
  "/my-tasks/:id/comments",
  protect,
  authorizeRoles("employee"),
  addTaskComment
);

// Super Admin Task Management
router
  .route("/")
  .get(protect, authorizeRoles("super_admin", "admin"), getAllTasksForSuperAdmin)
  .post(protect, authorizeRoles("super_admin", "admin"), createTask);

router.post(
  "/:id/comments",
  protect,
  authorizeRoles("super_admin"),
  addTaskComment
);

router
  .route("/:id")
  .get(protect, authorizeRoles("super_admin", "admin"), getTaskById)
  .patch(protect, authorizeRoles("super_admin", "admin"), updateTask)
  .delete(protect, authorizeRoles("super_admin"), deleteTask);

export default router;
