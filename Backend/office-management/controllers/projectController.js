import mongoose from "mongoose";
import { getRepositoryData } from "../services/githubService.js";
import Client from "../models/Client.js";
import Employee from "../models/Employee.js";
import Invoice from "../models/Invoice.js";
import Project, {
  projectPriorities,
  projectStatuses,
} from "../models/Project.js";
import ServiceRequest from "../models/ServiceRequest.js";
import Task from "../models/Task.js";
import Team from "../models/Team.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

const PROJECT_LIST_FIELDS =
  "projectName clientId category assignedTeam assignedTeams startDate deadline budget github status priority progressPercentage serviceRequestId createdAt updatedAt";

const PROJECT_DETAIL_FIELDS =
  "projectName clientId category assignedTeam assignedTeams startDate deadline budget status priority github description progressPercentage notes serviceRequestId createdBy updatedBy completedAt cancelledAt createdAt updatedAt";

const USER_BASIC_FIELDS = "name email phone role status";
const CLIENT_BASIC_FIELDS =
  "clientName companyName email phone businessCategory status";
const SERVICE_REQUEST_STATUS_FIELDS =
  "clientName clientEmail clientPhone companyName address gstNumber serviceRequired projectTitle projectDescription budgetRange deadline priority category referenceLinks attachments status statusHistory adminRemarks convertedToProject createdAt updatedAt";
const EMPLOYEE_BASIC_FIELDS = "name email phone department designation status";
const TEAM_PROJECT_FIELDS =
  "teamName teamLead members department assignedProjects status description createdAt updatedAt";
const TASK_PROJECT_FIELDS =
  "taskTitle description assignedEmployee assignedUser relatedProject priority deadline status createdBy updatedBy completedAt createdAt updatedAt";

const getProjectListFieldsForUser = (user) => {
  return ["super_admin", "admin"].includes(user?.role)
    ? PROJECT_LIST_FIELDS
    : PROJECT_LIST_FIELDS.replace(/\bbudget\b/g, "").replace(/\s+/g, " ").trim();
};

const getProjectDetailFieldsForUser = (user) => {
  return ["super_admin", "admin"].includes(user?.role)
    ? PROJECT_DETAIL_FIELDS
    : PROJECT_DETAIL_FIELDS.replace(/\bbudget\b/g, "").replace(/\s+/g, " ").trim();
};

const PROJECT_CREATE_FIELDS = [
  "projectName",
  "clientId",
  "category",
  "assignedTeam",
  "assignedTeams",
  "startDate",
  "deadline",
  "budget",
  "status",
  "priority",
  "githubRepo",
  "description",
  "progressPercentage",
  "notes",
  "serviceRequestId",
];

const PROJECT_UPDATE_FIELDS = [
  "projectName",
  "clientId",
  "category",
  "assignedTeam",
  "assignedTeams",
  "startDate",
  "deadline",
  "budget",
  "status",
  "priority",
  "githubRepo",
  "description",
  "progressPercentage",
  "notes",
  "serviceRequestId",
];

const escapeRegex = (value = "") => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);
};


const extractOwnerRepo = (githubUrl) => {
  try {
    const url = new URL(githubUrl.trim());

    if (url.hostname !== "github.com") {
      throw new Error();
    }

    const parts = url.pathname
      .replace(/^\/|\/$/g, "") // first/last slash remove
      .replace(/\.git$/, "")   // .git remove
      .split("/");

    if (parts.length < 2) {
      throw new Error();
    }

    return {
      owner: parts[0],
      repo: parts[1],
    };
  } catch {
    throw new AppError(
      "Invalid Github Repository URL",
      400,
      "INVALID_GITHUB_REPO_URL"
    );
  }
};

const requireAuthenticatedUser = (user) => {
  if (!user) {
    throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
  }
};

const requireSuperAdmin = (user) => {
  requireAuthenticatedUser(user);

  if (user.role !== "super_admin") {
    throw new AppError(
      "Only super admin can delete projects",
      403,
      "FORBIDDEN"
    );
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

const normalizeProjectPayload = (payload = {}) => {
  ["projectName", "category", "description", "notes","githubRepo"].forEach((field) => {
    if (typeof payload[field] === "string") {
      payload[field] = payload[field].trim();
    }
  });

  if (payload.budget !== undefined) {
    payload.budget = Number(payload.budget);
  }

  if (payload.progressPercentage !== undefined) {
    payload.progressPercentage = Number(payload.progressPercentage);
  }

  if (!payload.startDate) delete payload.startDate;
  if (!payload.deadline) delete payload.deadline;
  if (!payload.serviceRequestId) delete payload.serviceRequestId;

  if (payload.assignedTeam !== undefined && !Array.isArray(payload.assignedTeam)) {
    payload.assignedTeam = [];
  }

  if (payload.assignedTeams !== undefined && !Array.isArray(payload.assignedTeams)) {
    payload.assignedTeams = [];
  }

  return payload;
};

const getPagination = (query) => {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 10, 1), 100);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

const validateProjectId = (id) => {
  if (!isValidObjectId(id)) {
    throw new AppError("Invalid project id", 400, "INVALID_PROJECT_ID");
  }
};

const validateRequiredProjectFields = (payload) => {
  const requiredFields = ["projectName", "clientId"];
  const missingFields = requiredFields.filter((field) => !payload[field]);

  if (missingFields.length) {
    throw new AppError(
      `Missing required fields: ${missingFields.join(", ")}`,
      400,
      "REQUIRED_FIELDS_MISSING"
    );
  }
};

const validateObjectIdField = (payload, field, errorCode) => {
  if (payload[field] && !isValidObjectId(payload[field])) {
    throw new AppError(`Invalid ${field}`, 400, errorCode);
  }
};

const validateEnumFields = (payload) => {
  if (payload.status && !projectStatuses.includes(payload.status)) {
    throw new AppError("Invalid project status", 400, "INVALID_PROJECT_STATUS");
  }

  if (payload.priority && !projectPriorities.includes(payload.priority)) {
    throw new AppError(
      "Invalid project priority",
      400,
      "INVALID_PROJECT_PRIORITY"
    );
  }
};

const validateNumericFields = (payload) => {
  if (payload.budget !== undefined && (!Number.isFinite(payload.budget) || payload.budget < 0)) {
    throw new AppError("Budget cannot be negative", 400, "INVALID_BUDGET");
  }

  if (
    payload.progressPercentage !== undefined &&
    (!Number.isFinite(payload.progressPercentage) ||
      payload.progressPercentage < 0 ||
      payload.progressPercentage > 100)
  ) {
    throw new AppError(
      "Progress percentage must be between 0 and 100",
      400,
      "INVALID_PROGRESS_PERCENTAGE"
    );
  }
};

const uniqueIds = (values = []) => {
  return [...new Set(values.map((value) => String(value)).filter(Boolean))];
};

const validateAssignedTeam = async (assignedTeam = []) => {
  if (!Array.isArray(assignedTeam) || !assignedTeam.length) return;

  const employeeIds = uniqueIds(assignedTeam);
  const invalidId = employeeIds.find((id) => !isValidObjectId(id));

  if (invalidId) {
    throw new AppError(
      "Assigned users/employees contains an invalid id",
      400,
      "INVALID_ASSIGNED_TEAM"
    );
  }

  const employeesCount = await Employee.countDocuments({
    _id: { $in: employeeIds },
    status: "active",
  });

  if (employeesCount !== employeeIds.length) {
    throw new AppError(
      "One or more assigned users/employees do not exist or are inactive",
      400,
      "INVALID_ASSIGNED_TEAM"
    );
  }
};

const validateAssignedTeams = async (assignedTeams = []) => {
  if (!Array.isArray(assignedTeams) || !assignedTeams.length) return;

  const teamIds = uniqueIds(assignedTeams);
  const invalidId = teamIds.find((id) => !isValidObjectId(id));

  if (invalidId) {
    throw new AppError(
      "Assigned teams contains an invalid team id",
      400,
      "INVALID_ASSIGNED_TEAMS"
    );
  }

  const teamsCount = await Team.countDocuments({
    _id: { $in: teamIds },
    status: "active",
  });

  if (teamsCount !== teamIds.length) {
    throw new AppError(
      "One or more assigned teams do not exist or are inactive",
      400,
      "INVALID_ASSIGNED_TEAMS"
    );
  }
};

const validateClientExists = async (clientId) => {
  validateObjectIdField({ clientId }, "clientId", "INVALID_CLIENT_ID");

  const client = await Client.findById(clientId).select("_id").lean();

  if (!client) {
    throw new AppError("Client not found", 404, "CLIENT_NOT_FOUND");
  }
};

const validateServiceRequestLink = async (serviceRequestId, projectId = null) => {
  if (!serviceRequestId) return;

  validateObjectIdField(
    { serviceRequestId },
    "serviceRequestId",
    "INVALID_SERVICE_REQUEST_ID"
  );

  const serviceRequest = await ServiceRequest.findById(serviceRequestId)
    .select("_id")
    .lean();

  if (!serviceRequest) {
    throw new AppError(
      "Service request not found",
      404,
      "SERVICE_REQUEST_NOT_FOUND"
    );
  }

  const existingProject = await Project.findOne({ serviceRequestId })
    .select("_id")
    .lean();

  if (existingProject && String(existingProject._id) !== String(projectId)) {
    throw new AppError(
      "Service request is already linked to another project",
      409,
      "SERVICE_REQUEST_ALREADY_LINKED"
    );
  }
};

const mapServiceRequestStatusToProjectStatus = (
  serviceRequestStatus,
  fallbackStatus = "not_started"
) => {
  const statusMap = {
    submitted: "not_started",
    reviewed: "not_started",
    approved: "not_started",
    in_progress: "in_progress",
    completed: "completed",
    closed: "completed",
  };

  return statusMap[serviceRequestStatus] || fallbackStatus;
};

const attachServiceRequestStatus = (project) => {
  if (!project) return project;

  const serviceRequest = project.serviceRequestId;

  if (!serviceRequest || typeof serviceRequest !== "object") {
    return project;
  }

  const storedStatus = project.status;
  const serviceRequestStatus = serviceRequest.status;

  return {
    ...project,
    storedStatus,
    status: mapServiceRequestStatusToProjectStatus(
      serviceRequestStatus,
      storedStatus
    ),
    serviceRequestStatus,
  };
};

const removeBudgetForRestrictedRoles = (project, user) => {
  if (!project || user?.role === "super_admin") return project;

  const sanitizedProject = { ...project };
  delete sanitizedProject.budget;

  return sanitizedProject;
};

const removeClientRestrictedProjectFields = (project) => {
  if (!project) return project;

  const sanitizedProject = { ...project };
  delete sanitizedProject.budget;
  delete sanitizedProject.assignedTeam;
  delete sanitizedProject.assignedTeams;
  delete sanitizedProject.projectTasks;
  delete sanitizedProject.createdBy;
  delete sanitizedProject.updatedBy;
  delete sanitizedProject.notes;

  return sanitizedProject;
};

const prepareProjectForResponse = (project, user) => {
  const preparedProject = removeBudgetForRestrictedRoles(
    attachServiceRequestStatus(project),
    user
  );

  if (user?.role === "client") {
    return removeClientRestrictedProjectFields(preparedProject);
  }

  return preparedProject;
};

const prepareProjectsForResponse = (projects = [], user) => {
  return projects.map((project) => prepareProjectForResponse(project, user));
};

const attachLatestInvoiceInfo = async (projects = []) => {
  const projectList = Array.isArray(projects) ? projects : [projects];
  const projectIds = uniqueIds(projectList.map((project) => project?._id));

  if (!projectIds.length) return projects;

  const invoices = await Invoice.find({ projectId: { $in: projectIds } })
    .select("invoiceNumber projectId paymentStatus dueDate paidDate totalAmount createdAt")
    .sort({ createdAt: -1 })
    .lean();

  const latestInvoiceByProject = new Map();

  invoices.forEach((invoice) => {
    const projectId = String(invoice.projectId);
    if (!latestInvoiceByProject.has(projectId)) {
      latestInvoiceByProject.set(projectId, invoice);
    }
  });

  const withInvoiceInfo = projectList.map((project) => {
    if (!project?._id) return project;

    const latestInvoice = latestInvoiceByProject.get(String(project._id));

    return {
      ...project,
      paymentStatus: latestInvoice?.paymentStatus || "pending",
      invoiceStatus: latestInvoice?.paymentStatus || "not_generated",
      latestInvoice: latestInvoice
        ? {
            invoiceNumber: latestInvoice.invoiceNumber,
            amount: latestInvoice.totalAmount,
            paymentStatus: latestInvoice.paymentStatus,
            dueDate: latestInvoice.dueDate,
            paidDate: latestInvoice.paidDate,
          }
        : null,
    };
  });

  return Array.isArray(projects) ? withInvoiceInfo : withInvoiceInfo[0];
};

const getProjectWorkContext = async (projectId) => {
  const [teams, tasks] = await Promise.all([
    Team.find({ assignedProjects: projectId })
      .select(TEAM_PROJECT_FIELDS)
      .populate("teamLead", EMPLOYEE_BASIC_FIELDS)
      .populate("members", EMPLOYEE_BASIC_FIELDS)
      .sort({ updatedAt: -1 })
      .lean(),
    Task.find({ relatedProject: projectId })
      .select(TASK_PROJECT_FIELDS)
      .populate("assignedEmployee", EMPLOYEE_BASIC_FIELDS)
      .populate("assignedUser", USER_BASIC_FIELDS)
      .populate("createdBy", USER_BASIC_FIELDS)
      .populate("updatedBy", USER_BASIC_FIELDS)
      .sort({ status: 1, deadline: 1, createdAt: -1 })
      .lean(),
  ]);

  return {
    assignedTeams: teams,
    projectTasks: tasks,
  };
};

export const normalizeProjectStatusAndProgress = (
  updateData,
  existingProject = {}
) => {
  const normalized = { ...updateData };
  const currentStatus = existingProject.status || "not_started";
  const currentProgress = existingProject.progressPercentage ?? 0;
  const hasStatus = Object.prototype.hasOwnProperty.call(normalized, "status");
  const hasProgress = Object.prototype.hasOwnProperty.call(
    normalized,
    "progressPercentage"
  );

  const nextStatus = hasStatus ? normalized.status : currentStatus;
  const nextProgress = hasProgress
    ? normalized.progressPercentage
    : currentProgress;

  if (
    hasProgress &&
    (!Number.isFinite(nextProgress) || nextProgress < 0 || nextProgress > 100)
  ) {
    throw new AppError(
      "Progress percentage must be between 0 and 100",
      400,
      "INVALID_PROGRESS_PERCENTAGE"
    );
  }

  if (nextStatus === "not_started" && !hasProgress) {
    normalized.progressPercentage = 0;
  }

  if (nextStatus === "not_started" && hasProgress && nextProgress > 0) {
    normalized.status = "in_progress";
  }

  if (nextStatus === "in_progress" && hasProgress) {
    normalized.progressPercentage = nextProgress;
  }

  if (hasProgress && nextProgress === 100) {
    normalized.status = "completed";
  }

  if (normalized.status === "completed") {
    normalized.progressPercentage = 100;
    normalized.completedAt = existingProject.completedAt || new Date();
    normalized.cancelledAt = null;
  }

  if (normalized.status === "cancelled") {
    normalized.cancelledAt = existingProject.cancelledAt || new Date();
  }

  if (normalized.status && normalized.status !== "completed") {
    normalized.completedAt = null;
  }

  if (normalized.status && normalized.status !== "cancelled") {
    normalized.cancelledAt = null;
  }

  return normalized;
};

const buildProjectFilter = (query = {}) => {
  const filter = {};
  const {
    clientId,
    category,
    status,
    priority,
    startDate,
    deadline,
    employeeId,
    teamMember,
    search = "",
  } = query;

  if (clientId) {
    if (!isValidObjectId(clientId.trim())) {
      throw new AppError("Invalid client id", 400, "INVALID_CLIENT_ID");
    }

    filter.clientId = clientId.trim();
  }
  if (category) filter.category = category.trim();
  if (status) {
    const trimmedStatus = status.trim();
    if (trimmedStatus === "active") {
      filter.status = { $in: ["not_started", "in_progress", "on_hold"] };
    } else {
      filter.status = trimmedStatus;
    }
  }
  if (priority) filter.priority = priority.trim();

  const teamMemberId = employeeId || teamMember;
  if (teamMemberId) {
    if (!isValidObjectId(teamMemberId.trim())) {
      throw new AppError("Invalid team member id", 400, "INVALID_TEAM_MEMBER_ID");
    }

    filter.assignedTeam = teamMemberId.trim();
  }

  if (startDate) {
    filter.startDate = { $gte: new Date(startDate) };
  }

  if (deadline) {
    filter.deadline = { $lte: new Date(deadline) };
  }

  if (search.trim()) {
    const searchRegex = new RegExp(escapeRegex(search.trim()), "i");

    filter.$or = [
      { projectName: searchRegex },
      { category: searchRegex },
      { description: searchRegex },
    ];
  }

  return filter;
};

const populateProjectQuery = (query) => {
  return query
    .populate("clientId", CLIENT_BASIC_FIELDS)
    .populate("serviceRequestId", SERVICE_REQUEST_STATUS_FIELDS)
    .populate("assignedTeam", EMPLOYEE_BASIC_FIELDS)
    .populate({
      path: "assignedTeams",
      select: TEAM_PROJECT_FIELDS,
      populate: [
        { path: "teamLead", select: EMPLOYEE_BASIC_FIELDS },
        { path: "members", select: EMPLOYEE_BASIC_FIELDS },
      ],
    })
    .populate("createdBy", USER_BASIC_FIELDS)
    .populate("updatedBy", USER_BASIC_FIELDS);
};

const findClientProfilesForUser = async (user) => {
  const lookup = [];

  if (user.email) lookup.push({ email: user.email });
  if (user.phone) lookup.push({ phone: user.phone });

  if (!lookup.length) return [];

  return Client.find({ $or: lookup }).select("_id").lean();
};

const findEmployeeProfileForUser = async (user) => {
  const lookup = [];

  if (user._id) lookup.push({ userId: user._id });
  if (user.email) lookup.push({ email: user.email });
  if (user.phone) lookup.push({ phone: user.phone });

  if (!lookup.length) return null;

  return Employee.findOne({ $or: lookup }).select("_id").lean();
};

const getEmployeeProjectAccessContext = async (user) => {
  const employeeProfile = await findEmployeeProfileForUser(user);
  const assignedIdentityIds = uniqueIds([user?._id, employeeProfile?._id]);

  if (!assignedIdentityIds.length) {
    return {
      assignedIdentityIds: [],
      teamIds: [],
      projectIds: [],
    };
  }

  const { teamIds, projectIds } = await getProjectTeamContextForEmployee(
    employeeProfile?._id
  );

  return {
    assignedIdentityIds,
    teamIds,
    projectIds,
  };
};

const getProjectTeamContextForEmployee = async (employeeId) => {
  if (!employeeId) {
    return {
      teamIds: [],
      projectIds: [],
    };
  }

  const teams = await Team.find({
    status: "active",
    $or: [{ members: employeeId }, { teamLead: employeeId }],
  })
    .select("_id assignedProjects")
    .lean();

  return {
    teamIds: teams.map((team) => team._id),
    projectIds: uniqueIds(
      teams.flatMap((team) => team.assignedProjects || [])
    ),
  };
};

const syncProjectTeamAssignments = async (projectId, assignedTeams) => {
  if (assignedTeams === undefined) return;

  const teamIds = uniqueIds(assignedTeams);

  await Team.updateMany(
    { assignedProjects: projectId, _id: { $nin: teamIds } },
    { $pull: { assignedProjects: projectId } }
  );

  if (teamIds.length) {
    await Team.updateMany(
      { _id: { $in: teamIds } },
      { $addToSet: { assignedProjects: projectId } }
    );
  }
};

const getAllowedProjectFilterForUser = async (user) => {
  requireAuthenticatedUser(user);

  if (user.role === "super_admin") return {};

  if (user.role === "employee") {
    const { assignedIdentityIds, teamIds, projectIds } =
      await getEmployeeProjectAccessContext(user);

    if (!assignedIdentityIds.length && !teamIds.length && !projectIds.length) {
      return { _id: null };
    }

    return {
      $or: [
        ...(assignedIdentityIds.length
          ? [
              { assignedTeam: { $in: assignedIdentityIds } },
              { "assignedTeam.user": { $in: assignedIdentityIds } },
            ]
          : []),
        ...(teamIds.length ? [{ assignedTeams: { $in: teamIds } }] : []),
        ...(projectIds.length ? [{ _id: { $in: projectIds } }] : []),
      ],
    };
  }

  if (user.role === "client") {
    const clientProfiles = await findClientProfilesForUser(user);
    const clientIds = uniqueIds([user._id, ...clientProfiles.map((client) => client._id)]);

    return { clientId: { $in: clientIds } };
  }

  throw new AppError("You are not allowed to access projects", 403, "FORBIDDEN");
};

const mergeFilters = (...filters) => {
  const cleanedFilters = filters.filter((filter) => {
    return filter && Object.keys(filter).length > 0;
  });

  if (!cleanedFilters.length) return {};
  if (cleanedFilters.length === 1) return cleanedFilters[0];

  return { $and: cleanedFilters };
};
export const createProject = asyncHandler(async (req, res) => {
  requireAuthenticatedUser(req.user);

  if (req.user.role !== "super_admin") {
    throw new AppError("You are not allowed to create projects", 403, "FORBIDDEN");
  }

  let payload = normalizeProjectPayload(pickFields(req.body, PROJECT_CREATE_FIELDS));
  payload.progressPercentage = payload.progressPercentage ?? 0;
 
  let githubWarning = null;

  if (payload.githubRepo) {
    const { owner, repo } = extractOwnerRepo(payload.githubRepo);

    try {
      await getRepositoryData(owner, repo);
    } catch (error) {
      console.error(`[GitHub] Create-time verification failed for ${owner}/${repo}:`, error.message);
      githubWarning = error instanceof AppError
        ? error.message
        : "Unable to verify GitHub repository. The project will be created but GitHub data may be incomplete.";
    }

    payload.github = {
        repoUrl: payload.githubRepo,
        owner,
        repo,
    };

    delete payload.githubRepo;
  }
  validateRequiredProjectFields(payload);
  validateObjectIdField(payload, "clientId", "INVALID_CLIENT_ID");
  validateEnumFields(payload);
  validateNumericFields(payload);

  payload = normalizeProjectStatusAndProgress(payload, {});

  await Promise.all([
    validateClientExists(payload.clientId),
    validateAssignedTeam(payload.assignedTeam),
    validateAssignedTeams(payload.assignedTeams),
    validateServiceRequestLink(payload.serviceRequestId),
  ]);

  const project = await Project.create({
    ...payload,
    createdBy: req.user._id,
    updatedBy: req.user._id,
  });

  await syncProjectTeamAssignments(project._id, payload.assignedTeams || []);

  const createdProject = await populateProjectQuery(
    Project.findById(project._id).select(PROJECT_DETAIL_FIELDS)
  ).lean();

  return res.status(201).json({
    success: true,
    message: githubWarning
      ? "Project created successfully, but GitHub repository could not be verified"
      : "Project created successfully",
    data: {
      project: prepareProjectForResponse(createdProject, req.user),
      githubWarning,
    },
    error: null,
  });
});

export const getAllProjectsForSuperAdmin = asyncHandler(async (req, res) => {
  requireAuthenticatedUser(req.user);

  if (!["super_admin", "admin"].includes(req.user.role)) {
    throw new AppError("You are not allowed to view all projects", 403, "FORBIDDEN");
  }

  const { page, limit, skip } = getPagination(req.query);
  const filter = buildProjectFilter(req.query);

  const [rawProjects, totalProjects] = await Promise.all([
    populateProjectQuery(
      Project.find(filter)
        .select(getProjectListFieldsForUser(req.user))
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
    ).lean(),
    Project.countDocuments(filter),
  ]);
  const projectsWithGithub = await Promise.all(
    rawProjects.map((project) => enrichProjectWithGithub(project))
  );

  const projects = await attachLatestInvoiceInfo(projectsWithGithub);
  // const projects = await attachLatestInvoiceInfo(rawProjects);
  // projects: prepareProjectsForResponse(projects, req.user)

  return res.status(200).json({
    success: true,
    message: "Projects fetched successfully",
    data: {
      projects: prepareProjectsForResponse(projects, req.user),
      pagination: {
        page,
        limit,
        total: totalProjects,
        totalPages: Math.ceil(totalProjects / limit),
      },
    },
    error: null,
  });
});

export const getClientProjects = asyncHandler(async (req, res) => {
  requireAuthenticatedUser(req.user);

  if (req.user.role !== "client") {
    throw new AppError(
      "Only clients can access client projects",
      403,
      "FORBIDDEN"
    );
  }

  const { page, limit, skip } = getPagination(req.query);
  const { status, priority, category } = req.query;
  const clientProfiles = await findClientProfilesForUser(req.user);
  const clientIds = uniqueIds([
    req.user._id,
    ...clientProfiles.map((client) => client._id),
  ]);

  if (!clientIds.length) {
    return res.status(200).json({
      success: true,
      message: "Client projects fetched successfully",
      data: {
        projects: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      },
      error: null,
    });
  }

  const filter = {
    clientId: { $in: clientIds },
  };

  if (status) filter.status = status.trim();
  if (priority) filter.priority = priority.trim();
  if (category) filter.category = category.trim();

  const [rawProjects, totalProjects] = await Promise.all([
    populateProjectQuery(
      Project.find(filter)
        .select(getProjectListFieldsForUser(req.user))
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
    ).lean(),
    Project.countDocuments(filter),
  ]);

  const projects = await attachLatestInvoiceInfo(rawProjects);

  return res.status(200).json({
    success: true,
    message: "Client projects fetched successfully",
    data: {
      projects: prepareProjectsForResponse(projects, req.user),
      pagination: {
        page,
        limit,
        total: totalProjects,
        totalPages: Math.ceil(totalProjects / limit),
      },
    },
    error: null,
  });
});

export const getProjectById = asyncHandler(async (req, res) => {
  requireAuthenticatedUser(req.user);

  const { id } = req.params;
  validateProjectId(id);

  const accessFilter = await getAllowedProjectFilterForUser(req.user);
  const project = await populateProjectQuery(
    Project.findOne(mergeFilters({ _id: id }, accessFilter)).select(
      getProjectDetailFieldsForUser(req.user)
    )
  ).lean();

  if (!project) {
    throw new AppError("Project not found", 404, "PROJECT_NOT_FOUND");
  }

  let enrichedProject = await enrichProjectWithGithub(project);

  const projectWithInvoiceInfo =
    req.user.role === "client" ? await attachLatestInvoiceInfo(enrichedProject) : enrichedProject;
  const workContext =
    req.user.role === "client" ? {} : await getProjectWorkContext(enrichedProject._id);

  return res.status(200).json({
    success: true,
    message: "Project fetched successfully",
    data: {
      project: {
        ...prepareProjectForResponse(projectWithInvoiceInfo, req.user),
        ...workContext,
      },
    },
    error: null,
  });
});

export const updateProject = asyncHandler(async (req, res) => {
  requireAuthenticatedUser(req.user);

  if (req.user.role !== "super_admin") {
    throw new AppError("You are not allowed to update projects", 403, "FORBIDDEN");
  }

  const { id } = req.params;
  validateProjectId(id);

  const existingProject = await Project.findById(id)
    .select("_id status progressPercentage completedAt cancelledAt assignedTeams github")
    .lean();

  if (!existingProject) {
    throw new AppError("Project not found", 404, "PROJECT_NOT_FOUND");
  }

  const rawPayload = normalizeProjectPayload(pickFields(req.body, PROJECT_UPDATE_FIELDS));

  delete rawPayload.createdBy;

  if (existingProject.status === "cancelled") {
    if (req.user.role !== "super_admin") {
      throw new AppError(
        "Cancelled projects can only be updated by super admin",
        403,
        "CANCELLED_PROJECT_LOCKED"
      );
    }

    const allowedCancelledFields = ["notes", "status"];
    const blockedFields = Object.keys(rawPayload).filter(
      (field) => !allowedCancelledFields.includes(field)
    );

    if (blockedFields.length) {
      throw new AppError(
        "Cancelled projects can only update notes or status",
        400,
        "CANCELLED_PROJECT_RESTRICTED"
      );
    }
  }

  if (rawPayload.clientId) {
    validateObjectIdField(rawPayload, "clientId", "INVALID_CLIENT_ID");
  }

  validateEnumFields(rawPayload);
  validateNumericFields(rawPayload);

  if (rawPayload.githubRepo !== undefined) {
    const newUrl = rawPayload.githubRepo.trim();
    const existingUrl = existingProject.github?.repoUrl || "";

    if (newUrl && newUrl !== existingUrl) {
      const { owner, repo } = extractOwnerRepo(newUrl);

      try {
        await getRepositoryData(owner, repo);
      } catch (error) {
        if (error instanceof AppError) {
          throw error;
        }

        throw new AppError(
          "Unable to verify GitHub repository. Please try again later.",
          500,
          "GITHUB_VERIFICATION_FAILED"
        );
      }

      rawPayload.github = { repoUrl: newUrl, owner, repo };
    } else if (!newUrl) {
      rawPayload.github = { repoUrl: "", owner: "", repo: "" };
    }

    delete rawPayload.githubRepo;
  }

  const payload = normalizeProjectStatusAndProgress(rawPayload, existingProject);

  await Promise.all([
    payload.clientId ? validateClientExists(payload.clientId) : Promise.resolve(),
    payload.assignedTeam !== undefined
      ? validateAssignedTeam(payload.assignedTeam)
      : Promise.resolve(),
    payload.assignedTeams !== undefined
      ? validateAssignedTeams(payload.assignedTeams)
      : Promise.resolve(),
    payload.serviceRequestId
      ? validateServiceRequestLink(payload.serviceRequestId, id)
      : Promise.resolve(),
  ]);

  const updatedProject = await populateProjectQuery(
    Project.findByIdAndUpdate(
      id,
      {
        ...payload,
        updatedBy: req.user._id,
      },
      {
        new: true,
        runValidators: true,
      }
    ).select(getProjectDetailFieldsForUser(req.user))
  ).lean();

  await syncProjectTeamAssignments(id, payload.assignedTeams);

  return res.status(200).json({
    success: true,
    message: "Project updated successfully",
    data: {
      project: prepareProjectForResponse(updatedProject, req.user),
    },
    error: null,
  });
});

const enrichProjectWithGithub = async (project) => {
  if (!project?.github?.owner || !project?.github?.repo) {
    return project;
  }

  try {
    const githubData = await getRepositoryData(
      project.github.owner,
      project.github.repo
    );

    const repo = githubData.repository;

    return {
      ...project,
      github: {
        ...project.github,
        available: true,
        defaultBranch: repo?.default_branch || "",
        visibility: repo?.visibility || "public",
        stars: repo?.stargazers_count ?? 0,
        forks: repo?.forks_count ?? 0,
        openIssues: repo?.open_issues_count ?? 0,
        branchCount: githubData.branches.length,
        branches: githubData.branches.map((b) => b.name),
        commitCount: githubData.commitCount,
        latestCommit: githubData.latestCommit
          ? {
              sha: githubData.latestCommit.sha,
              message: githubData.latestCommit.commit.message,
              author: githubData.latestCommit.commit.author.name,
              date: githubData.latestCommit.commit.author.date,
            }
          : null,
      },
    };
  } catch (error) {
    console.error(
      `[GitHub] Enrichment failed for "${project.projectName}" (${project._id}):`,
      error.message
    );

    return {
      ...project,
      github: {
        ...project.github,
        available: false,
        error: error.message || "Unable to fetch GitHub data.",
      },
    };
  }
};

export const getEmployeeProjects = asyncHandler(async (req, res) => {
  requireAuthenticatedUser(req.user);

  if (req.user.role !== "employee") {
    throw new AppError(
      "Only employees can access employee projects",
      403,
      "FORBIDDEN"
    );
  }

  const { page, limit, skip } = getPagination(req.query);
  const accessFilter = await getAllowedProjectFilterForUser(req.user);

  const [rawProjects, totalProjects] = await Promise.all([
    populateProjectQuery(
      Project.find(accessFilter)
        .select(getProjectListFieldsForUser(req.user))
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
    ).lean(),
    Project.countDocuments(accessFilter),
  ]);

  const projectsWithGithub = await Promise.all(
    rawProjects.map((project) => enrichProjectWithGithub(project))
  );

  const projects = await attachLatestInvoiceInfo(projectsWithGithub);

  return res.status(200).json({
    success: true,
    message: "Projects fetched successfully",
    data: {
      projects: prepareProjectsForResponse(projects, req.user),
      pagination: {
        page,
        limit,
        total: totalProjects,
        totalPages: Math.ceil(totalProjects / limit),
      },
    },
    error: null,
  });
});

export const deleteProject = asyncHandler(async (req, res) => {
  requireSuperAdmin(req.user);

  const { id } = req.params;
  validateProjectId(id);

  const deletedProject = await Project.findByIdAndDelete(id).select("_id").lean();

  if (!deletedProject) {
    throw new AppError("Project not found", 404, "PROJECT_NOT_FOUND");
  }

  return res.status(200).json({
    success: true,
    message: "Project deleted successfully",
    data: null,
    error: null,
  });
});
