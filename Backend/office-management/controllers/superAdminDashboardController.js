import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import {
  Client,
  Employee,
  Project,
  Task,
  Payroll,
  Invoice,
  ServiceRequest,
  Team,
  Attendance,
  Income,
} from "../models/index.js";
import ReferralClient from "../models/Referral.js";

const RECENT_CLIENT_REQUESTS_LIMIT = 5;
const TASK_STATUS_VALUES = [
  "pending",
  "in_progress",
  "submitted",
  "approved",
  "rejected",
  "completed",
];
const TASK_BASIC_FIELDS =
  "taskTitle assignedEmployee relatedProject priority deadline status updatedAt createdAt";
const EMPLOYEE_BASIC_FIELDS = "name email department designation";
const PROJECT_BASIC_FIELDS = "projectName clientId category status deadline";
const CLIENT_BASIC_FIELDS = "clientName companyName email";

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);
};

const normalizeTaskStatusValue = (status) => {
  if (status === "review") return "submitted";
  if (status === "cancelled") return "completed";
  return status;
};

const normalizeTaskForResponse = (task) => {
  if (!task) return task;

  return {
    ...task,
    status: normalizeTaskStatusValue(task.status),
  };
};

const getCurrentPeriod = () => {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
};

const getTodayAttendanceData = async () => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const totalEmployees = await Employee.countDocuments({ status: "active" });

  const todayRecords = await Attendance.find({
    date: { $gte: startOfDay, $lte: endOfDay },
  }).lean();

  let present = 0;
  let leave = 0;
  let late = 0;
  let markedAbsent = 0;

  todayRecords.forEach((record) => {
    if (record.isPaidLeave || record.isUnpaidLeave) {
      leave++;
    } else if (record.attendanceStatus === "present" || record.attendanceStatus === "half_day") {
      present++;
    } else if (record.attendanceStatus === "absent") {
      markedAbsent++;
    }

    if (record.lateMinutes > 0) {
      late++;
    }
  });

  const unrecordedAbsent = Math.max(0, totalEmployees - (present + leave + markedAbsent));
  const absent = markedAbsent + unrecordedAbsent;

  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const dateStr = `${yyyy}-${mm}-${dd}`;

  return {
    date: dateStr,
    totalEmployees,
    present,
    absent,
    leave,
    late,
  };
};

const calculateMonthlySalary = async ({ month, year }) => {
  const payrollCount = await Payroll.countDocuments({ month, year });

  if (payrollCount > 0) {
    const [summary] = await Payroll.aggregate([
      {
        $match: { month, year },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$netSalary" },
        },
      },
    ]);
    return summary?.total || 0;
  }

  const [summary] = await Employee.aggregate([
    {
      $match: { status: "active" },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$salary" },
      },
    },
  ]);

  return summary?.total || 0;
};

const calculateMonthlyRevenue = async ({ month, year }) => {
  const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

  const [paidInvoicesAgg] = await Invoice.aggregate([
    {
      $match: {
        paymentStatus: "paid",
        $or: [
          { paidDate: { $gte: startOfMonth, $lte: endOfMonth } },
          { paidDate: null, updatedAt: { $gte: startOfMonth, $lte: endOfMonth } },
          { paidDate: null, createdAt: { $gte: startOfMonth, $lte: endOfMonth } },
        ],
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$totalAmount" },
      },
    },
  ]);

  const [partiallyPaidInvoicesAgg] = await Invoice.aggregate([
    {
      $match: {
        paymentStatus: "partially_paid",
        $or: [
          { updatedAt: { $gte: startOfMonth, $lte: endOfMonth } },
          { createdAt: { $gte: startOfMonth, $lte: endOfMonth } },
        ],
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$advancePayment" },
      },
    },
  ]);

  const [referralRevenueAgg] = await ReferralClient.aggregate([
    {
      $match: {
        status: "Converted",
        isDeleted: false,
        updatedAt: { $gte: startOfMonth, $lte: endOfMonth },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$actualFee" },
      },
    },
  ]);

  const [customIncomeAgg] = await Income.aggregate([
    {
      $match: {
        date: { $gte: startOfMonth, $lte: endOfMonth },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
      },
    },
  ]);

  const invoiceRevenue = (paidInvoicesAgg?.total || 0) + (partiallyPaidInvoicesAgg?.total || 0);
  const referralRevenue = referralRevenueAgg?.total || 0;
  const customIncome = customIncomeAgg?.total || 0;

  return Math.max(invoiceRevenue, referralRevenue) + customIncome;
};

const getTaskDeadlineFilter = ({ deadlineFrom, deadlineTo } = {}) => {
  if (!deadlineFrom && !deadlineTo) return null;

  const deadline = {};

  if (deadlineFrom) {
    const parsedFrom = new Date(deadlineFrom);
    if (Number.isNaN(parsedFrom.getTime())) {
      throw new AppError("Invalid deadline from date", 400, "INVALID_DEADLINE");
    }
    deadline.$gte = parsedFrom;
  }

  if (deadlineTo) {
    const parsedTo = new Date(deadlineTo);
    if (Number.isNaN(parsedTo.getTime())) {
      throw new AppError("Invalid deadline to date", 400, "INVALID_DEADLINE");
    }
    parsedTo.setHours(23, 59, 59, 999);
    deadline.$lte = parsedTo;
  }

  return deadline;
};

const buildTaskDashboardFilter = async (query = {}) => {
  const filter = {};
  const { employeeId, projectId, clientId, status } = query;

  if (employeeId) {
    if (!isValidObjectId(employeeId)) {
      throw new AppError("Invalid employee id", 400, "INVALID_EMPLOYEE_ID");
    }
    filter.assignedEmployee = new mongoose.Types.ObjectId(employeeId);
  }

  if (projectId) {
    if (!isValidObjectId(projectId)) {
      throw new AppError("Invalid project id", 400, "INVALID_PROJECT_ID");
    }
    filter.relatedProject = new mongoose.Types.ObjectId(projectId);
  }

  if (status) {
    const normalizedStatus = normalizeTaskStatusValue(status);
    if (!TASK_STATUS_VALUES.includes(normalizedStatus)) {
      throw new AppError("Invalid task status", 400, "INVALID_TASK_STATUS");
    }
    filter.status =
      normalizedStatus === "submitted"
        ? { $in: ["submitted", "review"] }
        : normalizedStatus;
  }

  const deadlineFilter = getTaskDeadlineFilter(query);
  if (deadlineFilter) filter.deadline = deadlineFilter;

  if (clientId) {
    if (!isValidObjectId(clientId)) {
      throw new AppError("Invalid client id", 400, "INVALID_CLIENT_ID");
    }

    const projectIds = await Project.find({ clientId }).select("_id").lean();
    const clientProjectIds = projectIds.map((project) => project._id);

    filter.relatedProject = projectId
      ? new mongoose.Types.ObjectId(projectId)
      : { $in: clientProjectIds };
  }

  return filter;
};

const populateDashboardTasks = (query) => {
  return query
    .populate("assignedEmployee", EMPLOYEE_BASIC_FIELDS)
    .populate({
      path: "relatedProject",
      select: PROJECT_BASIC_FIELDS,
      populate: {
        path: "clientId",
        select: CLIENT_BASIC_FIELDS,
      },
    });
};

const getTaskDashboard = async (query = {}) => {
  const filter = await buildTaskDashboardFilter(query);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalTasks,
    pendingTasks,
    inProgressTasks,
    submittedTasks,
    approvedTasks,
    completedTasks,
    overdueTasks,
    tasksByEmployee,
    tasksByProject,
    tasksByClient,
    recentSubmittedTasks,
    filteredTasks,
  ] = await Promise.all([
    Task.countDocuments(filter),
    Task.countDocuments({ ...filter, status: "pending" }),
    Task.countDocuments({ ...filter, status: "in_progress" }),
    Task.countDocuments({ ...filter, status: { $in: ["submitted", "review"] } }),
    Task.countDocuments({ ...filter, status: "approved" }),
    Task.countDocuments({ ...filter, status: "completed" }),
    Task.countDocuments({
      ...filter,
      deadline: { ...(filter.deadline || {}), $lt: today },
      status: { $nin: ["completed", "approved"] },
    }),
    Task.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$assignedEmployee",
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          inProgress: {
            $sum: { $cond: [{ $eq: ["$status", "in_progress"] }, 1, 0] },
          },
          submitted: {
            $sum: {
              $cond: [{ $in: ["$status", ["submitted", "review"]] }, 1, 0],
            },
          },
          completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "_id",
          foreignField: "_id",
          as: "employee",
        },
      },
      { $unwind: { path: "$employee", preserveNullAndEmptyArrays: true } },
      { $sort: { total: -1 } },
      { $limit: 8 },
    ]),
    Task.aggregate([
      { $match: filter },
      { $group: { _id: "$relatedProject", total: { $sum: 1 } } },
      {
        $lookup: {
          from: "projects",
          localField: "_id",
          foreignField: "_id",
          as: "project",
        },
      },
      { $unwind: { path: "$project", preserveNullAndEmptyArrays: true } },
      { $sort: { total: -1 } },
      { $limit: 8 },
    ]),
    Task.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: "projects",
          localField: "relatedProject",
          foreignField: "_id",
          as: "project",
        },
      },
      { $unwind: { path: "$project", preserveNullAndEmptyArrays: false } },
      { $group: { _id: "$project.clientId", total: { $sum: 1 } } },
      {
        $lookup: {
          from: "clients",
          localField: "_id",
          foreignField: "_id",
          as: "client",
        },
      },
      { $unwind: { path: "$client", preserveNullAndEmptyArrays: true } },
      { $sort: { total: -1 } },
      { $limit: 8 },
    ]),
    populateDashboardTasks(
      Task.find({ ...filter, status: { $in: ["submitted", "review"] } })
        .select(TASK_BASIC_FIELDS)
        .sort({ updatedAt: -1 })
        .limit(6)
    ).lean(),
    populateDashboardTasks(
      Task.find(filter)
        .select(TASK_BASIC_FIELDS)
        .sort({ deadline: 1, updatedAt: -1 })
        .limit(10)
    ).lean(),
  ]);

  return {
    filters: {
      employeeId: query.employeeId || "",
      projectId: query.projectId || "",
      clientId: query.clientId || "",
      status: query.status || "",
      deadlineFrom: query.deadlineFrom || "",
      deadlineTo: query.deadlineTo || "",
    },
    cards: {
      totalTasks,
      pendingTasks,
      inProgressTasks,
      submittedTasks,
      approvedTasks,
      completedTasks,
      overdueTasks,
    },
    tasksByEmployee: tasksByEmployee.map((item) => ({
      employeeId: item._id,
      employeeName: item.employee?.name || "Unassigned",
      email: item.employee?.email || "",
      designation: item.employee?.designation || "",
      total: item.total,
      pending: item.pending,
      inProgress: item.inProgress,
      submitted: item.submitted,
      completed: item.completed,
    })),
    tasksByProject: tasksByProject.map((item) => ({
      projectId: item._id,
      projectName: item.project?.projectName || "No project",
      category: item.project?.category || "",
      total: item.total,
    })),
    tasksByClient: tasksByClient.map((item) => ({
      clientId: item._id,
      clientName: item.client?.companyName || item.client?.clientName || "No client",
      email: item.client?.email || "",
      total: item.total,
    })),
    recentSubmittedTasks: recentSubmittedTasks.map(normalizeTaskForResponse),
    filteredTasks: filteredTasks.map(normalizeTaskForResponse),
  };
};

export const getSuperAdminDashboardSummary = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
  }

  const period = getCurrentPeriod();

  const [
    totalClients,
    totalEmployees,
    totalTeams,
    totalProjects,
    activeProjects,
    completedProjects,
    openServiceRequests,
    totalInvoices,
    pendingInvoices,
    paidInvoices,
    pendingTasks,
    todayAttendance,
    monthlySalary,
    monthlyRevenue,
    recentServiceRequests,
    taskDashboard,
  ] = await Promise.all([
    Client.countDocuments(),
    Employee.countDocuments(),
    Team.countDocuments(),
    Project.countDocuments(),
    Project.countDocuments({
      status: { $in: ["not_started", "in_progress", "on_hold"] },
    }),
    Project.countDocuments({ status: "completed" }),
    ServiceRequest.countDocuments({
      status: { $in: ["submitted", "reviewed", "approved", "in_progress"] },
    }),
    Invoice.countDocuments(),
    Invoice.countDocuments({ paymentStatus: { $in: ["pending", "partially_paid", "overdue"] } }),
    Invoice.countDocuments({ paymentStatus: "paid" }),
    Task.countDocuments({ status: "pending" }),
    getTodayAttendanceData(),
    calculateMonthlySalary(period),
    calculateMonthlyRevenue(period),
    ServiceRequest.find()
      .sort({ createdAt: -1 })
      .limit(RECENT_CLIENT_REQUESTS_LIMIT)
      .select(
        "-_id clientName clientEmail clientPhone serviceRequired projectTitle projectDescription status createdAt"
      )
      .lean(),
    getTaskDashboard(req.query),
  ]);

  const recentClientRequests = recentServiceRequests.map((request) => ({
    clientName: request.clientName,
    email: request.clientEmail,
    phone: request.clientPhone,
    serviceRequired: request.serviceRequired,
    message: request.projectDescription || request.projectTitle,
    status: request.status,
    createdAt: request.createdAt,
  }));

  return res.status(200).json({
    success: true,
    message: "Super admin dashboard summary fetched successfully",
    data: {
      cards: {
        totalClients,
        totalEmployees,
        totalTeams,
        totalProjects,
        activeProjects,
        completedProjects,
        openServiceRequests,
        totalInvoices,
        pendingInvoices,
        paidInvoices,
        pendingTasks,
        todayAttendance,
        monthlySalary,
        monthlySalaryPayable: monthlySalary,
        monthlyRevenue,
      },
      recentClientRequests,
      taskDashboard,
    },
    error: null,
  });
});

