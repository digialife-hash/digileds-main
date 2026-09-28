import mongoose from "mongoose";
import Client from "../models/Client.js";
import Project from "../models/Project.js";
import ServiceRequest, {
  serviceRequestStatuses,
} from "../models/ServiceRequest.js";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

const CLIENT_EDITABLE_STATUSES = ["submitted", "reviewed"];
const SUPER_ADMIN_ROLES = ["super_admin", "admin"];

const STATUS_FLOW = {
  submitted: "reviewed",
  reviewed: "approved",
  approved: "in_progress",
  in_progress: "completed",
  completed: "closed",
};

const CLIENT_CREATE_FIELDS = [
  "clientPhone",
  "companyName",
  "address",
  "gstNumber",
  "serviceRequired",
  "projectTitle",
  "projectDescription",
  "budgetRange",
  "deadline",
  "priority",
  "category",
  "referenceLinks",
  "attachments",
];

const CLIENT_UPDATE_FIELDS = [
  "clientPhone",
  "companyName",
  "address",
  "gstNumber",
  "serviceRequired",
  "projectTitle",
  "projectDescription",
  "budgetRange",
  "deadline",
  "priority",
  "category",
  "referenceLinks",
  "attachments",
];

const SUPER_ADMIN_UPDATE_FIELDS = [
  "clientName",
  "clientEmail",
  "clientPhone",
  "companyName",
  "address",
  "gstNumber",
  "serviceRequired",
  "projectTitle",
  "projectDescription",
  "budgetRange",
  "deadline",
  "priority",
  "category",
  "referenceLinks",
  "attachments",
  "adminRemarks",
];

const CLIENT_LIST_FIELDS =
  "serviceRequired projectTitle projectDescription budgetRange deadline priority category status convertedToProject projectId createdAt updatedAt";

const SUPER_ADMIN_LIST_FIELDS =
  "clientId clientName clientEmail clientPhone companyName serviceRequired projectTitle budgetRange deadline priority category status convertedToProject projectId reviewedBy approvedBy createdAt updatedAt";

const DETAIL_FIELDS =
  "clientId clientName clientEmail clientPhone companyName address gstNumber serviceRequired projectTitle projectDescription budgetRange deadline priority category referenceLinks attachments status statusHistory adminRemarks reviewedBy approvedBy convertedToProject projectId createdAt updatedAt";

const escapeRegex = (value = "") => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);
};

const requireAuthenticatedUser = (user) => {
  if (!user) {
    throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
  }
};

const requireClient = (user) => {
  requireAuthenticatedUser(user);

  if (user.role !== "client") {
    throw new AppError(
      "Only clients can access this resource",
      403,
      "FORBIDDEN"
    );
  }
};

const requireSuperAdminAccess = (user) => {
  requireAuthenticatedUser(user);

  if (!SUPER_ADMIN_ROLES.includes(user.role)) {
    throw new AppError(
      "You are not allowed to access service requests",
      403,
      "FORBIDDEN"
    );
  }
};

const requireSuperAdmin = (user) => {
  requireAuthenticatedUser(user);

  if (user.role !== "super_admin") {
    throw new AppError(
      "Only super admin can delete service requests",
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

const sanitizeReferenceLinks = (referenceLinks) => {
  if (!Array.isArray(referenceLinks)) return [];

  return referenceLinks
    .filter((link) => typeof link === "string")
    .map((link) => link.trim())
    .filter(Boolean);
};

const normalizePayload = (payload) => {
  if (payload.serviceRequired) payload.serviceRequired = payload.serviceRequired.trim();
  if (payload.projectTitle) payload.projectTitle = payload.projectTitle.trim();
  if (payload.projectDescription) {
    payload.projectDescription = payload.projectDescription.trim();
  }
  if (payload.clientName) payload.clientName = payload.clientName.trim();
  if (payload.clientEmail) payload.clientEmail = payload.clientEmail.toLowerCase().trim();
  if (payload.clientPhone) payload.clientPhone = payload.clientPhone.trim();
  if (payload.companyName) payload.companyName = payload.companyName.trim();
  if (payload.address) payload.address = payload.address.trim();
  if (payload.gstNumber) payload.gstNumber = payload.gstNumber.trim().toUpperCase();
  if (payload.budgetRange) payload.budgetRange = payload.budgetRange.trim();
  if (payload.category) payload.category = payload.category.trim();

  if (Object.prototype.hasOwnProperty.call(payload, "referenceLinks")) {
    payload.referenceLinks = sanitizeReferenceLinks(payload.referenceLinks);
  }

  if (!payload.deadline) {
    delete payload.deadline;
  }

  return payload;
};

const validateRequiredServiceRequestFields = (payload) => {
  const requiredFields = [
    "serviceRequired",
    "projectTitle",
    "projectDescription",
    "category",
  ];

  const missingFields = requiredFields.filter((field) => !payload[field]);

  if (missingFields.length) {
    throw new AppError(
      `Missing required fields: ${missingFields.join(", ")}`,
      400,
      "REQUIRED_FIELDS_MISSING"
    );
  }
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

const buildClientFilter = (query, clientId) => {
  const filter = { clientId };
  const { status, priority, category, search = "" } = query;

  if (status) filter.status = status.trim();
  if (priority) filter.priority = priority.trim();
  if (category) filter.category = category.trim();

  if (search.trim()) {
    const searchRegex = new RegExp(escapeRegex(search.trim()), "i");

    filter.$or = [
      { projectTitle: searchRegex },
      { serviceRequired: searchRegex },
      { projectDescription: searchRegex },
    ];
  }

  return filter;
};

const buildAdminFilter = (query) => {
  const filter = {};
  const {
    status,
    priority,
    category,
    convertedToProject,
    search = "",
  } = query;

  if (status) filter.status = status.trim();
  if (priority) filter.priority = priority.trim();
  if (category) filter.category = category.trim();

  if (convertedToProject === "true") filter.convertedToProject = true;
  if (convertedToProject === "false") filter.convertedToProject = false;

  if (search.trim()) {
    const searchRegex = new RegExp(escapeRegex(search.trim()), "i");

    filter.$or = [
      { clientName: searchRegex },
      { clientEmail: searchRegex },
      { projectTitle: searchRegex },
      { serviceRequired: searchRegex },
    ];
  }

  return filter;
};

const getPaginatedServiceRequests = async ({ filter, page, limit, skip, fields }) => {
  const [serviceRequests, total] = await Promise.all([
    ServiceRequest.find(filter)
      .select(fields)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ServiceRequest.countDocuments(filter),
  ]);

  return {
    serviceRequests,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const validateRequestId = (id) => {
  if (!isValidObjectId(id)) {
    throw new AppError(
      "Invalid service request id",
      400,
      "INVALID_SERVICE_REQUEST_ID"
    );
  }
};

const ensureClientRecordForApprovedRequest = async (
  serviceRequest,
  approvedBy,
  session = null
) => {
  const queryOptions = session ? { session } : {};

  const clientUser = await User.findById(serviceRequest.clientId)
    .select("name email phone")
    .session(session)
    .lean();

  if (!clientUser) {
    throw new AppError(
      "Client user linked to this request no longer exists",
      404,
      "CLIENT_USER_NOT_FOUND"
    );
  }

  const clientPhone = (serviceRequest.clientPhone || clientUser.phone || "").trim();

  if (!clientPhone) {
    throw new AppError(
      "Client phone number is required before approval",
      400,
      "CLIENT_PHONE_REQUIRED"
    );
  }

  const clientEmail = (serviceRequest.clientEmail || clientUser.email || "")
    .toLowerCase()
    .trim();

  if (!clientEmail) {
    throw new AppError(
      "Client email is required before approval",
      400,
      "CLIENT_EMAIL_REQUIRED"
    );
  }

  const [emailOwner, phoneOwner] = await Promise.all([
    Client.findOne({ email: clientEmail })
      .select("clientName companyName email phone businessCategory address gstNumber")
      .session(session)
      .lean(),
    Client.findOne({ phone: clientPhone })
      .select("clientName companyName email phone businessCategory address gstNumber")
      .session(session)
      .lean(),
  ]);

  if (
    emailOwner &&
    phoneOwner &&
    String(emailOwner._id) !== String(phoneOwner._id)
  ) {
    throw new AppError(
      "Client email and phone are linked to different clients",
      409,
      "CLIENT_CONTACT_CONFLICT"
    );
  }

  const existingClient = emailOwner || phoneOwner;

  if (existingClient) {
    const updatePayload = {
      clientName:
        serviceRequest.clientName || existingClient.clientName || clientUser.name,
      companyName:
        serviceRequest.companyName ||
        existingClient.companyName ||
        serviceRequest.projectTitle,
      email: clientEmail,
      phone: clientPhone,
      businessCategory:
        serviceRequest.category || existingClient.businessCategory || "General",
      status: "active",
      updatedBy: approvedBy,
    };

    if (serviceRequest.address || existingClient.address) {
      updatePayload.address = serviceRequest.address || existingClient.address;
    }

    if (serviceRequest.gstNumber || existingClient.gstNumber) {
      updatePayload.gstNumber =
        serviceRequest.gstNumber || existingClient.gstNumber;
    }

    await Client.findByIdAndUpdate(
      existingClient._id,
      updatePayload,
      { ...queryOptions, runValidators: true }
    );

    return existingClient._id;
  }

  const clientPayload = {
    clientName: serviceRequest.clientName || clientUser.name,
    companyName: serviceRequest.companyName || serviceRequest.projectTitle,
    email: clientEmail,
    phone: clientPhone,
    businessCategory: serviceRequest.category,
    address: serviceRequest.address || "",
    gstNumber: serviceRequest.gstNumber || undefined,
    status: "active",
    notes: `Auto-created from approved service request: ${serviceRequest.projectTitle}`,
    createdBy: approvedBy,
    updatedBy: approvedBy,
  };

  const client = session
    ? (await Client.create([clientPayload], { session }))[0]
    : await Client.create(clientPayload);

  return client._id;
};

const isTransactionUnavailableError = (error) => {
  return (
    error?.code === 20 ||
    error?.codeName === "IllegalOperation" ||
    error?.message?.includes("Transaction numbers are only allowed") ||
    error?.message?.includes("replica set member or mongos")
  );
};

const parseBudgetAmount = (budgetRange = "") => {
  const [firstAmount] = budgetRange.match(/\d+/g) || [];
  return firstAmount ? Number(firstAmount) : 0;
};

const mapServiceRequestStatusToProjectStatus = (serviceRequestStatus) => {
  const statusMap = {
    submitted: "not_started",
    reviewed: "not_started",
    approved: "not_started",
    in_progress: "in_progress",
    completed: "completed",
    closed: "completed",
  };

  return statusMap[serviceRequestStatus] || "not_started";
};

const buildProjectStatusSyncPayload = (serviceRequest, updatedBy) => {
  const projectStatus = mapServiceRequestStatusToProjectStatus(
    serviceRequest.status
  );
  const payload = {
    status: projectStatus,
    updatedBy,
  };

  if (projectStatus === "completed") {
    payload.progressPercentage = 100;
    payload.completedAt = new Date();
    payload.cancelledAt = null;
  }

  return payload;
};

const syncLinkedProjectStatusFromServiceRequest = async (
  serviceRequest,
  updatedBy,
  session = null
) => {
  if (!serviceRequest?.projectId) return;

  await Project.findByIdAndUpdate(
    serviceRequest.projectId,
    buildProjectStatusSyncPayload(serviceRequest, updatedBy),
    {
      runValidators: true,
      ...(session ? { session } : {}),
    }
  );
};

const buildProjectFromServiceRequest = (serviceRequest, clientRecordId, createdBy) => ({
  projectName: serviceRequest.projectTitle,
  description: serviceRequest.projectDescription,
  category: serviceRequest.category,
  clientId: clientRecordId,
  serviceRequestId: serviceRequest._id,
  status: "not_started",
  priority: serviceRequest.priority,
  deadline: serviceRequest.deadline,
  budget: parseBudgetAmount(serviceRequest.budgetRange),
  notes: serviceRequest.budgetRange
    ? `Original budget range: ${serviceRequest.budgetRange}`
    : "",
  createdBy,
  updatedBy: createdBy,
});

const runServiceRequestConversion = async (id, convertedBy, session = null) => {
  const queryOptions = session ? { session } : {};

  const serviceRequest = await ServiceRequest.findById(id).session(session);

  if (!serviceRequest) {
    throw new AppError(
      "Service request not found",
      404,
      "SERVICE_REQUEST_NOT_FOUND"
    );
  }

  if (!["approved", "in_progress"].includes(serviceRequest.status)) {
    throw new AppError(
      "Service request must be approved or in_progress before conversion",
      400,
      "SERVICE_REQUEST_NOT_READY"
    );
  }

  if (serviceRequest.convertedToProject) {
    throw new AppError(
      "Service request is already converted to a project",
      409,
      "SERVICE_REQUEST_ALREADY_CONVERTED"
    );
  }

  const existingProject = await Project.findOne({
    serviceRequestId: serviceRequest._id,
  })
    .session(session)
    .select("_id")
    .lean();

  if (existingProject) {
    throw new AppError(
      "Project already exists for this service request",
      409,
      "PROJECT_ALREADY_EXISTS"
    );
  }

  const clientRecordId = await ensureClientRecordForApprovedRequest(
    serviceRequest,
    convertedBy,
    session
  );
  let project;

  if (session) {
    [project] = await Project.create(
      [buildProjectFromServiceRequest(serviceRequest, clientRecordId, convertedBy)],
      { session }
    );
  } else {
    project = await Project.create(
      buildProjectFromServiceRequest(serviceRequest, clientRecordId, convertedBy)
    );
  }

  const updatedServiceRequest = await ServiceRequest.findOneAndUpdate(
    {
      _id: id,
      convertedToProject: false,
    },
    {
      convertedToProject: true,
      projectId: project._id,
      status: "in_progress",
      $push: {
        statusHistory: {
          status: "in_progress",
          changedAt: new Date(),
          remarks: "Converted to project",
        },
      },
    },
    {
      new: true,
      runValidators: true,
      ...queryOptions,
    }
  ).select(DETAIL_FIELDS);

  if (!updatedServiceRequest) {
    throw new AppError(
      "Service request was converted by another operation",
      409,
      "SERVICE_REQUEST_ALREADY_CONVERTED"
    );
  }

  await syncLinkedProjectStatusFromServiceRequest(
    updatedServiceRequest,
    convertedBy,
    session
  );

  return {
    project,
    serviceRequest: updatedServiceRequest,
  };
};

export const createServiceRequest = asyncHandler(async (req, res) => {
  requireClient(req.user);

  const payload = normalizePayload(pickFields(req.body, CLIENT_CREATE_FIELDS));

  validateRequiredServiceRequestFields(payload);

  const serviceRequest = await ServiceRequest.create({
    ...payload,
    clientId: req.user._id,
    clientName: req.user.name,
    clientEmail: req.user.email,
    clientPhone: payload.clientPhone || req.user.phone || "",
    status: "submitted",
    statusHistory: [
      {
        status: "submitted",
        changedBy: req.user._id,
      },
    ],
  });

  const createdServiceRequest = await ServiceRequest.findById(serviceRequest._id)
    .select(DETAIL_FIELDS)
    .lean();

  return res.status(201).json({
    success: true,
    message: "Service request submitted successfully",
    data: {
      serviceRequest: createdServiceRequest,
    },
    error: null,
  });
});

export const createServiceRequestBySuperAdmin = asyncHandler(async (req, res) => {
  requireSuperAdmin(req.user);

  const { clientId, clientEmail } = req.body;

  if (!clientId && !clientEmail) {
    throw new AppError(
      "Client id or client email is required",
      400,
      "CLIENT_IDENTIFIER_REQUIRED"
    );
  }

  const clientQuery = clientId
    ? { _id: clientId, role: "client" }
    : { email: clientEmail.toLowerCase().trim(), role: "client" };

  const clientUser = await User.findOne(clientQuery).select("name email phone role").lean();

  if (!clientUser) {
    throw new AppError("Client user not found", 404, "CLIENT_USER_NOT_FOUND");
  }

  const payload = normalizePayload(pickFields(req.body, CLIENT_CREATE_FIELDS));

  validateRequiredServiceRequestFields(payload);

  const serviceRequest = await ServiceRequest.create({
    ...payload,
    clientId: clientUser._id,
    clientName:
      typeof req.body.clientName === "string" && req.body.clientName.trim()
        ? req.body.clientName.trim()
        : clientUser.name,
    clientEmail: clientUser.email,
    clientPhone: payload.clientPhone || clientUser.phone || "",
    status: "submitted",
    statusHistory: [
      {
        status: "submitted",
        changedBy: req.user._id,
        remarks: "Created by super admin",
      },
    ],
    adminRemarks:
      typeof req.body.adminRemarks === "string" ? req.body.adminRemarks.trim() : "",
  });

  const createdServiceRequest = await ServiceRequest.findById(serviceRequest._id)
    .select(DETAIL_FIELDS)
    .lean();

  return res.status(201).json({
    success: true,
    message: "Service request created successfully",
    data: {
      serviceRequest: createdServiceRequest,
    },
    error: null,
  });
});

export const getMyServiceRequests = asyncHandler(async (req, res) => {
  requireClient(req.user);

  const { page, limit, skip } = getPagination(req.query);
  const filter = buildClientFilter(req.query, req.user._id);
  const result = await getPaginatedServiceRequests({
    filter,
    page,
    limit,
    skip,
    fields: CLIENT_LIST_FIELDS,
  });

  return res.status(200).json({
    success: true,
    message: "Service requests fetched successfully",
    data: result,
    error: null,
  });
});

export const getMyServiceRequestById = asyncHandler(async (req, res) => {
  requireClient(req.user);

  const { id } = req.params;
  validateRequestId(id);

  const serviceRequest = await ServiceRequest.findOne({
    _id: id,
    clientId: req.user._id,
  })
    .select(DETAIL_FIELDS)
    .lean();

  if (!serviceRequest) {
    throw new AppError(
      "Service request not found",
      404,
      "SERVICE_REQUEST_NOT_FOUND"
    );
  }

  return res.status(200).json({
    success: true,
    message: "Service request fetched successfully",
    data: {
      serviceRequest,
    },
    error: null,
  });
});

export const getAllServiceRequests = asyncHandler(async (req, res) => {
  requireSuperAdminAccess(req.user);

  const { page, limit, skip } = getPagination(req.query);
  const filter = buildAdminFilter(req.query);
  const result = await getPaginatedServiceRequests({
    filter,
    page,
    limit,
    skip,
    fields: SUPER_ADMIN_LIST_FIELDS,
  });

  return res.status(200).json({
    success: true,
    message: "Service requests fetched successfully",
    data: result,
    error: null,
  });
});

export const getServiceRequestByIdForSuperAdmin = asyncHandler(async (req, res) => {
  requireSuperAdminAccess(req.user);

  const { id } = req.params;
  validateRequestId(id);

  const serviceRequest = await ServiceRequest.findById(id)
    .select(DETAIL_FIELDS)
    .lean();

  if (!serviceRequest) {
    throw new AppError(
      "Service request not found",
      404,
      "SERVICE_REQUEST_NOT_FOUND"
    );
  }

  return res.status(200).json({
    success: true,
    message: "Service request fetched successfully",
    data: {
      serviceRequest,
    },
    error: null,
  });
});

export const updateServiceRequestStatus = asyncHandler(async (req, res) => {
  requireSuperAdminAccess(req.user);

  const { id } = req.params;
  const { status, adminRemarks, force = false } = req.body;

  validateRequestId(id);

  if (!serviceRequestStatuses.includes(status)) {
    throw new AppError(
      "Invalid service request status",
      400,
      "INVALID_SERVICE_REQUEST_STATUS"
    );
  }

  const serviceRequest = await ServiceRequest.findById(id);

  if (!serviceRequest) {
    throw new AppError(
      "Service request not found",
      404,
      "SERVICE_REQUEST_NOT_FOUND"
    );
  }

  const isAllowedNextStatus = STATUS_FLOW[serviceRequest.status] === status;
  const canForceStatus = req.user.role === "super_admin" && force === true;

  if (serviceRequest.status !== status && !isAllowedNextStatus && !canForceStatus) {
    throw new AppError(
      `Invalid status transition from ${serviceRequest.status} to ${status}`,
      400,
      "INVALID_STATUS_TRANSITION"
    );
  }

  serviceRequest.status = status;

  if (typeof adminRemarks === "string") {
    serviceRequest.adminRemarks = adminRemarks.trim();
  }

  serviceRequest.statusHistory.push({
    status,
    changedBy: req.user._id,
    remarks: typeof adminRemarks === "string" ? adminRemarks.trim() : "",
  });

  if (status === "reviewed") {
    serviceRequest.reviewedBy = req.user._id;
  }

  if (status === "approved") {
    await ensureClientRecordForApprovedRequest(serviceRequest, req.user._id);
    serviceRequest.approvedBy = req.user._id;
  }

  await serviceRequest.save();
  await syncLinkedProjectStatusFromServiceRequest(serviceRequest, req.user._id);

  const updatedServiceRequest = await ServiceRequest.findById(id)
    .select(DETAIL_FIELDS)
    .lean();

  return res.status(200).json({
    success: true,
    message: "Service request status updated successfully",
    data: {
      serviceRequest: updatedServiceRequest,
    },
    error: null,
  });
});

export const updateServiceRequestByClient = asyncHandler(async (req, res) => {
  requireClient(req.user);

  const { id } = req.params;
  validateRequestId(id);

  const serviceRequest = await ServiceRequest.findOne({
    _id: id,
    clientId: req.user._id,
  });

  if (!serviceRequest) {
    throw new AppError(
      "Service request not found",
      404,
      "SERVICE_REQUEST_NOT_FOUND"
    );
  }

  if (!CLIENT_EDITABLE_STATUSES.includes(serviceRequest.status)) {
    throw new AppError(
      "Service request can no longer be edited",
      403,
      "SERVICE_REQUEST_NOT_EDITABLE"
    );
  }

  const payload = normalizePayload(pickFields(req.body, CLIENT_UPDATE_FIELDS));

  Object.entries(payload).forEach(([field, value]) => {
    serviceRequest[field] = value;
  });

  await serviceRequest.save();

  const updatedServiceRequest = await ServiceRequest.findById(id)
    .select(DETAIL_FIELDS)
    .lean();

  return res.status(200).json({
    success: true,
    message: "Service request updated successfully",
    data: {
      serviceRequest: updatedServiceRequest,
    },
    error: null,
  });
});

export const updateServiceRequestBySuperAdmin = asyncHandler(async (req, res) => {
  requireSuperAdminAccess(req.user);

  const { id } = req.params;
  validateRequestId(id);

  const serviceRequest = await ServiceRequest.findById(id);

  if (!serviceRequest) {
    throw new AppError(
      "Service request not found",
      404,
      "SERVICE_REQUEST_NOT_FOUND"
    );
  }

  if (serviceRequest.convertedToProject) {
    throw new AppError(
      "Converted service requests cannot be edited",
      400,
      "SERVICE_REQUEST_CONVERTED"
    );
  }

  const payload = normalizePayload(pickFields(req.body, SUPER_ADMIN_UPDATE_FIELDS));

  Object.entries(payload).forEach(([field, value]) => {
    serviceRequest[field] = value;
  });

  await serviceRequest.save();

  const updatedServiceRequest = await ServiceRequest.findById(id)
    .select(DETAIL_FIELDS)
    .lean();

  return res.status(200).json({
    success: true,
    message: "Service request updated successfully",
    data: {
      serviceRequest: updatedServiceRequest,
    },
    error: null,
  });
});

export const deleteServiceRequest = asyncHandler(async (req, res) => {
  requireSuperAdmin(req.user);

  const { id } = req.params;
  validateRequestId(id);

  const serviceRequest = await ServiceRequest.findById(id)
    .select("convertedToProject")
    .lean();

  if (!serviceRequest) {
    throw new AppError(
      "Service request not found",
      404,
      "SERVICE_REQUEST_NOT_FOUND"
    );
  }

  if (serviceRequest.convertedToProject) {
    throw new AppError(
      "Converted service requests cannot be deleted",
      400,
      "SERVICE_REQUEST_CONVERTED"
    );
  }

  await ServiceRequest.findByIdAndDelete(id);

  return res.status(200).json({
    success: true,
    message: "Service request deleted successfully",
    data: null,
    error: null,
  });
});

export const convertServiceRequestToProject = asyncHandler(async (req, res) => {
  requireSuperAdmin(req.user);

  const { id } = req.params;
  validateRequestId(id);

  const session = await mongoose.startSession();
  let result;

  try {
    await session.withTransaction(async () => {
      result = await runServiceRequestConversion(id, req.user._id, session);
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    if (!isTransactionUnavailableError(error)) {
      if (error.code === 11000) {
        throw new AppError(
          "Project already exists for this service request",
          409,
          "PROJECT_ALREADY_EXISTS"
        );
      }

      throw error;
    }

    try {
      result = await runServiceRequestConversion(id, req.user._id);
    } catch (fallbackError) {
      if (fallbackError.code === 11000) {
        throw new AppError(
          "Project already exists for this service request",
          409,
          "PROJECT_ALREADY_EXISTS"
        );
      }

      throw fallbackError;
    }
  } finally {
    await session.endSession();
  }

  return res.status(201).json({
    success: true,
    message: "Service request converted to project successfully",
    data: {
      project: result.project,
      serviceRequest: result.serviceRequest,
    },
    error: null,
  });
});
