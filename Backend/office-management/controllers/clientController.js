import mongoose from "mongoose";
import Client from "../models/Client.js";
import Employee from "../models/Employee.js";
import Project from "../models/Project.js";
import Team from "../models/Team.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import logActivity from "../utils/logActivity.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import validator from "validator";
import crypto from "crypto";



const CLIENT_READ_FIELDS =
  "clientName companyName email phone address businessCategory gstNumber status notes createdAt updatedAt";

const CLIENT_LIST_FIELDS =
  "clientName companyName email phone businessCategory status createdAt updatedAt";

const CLIENT_MUTABLE_FIELDS = [
  "clientName",
  "companyName",
  "email",
  "phone",
  "address",
  "businessCategory",
  "gstNumber",
  "status",
  "notes",
];

const CLIENT_MODULE_ROLES = ["super_admin", "admin"];

const escapeRegex = (value = "") => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);
};

const requireClientModuleAccess = (user) => {
  if (!user) {
    throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
  }

  if (!CLIENT_MODULE_ROLES.includes(user.role)) {
    throw new AppError(
      "You are not allowed to access clients",
      403,
      "FORBIDDEN"
    );
  }
};

const requireSuperAdmin = (user) => {
  if (!user) {
    throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
  }

  if (!["super_admin", "admin"].includes(user.role)) {
    throw new AppError(
      "Only super admin can delete clients",
      403,
      "FORBIDDEN"
    );
  }
};

const pickClientFields = (body = {}) => {
  return CLIENT_MUTABLE_FIELDS.reduce((payload, field) => {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      payload[field] = body[field];
    }

    return payload;
  }, {});
};

const normalizeClientPayload = (payload) => {
  if (payload.email) payload.email = payload.email.toLowerCase().trim();
  if (payload.phone) payload.phone = payload.phone.trim();
  if (payload.gstNumber) payload.gstNumber = payload.gstNumber.trim().toUpperCase();

  return payload;
};

const validateRequiredClientFields = (payload) => {
  const requiredFields = [
    "clientName",
    "companyName",
    "email",
    "phone",
    "businessCategory",
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

const ensureUniqueEmailAndPhone = async ({ email, phone, excludeClientId }) => {
  const duplicateConditions = [];

  if (email) duplicateConditions.push({ email });
  if (phone) duplicateConditions.push({ phone });

  if (!duplicateConditions.length) return;

  const query = { $or: duplicateConditions };

  if (excludeClientId) {
    query._id = { $ne: excludeClientId };
  }

  const existingClient = await Client.findOne(query).select("email phone").lean();

  if (!existingClient) return;

  if (email && existingClient.email === email) {
    throw new AppError(
      "Client email already exists",
      409,
      "CLIENT_EMAIL_EXISTS"
    );
  }

  if (phone && existingClient.phone === phone) {
    throw new AppError(
      "Client phone already exists",
      409,
      "CLIENT_PHONE_EXISTS"
    );
  }
};

const getSortOption = (sort = "newest") => {
  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    clientName: { clientName: 1 },
    companyName: { companyName: 1 },
  };

  return sortOptions[sort] || sortOptions.newest;
};

const uniqueIds = (values = []) => {
  return [...new Set(values.map((value) => String(value)).filter(Boolean))];
};

const findEmployeeProfileForUser = async (user) => {
  const lookup = [];

  if (user?._id) lookup.push({ userId: user._id });
  if (user?.email) lookup.push({ email: user.email });
  if (user?.phone) lookup.push({ phone: user.phone });

  if (!lookup.length) return null;

  return Employee.findOne({ $or: lookup }).select("_id userId email phone").lean();
};

const getEmployeeProjectClientFilter = async (user) => {
  const employee = await findEmployeeProfileForUser(user);
  const assignedIdentityIds = uniqueIds([user?._id, employee?._id]);

  if (!assignedIdentityIds.length) return { _id: null };

  const teams = employee?._id
    ? await Team.find({
        status: "active",
        $or: [{ members: employee._id }, { teamLead: employee._id }],
      })
        .select("_id assignedProjects")
        .lean()
    : [];

  const teamIds = teams.map((team) => team._id);
  const projectIds = uniqueIds(teams.flatMap((team) => team.assignedProjects || []));

  return {
    $or: [
      { assignedTeam: { $in: assignedIdentityIds } },
      { "assignedTeam.user": { $in: assignedIdentityIds } },
      ...(teamIds.length ? [{ assignedTeams: { $in: teamIds } }] : []),
      ...(projectIds.length ? [{ _id: { $in: projectIds } }] : []),
    ],
  };
};


// create client, get all clients, get my assigned clients, get client by id, update client, delete client, change client password


// export const createClient = asyncHandler(async (req, res) => {
//   requireClientModuleAccess(req.user);

//   const payload = normalizeClientPayload(pickClientFields(req.body));

//   validateRequiredClientFields(payload);
//   await ensureUniqueEmailAndPhone({
//     email: payload.email,
//     phone: payload.phone,
//   });

//   const client = await Client.create({
//     ...payload,
//     createdBy: req.user._id,
//     updatedBy: req.user._id,
//   });

//   const createdClient = await Client.findById(client._id)
//     .select(CLIENT_READ_FIELDS)
//     .lean();

//   return res.status(201).json({
//     success: true,
//     message: "Client created successfully",
//     data: {
//       client: createdClient,
//     },
//     error: null,
//   });
// });










const isStrongPassword = (password) => {
  return validator.isStrongPassword(String(password), {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  });
};


// NEW: agar admin password nahi deta to strong random password generate karo
const generateTempPassword = () => {
  const random = crypto.randomBytes(9).toString("base64").replace(/[+/=]/g, "x");
  return `Aa1!${random}`;
};

export const createClient = asyncHandler(async (req, res) => {
  requireClientModuleAccess(req.user);

  const payload = normalizeClientPayload(pickClientFields(req.body));

  validateRequiredClientFields(payload);

  if (!payload.email || !validator.isEmail(payload.email)) {
    throw new AppError("Please provide a valid email", 400, "INVALID_EMAIL");
  }

  if (!payload.phone || !/^[6-9]\d{9}$/.test(payload.phone)) {
    throw new AppError(
      "Please provide a valid 10-digit Indian phone number",
      400,
      "INVALID_PHONE"
    );
  }

  const normalizedEmail = payload.email.toLowerCase().trim();
  const normalizedPhone = payload.phone.trim();

  let { password } = req.body;
  let generatedPassword = null;

  if (password) {
    if (!isStrongPassword(password)) {
      throw new AppError(
        "Password must contain at least 8 characters, uppercase, lowercase, number and special character",
        400,
        "WEAK_PASSWORD"
      );
    }
  } else {
    password = generateTempPassword();
    generatedPassword = password;
  }

  const [existingUser, emailClient, phoneClient] = await Promise.all([
    User.findOne({ email: normalizedEmail }).select("_id").lean(),
    Client.findOne({ email: normalizedEmail }).select("_id email phone").lean(),
    Client.findOne({ phone: normalizedPhone }).select("_id email phone").lean(),
  ]);

  if (existingUser) {
    throw new AppError("Email already registered", 409, "EMAIL_ALREADY_EXISTS");
  }

  if (
    emailClient &&
    phoneClient &&
    String(emailClient._id) !== String(phoneClient._id)
  ) {
    throw new AppError(
      "Email and phone are linked to different clients",
      409,
      "CLIENT_CONTACT_CONFLICT"
    );
  }

  if (phoneClient && phoneClient.email !== normalizedEmail) {
    throw new AppError("Phone already linked to another client", 409, "CLIENT_PHONE_EXISTS");
  }

  if (emailClient && emailClient.phone && emailClient.phone !== normalizedPhone) {
    throw new AppError("Email already linked to another client's phone", 409, "CLIENT_EMAIL_EXISTS");
  }

  await ensureUniqueEmailAndPhone({
    email: normalizedEmail,
    phone: normalizedPhone,
  });

  const user = await User.create({
    name: payload.clientName || payload.companyName || "Client",
    email: normalizedEmail,
    password,
    phone: normalizedPhone,
    role: "client",
    status: "active",
    emailVerified: true,
    emailVerifiedAt: new Date(),
  });

  const existingClient = emailClient || phoneClient;
  let client;

  if (existingClient) {
    client = await Client.findByIdAndUpdate(
      existingClient._id,
      {
        ...payload,
        email: normalizedEmail,
        phone: normalizedPhone,
        status: payload.status || "active",
        updatedBy: req.user._id,
      },
      { new: true, runValidators: true }
    );
  } else {
    client = await Client.create({
      ...payload,
      email: normalizedEmail,
      phone: normalizedPhone,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });
  }

  const createdClient = await Client.findById(client._id)
    .select(CLIENT_READ_FIELDS)
    .lean();

  return res.status(201).json({
    success: true,
    message: "Client created successfully",
    data: {
      client: createdClient,
      ...(generatedPassword ? { generatedPassword } : {}),
    },
    error: null,
  });
});




export const getAllClients = asyncHandler(async (req, res) => {
  requireClientModuleAccess(req.user);

  const {
    search = "",
    businessCategory,
    status,
    page = 1,
    limit = 10,
    sort = "newest",
  } = req.query;

  const pageNumber = Math.max(Number.parseInt(page, 10) || 1, 1);
  const limitNumber = Math.min(
    Math.max(Number.parseInt(limit, 10) || 10, 1),
    100
  );
  const skip = (pageNumber - 1) * limitNumber;

  const filter = {};

  if (search.trim()) {
    const searchRegex = new RegExp(escapeRegex(search.trim()), "i");

    filter.$or = [
      { clientName: searchRegex },
      { companyName: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
    ];
  }

  if (businessCategory) {
    filter.businessCategory = businessCategory.trim();
  }

  if (status) {
    filter.status = status.trim();
  }

  const [clients, totalClients] = await Promise.all([
    Client.find(filter)
      .select(CLIENT_LIST_FIELDS)
      .sort(getSortOption(sort))
      .skip(skip)
      .limit(limitNumber)
      .lean(),
    Client.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    message: "Clients fetched successfully",
    data: {
      clients,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total: totalClients,
        totalPages: Math.ceil(totalClients / limitNumber),
      },
    },
    error: null,
  });
});

export const getMyAssignedClients = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
  }

  if (req.user.role !== "employee") {
    throw new AppError(
      "Only employees can access assigned clients",
      403,
      "FORBIDDEN"
    );
  }

  const { search = "", page = 1, limit = 10, sort = "newest" } = req.query;
  const pageNumber = Math.max(Number.parseInt(page, 10) || 1, 1);
  const limitNumber = Math.min(
    Math.max(Number.parseInt(limit, 10) || 10, 1),
    100
  );
  const skip = (pageNumber - 1) * limitNumber;
  const projectFilter = await getEmployeeProjectClientFilter(req.user);

  const assignedProjects = await Project.find(projectFilter)
    .select("clientId")
    .lean();

  const clientIds = uniqueIds(assignedProjects.map((project) => project.clientId));
  const filter = clientIds.length ? { _id: { $in: clientIds } } : { _id: null };

  if (search.trim()) {
    const searchRegex = new RegExp(escapeRegex(search.trim()), "i");
    filter.$or = [
      { clientName: searchRegex },
      { companyName: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
    ];
  }

  const [clients, totalClients] = await Promise.all([
    Client.find(filter)
      .select(CLIENT_LIST_FIELDS)
      .sort(getSortOption(sort))
      .skip(skip)
      .limit(limitNumber)
      .lean(),
    Client.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    message: "Assigned clients fetched successfully",
    data: {
      clients,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total: totalClients,
        totalPages: Math.ceil(totalClients / limitNumber),
      },
    },
    error: null,
  });
});

export const getClientById = asyncHandler(async (req, res) => {
  requireClientModuleAccess(req.user);

  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new AppError("Invalid client id", 400, "INVALID_CLIENT_ID");
  }

  const client = await Client.findById(id).select(CLIENT_READ_FIELDS).lean();

  if (!client) {
    throw new AppError("Client not found", 404, "CLIENT_NOT_FOUND");
  }

  return res.status(200).json({
    success: true,
    message: "Client fetched successfully",
    data: {
      client,
    },
    error: null,
  });
});

export const updateClient = asyncHandler(async (req, res) => {
  requireClientModuleAccess(req.user);

  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new AppError("Invalid client id", 400, "INVALID_CLIENT_ID");
  }

  const existingClient = await Client.findById(id).select("_id").lean();

  if (!existingClient) {
    throw new AppError("Client not found", 404, "CLIENT_NOT_FOUND");
  }

  const payload = normalizeClientPayload(pickClientFields(req.body));
  delete payload.createdBy;

  await ensureUniqueEmailAndPhone({
    email: payload.email,
    phone: payload.phone,
    excludeClientId: id,
  });

  const updatedClient = await Client.findByIdAndUpdate(
    id,
    {
      ...payload,
      updatedBy: req.user._id,
    },
    {
      new: true,
      runValidators: true,
    }
  )
    .select(CLIENT_READ_FIELDS)
    .lean();

  await logActivity({
    req,
    action: "update",
    module: "clients",
    targetId: updatedClient._id,
    targetModel: "Client",
    description: "Super admin edited client",
    metadata: {
      clientName: updatedClient.clientName,
      companyName: updatedClient.companyName,
      changedFields: Object.keys(payload),
    },
  });

  return res.status(200).json({
    success: true,
    message: "Client updated successfully",
    data: {
      client: updatedClient,
    },
    error: null,
  });
});

export const deleteClient = asyncHandler(async (req, res) => {
  requireSuperAdmin(req.user);

  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new AppError("Invalid client id", 400, "INVALID_CLIENT_ID");
  }

  const deletedClient = await Client.findByIdAndDelete(id).select("_id").lean();

  if (!deletedClient) {
    throw new AppError("Client not found", 404, "CLIENT_NOT_FOUND");
  }

  return res.status(200).json({
    success: true,
    message: "Client deleted successfully",
    data: null,
    error: null,
  });
});




// Admin changes client password
export const changeClientPassword = asyncHandler(async (req, res) => {

  const { email, newPassword } = req.body;
  const { clientId } = req.params;

  // console.log("BODY:", req.body);
  // console.log("PARAMS:", req.params);

  if (!email || !newPassword) {
    throw new AppError(
      "Email and new password are required",
      400,
      "PASSWORD_FIELDS_REQUIRED"
    );
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  console.log("EMAIL:", normalizedEmail);
  console.log("CLIENT ID:", clientId);

  // Find client
  const client = await Client.findById(clientId)
    .select("_id email");

  console.log("CLIENT:", client);

  if (!client) {
    throw new AppError(
      "Client does not exist",
      404,
      "CLIENT_NOT_FOUND"
    );
  }

  // Verify email belongs to this client
  const clientEmail = String(client.email || "")
    .trim()
    .toLowerCase();

  if (clientEmail !== normalizedEmail) {
    throw new AppError(
      "Email does not belong to this client",
      400,
      "CLIENT_EMAIL_MISMATCH"
    );
  }

  // console.log("CLIENT EMAIL MATCHED");

  // Find client's User account
  const user = await User.findOne({
    email: normalizedEmail,
    role: "client",
  }).select("+password");

  console.log("USER ID:", user?._id);

  if (!user) {
    throw new AppError(
      "Client user account does not exist",
      404,
      "USER_NOT_FOUND"
    );
  }

  // Validate password
  // console.log("BEFORE PASSWORD VALIDATION");

  const password = String(newPassword);

  let passwordIsStrong = false;

  try {
    passwordIsStrong = isStrongPassword(password);
  } catch (error) {
    console.error("PASSWORD VALIDATION ERROR:", error);
    throw new AppError(
      "Unable to validate password",
      500,
      "PASSWORD_VALIDATION_ERROR"
    );
  }

  if (!passwordIsStrong) {
    throw new AppError(
      "Password must contain at least 8 characters, uppercase, lowercase, number and special character",
      400,
      "WEAK_PASSWORD"
    );
  }

  // Change ONLY client's password
  user.password = password;
  user.passwordChangedAt = new Date();
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  user.sessionVersion = (user.sessionVersion || 0) + 1;

  await user.save();

  return res.status(200).json({
    success: true,
    message: "Client password changed successfully.",
    data: null,
    error: null,
  });
});
