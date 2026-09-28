import mongoose from "mongoose";
import validator from "validator";
import Employee, {
  employeeStatuses,
  employmentTypes,
} from "../models/Employee.js";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import logActivity from "../utils/logActivity.js";

const EMPLOYEE_LIST_FIELDS =
  "name email phone department designation joiningDate salary employmentType status userId createdAt updatedAt";

const EMPLOYEE_DETAIL_FIELDS =
  "name email phone department designation joiningDate salary employmentType status address emergencyContact documents userId createdBy updatedBy createdAt updatedAt";

const USER_SAFE_FIELDS = "name email role status";

const EMPLOYEE_MUTABLE_FIELDS = [
  "name",
  "email",
  "phone",
  "department",
  "designation",
  "joiningDate",
  "salary",
  "employmentType",
  "status",
  "address",
  "emergencyContact",
  "documents",
];

const EMPLOYEE_READ_ROLES = ["super_admin", "admin", "hr"];
const EMPLOYEE_WRITE_ROLES = ["super_admin", "admin", "hr"];

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

const requireEmployeeReadAccess = (user) => {
  requireAuthenticatedUser(user);

  if (!EMPLOYEE_READ_ROLES.includes(user.role)) {
    throw new AppError(
      "You are not allowed to access employee management",
      403,
      "FORBIDDEN"
    );
  }
};

const requireEmployeeWriteAccess = (user) => {
  requireAuthenticatedUser(user);

  if (!EMPLOYEE_WRITE_ROLES.includes(user.role)) {
    throw new AppError(
      "You are not allowed to modify employees",
      403,
      "FORBIDDEN"
    );
  }
};

const requireSuperAdmin = (user) => {
  requireAuthenticatedUser(user);

  if (!["super_admin", "hr"].includes(user.role)) {
    throw new AppError(
      "Only super admin can delete employees",
      403,
      "FORBIDDEN"
    );
  }
};

const isStrongPassword = (password) => {
  return validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  });
};

const mapEmployeeStatusToUserStatus = (status) => {
  return status === "active" ? "active" : "inactive";
};

const pickFields = (body = {}, allowedFields = []) => {
  return allowedFields.reduce((payload, field) => {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      payload[field] = body[field];
    }

    return payload;
  }, {});
};

const normalizeEmployeePayload = (payload = {}) => {
  [
    "name",
    "email",
    "phone",
    "department",
    "designation",
    "employmentType",
    "status",
    "address",
  ].forEach((field) => {
    if (typeof payload[field] === "string") {
      payload[field] = payload[field].trim();
    }
  });

  if (payload.email) {
    payload.email = payload.email.toLowerCase();
  }

  if (payload.salary !== undefined && payload.salary !== "") {
    payload.salary = Number(payload.salary);
  }

  return payload;
};

const validateEmployeeId = (id) => {
  if (!isValidObjectId(id)) {
    throw new AppError("Invalid employee id", 400, "INVALID_EMPLOYEE_ID");
  }
};

const validateRequiredEmployeeFields = (payload) => {
  const requiredFields = [
    "name",
    "email",
    "phone",
    "joiningDate",
    "employmentType",
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

const validateEmployeePayload = (payload = {}) => {
  if (
    payload.salary !== undefined &&
    (!Number.isFinite(payload.salary) || payload.salary < 0)
  ) {
    throw new AppError("Salary cannot be negative", 400, "INVALID_SALARY");
  }

  if (payload.joiningDate !== undefined) {
    const joiningDate = new Date(payload.joiningDate);

    if (Number.isNaN(joiningDate.getTime())) {
      throw new AppError(
        "Joining date must be a valid date",
        400,
        "INVALID_JOINING_DATE"
      );
    }

    payload.joiningDate = joiningDate;
  }

  if (payload.employmentType && !employmentTypes.includes(payload.employmentType)) {
    throw new AppError(
      "Invalid employment type",
      400,
      "INVALID_EMPLOYMENT_TYPE"
    );
  }

  if (payload.status && !employeeStatuses.includes(payload.status)) {
    throw new AppError("Invalid employee status", 400, "INVALID_EMPLOYEE_STATUS");
  }

};

const ensureUniqueUserEmail = async ({ email, excludeUserId }) => {
  if (!email) return;

  const query = { email };

  if (excludeUserId) {
    query._id = { $ne: excludeUserId };
  }

  const existingUser = await User.findOne(query).select("_id role").lean();

  if (existingUser) {
    throw new AppError(
      "A login account already exists with this email",
      409,
      "USER_EMAIL_EXISTS"
    );
  }
};

const ensureUniqueEmailAndPhone = async ({ email, phone, excludeEmployeeId }) => {
  const duplicateConditions = [];

  if (email) duplicateConditions.push({ email });
  if (phone) duplicateConditions.push({ phone });

  if (!duplicateConditions.length) return;

  const query = { $or: duplicateConditions };

  if (excludeEmployeeId) {
    query._id = { $ne: excludeEmployeeId };
  }

  const employee = await Employee.findOne(query).select("email phone").lean();

  if (!employee) return;

  if (email && employee.email === email) {
    throw new AppError(
      "Employee email already exists",
      409,
      "EMPLOYEE_EMAIL_EXISTS"
    );
  }

  if (phone && employee.phone === phone) {
    throw new AppError(
      "Employee phone already exists",
      409,
      "EMPLOYEE_PHONE_EXISTS"
    );
  }
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
    name: { name: 1 },
    joiningDate: { joiningDate: -1 },
  };

  return sortOptions[sort] || sortOptions.newest;
};

const buildEmployeeFilter = (query = {}) => {
  const filter = {};
  const {
    search = "",
    department,
    status,
    designation,
    employmentType,
  } = query;

  if (search.trim()) {
    const searchRegex = new RegExp(escapeRegex(search.trim()), "i");

    filter.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
      { department: searchRegex },
      { designation: searchRegex },
    ];
  }

  if (department) filter.department = department.trim();
  if (designation) filter.designation = designation.trim();

  if (status) {
    const normalizedStatus = status.trim();

    if (!employeeStatuses.includes(normalizedStatus)) {
      throw new AppError("Invalid employee status", 400, "INVALID_EMPLOYEE_STATUS");
    }

    filter.status = normalizedStatus;
  }

  if (employmentType) {
    const normalizedEmploymentType = employmentType.trim();

    if (!employmentTypes.includes(normalizedEmploymentType)) {
      throw new AppError(
        "Invalid employment type",
        400,
        "INVALID_EMPLOYMENT_TYPE"
      );
    }

    filter.employmentType = normalizedEmploymentType;
  }

  return filter;
};

export const createEmployee = asyncHandler(async (req, res) => {
  requireEmployeeWriteAccess(req.user);

  const password = req.body.password;

  if (!password) {
    throw new AppError(
      "Login password is required",
      400,
      "PASSWORD_REQUIRED"
    );
  }

  if (!isStrongPassword(password)) {
    throw new AppError(
      "Password must contain at least 8 characters, uppercase, lowercase, number and special character",
      400,
      "WEAK_PASSWORD"
    );
  }

  const payload = normalizeEmployeePayload(
    pickFields(req.body, EMPLOYEE_MUTABLE_FIELDS)
  );

  validateRequiredEmployeeFields(payload);
  validateEmployeePayload(payload);

  delete payload.userId;

  await Promise.all([
    ensureUniqueEmailAndPhone({
      email: payload.email,
      phone: payload.phone,
    }),
    ensureUniqueUserEmail({ email: payload.email }),
  ]);

  let loginUser;

  try {
    loginUser = await User.create({
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      password,
      role: "employee",
      status: mapEmployeeStatusToUserStatus(payload.status),
      emailVerified: true,
      emailVerifiedAt: new Date(),
    });

    const employee = await Employee.create({
      ...payload,
      userId: loginUser._id,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    const createdEmployee = await Employee.findById(employee._id)
      .select(EMPLOYEE_DETAIL_FIELDS)
      .populate("userId", USER_SAFE_FIELDS)
      .lean();

    return res.status(201).json({
      success: true,
      message: "Employee and login account created successfully",
      data: {
        employee: createdEmployee,
        user: createdEmployee.userId,
      },
      error: null,
    });
  } catch (error) {
    if (loginUser?._id) {
      await User.findByIdAndDelete(loginUser._id);
    }

    throw error;
  }
});

export const getAllEmployees = asyncHandler(async (req, res) => {
  requireEmployeeReadAccess(req.user);

  const { page, limit, skip } = getPagination(req.query);
  const filter = buildEmployeeFilter(req.query);

  const [employees, totalEmployees] = await Promise.all([
    Employee.find(filter)
      .select(EMPLOYEE_LIST_FIELDS)
      .populate("userId", USER_SAFE_FIELDS)
      .sort(getSortOption(req.query.sort))
      .skip(skip)
      .limit(limit)
      .lean(),
    Employee.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    message: "Employees fetched successfully",
    data: {
      employees,
      pagination: {
        page,
        limit,
        total: totalEmployees,
        totalPages: Math.ceil(totalEmployees / limit),
      },
    },
    error: null,
  });
});

export const getEmployeeById = asyncHandler(async (req, res) => {
  requireEmployeeReadAccess(req.user);

  const { id } = req.params;
  validateEmployeeId(id);

  const employee = await Employee.findById(id)
    .select(EMPLOYEE_DETAIL_FIELDS)
    .populate("userId", USER_SAFE_FIELDS)
    .lean();

  if (!employee) {
    throw new AppError("Employee not found", 404, "EMPLOYEE_NOT_FOUND");
  }

  return res.status(200).json({
    success: true,
    message: "Employee fetched successfully",
    data: {
      employee,
    },
    error: null,
  });
});

export const updateEmployee = asyncHandler(async (req, res) => {
  requireEmployeeWriteAccess(req.user);

  const { id } = req.params;
  validateEmployeeId(id);

  const existingEmployee = await Employee.findById(id).select("_id userId").lean();

  if (!existingEmployee) {
    throw new AppError("Employee not found", 404, "EMPLOYEE_NOT_FOUND");
  }

  const payload = normalizeEmployeePayload(
    pickFields(req.body, EMPLOYEE_MUTABLE_FIELDS)
  );
  delete payload.userId;

  validateEmployeePayload(payload);

  await Promise.all([
    ensureUniqueEmailAndPhone({
      email: payload.email,
      phone: payload.phone,
      excludeEmployeeId: id,
    }),
    ensureUniqueUserEmail({
      email: payload.email,
      excludeUserId: existingEmployee.userId,
    }),
  ]);

  const update = {
    $set: {
      ...payload,
      updatedBy: req.user._id,
    },
  };

  const updatedEmployee = await Employee.findByIdAndUpdate(
    id,
    update,
    {
      new: true,
      runValidators: true,
    }
  )
    .select(EMPLOYEE_DETAIL_FIELDS)
    .populate("userId", USER_SAFE_FIELDS)
    .lean();

  if (updatedEmployee?.userId?._id) {
    await User.findByIdAndUpdate(
      updatedEmployee.userId._id,
      {
        $set: {
          name: updatedEmployee.name,
          email: updatedEmployee.email,
          phone: updatedEmployee.phone,
          status: mapEmployeeStatusToUserStatus(updatedEmployee.status),
        },
      },
      { runValidators: true }
    );
  }

  return res.status(200).json({
    success: true,
    message: "Employee updated successfully",
    data: {
      employee: updatedEmployee,
    },
    error: null,
  });
});

export const deleteEmployee = asyncHandler(async (req, res) => {
  requireSuperAdmin(req.user);

  const { id } = req.params;
  validateEmployeeId(id);

  const deletedEmployee = await Employee.findByIdAndDelete(id)
    .select("_id name email department designation")
    .lean();

  if (!deletedEmployee) {
    throw new AppError("Employee not found", 404, "EMPLOYEE_NOT_FOUND");
  }

  await logActivity({
    req,
    action: "delete",
    module: "employees",
    targetId: deletedEmployee._id,
    targetModel: "Employee",
    description: "Super admin deleted employee",
    metadata: {
      employeeName: deletedEmployee.name,
      employeeEmail: deletedEmployee.email,
      department: deletedEmployee.department,
      designation: deletedEmployee.designation,
    },
  });

  return res.status(200).json({
    success: true,
    message: "Employee deleted successfully",
    data: null,
    error: null,
  });
});
