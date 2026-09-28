import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import {
  Client,
  Employee,
  Project,
  ServiceRequest,
  Task,
} from "../models/index.js";

const PROJECT_BASIC_FIELDS =
  "projectName clientId category status priority progressPercentage deadline updatedAt createdAt";
const SERVICE_REQUEST_FIELDS =
  "clientName clientEmail clientPhone serviceRequired projectTitle projectDescription status priority deadline createdAt updatedAt";
const TASK_BASIC_FIELDS =
  "taskTitle description assignedEmployee assignedUser relatedProject priority deadline status updatedAt createdAt";
const EMPLOYEE_BASIC_FIELDS = "name email phone department designation userId status";

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const endOfToday = () => {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date;
};

const requireUser = (user) => {
  if (!user) {
    throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
  }
};

const uniqueObjectIds = (values = []) => {
  const ids = values
    .map((value) => {
      if (!value) return "";
      if (typeof value === "string") return value;
      if (value._id) return String(value._id);
      return String(value);
    })
    .filter((value) => mongoose.Types.ObjectId.isValid(value));

  return [...new Set(ids)];
};

const getClientProfilesForUser = async (user) => {
  const lookup = [];
  if (user.email) lookup.push({ email: user.email });
  if (user.phone) lookup.push({ phone: user.phone });
  if (!lookup.length) return [];

  return Client.find({ $or: lookup }).select("_id email phone").lean();
};

const getClientDashboardScope = async (user) => {
  const requestLookup = [{ clientId: user._id }];

  if (user.email) requestLookup.push({ clientEmail: user.email });
  if (user.phone) requestLookup.push({ clientPhone: user.phone });

  const [clientProfiles, serviceRequests] = await Promise.all([
    getClientProfilesForUser(user),
    ServiceRequest.find({ $or: requestLookup })
      .select("_id clientId clientEmail clientPhone projectId status")
      .lean(),
  ]);

  const clientIds = uniqueObjectIds(clientProfiles.map((client) => client._id));
  const serviceRequestIds = uniqueObjectIds(serviceRequests.map((request) => request._id));
  const linkedProjectIds = uniqueObjectIds(
    serviceRequests.map((request) => request.projectId)
  );
  const completedServiceRequestIds = uniqueObjectIds(
    serviceRequests
      .filter((request) => ["completed", "closed"].includes(request.status))
      .map((request) => request._id)
  );
  const completedLinkedProjectIds = uniqueObjectIds(
    serviceRequests
      .filter((request) => ["completed", "closed"].includes(request.status))
      .map((request) => request.projectId)
  );

  const requestFilter = {
    $or: [
      { clientId: user._id },
      ...(user.email ? [{ clientEmail: user.email }] : []),
      ...(user.phone ? [{ clientPhone: user.phone }] : []),
    ],
  };

  const projectAccessFilters = [
    ...(clientIds.length ? [{ clientId: { $in: clientIds } }] : []),
    ...(serviceRequestIds.length
      ? [{ serviceRequestId: { $in: serviceRequestIds } }]
      : []),
    ...(linkedProjectIds.length ? [{ _id: { $in: linkedProjectIds } }] : []),
  ];

  return {
    requestFilter,
    projectFilter: projectAccessFilters.length
      ? { $or: projectAccessFilters }
      : { _id: { $in: [] } },
    completedServiceRequestIds,
    completedLinkedProjectIds,
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

const getEmployeeProfileForUser = async (user) => {
  const lookup = [];
  if (user._id) lookup.push({ userId: user._id });
  if (user.email) lookup.push({ email: user.email });
  if (user.phone) lookup.push({ phone: user.phone });
  if (!lookup.length) return null;

  return Employee.findOne({ $or: lookup }).select("_id userId email phone").lean();
};

export const getClientDashboardSummary = asyncHandler(async (req, res) => {
  requireUser(req.user);

  const {
    requestFilter,
    projectFilter,
    completedServiceRequestIds,
    completedLinkedProjectIds,
  } = await getClientDashboardScope(req.user);

  const completedProjectFilter = mergeFilters(projectFilter, {
    $or: [
      { status: "completed" },
      ...(completedServiceRequestIds.length
        ? [{ serviceRequestId: { $in: completedServiceRequestIds } }]
        : []),
      ...(completedLinkedProjectIds.length
        ? [{ _id: { $in: completedLinkedProjectIds } }]
        : []),
    ],
  });

  const [
    totalRequests,
    openRequests,
    activeProjects,
    completedProjects,
    pendingApprovals,
    totalProjects,
    serviceRequests,
    myProjects,
    myRequests,
  ] = await Promise.all([
    ServiceRequest.countDocuments(requestFilter),
    ServiceRequest.countDocuments({
      ...requestFilter,
      status: { $in: ["submitted", "reviewed", "approved", "in_progress"] },
    }),
    Project.countDocuments({
      ...projectFilter,
      status: { $in: ["not_started", "in_progress", "on_hold"] },
    }),
    Project.countDocuments(completedProjectFilter),
    ServiceRequest.countDocuments({
      ...requestFilter,
      status: { $in: ["submitted", "reviewed", "approved"] },
    }),
    Project.countDocuments(projectFilter),
    ServiceRequest.find(requestFilter)
      .select("attachments status projectTitle projectDescription serviceRequired createdAt updatedAt")
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean(),
    Project.find({
      ...projectFilter,
      status: { $nin: ["completed", "cancelled"] },
    })
      .select(PROJECT_BASIC_FIELDS)
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean(),
    ServiceRequest.find(requestFilter)
      .select(SERVICE_REQUEST_FIELDS)
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  const uploadedDocuments = serviceRequests.reduce((count, request) => {
    return count + (request.attachments?.length || 0);
  }, 0);

  const recentUpdates = [
    ...myProjects.map((project) => ({
      type: "project",
      title: project.projectName,
      status: project.status,
      updatedAt: project.updatedAt,
    })),
    ...serviceRequests.slice(0, 5).map((request) => ({
      type: "request",
      title: request.projectTitle || request.serviceRequired,
      status: request.status,
      updatedAt: request.updatedAt,
    })),
  ]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 6);

  return res.status(200).json({
    success: true,
    message: "Client dashboard summary fetched successfully",
    data: {
      cards: {
        totalRequests,
        openRequests,
        totalProjects,
        activeProjects,
        completedProjects,
        pendingApprovals,
        uploadedDocuments,
      },
      myProjects,
      recentUpdates,
      myRequests,
    },
    error: null,
  });
});

export const getEmployeeDashboardSummary = asyncHandler(async (req, res) => {
  requireUser(req.user);

  const employee = await getEmployeeProfileForUser(req.user);
  const employeeTaskFilter = {
    $or: [
      { assignedUser: req.user._id },
      ...(employee?._id ? [{ assignedEmployee: employee._id }] : []),
    ],
  };

  const [
    totalAssignedTasks,
    pendingTasks,
    inProgressTasks,
    submittedTasks,
    approvedTasks,
    completedTasks,
    dueToday,
    todayTasks,
    priorityTasks,
    assignedProjectTasks,
    directlyAssignedProjects,
    directlyAssignedProjectsCount,
  ] = await Promise.all([
    Task.countDocuments(employeeTaskFilter),
    Task.countDocuments({ ...employeeTaskFilter, status: "pending" }),
    Task.countDocuments({ ...employeeTaskFilter, status: "in_progress" }),
    Task.countDocuments({ ...employeeTaskFilter, status: "submitted" }),
    Task.countDocuments({ ...employeeTaskFilter, status: "approved" }),
    Task.countDocuments({ ...employeeTaskFilter, status: "completed" }),
    Task.countDocuments({
      ...employeeTaskFilter,
      deadline: { $gte: startOfToday(), $lte: endOfToday() },
      status: { $nin: ["completed"] },
    }),
    Task.find({
      ...employeeTaskFilter,
      deadline: { $gte: startOfToday(), $lte: endOfToday() },
    })
      .select(TASK_BASIC_FIELDS)
      .populate("relatedProject", PROJECT_BASIC_FIELDS)
      .sort({ deadline: 1 })
      .limit(6)
      .lean(),
    Task.find({
      ...employeeTaskFilter,
      priority: { $in: ["urgent", "high"] },
      status: { $nin: ["completed"] },
    })
      .select(TASK_BASIC_FIELDS)
      .populate("relatedProject", PROJECT_BASIC_FIELDS)
      .sort({ priority: -1, deadline: 1 })
      .limit(6)
      .lean(),
    Task.find(employeeTaskFilter)
      .select("relatedProject")
      .populate("relatedProject", PROJECT_BASIC_FIELDS)
      .sort({ updatedAt: -1 })
      .limit(20)
      .lean(),
    Project.find({
      $or: [
        { assignedTeam: req.user._id },
        ...(employee?._id ? [{ assignedTeam: employee._id }] : []),
      ],
    })
      .select(PROJECT_BASIC_FIELDS)
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean(),
    Project.countDocuments({
      $or: [
        { assignedTeam: req.user._id },
        ...(employee?._id ? [{ assignedTeam: employee._id }] : []),
      ],
    }),
  ]);

  const taskProjects = assignedProjectTasks
    .map((task) => task.relatedProject)
    .filter(Boolean);
  const assignedProjects = [
    ...new Map(
      [...taskProjects, ...directlyAssignedProjects].map((project) => [
        String(project._id),
        project,
      ])
    ).values(),
  ].slice(0, 6);

  return res.status(200).json({
    success: true,
    message: "Employee dashboard summary fetched successfully",
    data: {
      cards: {
        totalAssignedTasks,
        pendingTasks,
        inProgressTasks,
        submittedTasks,
        approvedTasks,
        completedTasks,
        dueToday,
        assignedProjectsCount: Math.max(
          directlyAssignedProjectsCount,
          assignedProjects.length
        ),
      },
      todayTasks,
      priorityTasks,
      assignedProjects,
    },
    error: null,
  });
});
