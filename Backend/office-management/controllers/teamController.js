import mongoose from "mongoose";
import Employee from "../models/Employee.js";
import Project from "../models/Project.js";
import Team, { teamStatuses } from "../models/Team.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

const TEAM_LIST_FIELDS =
  "teamName teamLead members department assignedProjects status description createdBy updatedBy createdAt updatedAt";

const TEAM_DETAIL_FIELDS =
  "teamName teamLead members department assignedProjects status description createdBy updatedBy createdAt updatedAt";

const EMPLOYEE_BASIC_FIELDS = "name email phone department designation status";
const PROJECT_BASIC_FIELDS = "projectName category status priority deadline";

const TEAM_MUTABLE_FIELDS = [
  "teamName",
  "teamLead",
  "members",
  "department",
  "assignedProjects",
  "status",
  "description",
];

const TEAM_READ_ROLES = ["super_admin", "admin"];
const TEAM_WRITE_ROLES = ["super_admin", "admin"];

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

const uniqueIds = (ids = []) => {
  return [...new Set(ids.map((id) => getIdString(id)).filter(Boolean))];
};

const hasDuplicateIds = (ids = []) => {
  const normalizedIds = ids.map((id) => getIdString(id)).filter(Boolean);
  return new Set(normalizedIds).size !== normalizedIds.length;
};

export const normalizeTeamMembers = ({ teamLead, members = [] } = {}) => {
  if (!teamLead) {
    throw new AppError("Team lead is required", 400, "TEAM_LEAD_REQUIRED");
  }

  if (!Array.isArray(members)) {
    throw new AppError("Members must be an array", 400, "INVALID_MEMBERS");
  }

  if (hasDuplicateIds(members)) {
    throw new AppError(
      "Duplicate members are not allowed in the same team",
      400,
      "DUPLICATE_TEAM_MEMBERS"
    );
  }

  return uniqueIds([...members, teamLead]);
};

export const validateTeamCanReceiveProject = (team = {}) => {
  if (!team) {
    throw new AppError("Team not found", 404, "TEAM_NOT_FOUND");
  }

  if (team.status === "archived") {
    throw new AppError(
      "Archived teams cannot receive new projects",
      400,
      "TEAM_ARCHIVED"
    );
  }

  if (team.status === "inactive") {
    throw new AppError(
      "Inactive teams cannot receive new projects. Reactivate the team first.",
      400,
      "TEAM_INACTIVE"
    );
  }

  return true;
};

const requireAuthenticatedUser = (user) => {
  if (!user) {
    throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
  }
};

const requireTeamReadAccess = (user) => {
  requireAuthenticatedUser(user);

  if (!TEAM_READ_ROLES.includes(user.role)) {
    throw new AppError("You are not allowed to access teams", 403, "FORBIDDEN");
  }
};

const requireTeamWriteAccess = (user) => {
  requireAuthenticatedUser(user);

  if (!TEAM_WRITE_ROLES.includes(user.role)) {
    throw new AppError("You are not allowed to modify teams", 403, "FORBIDDEN");
  }
};

const requireSuperAdmin = (user) => {
  requireAuthenticatedUser(user);

  if (!["super_admin", "admin"].includes(user.role)) {
    throw new AppError("Only super admin can delete teams", 403, "FORBIDDEN");
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

const getSortOption = (sort = "newest") => {
  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    teamName: { teamName: 1 },
    department: { department: 1, createdAt: -1 },
  };

  return sortOptions[sort] || sortOptions.newest;
};

const validateTeamId = (id) => {
  if (!isValidObjectId(id)) {
    throw new AppError("Invalid team id", 400, "INVALID_TEAM_ID");
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

const normalizeArrayIds = (value, fieldName) => {
  if (value === undefined) return undefined;

  if (!Array.isArray(value)) {
    throw new AppError(`${fieldName} must be an array`, 400, "INVALID_ARRAY");
  }

  return uniqueIds(value);
};

const normalizeProjectIds = (value) => {
  const projectIds = normalizeArrayIds(value, "Assigned projects");

  if (projectIds !== undefined && hasDuplicateIds(value)) {
    throw new AppError(
      "Duplicate assigned projects are not allowed in the same team",
      400,
      "DUPLICATE_ASSIGNED_PROJECTS"
    );
  }

  return projectIds;
};

const normalizeMemberIds = (value) => {
  const memberIds = normalizeArrayIds(value, "Members");

  if (memberIds !== undefined && hasDuplicateIds(value)) {
    throw new AppError(
      "Duplicate members are not allowed in the same team",
      400,
      "DUPLICATE_TEAM_MEMBERS"
    );
  }

  return memberIds;
};

const normalizeTeamPayload = (payload = {}) => {
  ["teamName", "department", "status", "description"].forEach((field) => {
    if (typeof payload[field] === "string") {
      payload[field] = payload[field].trim();
    }
  });

  if (payload.members !== undefined) {
    payload.members = normalizeMemberIds(payload.members);
  }

  if (payload.assignedProjects !== undefined) {
    payload.assignedProjects = normalizeProjectIds(payload.assignedProjects);
  }

  return payload;
};

const validateRequiredTeamFields = (payload = {}) => {
  const requiredFields = ["teamName", "teamLead", "department"];
  const missingFields = requiredFields.filter((field) => !payload[field]);

  if (missingFields.length) {
    throw new AppError(
      `Missing required fields: ${missingFields.join(", ")}`,
      400,
      "REQUIRED_FIELDS_MISSING"
    );
  }
};

const validateTeamPayload = (payload = {}) => {
  if (payload.teamLead !== undefined) {
    validateEmployeeId(payload.teamLead);
  }

  if (payload.members !== undefined) {
    payload.members.forEach(validateEmployeeId);
  }

  if (payload.assignedProjects !== undefined) {
    payload.assignedProjects.forEach(validateProjectId);
  }

  if (payload.status && !teamStatuses.includes(payload.status)) {
    throw new AppError("Invalid team status", 400, "INVALID_TEAM_STATUS");
  }
};

const ensureEmployeesExist = async (employeeIds = []) => {
  const ids = uniqueIds(employeeIds);
  if (!ids.length) return;

  const employees = await Employee.find({ _id: { $in: ids } })
    .select("_id")
    .lean();

  if (employees.length !== ids.length) {
    throw new AppError(
      "One or more employees were not found",
      404,
      "EMPLOYEES_NOT_FOUND"
    );
  }
};

const ensureProjectsExist = async (projectIds = []) => {
  const ids = uniqueIds(projectIds);
  if (!ids.length) return;

  const projects = await Project.find({ _id: { $in: ids } })
    .select("_id")
    .lean();

  if (projects.length !== ids.length) {
    throw new AppError(
      "One or more projects were not found",
      404,
      "PROJECTS_NOT_FOUND"
    );
  }
};

const ensureUniqueTeamNameInDepartment = async ({
  teamName,
  department,
  excludeTeamId,
}) => {
  if (!teamName || !department) return;

  const query = {
    teamName: new RegExp(`^${escapeRegex(teamName)}$`, "i"),
    department: new RegExp(`^${escapeRegex(department)}$`, "i"),
  };

  if (excludeTeamId) {
    query._id = { $ne: excludeTeamId };
  }

  const existingTeam = await Team.findOne(query).select("_id").lean();

  if (existingTeam) {
    throw new AppError(
      "Team name already exists in this department",
      409,
      "TEAM_NAME_EXISTS"
    );
  }
};

const ensureTeamLeadInMembers = (payload = {}, existingTeam = {}) => {
  const teamLead = payload.teamLead ?? existingTeam.teamLead;
  const members =
    payload.members !== undefined ? payload.members : existingTeam.members || [];

  if (!teamLead) return payload;

  payload.members = normalizeTeamMembers({ teamLead, members });
  return payload;
};

const hasNewProjectAssignments = (nextProjects = [], currentProjects = []) => {
  const currentProjectIds = new Set(uniqueIds(currentProjects));

  return uniqueIds(nextProjects).some((projectId) => {
    return !currentProjectIds.has(projectId);
  });
};

const buildTeamFilter = (query = {}) => {
  const filter = {};
  const {
    search = "",
    department,
    status,
    teamLead,
    assignedProject,
  } = query;

  if (search.trim()) {
    const searchRegex = new RegExp(escapeRegex(search.trim()), "i");

    filter.$or = [
      { teamName: searchRegex },
      { department: searchRegex },
    ];
  }

  if (department) filter.department = department.trim();

  if (teamLead) {
    validateEmployeeId(teamLead.trim());
    filter.teamLead = teamLead.trim();
  }

  if (assignedProject) {
    validateProjectId(assignedProject.trim());
    filter.assignedProjects = assignedProject.trim();
  }

  if (status) {
    const normalizedStatus = status.trim();

    if (!teamStatuses.includes(normalizedStatus)) {
      throw new AppError("Invalid team status", 400, "INVALID_TEAM_STATUS");
    }

    filter.status = normalizedStatus;
  }

  return filter;
};

const populateTeamQuery = (query) => {
  return query
    .populate("teamLead", EMPLOYEE_BASIC_FIELDS)
    .populate("members", EMPLOYEE_BASIC_FIELDS)
    .populate("assignedProjects", PROJECT_BASIC_FIELDS);
};

export const createTeam = asyncHandler(async (req, res) => {
  requireTeamWriteAccess(req.user);

  const payload = normalizeTeamPayload(pickFields(req.body, TEAM_MUTABLE_FIELDS));
  validateRequiredTeamFields(payload);
  validateTeamPayload(payload);
  ensureTeamLeadInMembers(payload);

  if (payload.assignedProjects?.length) {
    validateTeamCanReceiveProject({
      status: payload.status || "active",
    });
  }

  await Promise.all([
    ensureEmployeesExist([payload.teamLead, ...(payload.members || [])]),
    ensureProjectsExist(payload.assignedProjects || []),
    ensureUniqueTeamNameInDepartment({
      teamName: payload.teamName,
      department: payload.department,
    }),
  ]);

  const team = await Team.create({
    ...payload,
    createdBy: req.user._id,
    updatedBy: req.user._id,
  });

  const createdTeam = await populateTeamQuery(
    Team.findById(team._id).select(TEAM_DETAIL_FIELDS)
  ).lean();

  return res.status(201).json({
    success: true,
    message: "Team created successfully",
    data: {
      team: createdTeam,
    },
    error: null,
  });
});

export const getAllTeams = asyncHandler(async (req, res) => {
  requireTeamReadAccess(req.user);

  const { page, limit, skip } = getPagination(req.query);
  const filter = buildTeamFilter(req.query);

  const [teams, totalTeams] = await Promise.all([
    populateTeamQuery(
      Team.find(filter)
        .select(TEAM_LIST_FIELDS)
        .sort(getSortOption(req.query.sort))
        .skip(skip)
        .limit(limit)
    ).lean(),
    Team.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    message: "Teams fetched successfully",
    data: {
      teams,
      pagination: {
        page,
        limit,
        total: totalTeams,
        totalPages: Math.ceil(totalTeams / limit),
      },
    },
    error: null,
  });
});

export const getTeamById = asyncHandler(async (req, res) => {
  requireTeamReadAccess(req.user);

  const { id } = req.params;
  validateTeamId(id);

  const team = await populateTeamQuery(
    Team.findById(id).select(TEAM_DETAIL_FIELDS)
  ).lean();

  if (!team) {
    throw new AppError("Team not found", 404, "TEAM_NOT_FOUND");
  }

  return res.status(200).json({
    success: true,
    message: "Team fetched successfully",
    data: {
      team,
    },
    error: null,
  });
});

export const updateTeam = asyncHandler(async (req, res) => {
  requireTeamWriteAccess(req.user);

  const { id } = req.params;
  validateTeamId(id);

  const existingTeam = await Team.findById(id)
    .select("teamName teamLead members department assignedProjects status")
    .lean();

  if (!existingTeam) {
    throw new AppError("Team not found", 404, "TEAM_NOT_FOUND");
  }

  const payload = normalizeTeamPayload(pickFields(req.body, TEAM_MUTABLE_FIELDS));
  validateTeamPayload(payload);
  ensureTeamLeadInMembers(payload, existingTeam);

  const nextTeamName = payload.teamName ?? existingTeam.teamName;
  const nextDepartment = payload.department ?? existingTeam.department;
  const nextStatus = payload.status ?? existingTeam.status;

  if (
    payload.assignedProjects !== undefined &&
    hasNewProjectAssignments(payload.assignedProjects, existingTeam.assignedProjects)
  ) {
    validateTeamCanReceiveProject({
      ...existingTeam,
      status: nextStatus,
    });
  }

  await Promise.all([
    ensureEmployeesExist(
      uniqueIds([
        payload.teamLead,
        ...(payload.members || []),
      ])
    ),
    ensureProjectsExist(payload.assignedProjects || []),
    ensureUniqueTeamNameInDepartment({
      teamName: nextTeamName,
      department: nextDepartment,
      excludeTeamId: id,
    }),
  ]);

  const updatedTeam = await populateTeamQuery(
    Team.findByIdAndUpdate(
      id,
      {
        $set: {
          ...payload,
          updatedBy: req.user._id,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select(TEAM_DETAIL_FIELDS)
  ).lean();

  return res.status(200).json({
    success: true,
    message: "Team updated successfully",
    data: {
      team: updatedTeam,
    },
    error: null,
  });
});

export const deleteTeam = asyncHandler(async (req, res) => {
  requireSuperAdmin(req.user);

  const { id } = req.params;
  validateTeamId(id);

  const deletedTeam = await Team.findByIdAndDelete(id).select("_id").lean();

  if (!deletedTeam) {
    throw new AppError("Team not found", 404, "TEAM_NOT_FOUND");
  }

  return res.status(200).json({
    success: true,
    message: "Team deleted successfully",
    data: null,
    error: null,
  });
});

export const addMembersToTeam = asyncHandler(async (req, res) => {
  requireTeamWriteAccess(req.user);

  const { id } = req.params;
  validateTeamId(id);

  const memberIds = normalizeArrayIds(req.body.members || [], "Members");
  memberIds.forEach(validateEmployeeId);

  if (!memberIds.length) {
    throw new AppError("Members are required", 400, "MEMBERS_REQUIRED");
  }

  const team = await Team.findById(id).select("_id teamLead members").lean();

  if (!team) {
    throw new AppError("Team not found", 404, "TEAM_NOT_FOUND");
  }

  await ensureEmployeesExist(memberIds);

  const members = uniqueIds([...(team.members || []), ...memberIds, team.teamLead]);

  const updatedTeam = await populateTeamQuery(
    Team.findByIdAndUpdate(
      id,
      {
        $set: {
          members,
          updatedBy: req.user._id,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select(TEAM_DETAIL_FIELDS)
  ).lean();

  return res.status(200).json({
    success: true,
    message: "Members added successfully",
    data: {
      team: updatedTeam,
    },
    error: null,
  });
});

export const removeMembersFromTeam = asyncHandler(async (req, res) => {
  requireTeamWriteAccess(req.user);

  const { id } = req.params;
  validateTeamId(id);

  const memberIds = normalizeArrayIds(req.body.members || [], "Members");
  memberIds.forEach(validateEmployeeId);

  if (!memberIds.length) {
    throw new AppError("Members are required", 400, "MEMBERS_REQUIRED");
  }

  const team = await Team.findById(id).select("_id teamLead members").lean();

  if (!team) {
    throw new AppError("Team not found", 404, "TEAM_NOT_FOUND");
  }

  const teamLeadId = getIdString(team.teamLead);

  if (memberIds.includes(teamLeadId)) {
    throw new AppError(
      "Cannot remove team lead from members. Change team lead first.",
      400,
      "TEAM_LEAD_REMOVAL_BLOCKED"
    );
  }

  const removeSet = new Set(memberIds);
  const members = uniqueIds(team.members || []).filter((memberId) => {
    return !removeSet.has(memberId);
  });

  const updatedTeam = await populateTeamQuery(
    Team.findByIdAndUpdate(
      id,
      {
        $set: {
          members,
          updatedBy: req.user._id,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select(TEAM_DETAIL_FIELDS)
  ).lean();

  return res.status(200).json({
    success: true,
    message: "Members removed successfully",
    data: {
      team: updatedTeam,
    },
    error: null,
  });
});

export const assignProjectsToTeam = asyncHandler(async (req, res) => {
  requireTeamWriteAccess(req.user);

  const { id } = req.params;
  validateTeamId(id);

  const projectIds = normalizeArrayIds(
    req.body.assignedProjects || req.body.projects || [],
    "Assigned projects"
  );
  projectIds.forEach(validateProjectId);

  if (!projectIds.length) {
    throw new AppError("Projects are required", 400, "PROJECTS_REQUIRED");
  }

  const team = await Team.findById(id)
    .select("_id assignedProjects status")
    .lean();

  if (!team) {
    throw new AppError("Team not found", 404, "TEAM_NOT_FOUND");
  }

  validateTeamCanReceiveProject(team);

  await ensureProjectsExist(projectIds);

  const assignedProjects = uniqueIds([
    ...(team.assignedProjects || []),
    ...projectIds,
  ]);

  const updatedTeam = await populateTeamQuery(
    Team.findByIdAndUpdate(
      id,
      {
        $set: {
          assignedProjects,
          updatedBy: req.user._id,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select(TEAM_DETAIL_FIELDS)
  ).lean();

  return res.status(200).json({
    success: true,
    message: "Projects assigned successfully",
    data: {
      team: updatedTeam,
    },
    error: null,
  });
});

export const removeProjectsFromTeam = asyncHandler(async (req, res) => {
  requireTeamWriteAccess(req.user);

  const { id } = req.params;
  validateTeamId(id);

  const projectIds = normalizeArrayIds(
    req.body.assignedProjects || req.body.projects || [],
    "Assigned projects"
  );
  projectIds.forEach(validateProjectId);

  if (!projectIds.length) {
    throw new AppError("Projects are required", 400, "PROJECTS_REQUIRED");
  }

  const team = await Team.findById(id)
    .select("_id assignedProjects")
    .lean();

  if (!team) {
    throw new AppError("Team not found", 404, "TEAM_NOT_FOUND");
  }

  const removeSet = new Set(projectIds);
  const assignedProjects = uniqueIds(team.assignedProjects || []).filter(
    (projectId) => !removeSet.has(projectId)
  );

  const updatedTeam = await populateTeamQuery(
    Team.findByIdAndUpdate(
      id,
      {
        $set: {
          assignedProjects,
          updatedBy: req.user._id,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select(TEAM_DETAIL_FIELDS)
  ).lean();

  return res.status(200).json({
    success: true,
    message: "Projects removed successfully",
    data: {
      team: updatedTeam,
    },
    error: null,
  });
});
