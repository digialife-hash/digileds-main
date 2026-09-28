import mongoose from "mongoose";
import Employee from "../models/Employee.js";
import Project from "../models/Project.js";
import Task, { taskPriorities, taskStatuses } from "../models/Task.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import logActivity from "../utils/logActivity.js";

const TASK_LIST_FIELDS =
  "taskTitle description assignedEmployee assignedUser relatedProject priority deadline status createdBy updatedBy completedAt createdAt updatedAt";

const TASK_DETAIL_FIELDS =
  "taskTitle description assignedEmployee assignedUser relatedProject priority deadline status createdBy updatedBy comments progressUpdates completedAt createdAt updatedAt";

const EMPLOYEE_BASIC_FIELDS = "name email phone department designation userId status";
const PROJECT_BASIC_FIELDS = "projectName category status priority deadline";
const USER_SAFE_FIELDS = "name email role status";

const TASK_CREATE_FIELDS = [
  "taskTitle",
  "description",
  "assignedEmployee",
  "relatedProject",
  "priority",
  "deadline",
];

const TASK_UPDATE_FIELDS = [
  "taskTitle",
  "description",
  "assignedEmployee",
  "relatedProject",
  "priority",
  "deadline",
  "status",
];

const EMPLOYEE_STATUS_TRANSITIONS = {
  pending: ["in_progress"],
  in_progress: ["submitted"],
  submitted: [],
  approved: [],
  rejected: ["in_progress"],
  completed: [],
};

const MANAGER_STATUS_TRANSITIONS = {
  pending: ["in_progress", "submitted"],
  in_progress: ["submitted"],
  submitted: ["approved", "rejected", "completed"],
  approved: ["completed", "rejected"],
  rejected: ["in_progress", "submitted"],
  completed: [],
};

const TERMINAL_STATUSES = ["completed"];

const escapeRegex = (value = "") => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

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

const normalizeTaskStatusValue = (status) => {
  if (status === "review") return "submitted";
  if (status === "cancelled") return "completed";
  return status;
};

const prepareTaskForResponse = (task) => {
  if (!task) return task;

  return {
    ...task,
    status: normalizeTaskStatusValue(task.status),
    progressUpdates: (task.progressUpdates || []).map((update) => ({
      ...update,
      statusAtThatTime: normalizeTaskStatusValue(update.statusAtThatTime),
    })),
  };
};

const prepareTasksForResponse = (tasks = []) => {
  return tasks.map((task) => prepareTaskForResponse(task));
};

export const validateTaskStatusTransition = ({
  currentStatus,
  nextStatus,
  role,
} = {}) => {
  const normalizedCurrentStatus = normalizeTaskStatusValue(currentStatus);
  const normalizedNextStatus = normalizeTaskStatusValue(nextStatus);

  if (!normalizedNextStatus || !taskStatuses.includes(normalizedNextStatus)) {
    throw new AppError("Invalid task status", 400, "INVALID_TASK_STATUS");
  }

  if (!normalizedCurrentStatus || !taskStatuses.includes(normalizedCurrentStatus)) {
    throw new AppError(
      "Current task status is invalid",
      400,
      "INVALID_CURRENT_TASK_STATUS"
    );
  }

  if (normalizedCurrentStatus === normalizedNextStatus) return true;

  if (TERMINAL_STATUSES.includes(normalizedCurrentStatus)) {
    throw new AppError(
      `Cannot change status after task is ${normalizedCurrentStatus}`,
      400,
      "TASK_STATUS_LOCKED"
    );
  }

  const transitions =
    role === "employee" ? EMPLOYEE_STATUS_TRANSITIONS : MANAGER_STATUS_TRANSITIONS;
  const allowedNextStatuses = transitions[normalizedCurrentStatus] || [];

  if (!allowedNextStatuses.includes(normalizedNextStatus)) {
    throw new AppError(
      `Cannot change task status from ${normalizedCurrentStatus} to ${normalizedNextStatus}`,
      400,
      "INVALID_STATUS_TRANSITION"
    );
  }

  return true;
};

export const canUserAccessTask = ({ user, task } = {}) => {
  if (!user || !task) return false;
  if (user.role === "super_admin") return true;

  if (user.role === "employee") {
    return (
      isSameId(task.assignedUser, user._id) ||
      isSameId(task.assignedEmployee?.userId, user._id) ||
      isSameId(task.assignedEmployee, user.linkedEmployeeId)
    );
  }

  return false;
};

const requireAuthenticatedUser = (user) => {
  if (!user) {
    throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
  }
};

const requireTaskManagerAccess = (user) => {
  requireAuthenticatedUser(user);

  if (user.role !== "super_admin") {
    throw new AppError("You are not allowed to manage tasks", 403, "FORBIDDEN");
  }
};

const requireSuperAdmin = (user) => {
  requireAuthenticatedUser(user);

  if (user.role !== "super_admin") {
    throw new AppError("Only super admin can delete tasks", 403, "FORBIDDEN");
  }
};

const pickFields = (body = {}, allowedFields = []) => {
  return allowedFields.reduce((payload, field) => {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      payload[field] = body[field];
    }

    return payload;
  }, {});
};

const getPagination = (query = {}) => {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(
    Math.max(Number.parseInt(query.limit, 10) || 10, 1),
    100
  );

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

const mergeFilters = (...filters) => {
  const cleanedFilters = filters.filter((filter) => {
    return filter && Object.keys(filter).length > 0;
  });

  if (!cleanedFilters.length) return {};
  if (cleanedFilters.length === 1) return cleanedFilters[0];

  return { $and: cleanedFilters };
};

const validateTaskId = (id) => {
  if (!isValidObjectId(id)) {
    throw new AppError("Invalid task id", 400, "INVALID_TASK_ID");
  }
};

const validateEmployeeId = (id) => {
  if (!isValidObjectId(id)) {
    throw new AppError("Invalid employee id", 400, "INVALID_EMPLOYEE_ID");
  }
};

const validateProjectId = (id) => {
  if (!isValidObjectId(id)) {
    throw new AppError("Invalid project id", 400, "INVALID_PROJECT_ID");
  }
};

const normalizeTaskPayload = (payload = {}) => {
  ["taskTitle", "description", "priority", "status"].forEach((field) => {
    if (typeof payload[field] === "string") {
      payload[field] = payload[field].trim();
    }
  });

  if (!payload.relatedProject) {
    delete payload.relatedProject;
  }

  if (!payload.deadline) {
    delete payload.deadline;
  } else {
    payload.deadline = new Date(payload.deadline);

    if (Number.isNaN(payload.deadline.getTime())) {
      throw new AppError("Deadline must be a valid date", 400, "INVALID_DEADLINE");
    }
  }

  return payload;
};

const validateRequiredTaskFields = (payload = {}) => {
  const requiredFields = ["taskTitle", "assignedEmployee"];
  const missingFields = requiredFields.filter((field) => !payload[field]);

  if (missingFields.length) {
    throw new AppError(
      `Missing required fields: ${missingFields.join(", ")}`,
      400,
      "REQUIRED_FIELDS_MISSING"
    );
  }
};

const validateTaskEnums = (payload = {}) => {
  if (payload.priority && !taskPriorities.includes(payload.priority)) {
    throw new AppError("Invalid task priority", 400, "INVALID_TASK_PRIORITY");
  }

  if (payload.status && !taskStatuses.includes(payload.status)) {
    throw new AppError("Invalid task status", 400, "INVALID_TASK_STATUS");
  }
};

const resolveAssignedEmployee = async (employeeId) => {
  validateEmployeeId(employeeId);

  const employee = await Employee.findById(employeeId)
    .select("_id userId status")
    .lean();

  if (!employee) {
    throw new AppError("Assigned employee not found", 404, "EMPLOYEE_NOT_FOUND");
  }

  return employee;
};

const validateRelatedProject = async (projectId) => {
  if (!projectId) return null;

  validateProjectId(projectId);

  const project = await Project.findById(projectId)
    .select("_id assignedTeam createdBy updatedBy")
    .lean();

  if (!project) {
    throw new AppError("Related project not found", 404, "PROJECT_NOT_FOUND");
  }

  return project;
};

const getLinkedEmployeeForUser = async (user) => {
  const lookup = [];

  if (user?._id) lookup.push({ userId: user._id });
  if (user?.email) lookup.push({ email: user.email });
  if (user?.phone) lookup.push({ phone: user.phone });

  if (!lookup.length) return null;

  return Employee.findOne({ $or: lookup }).select("_id userId").lean();
};

const getEmployeeTaskAccessFilter = async (user) => {
  const employee = await getLinkedEmployeeForUser(user);
  const accessFilters = [{ assignedUser: user._id }];

  if (employee) {
    accessFilters.push({ assignedEmployee: employee._id });
  }

  return {
    filter: { $or: accessFilters },
    employee,
  };
};

const getTaskAccessFilterForUser = async (user) => {
  requireAuthenticatedUser(user);

  if (user.role === "super_admin") return {};
  if (user.role === "employee") {
    const { filter } = await getEmployeeTaskAccessFilter(user);
    return filter;
  }

  throw new AppError("You are not allowed to access tasks", 403, "FORBIDDEN");
};

const buildTaskFilter = (query = {}) => {
  const filter = {};
  const {
    assignedEmployee,
    relatedProject,
    priority,
    status,
    createdBy,
    deadlineFrom,
    deadlineTo,
    startDate,
    endDate,
    search = "",
  } = query;

  if (assignedEmployee) {
    validateEmployeeId(assignedEmployee.trim());
    filter.assignedEmployee = assignedEmployee.trim();
  }

  if (relatedProject) {
    validateProjectId(relatedProject.trim());
    filter.relatedProject = relatedProject.trim();
  }

  if (createdBy) {
    if (!isValidObjectId(createdBy.trim())) {
      throw new AppError("Invalid created by user id", 400, "INVALID_CREATED_BY");
    }

    filter.createdBy = createdBy.trim();
  }

  if (priority) {
    const normalizedPriority = priority.trim();

    if (!taskPriorities.includes(normalizedPriority)) {
      throw new AppError("Invalid task priority", 400, "INVALID_TASK_PRIORITY");
    }

    filter.priority = normalizedPriority;
  }

  if (status) {
    const normalizedStatus = normalizeTaskStatusValue(status.trim());

    if (!taskStatuses.includes(normalizedStatus)) {
      throw new AppError("Invalid task status", 400, "INVALID_TASK_STATUS");
    }

    filter.status =
      normalizedStatus === "submitted"
        ? { $in: ["submitted", "review"] }
        : normalizedStatus;
  }

  const fromDate = deadlineFrom || startDate;
  const toDate = deadlineTo || endDate;

  if (fromDate || toDate) {
    filter.deadline = {};

    if (fromDate) {
      const parsedFrom = new Date(fromDate);

      if (Number.isNaN(parsedFrom.getTime())) {
        throw new AppError("Invalid deadline start date", 400, "INVALID_DEADLINE");
      }

      filter.deadline.$gte = parsedFrom;
    }

    if (toDate) {
      const parsedTo = new Date(toDate);

      if (Number.isNaN(parsedTo.getTime())) {
        throw new AppError("Invalid deadline end date", 400, "INVALID_DEADLINE");
      }

      filter.deadline.$lte = parsedTo;
    }
  }

  if (search.trim()) {
    const searchRegex = new RegExp(escapeRegex(search.trim()), "i");

    filter.$or = [
      { taskTitle: searchRegex },
      { description: searchRegex },
    ];
  }

  return filter;
};

const getTaskSort = (sort = "newest") => {
  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    deadlineAsc: { deadline: 1, createdAt: -1 },
    deadlineDesc: { deadline: -1, createdAt: -1 },
    priority: { priority: 1, createdAt: -1 },
  };

  return sortOptions[sort] || sortOptions.newest;
};

const populateTaskQuery = (query) => {
  return query
    .populate("assignedEmployee", EMPLOYEE_BASIC_FIELDS)
    .populate("assignedUser", USER_SAFE_FIELDS)
    .populate("relatedProject", PROJECT_BASIC_FIELDS)
    .populate("createdBy", USER_SAFE_FIELDS)
    .populate("updatedBy", USER_SAFE_FIELDS)
    .populate("comments.commentedBy", USER_SAFE_FIELDS)
    .populate("progressUpdates.updatedBy", USER_SAFE_FIELDS);
};

const applyTaskStatusTimestamps = (payload = {}, existingTask = {}) => {
  if (!payload.status) return payload;

  if (payload.status === "completed") {
    payload.completedAt = existingTask.completedAt || new Date();
  } else {
    payload.completedAt = null;
  }

  return payload;
};

const findTaskForAccessCheck = (taskId) => {
  return Task.findById(taskId)
    .select(
      "_id assignedEmployee assignedUser relatedProject createdBy updatedBy status completedAt"
    )
    .populate("assignedEmployee", "_id userId")
    .populate("relatedProject", "_id assignedTeam createdBy updatedBy")
    .lean();
};

const ensureCanMutateTask = async (user, taskId) => {
  if (user.role === "super_admin") return;

  const task = await findTaskForAccessCheck(taskId);
  const linkedEmployee = user.role === "employee" ? await getLinkedEmployeeForUser(user) : null;
  const accessUser = {
    ...user.toObject?.(),
    _id: user._id,
    role: user.role,
    linkedEmployeeId: linkedEmployee?._id,
  };

  if (!canUserAccessTask({ user: accessUser, task })) {
    throw new AppError("Task not found", 404, "TASK_NOT_FOUND");
  }
};

const sendTaskListResponse = async ({ res, filter, query, message }) => {
  const { page, limit, skip } = getPagination(query);

  const [tasks, totalTasks] = await Promise.all([
    populateTaskQuery(
      Task.find(filter)
        .select(TASK_LIST_FIELDS)
        .sort(getTaskSort(query.sort))
        .skip(skip)
        .limit(limit)
    ).lean(),
    Task.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    message,
    data: {
      tasks: prepareTasksForResponse(tasks),
      pagination: {
        page,
        limit,
        total: totalTasks,
        totalPages: Math.ceil(totalTasks / limit),
      },
    },
    error: null,
  });
};

export const createTask = asyncHandler(async (req, res) => {
  requireTaskManagerAccess(req.user);

  const payload = normalizeTaskPayload(pickFields(req.body, TASK_CREATE_FIELDS));
  validateRequiredTaskFields(payload);
  validateTaskEnums(payload);

  payload.status = "pending";

  const [employee] = await Promise.all([
    resolveAssignedEmployee(payload.assignedEmployee),
    validateRelatedProject(payload.relatedProject),
  ]);

  const task = await Task.create({
    ...payload,
    assignedUser: employee.userId || null,
    createdBy: req.user._id,
    updatedBy: req.user._id,
  });

  const createdTask = await populateTaskQuery(
    Task.findById(task._id).select(TASK_DETAIL_FIELDS)
  ).lean();

  await logActivity({
    req,
    action: "create",
    module: "tasks",
    targetId: createdTask._id,
    targetModel: "Task",
    description: "Super admin assigned task",
    metadata: {
      taskTitle: createdTask.taskTitle,
      assignedEmployee: getIdString(createdTask.assignedEmployee),
      relatedProject: getIdString(createdTask.relatedProject),
      priority: createdTask.priority,
      deadline: createdTask.deadline,
    },
  });

  return res.status(201).json({
    success: true,
    message: "Task created successfully",
    data: {
      task: prepareTaskForResponse(createdTask),
    },
    error: null,
  });
});

export const getAllTasksForSuperAdmin = asyncHandler(async (req, res) => {
  requireAuthenticatedUser(req.user);

  if (!["super_admin", "admin"].includes(req.user.role)) {
    throw new AppError("You are not allowed to view all tasks", 403, "FORBIDDEN");
  }

  return sendTaskListResponse({
    res,
    filter: buildTaskFilter(req.query),
    query: req.query,
    message: "Tasks fetched successfully",
  });
});

export const getMyAssignedTasks = asyncHandler(async (req, res) => {
  requireAuthenticatedUser(req.user);

  if (req.user.role !== "employee") {
    throw new AppError(
      "Only employees can access assigned tasks",
      403,
      "FORBIDDEN"
    );
  }

  const { filter: accessFilter } = await getEmployeeTaskAccessFilter(req.user);
  const requestedFilter = buildTaskFilter({
    status: req.query.status,
    priority: req.query.priority,
    relatedProject: req.query.relatedProject,
    search: req.query.search,
  });

  return sendTaskListResponse({
    res,
    filter: mergeFilters(requestedFilter, accessFilter),
    query: {
      ...req.query,
      sort: req.query.sort || "deadlineAsc",
    },
    message: "Assigned tasks fetched successfully",
  });
});

export const getTaskById = asyncHandler(async (req, res) => {
  requireAuthenticatedUser(req.user);

  const { id } = req.params;
  validateTaskId(id);

  const accessTask = await findTaskForAccessCheck(id);
  const linkedEmployee =
    req.user.role === "employee" ? await getLinkedEmployeeForUser(req.user) : null;
  const accessUser = {
    ...req.user.toObject?.(),
    _id: req.user._id,
    role: req.user.role,
    linkedEmployeeId: linkedEmployee?._id,
  };

  if (!canUserAccessTask({ user: accessUser, task: accessTask })) {
    throw new AppError("Task not found", 404, "TASK_NOT_FOUND");
  }

  const task = await populateTaskQuery(
    Task.findById(id).select(TASK_DETAIL_FIELDS)
  ).lean();

  if (!task) {
    throw new AppError("Task not found", 404, "TASK_NOT_FOUND");
  }

  return res.status(200).json({
    success: true,
    message: "Task fetched successfully",
    data: {
      task: prepareTaskForResponse(task),
    },
    error: null,
  });
});

export const updateTask = asyncHandler(async (req, res) => {
  requireTaskManagerAccess(req.user);

  const { id } = req.params;
  validateTaskId(id);

  const existingTask = await Task.findById(id)
    .select("_id status completedAt")
    .lean();

  if (!existingTask) {
    throw new AppError("Task not found", 404, "TASK_NOT_FOUND");
  }

  await ensureCanMutateTask(req.user, id);

  const payload = normalizeTaskPayload(pickFields(req.body, TASK_UPDATE_FIELDS));
  validateTaskEnums(payload);

  if (payload.status) {
    validateTaskStatusTransition({
      currentStatus: existingTask.status,
      nextStatus: payload.status,
      role: req.user.role,
    });
  }

  if (payload.assignedEmployee) {
    const employee = await resolveAssignedEmployee(payload.assignedEmployee);
    payload.assignedUser = employee.userId || null;
  }

  if (payload.relatedProject) {
    await validateRelatedProject(payload.relatedProject);
  }

  const updatePayload = applyTaskStatusTimestamps(payload, existingTask);
  updatePayload.updatedBy = req.user._id;

  const updatedTask = await populateTaskQuery(
    Task.findByIdAndUpdate(id, updatePayload, {
      new: true,
      runValidators: true,
    }).select(TASK_DETAIL_FIELDS)
  ).lean();

  return res.status(200).json({
    success: true,
    message: "Task updated successfully",
    data: {
      task: prepareTaskForResponse(updatedTask),
    },
    error: null,
  });
});

export const updateMyTaskStatus = asyncHandler(async (req, res) => {
  requireAuthenticatedUser(req.user);

  if (req.user.role !== "employee") {
    throw new AppError("Only employees can update assigned task status", 403, "FORBIDDEN");
  }

  const { id } = req.params;
  const { status } = req.body;

  validateTaskId(id);

  if (!status || !taskStatuses.includes(status)) {
    throw new AppError("Invalid task status", 400, "INVALID_TASK_STATUS");
  }

  const accessFilter = await getTaskAccessFilterForUser(req.user);
  const task = await Task.findOne(mergeFilters({ _id: id }, accessFilter))
    .select("_id status completedAt")
    .lean();

  if (!task) {
    throw new AppError("Task not found", 404, "TASK_NOT_FOUND");
  }

  if (TERMINAL_STATUSES.includes(task.status)) {
    throw new AppError(
      `Cannot update status after task is ${task.status}`,
      400,
      "TASK_LOCKED"
    );
  }

  validateTaskStatusTransition({
    currentStatus: task.status,
    nextStatus: status,
    role: req.user.role,
  });

  const statusUpdate = applyTaskStatusTimestamps(
    {
      status,
      updatedBy: req.user._id,
    },
    task
  );

  if (status !== task.status) {
    statusUpdate.$push = {
      progressUpdates: {
        updateText: `Status changed from ${task.status} to ${status}`,
        statusAtThatTime: status,
        updatedBy: req.user._id,
      },
    };
  }

  const update = statusUpdate.$push
    ? {
        $set: {
          status: statusUpdate.status,
          completedAt: statusUpdate.completedAt,
          updatedBy: req.user._id,
        },
        $push: statusUpdate.$push,
      }
    : {
        $set: {
          status,
          updatedBy: req.user._id,
        },
      };

  const updatedTask = await populateTaskQuery(
    Task.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).select(TASK_DETAIL_FIELDS)
  ).lean();

  return res.status(200).json({
    success: true,
    message: "Task status updated successfully",
    data: {
      task: prepareTaskForResponse(updatedTask),
    },
    error: null,
  });
});

export const addTaskProgressUpdate = asyncHandler(async (req, res) => {
  requireAuthenticatedUser(req.user);

  const { id } = req.params;
  const updateText = req.body.updateText?.trim();

  validateTaskId(id);

  if (!updateText) {
    throw new AppError("Progress update text is required", 400, "UPDATE_TEXT_REQUIRED");
  }

  const accessFilter = await getTaskAccessFilterForUser(req.user);
  const task = await Task.findOne(mergeFilters({ _id: id }, accessFilter))
    .select("_id status")
    .lean();

  if (!task) {
    throw new AppError("Task not found", 404, "TASK_NOT_FOUND");
  }

  if (req.user.role === "employee" && TERMINAL_STATUSES.includes(task.status)) {
    throw new AppError(
      `Cannot add progress update after task is ${task.status}`,
      400,
      "TASK_LOCKED"
    );
  }

  const updatedTask = await populateTaskQuery(
    Task.findByIdAndUpdate(
      id,
      {
        $push: {
          progressUpdates: {
            updateText,
            statusAtThatTime: task.status,
            updatedBy: req.user._id,
          },
        },
        $set: {
          updatedBy: req.user._id,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select(TASK_DETAIL_FIELDS)
  ).lean();

  return res.status(200).json({
    success: true,
    message: "Task progress update added successfully",
    data: {
      task: prepareTaskForResponse(updatedTask),
    },
    error: null,
  });
});

export const addTaskComment = asyncHandler(async (req, res) => {
  requireAuthenticatedUser(req.user);

  const { id } = req.params;
  const commentText = req.body.commentText?.trim();

  validateTaskId(id);

  if (!commentText) {
    throw new AppError("Comment text is required", 400, "COMMENT_TEXT_REQUIRED");
  }

  const accessFilter = await getTaskAccessFilterForUser(req.user);
  const task = await Task.findOne(mergeFilters({ _id: id }, accessFilter))
    .select("_id")
    .lean();

  if (!task) {
    throw new AppError("Task not found", 404, "TASK_NOT_FOUND");
  }

  const updatedTask = await populateTaskQuery(
    Task.findByIdAndUpdate(
      id,
      {
        $push: {
          comments: {
            commentText,
            commentedBy: req.user._id,
          },
        },
        $set: {
          updatedBy: req.user._id,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select(TASK_DETAIL_FIELDS)
  ).lean();

  return res.status(200).json({
    success: true,
    message: "Task comment added successfully",
    data: {
      task: prepareTaskForResponse(updatedTask),
    },
    error: null,
  });
});

export const deleteTask = asyncHandler(async (req, res) => {
  requireSuperAdmin(req.user);

  const { id } = req.params;
  validateTaskId(id);

  const deletedTask = await Task.findByIdAndDelete(id).select("_id").lean();

  if (!deletedTask) {
    throw new AppError("Task not found", 404, "TASK_NOT_FOUND");
  }

  return res.status(200).json({
    success: true,
    message: "Task deleted successfully",
    data: null,
    error: null,
  });
});
