import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import Task from "../models/Task.js";
import TaskDocument from "../models/TaskDocument.js";
import ActivityLog from "../models/ActivityLog.js";
import Employee from "../models/Employee.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import logActivity from "../utils/logActivity.js";
import { hasPermission } from "../utils/permissions.js";

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);
};

const getIdString = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (value._id) return String(value._id);
  return String(value);
};

const isSameId = (left, right) => {
  const leftId = getIdString(left);
  const rightId = getIdString(right);
  return Boolean(leftId && rightId && leftId === rightId);
};

const getLinkedEmployeeForUser = async (user) => {
  const lookup = [];
  if (user?._id) lookup.push({ userId: user._id });
  if (user?.email) lookup.push({ email: user.email });
  if (user?.phone) lookup.push({ phone: user.phone });
  if (!lookup.length) return null;
  return Employee.findOne({ $or: lookup }).select("_id userId").lean();
};

const canUserAccessTask = ({ user, task } = {}) => {
  if (!user || !task) return false;
  if (user.role === "super_admin") return true;
  if (user.role === "admin") return hasPermission(user, "documents", "view");

  if (user.role === "employee") {
    return (
      isSameId(task.assignedUser, user._id) ||
      isSameId(task.assignedEmployee?.userId, user._id) ||
      isSameId(task.assignedEmployee, user.linkedEmployeeId)
    );
  }

  return false;
};

const findTaskAndVerifyAccess = async (taskId, user) => {
  if (!isValidObjectId(taskId)) {
    throw new AppError("Invalid task ID", 400, "INVALID_TASK_ID");
  }

  const task = await Task.findById(taskId)
    .select("_id assignedEmployee assignedUser taskTitle status createdBy")
    .populate("assignedEmployee", "_id userId")
    .lean();

  if (!task) {
    throw new AppError("Task not found", 404, "TASK_NOT_FOUND");
  }

  const linkedEmployee = user.role === "employee" ? await getLinkedEmployeeForUser(user) : null;
  const accessUser = {
    ...user.toObject?.(),
    _id: user._id,
    role: user.role,
    linkedEmployeeId: linkedEmployee?._id,
  };

  if (!canUserAccessTask({ user: accessUser, task })) {
    throw new AppError("You do not have permission to access this task", 403, "FORBIDDEN");
  }

  return task;
};

const normalizeDocumentType = (rawType, userRole) => {
  if (rawType) {
    const typeLower = rawType.toLowerCase();
    if (typeLower.includes("admin") || typeLower.includes("requirement") || typeLower.includes("sop")) {
      return "Admin Attachment";
    }
    if (typeLower.includes("employee") || typeLower.includes("submission") || typeLower.includes("work")) {
      return "Employee Submission";
    }
  }

  return ["super_admin", "admin", "Admin"].includes(userRole)
    ? "Admin Attachment"
    : "Employee Submission";
};

const normalizeUserRole = (role) => {
  if (["super_admin", "admin"].includes(role)) return "Admin";
  return "Employee";
};

const safelyUnlinkFile = async (filePath) => {
  if (!filePath) return;

  try {
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(process.cwd(), filePath.replace(/^\/+/, ""));

    if (fs.existsSync(absolutePath)) {
      await fs.promises.unlink(absolutePath);
    }
  } catch (err) {
    console.error("Failed to delete local file:", err.message);
  }
};

export const uploadTaskDocuments = asyncHandler(async (req, res) => {
  const taskId = req.params.id || req.body.task_id || req.body.taskId;
  const task = await findTaskAndVerifyAccess(taskId, req.user);

  if (req.user.role === "employee" && task.status === "completed") {
    throw new AppError(
      "Cannot upload submission documents after task is marked completed",
      400,
      "TASK_COMPLETED"
    );
  }

  let filesToProcess = [];
  if (req.files) {
    if (Array.isArray(req.files)) {
      filesToProcess = req.files;
    } else if (typeof req.files === "object") {
      Object.values(req.files).forEach((fileArray) => {
        if (Array.isArray(fileArray)) filesToProcess.push(...fileArray);
      });
    }
  } else if (req.file) {
    filesToProcess = [req.file];
  }

  if (!filesToProcess.length) {
    throw new AppError("Please select at least one file to upload", 400, "NO_FILE_UPLOADED");
  }

  const comment = (req.body.comment || req.body.remarks || "").trim();
  const rawDocumentType = req.body.document_type || req.body.documentType;
  const documentType = normalizeDocumentType(rawDocumentType, req.user.role);
  const userRole = normalizeUserRole(req.user.role);

  const createdDocuments = [];

  for (const file of filesToProcess) {
    const extension = path.extname(file.originalname).toLowerCase();
    const storedName = file.filename;
    const filePath = `/uploads/${storedName}`;

    const newDoc = await TaskDocument.create({
      task_id: task._id,
      uploaded_by: req.user._id,
      user_role: userRole,
      document_type: documentType,
      comment,
      original_name: file.originalname,
      stored_name: storedName,
      file_path: filePath,
      extension,
      mime_type: file.mimetype,
      file_size: file.size,
    });

    const populatedDoc = await TaskDocument.findById(newDoc._id)
      .populate("uploaded_by", "name email role")
      .lean();

    createdDocuments.push(populatedDoc);

    await logActivity({
      req,
      action: "upload_document",
      module: "tasks",
      targetId: task._id,
      targetModel: "Task",
      description: `${req.user.name || "User"} (${userRole}) uploaded ${file.originalname}`,
      metadata: {
        documentId: newDoc._id,
        originalName: file.originalname,
        documentType,
        userRole,
        comment,
      },
    });
  }

  return res.status(201).json({
    success: true,
    message: `${createdDocuments.length} document(s) uploaded successfully`,
    data: {
      documents: createdDocuments,
    },
    error: null,
  });
});

export const getTaskDocuments = asyncHandler(async (req, res) => {
  const taskId = req.params.id;
  await findTaskAndVerifyAccess(taskId, req.user);

  const documents = await TaskDocument.find({ task_id: taskId })
    .populate("uploaded_by", "name email role")
    .sort({ created_at: -1 })
    .lean();

  const adminAttachments = documents.filter(
    (doc) => doc.document_type === "Admin Attachment" || doc.user_role === "Admin"
  );
  const employeeSubmissions = documents.filter(
    (doc) => doc.document_type === "Employee Submission" || doc.user_role === "Employee"
  );

  return res.status(200).json({
    success: true,
    message: "Task documents fetched successfully",
    data: {
      documents,
      adminAttachments,
      employeeSubmissions,
      count: documents.length,
    },
    error: null,
  });
});

export const updateTaskDocument = asyncHandler(async (req, res) => {
  const docId = req.params.id;

  if (!isValidObjectId(docId)) {
    throw new AppError("Invalid document ID", 400, "INVALID_DOCUMENT_ID");
  }

  const document = await TaskDocument.findById(docId);
  if (!document) {
    throw new AppError("Document not found", 404, "DOCUMENT_NOT_FOUND");
  }

  const task = await findTaskAndVerifyAccess(document.task_id, req.user);

  const isSuperAdmin = ["super_admin", "admin"].includes(req.user.role);
  const isOwner = isSameId(document.uploaded_by, req.user._id);

  if (!isSuperAdmin && !isOwner) {
    throw new AppError("You do not have permission to update this document", 403, "FORBIDDEN");
  }

  if (req.user.role === "employee" && task.status === "completed") {
    throw new AppError(
      "Cannot modify documents after task is marked completed",
      400,
      "TASK_COMPLETED"
    );
  }

  const updateFields = {};

  if (req.body.comment !== undefined) {
    updateFields.comment = req.body.comment.trim();
  }

  if (req.file) {
    await safelyUnlinkFile(document.file_path);

    const file = req.file;
    updateFields.extension = path.extname(file.originalname).toLowerCase();
    updateFields.original_name = file.originalname;
    updateFields.stored_name = file.filename;
    updateFields.file_path = `/uploads/${file.filename}`;
    updateFields.mime_type = file.mimetype;
    updateFields.file_size = file.size;
  }

  const updatedDocument = await TaskDocument.findByIdAndUpdate(docId, updateFields, {
    new: true,
    runValidators: true,
  })
    .populate("uploaded_by", "name email role")
    .lean();

  await logActivity({
    req,
    action: "update_document",
    module: "tasks",
    targetId: task._id,
    targetModel: "Task",
    description: `${req.user.name || "User"} updated document ${updatedDocument.original_name}`,
    metadata: {
      documentId: docId,
      originalName: updatedDocument.original_name,
    },
  });

  return res.status(200).json({
    success: true,
    message: "Document updated successfully",
    data: {
      document: updatedDocument,
    },
    error: null,
  });
});

export const deleteTaskDocument = asyncHandler(async (req, res) => {
  const docId = req.params.id;

  if (!isValidObjectId(docId)) {
    throw new AppError("Invalid document ID", 400, "INVALID_DOCUMENT_ID");
  }

  const document = await TaskDocument.findById(docId);
  if (!document) {
    throw new AppError("Document not found", 404, "DOCUMENT_NOT_FOUND");
  }

  const task = await findTaskAndVerifyAccess(document.task_id, req.user);

  const isSuperAdmin = ["super_admin", "admin"].includes(req.user.role);
  const isOwner = isSameId(document.uploaded_by, req.user._id);

  if (!isSuperAdmin && !isOwner) {
    throw new AppError("You do not have permission to delete this document", 403, "FORBIDDEN");
  }

  if (req.user.role === "employee" && task.status === "completed") {
    throw new AppError(
      "Cannot delete documents after task is marked completed",
      400,
      "TASK_COMPLETED"
    );
  }

  await safelyUnlinkFile(document.file_path);
  await TaskDocument.findByIdAndDelete(docId);

  await logActivity({
    req,
    action: "delete_document",
    module: "tasks",
    targetId: task._id,
    targetModel: "Task",
    description: `${req.user.name || "User"} deleted document ${document.original_name}`,
    metadata: {
      documentId: docId,
      originalName: document.original_name,
    },
  });

  return res.status(200).json({
    success: true,
    message: "Document deleted successfully",
    data: null,
    error: null,
  });
});

export const downloadTaskDocument = asyncHandler(async (req, res) => {
  const docId = req.params.id;

  if (!isValidObjectId(docId)) {
    throw new AppError("Invalid document ID", 400, "INVALID_DOCUMENT_ID");
  }

  const document = await TaskDocument.findById(docId);
  if (!document) {
    throw new AppError("Document not found", 404, "DOCUMENT_NOT_FOUND");
  }

  await findTaskAndVerifyAccess(document.task_id, req.user);

  const safeFilename = path.basename(document.stored_name);
  const absolutePath = path.join(process.cwd(), "uploads", safeFilename);

  if (!fs.existsSync(absolutePath)) {
    throw new AppError("Physical file not found on server", 404, "FILE_NOT_FOUND");
  }

  return res.download(absolutePath, document.original_name);
});

export const getTaskTimeline = asyncHandler(async (req, res) => {
  const taskId = req.params.id;
  const task = await Task.findById(taskId)
    .populate("createdBy", "name email role")
    .populate("assignedEmployee", "name email department designation")
    .populate("comments.commentedBy", "name email role")
    .populate("progressUpdates.updatedBy", "name email role")
    .lean();

  if (!task) {
    throw new AppError("Task not found", 404, "TASK_NOT_FOUND");
  }

  await findTaskAndVerifyAccess(taskId, req.user);

  const [documents, logs] = await Promise.all([
    TaskDocument.find({ task_id: taskId })
      .populate("uploaded_by", "name email role")
      .lean(),
    ActivityLog.find({ targetId: taskId, module: "tasks" })
      .populate("actor", "name email role")
      .lean(),
  ]);

  const timelineEvents = [];

  if (task.createdAt) {
    timelineEvents.push({
      id: `created-${task._id}`,
      type: "task_created",
      action: "Task Created",
      userName: task.createdBy?.name || "System Admin",
      userRole: normalizeUserRole(task.createdBy?.role || "admin"),
      timestamp: task.createdAt,
      details: {
        taskTitle: task.taskTitle,
        assignedEmployee: task.assignedEmployee?.name || "Employee",
      },
    });
  }

  documents.forEach((doc) => {
    timelineEvents.push({
      id: `doc-${doc._id}`,
      type: "document_upload",
      action: `Uploaded ${doc.original_name}`,
      userName: doc.uploaded_by?.name || "User",
      userRole: doc.user_role || normalizeUserRole(doc.uploaded_by?.role),
      timestamp: doc.created_at || doc.createdAt,
      details: {
        documentId: doc._id,
        originalName: doc.original_name,
        storedName: doc.stored_name,
        filePath: doc.file_path,
        fileSize: doc.file_size,
        extension: doc.extension,
        mimeType: doc.mime_type,
        documentType: doc.document_type,
        comment: doc.comment,
      },
    });
  });

  (task.progressUpdates || []).forEach((update) => {
    timelineEvents.push({
      id: `progress-${update._id}`,
      type: "progress_update",
      action: `Added progress update (${update.statusAtThatTime})`,
      userName: update.updatedBy?.name || "User",
      userRole: normalizeUserRole(update.updatedBy?.role || "employee"),
      timestamp: update.createdAt,
      details: {
        text: update.updateText,
        statusAtThatTime: update.statusAtThatTime,
      },
    });
  });

  (task.comments || []).forEach((comment) => {
    timelineEvents.push({
      id: `comment-${comment._id}`,
      type: "comment",
      action: "Added comment",
      userName: comment.commentedBy?.name || "User",
      userRole: normalizeUserRole(comment.commentedBy?.role),
      timestamp: comment.createdAt,
      details: {
        text: comment.commentText,
      },
    });
  });

  logs.forEach((log) => {
    if (["create", "update_status", "delete"].includes(log.action)) {
      timelineEvents.push({
        id: `log-${log._id}`,
        type: "activity_log",
        action: log.description || log.action,
        userName: log.actor?.name || "User",
        userRole: normalizeUserRole(log.actorRole || log.actor?.role),
        timestamp: log.createdAt,
        details: log.metadata || {},
      });
    }
  });

  if (task.completedAt) {
    timelineEvents.push({
      id: `completed-${task._id}`,
      type: "task_completed",
      action: "Marked task completed",
      userName: task.assignedEmployee?.name || "Employee",
      userRole: "Employee",
      timestamp: task.completedAt,
      details: {},
    });
  }

  // Sort events chronologically (oldest to newest for timeline presentation)
  timelineEvents.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  return res.status(200).json({
    success: true,
    message: "Task timeline fetched successfully",
    data: {
      timeline: timelineEvents,
    },
    error: null,
  });
});
