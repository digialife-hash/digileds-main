import mongoose from "mongoose";
import Employee from "../models/Employee.js";
import Payroll, { payrollPaymentStatuses } from "../models/Payroll.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { calculateMonthlyBreakdown } from "./attendanceController.js";
import AttendanceSettings from "../models/AttendanceSettings.js";

const PAYROLL_LIST_FIELDS =
  "employeeId month year basicSalary bonus deduction paidAmount dueAmount paymentStatus paymentDate remarks createdAt updatedAt";

const PAYROLL_DETAIL_FIELDS =
  "employeeId month year basicSalary bonus deduction paidAmount dueAmount paymentStatus paymentDate remarks salarySlip attendanceSummary createdBy updatedBy createdAt updatedAt";

const EMPLOYEE_BASIC_FIELDS = "name email phone department designation";

const PAYROLL_CREATE_FIELDS = [
  "employeeId",
  "month",
  "year",
  "basicSalary",
  "bonus",
  "deduction",
  "paidAmount",
  "paymentDate",
  "remarks",
  "salarySlip",
  "attendanceSummary",
];

const PAYROLL_UPDATE_FIELDS = [
  "basicSalary",
  "bonus",
  "deduction",
  "paidAmount",
  "paymentDate",
  "remarks",
  "salarySlip",
  "attendanceSummary",
];

const PAYROLL_READ_ROLES = ["super_admin", "admin", "hr"];

export const calculatePayrollAmounts = ({
  basicSalary,
  bonus = 0,
  deduction = 0,
  paidAmount = 0,
} = {}) => {
  const toAmount = (value, fieldLabel, errorCode) => {
    const amount = Number(value ?? 0);

    if (!Number.isFinite(amount)) {
      throw new AppError(
        `${fieldLabel} must be a valid number`,
        400,
        errorCode
      );
    }

    if (amount < 0) {
      throw new AppError(`${fieldLabel} cannot be negative`, 400, errorCode);
    }

    return amount;
  };

  const normalizedBasicSalary = toAmount(
    basicSalary,
    "Basic salary",
    "INVALID_BASIC_SALARY"
  );
  const normalizedBonus = toAmount(bonus, "Bonus", "INVALID_BONUS");
  const normalizedDeduction = toAmount(
    deduction,
    "Deduction",
    "INVALID_DEDUCTION"
  );
  const normalizedPaidAmount = toAmount(
    paidAmount,
    "Paid amount",
    "INVALID_PAID_AMOUNT"
  );

  const grossAmount = normalizedBasicSalary + normalizedBonus;

  if (normalizedDeduction > grossAmount) {
    throw new AppError(
      "Deduction cannot be greater than basic salary plus bonus",
      400,
      "INVALID_DEDUCTION"
    );
  }

  const totalPayable = grossAmount - normalizedDeduction;

  if (normalizedPaidAmount > totalPayable) {
    throw new AppError(
      "Paid amount cannot be greater than total payable",
      400,
      "INVALID_PAID_AMOUNT"
    );
  }

  const dueAmount = totalPayable - normalizedPaidAmount;
  let paymentStatus = "unpaid";

  if (normalizedPaidAmount > 0 && normalizedPaidAmount < totalPayable) {
    paymentStatus = "partially_paid";
  }

  if (normalizedPaidAmount === totalPayable && totalPayable > 0) {
    paymentStatus = "paid";
  }

  return {
    basicSalary: normalizedBasicSalary,
    bonus: normalizedBonus,
    deduction: normalizedDeduction,
    paidAmount: normalizedPaidAmount,
    totalPayable,
    dueAmount,
    paymentStatus,
  };
};

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

const requirePayrollReadAccess = (user) => {
  requireAuthenticatedUser(user);

  if (!PAYROLL_READ_ROLES.includes(user.role)) {
    throw new AppError(
      "You are not allowed to access payroll",
      403,
      "FORBIDDEN"
    );
  }
};

const requireSuperAdmin = (user) => {
  requireAuthenticatedUser(user);

  if (!["super_admin", "admin", "hr"].includes(user.role)) {
    throw new AppError(
      "Only super admin can modify payroll",
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

const validatePayrollId = (id) => {
  if (!isValidObjectId(id)) {
    throw new AppError("Invalid payroll id", 400, "INVALID_PAYROLL_ID");
  }
};

const validateEmployeeId = (id) => {
  if (!isValidObjectId(id)) {
    throw new AppError("Invalid employee id", 400, "INVALID_EMPLOYEE_ID");
  }
};

const validateEmployeeExists = async (employeeId) => {
  validateEmployeeId(employeeId);

  const employee = await Employee.findById(employeeId).select("_id").lean();

  if (!employee) {
    throw new AppError("Employee not found", 404, "EMPLOYEE_NOT_FOUND");
  }
};

const normalizeNumber = (payload, field) => {
  if (payload[field] !== undefined && payload[field] !== "") {
    payload[field] = Number(payload[field]);
  }
};

const normalizePayrollPayload = (payload = {}) => {
  [
    "month",
    "year",
    "basicSalary",
    "bonus",
    "deduction",
    "paidAmount",
  ].forEach((field) => normalizeNumber(payload, field));

  if (typeof payload.remarks === "string") {
    payload.remarks = payload.remarks.trim();
  }

  if (!payload.paymentDate) {
    delete payload.paymentDate;
  } else {
    payload.paymentDate = new Date(payload.paymentDate);

    if (Number.isNaN(payload.paymentDate.getTime())) {
      throw new AppError(
        "Payment date must be a valid date",
        400,
        "INVALID_PAYMENT_DATE"
      );
    }
  }

  return payload;
};

const validateRequiredPayrollFields = (payload = {}) => {
  const requiredFields = ["employeeId", "month", "year", "basicSalary"];
  const missingFields = requiredFields.filter((field) => {
    return payload[field] === undefined || payload[field] === "";
  });

  if (missingFields.length) {
    throw new AppError(
      `Missing required fields: ${missingFields.join(", ")}`,
      400,
      "REQUIRED_FIELDS_MISSING"
    );
  }
};

const validatePayrollPeriod = ({ month, year }) => {
  if (
    month !== undefined &&
    (!Number.isInteger(month) || month < 1 || month > 12)
  ) {
    throw new AppError(
      "Payroll month must be between 1 and 12",
      400,
      "INVALID_PAYROLL_MONTH"
    );
  }

  if (
    year !== undefined &&
    (!Number.isInteger(year) || year < 2000 || year > 2100)
  ) {
    throw new AppError("Invalid payroll year", 400, "INVALID_PAYROLL_YEAR");
  }
};

const applyPayrollCalculations = (payload = {}, options = {}) => {
  const { paymentDateProvided = false } = options;
  const calculated = calculatePayrollAmounts(payload);

  payload.basicSalary = calculated.basicSalary;
  payload.bonus = calculated.bonus;
  payload.deduction = calculated.deduction;
  payload.paidAmount = calculated.paidAmount;
  payload.dueAmount = calculated.dueAmount;
  payload.paymentStatus = calculated.paymentStatus;

  if (payload.paymentStatus === "unpaid") {
    payload.paymentDate = null;
  } else if (payload.paymentStatus === "paid" && !payload.paymentDate) {
    payload.paymentDate = new Date();
  } else if (payload.paymentStatus === "partially_paid" && !paymentDateProvided) {
    payload.paymentDate = null;
  }

  return payload;
};

const ensureUniquePayrollPeriod = async ({ employeeId, month, year }) => {
  const payroll = await Payroll.findOne({ employeeId, month, year })
    .select("_id")
    .lean();

  if (payroll) {
    throw new AppError(
      "Payroll already exists for this employee and period",
      409,
      "PAYROLL_ALREADY_EXISTS"
    );
  }
};

const getEmployeeIdsForSearch = async (search = "") => {
  if (!search.trim()) return null;

  const searchRegex = new RegExp(escapeRegex(search.trim()), "i");
  const employees = await Employee.find({
    $or: [
      { name: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
    ],
  })
    .select("_id")
    .lean();

  return employees.map((employee) => employee._id);
};

const buildPayrollFilter = async (query = {}) => {
  const filter = {};
  const { employeeId, month, year, paymentStatus, search = "" } = query;

  if (employeeId) {
    validateEmployeeId(employeeId.trim());
    filter.employeeId = employeeId.trim();
  }

  if (month) {
    const normalizedMonth = Number.parseInt(month, 10);
    validatePayrollPeriod({ month: normalizedMonth });
    filter.month = normalizedMonth;
  }

  if (year) {
    const normalizedYear = Number.parseInt(year, 10);
    validatePayrollPeriod({ year: normalizedYear });
    filter.year = normalizedYear;
  }

  if (paymentStatus) {
    const normalizedStatus = paymentStatus.trim();

    if (!payrollPaymentStatuses.includes(normalizedStatus)) {
      throw new AppError(
        "Invalid payment status",
        400,
        "INVALID_PAYMENT_STATUS"
      );
    }

    filter.paymentStatus = normalizedStatus;
  }

  const searchEmployeeIds = await getEmployeeIdsForSearch(search);

  if (searchEmployeeIds) {
    filter.employeeId = filter.employeeId
      ? { $in: searchEmployeeIds.filter((id) => String(id) === filter.employeeId) }
      : { $in: searchEmployeeIds };
  }

  return filter;
};

const populatePayrollEmployee = (query) => {
  return query.populate("employeeId", EMPLOYEE_BASIC_FIELDS);
};

export const createPayroll = asyncHandler(async (req, res) => {
  requireSuperAdmin(req.user);

  const payload = normalizePayrollPayload(
    pickFields(req.body, PAYROLL_CREATE_FIELDS)
  );

  validateRequiredPayrollFields(payload);
  validatePayrollPeriod(payload);

  payload.bonus = payload.bonus ?? 0;
  payload.deduction = payload.deduction ?? 0;
  payload.paidAmount = payload.paidAmount ?? 0;

  await Promise.all([
    validateEmployeeExists(payload.employeeId),
    ensureUniquePayrollPeriod({
      employeeId: payload.employeeId,
      month: payload.month,
      year: payload.year,
    }),
  ]);

  const calculatedPayroll = applyPayrollCalculations(payload, {
    paymentDateProvided: Object.prototype.hasOwnProperty.call(
      payload,
      "paymentDate"
    ),
  });

  const payroll = await Payroll.create({
    ...calculatedPayroll,
    createdBy: req.user._id,
    updatedBy: req.user._id,
  });

  const createdPayroll = await populatePayrollEmployee(
    Payroll.findById(payroll._id).select(PAYROLL_DETAIL_FIELDS)
  ).lean();

  return res.status(201).json({
    success: true,
    message: "Payroll created successfully",
    data: {
      payroll: createdPayroll,
    },
    error: null,
  });
});

export const getAllPayrolls = asyncHandler(async (req, res) => {
  requirePayrollReadAccess(req.user);

  const { page, limit, skip } = getPagination(req.query);
  const filter = await buildPayrollFilter(req.query);

  const [payrolls, totalPayrolls] = await Promise.all([
    populatePayrollEmployee(
      Payroll.find(filter)
        .select(PAYROLL_LIST_FIELDS)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
    ).lean(),
    Payroll.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    message: "Payrolls fetched successfully",
    data: {
      payrolls,
      pagination: {
        page,
        limit,
        total: totalPayrolls,
        totalPages: Math.ceil(totalPayrolls / limit),
      },
    },
    error: null,
  });
});

export const getPayrollById = asyncHandler(async (req, res) => {
  requirePayrollReadAccess(req.user);

  const { id } = req.params;
  validatePayrollId(id);

  const payroll = await populatePayrollEmployee(
    Payroll.findById(id).select(PAYROLL_DETAIL_FIELDS)
  ).lean();

  if (!payroll) {
    throw new AppError("Payroll not found", 404, "PAYROLL_NOT_FOUND");
  }

  return res.status(200).json({
    success: true,
    message: "Payroll fetched successfully",
    data: {
      payroll,
    },
    error: null,
  });
});

export const getPayrollByEmployee = asyncHandler(async (req, res) => {
  requirePayrollReadAccess(req.user);

  const employeeId = req.params.employeeId || req.params.id;
  validateEmployeeId(employeeId);
  await validateEmployeeExists(employeeId);

  const filter = { employeeId };
  const { year, paymentStatus } = req.query;

  if (year) {
    const normalizedYear = Number.parseInt(year, 10);
    validatePayrollPeriod({ year: normalizedYear });
    filter.year = normalizedYear;
  }

  if (paymentStatus) {
    const normalizedStatus = paymentStatus.trim();

    if (!payrollPaymentStatuses.includes(normalizedStatus)) {
      throw new AppError(
        "Invalid payment status",
        400,
        "INVALID_PAYMENT_STATUS"
      );
    }

    filter.paymentStatus = normalizedStatus;
  }

  const payrolls = await populatePayrollEmployee(
    Payroll.find(filter)
      .select(PAYROLL_LIST_FIELDS)
      .sort({ year: -1, month: -1 })
  ).lean();

  return res.status(200).json({
    success: true,
    message: "Employee payrolls fetched successfully",
    data: {
      payrolls,
    },
    error: null,
  });
});

export const updatePayroll = asyncHandler(async (req, res) => {
  requireSuperAdmin(req.user);

  const { id } = req.params;
  validatePayrollId(id);

  const existingPayroll = await Payroll.findById(id).lean();

  if (!existingPayroll) {
    throw new AppError("Payroll not found", 404, "PAYROLL_NOT_FOUND");
  }

  const payload = normalizePayrollPayload(
    pickFields(req.body, PAYROLL_UPDATE_FIELDS)
  );
  const paymentDateProvided = Object.prototype.hasOwnProperty.call(
    payload,
    "paymentDate"
  );

  const nextPayroll = {
    basicSalary: existingPayroll.basicSalary,
    bonus: existingPayroll.bonus,
    deduction: existingPayroll.deduction,
    paidAmount: existingPayroll.paidAmount,
    paymentDate: existingPayroll.paymentDate,
    ...payload,
  };

  const calculatedPayroll = applyPayrollCalculations(nextPayroll, {
    paymentDateProvided,
  });

  const updatedPayroll = await populatePayrollEmployee(
    Payroll.findByIdAndUpdate(
      id,
      {
        ...payload,
        basicSalary: calculatedPayroll.basicSalary,
        bonus: calculatedPayroll.bonus,
        deduction: calculatedPayroll.deduction,
        paidAmount: calculatedPayroll.paidAmount,
        dueAmount: calculatedPayroll.dueAmount,
        paymentStatus: calculatedPayroll.paymentStatus,
        paymentDate: calculatedPayroll.paymentDate,
        updatedBy: req.user._id,
      },
      {
        new: true,
        runValidators: true,
      }
    ).select(PAYROLL_DETAIL_FIELDS)
  ).lean();

  return res.status(200).json({
    success: true,
    message: "Payroll updated successfully",
    data: {
      payroll: updatedPayroll,
    },
    error: null,
  });
});

export const deletePayroll = asyncHandler(async (req, res) => {
  requireSuperAdmin(req.user);

  const { id } = req.params;
  validatePayrollId(id);

  const deletedPayroll = await Payroll.findByIdAndDelete(id).select("_id").lean();

  if (!deletedPayroll) {
    throw new AppError("Payroll not found", 404, "PAYROLL_NOT_FOUND");
  }

  return res.status(200).json({
    success: true,
    message: "Payroll deleted successfully",
    data: null,
    error: null,
  });
});

// GET Payroll Preview
export const getPayrollPreviewApi = asyncHandler(async (req, res) => {
  requireSuperAdmin(req.user);

  let { month, year } = req.query;
  const current = new Date();
  month = Number.parseInt(month || current.getMonth() + 1, 10);
  year = Number.parseInt(year || current.getFullYear(), 10);

  const employees = await Employee.find({ status: "active" }).lean();
  const settings = (await AttendanceSettings.findOne()) || (await AttendanceSettings.create({}));

  const previewList = [];

  for (const emp of employees) {
    const breakdown = await calculateMonthlyBreakdown(emp._id, month, year);

    // Salary Calculation Engine
    const basicSalary = emp.salary || 0;
    const dailyRate = basicSalary / (settings.defaultWorkingDaysPerMonth || 26);
    const hourlyRate = dailyRate / (settings.minWorkingHours || 8);
    const overtimeAmount = Math.round(breakdown.overtimeHours * hourlyRate * (settings.overtimeRate || 1.5) * 100) / 100;

    let lateDeduction = 0;
    if (breakdown.lateArrivals > settings.lateEntryDeductionAfter) {
      const penaltyCount = breakdown.lateArrivals - settings.lateEntryDeductionAfter;
      lateDeduction = Math.round(penaltyCount * dailyRate * settings.lateEntryDeductionRate * 100) / 100;
    }

    const unpaidLeaveDeduction = Math.round(breakdown.unpaidLeave * dailyRate * 100) / 100;
    const absentDeduction = Math.round(breakdown.absent * dailyRate * 100) / 100;
    const halfDayDeduction = Math.round(breakdown.halfDays * 0.5 * dailyRate * 100) / 100;
    const totalDeductions = Math.round((lateDeduction + unpaidLeaveDeduction + absentDeduction + halfDayDeduction) * 100) / 100;

    const netSalary = Math.max(Math.round((basicSalary + overtimeAmount - totalDeductions) * 100) / 100, 0);

    const existing = await Payroll.findOne({ employeeId: emp._id, month, year }).lean();

    previewList.push({
      employee: emp,
      month,
      year,
      basicSalary,
      overtimeHours: breakdown.overtimeHours,
      overtimeAmount,
      lateArrivals: breakdown.lateArrivals,
      lateDeduction,
      deductions: totalDeductions,
      absentDays: breakdown.absent,
      halfDays: breakdown.halfDays,
      unpaidLeave: breakdown.unpaidLeave,
      netSalary,
      status: existing ? existing.status : "draft",
      payrollId: existing ? existing._id : null,
      paymentStatus: existing ? existing.paymentStatus : "unpaid",
    });
  }

  return res.status(200).json({
    success: true,
    data: previewList,
  });
});

// POST Bulk Generate Payroll
export const generateBulkPayrollApi = asyncHandler(async (req, res) => {
  requireSuperAdmin(req.user);

  let { month, year } = req.body;
  if (!month || !year) {
    throw new AppError("Month and year are required", 400, "BAD_REQUEST");
  }

  month = Number.parseInt(month, 10);
  year = Number.parseInt(year, 10);

  const employees = await Employee.find({ status: "active" }).lean();
  const settings = (await AttendanceSettings.findOne()) || (await AttendanceSettings.create({}));

  let generatedCount = 0;
  let skippedCount = 0;

  for (const emp of employees) {
    const existing = await Payroll.findOne({ employeeId: emp._id, month, year }).lean();
    if (existing) {
      skippedCount++;
      continue;
    }

    const breakdown = await calculateMonthlyBreakdown(emp._id, month, year);

    // Salary Calculation Engine
    const basicSalary = emp.salary || 0;
    const dailyRate = basicSalary / (settings.defaultWorkingDaysPerMonth || 26);
    const hourlyRate = dailyRate / (settings.minWorkingHours || 8);
    const overtimeAmount = Math.round(breakdown.overtimeHours * hourlyRate * (settings.overtimeRate || 1.5) * 100) / 100;

    let lateDeduction = 0;
    if (breakdown.lateArrivals > settings.lateEntryDeductionAfter) {
      const penaltyCount = breakdown.lateArrivals - settings.lateEntryDeductionAfter;
      lateDeduction = Math.round(penaltyCount * dailyRate * settings.lateEntryDeductionRate * 100) / 100;
    }

    const unpaidLeaveDeduction = Math.round(breakdown.unpaidLeave * dailyRate * 100) / 100;
    const absentDeduction = Math.round(breakdown.absent * dailyRate * 100) / 100;
    const halfDayDeduction = Math.round(breakdown.halfDays * 0.5 * dailyRate * 100) / 100;
    const totalDeductions = Math.round((lateDeduction + unpaidLeaveDeduction + absentDeduction + halfDayDeduction) * 100) / 100;

    const netSalary = Math.max(Math.round((basicSalary + overtimeAmount - totalDeductions) * 100) / 100, 0);

    await Payroll.create({
      employeeId: emp._id,
      month,
      year,
      basicSalary,
      bonus: overtimeAmount,
      deduction: totalDeductions,
      overtimeAmount,
      lateDeduction,
      netSalary,
      paidAmount: 0,
      dueAmount: netSalary,
      paymentStatus: "unpaid",
      status: "generated",
      attendanceSummary: {
        workingDays: breakdown.workingDays,
        presentDays: breakdown.present,
        leaveDays: breakdown.paidLeave + breakdown.unpaidLeave,
        absentDays: breakdown.absent,
        attendanceDeduction: totalDeductions,
      },
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });
    generatedCount++;
  }

  return res.status(201).json({
    success: true,
    message: `Payroll generation completed. Generated: ${generatedCount}, Skipped: ${skippedCount}`,
    data: {
      generatedCount,
      skippedCount,
    },
  });
});

// PUT Approve/Reject Payroll
export const approvePayrollApi = asyncHandler(async (req, res) => {
  requireSuperAdmin(req.user);

  const { id } = req.params;
  const { action } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid payroll ID", 400, "BAD_REQUEST");
  }

  const status = action === "approve" ? "approved" : "rejected";

  const payroll = await Payroll.findByIdAndUpdate(
    id,
    { status, updatedBy: req.user._id },
    { new: true, runValidators: true }
  )
    .populate("employeeId", EMPLOYEE_BASIC_FIELDS)
    .lean();

  if (!payroll) {
    throw new AppError("Payroll record not found", 404, "NOT_FOUND");
  }

  return res.status(200).json({
    success: true,
    message: `Payroll status updated to ${status}`,
    data: payroll,
  });
});

// POST Recalculate Payroll
export const recalculatePayrollApi = asyncHandler(async (req, res) => {
  requireSuperAdmin(req.user);

  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid payroll ID", 400, "BAD_REQUEST");
  }

  const payroll = await Payroll.findById(id);
  if (!payroll) {
    throw new AppError("Payroll record not found", 404, "NOT_FOUND");
  }

  const employee = await Employee.findById(payroll.employeeId).lean();
  if (!employee) {
    throw new AppError("Employee not found", 404, "NOT_FOUND");
  }

  const settings = (await AttendanceSettings.findOne()) || (await AttendanceSettings.create({}));
  const breakdown = await calculateMonthlyBreakdown(employee._id, payroll.month, payroll.year);

  const basicSalary = employee.salary || 0;
  const dailyRate = basicSalary / (settings.defaultWorkingDaysPerMonth || 26);
  const hourlyRate = dailyRate / (settings.minWorkingHours || 8);
  const overtimeAmount = Math.round(breakdown.overtimeHours * hourlyRate * (settings.overtimeRate || 1.5) * 100) / 100;

  let lateDeduction = 0;
  if (breakdown.lateArrivals > settings.lateEntryDeductionAfter) {
    const penaltyCount = breakdown.lateArrivals - settings.lateEntryDeductionAfter;
    lateDeduction = Math.round(penaltyCount * dailyRate * settings.lateEntryDeductionRate * 100) / 100;
  }

  const unpaidLeaveDeduction = Math.round(breakdown.unpaidLeave * dailyRate * 100) / 100;
  const absentDeduction = Math.round(breakdown.absent * dailyRate * 100) / 100;
  const halfDayDeduction = Math.round(breakdown.halfDays * 0.5 * dailyRate * 100) / 100;
  const totalDeductions = Math.round((lateDeduction + unpaidLeaveDeduction + absentDeduction + halfDayDeduction) * 100) / 100;

  const netSalary = Math.max(Math.round((basicSalary + overtimeAmount - totalDeductions) * 100) / 100, 0);

  payroll.basicSalary = basicSalary;
  payroll.bonus = overtimeAmount;
  payroll.deduction = totalDeductions;
  payroll.overtimeAmount = overtimeAmount;
  payroll.lateDeduction = lateDeduction;
  payroll.netSalary = netSalary;
  payroll.dueAmount = netSalary - payroll.paidAmount;
  payroll.attendanceSummary = {
    workingDays: breakdown.workingDays,
    presentDays: breakdown.present,
    leaveDays: breakdown.paidLeave + breakdown.unpaidLeave,
    absentDays: breakdown.absent,
    attendanceDeduction: totalDeductions,
  };
  payroll.status = "generated";
  payroll.updatedBy = req.user._id;

  await payroll.save();

  const populated = await Payroll.findById(payroll._id)
    .populate("employeeId", EMPLOYEE_BASIC_FIELDS)
    .lean();

  return res.status(200).json({
    success: true,
    message: "Payroll recalculated successfully",
    data: populated,
  });
});
