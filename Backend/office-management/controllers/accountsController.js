import mongoose from "mongoose";
import Project from "../models/Project.js";
import Invoice from "../models/Invoice.js";
import Client from "../models/Client.js";
import Income from "../models/Income.js";
import Expense, { expenseCategories, paymentMethods } from "../models/Expense.js";
import Payroll from "../models/Payroll.js";
import ReferralClient from "../models/Referral.js";
import Counter from "../models/Counter.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

const validObjectId = (id) => id && mongoose.Types.ObjectId.isValid(id);
const asObjectId = (id) => (validObjectId(id) ? new mongoose.Types.ObjectId(id) : null);
const toNumber = (value) => {
  const numberValue = Number(value || 0);
  return Number.isFinite(numberValue) ? Math.max(0, numberValue) : 0;
};

const parseMaybeJson = (value, fallback) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch (e) {
    return fallback;
  }
};

const normalizeBoolean = (value) => value === true || value === "true" || value === "yes" || value === "1";

const getFinancialYear = (date) => {
  const month = date.getMonth();
  const year = date.getFullYear();
  const startYear = month >= 3 ? year : year - 1;
  return `${startYear}-${String(startYear + 1).slice(-2)}`;
};

const buildDateRange = ({ range = "", startDate = "", endDate = "" } = {}) => {
  const now = new Date();
  let start = null;
  let end = null;

  if (range === "today") {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  } else if (range === "this_week") {
    const base = new Date(now);
    const day = base.getDay();
    const diff = base.getDate() - day + (day === 0 ? -6 : 1);
    start = new Date(base.setDate(diff));
    start.setHours(0, 0, 0, 0);
    end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
  } else if (range === "this_month") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  } else if (range === "last_month") {
    start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  } else if (range === "this_quarter") {
    const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
    start = new Date(now.getFullYear(), quarterMonth, 1);
    end = new Date(now.getFullYear(), quarterMonth + 3, 0, 23, 59, 59, 999);
  } else if (range === "this_financial_year" || range === "this_year") {
    const startYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    start = new Date(startYear, 3, 1);
    end = new Date(startYear + 1, 2, 31, 23, 59, 59, 999);
  }

  if (startDate) {
    start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
  }
  if (endDate) {
    end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
  }

  return { start, end };
};

const getDayRange = (dateValue = new Date()) => {
  const source = dateValue ? new Date(dateValue) : new Date();
  const start = new Date(source.getFullYear(), source.getMonth(), source.getDate(), 0, 0, 0, 0);
  const end = new Date(source.getFullYear(), source.getMonth(), source.getDate(), 23, 59, 59, 999);
  return { start, end };
};

const getMonthRange = (monthValue, yearValue) => {
  const now = new Date();
  const month = Math.max(1, Math.min(12, parseInt(monthValue || now.getMonth() + 1, 10)));
  const year = parseInt(yearValue || now.getFullYear(), 10);
  return {
    month,
    year,
    start: new Date(year, month - 1, 1, 0, 0, 0, 0),
    end: new Date(year, month, 0, 23, 59, 59, 999),
  };
};

const getPreviousMonthRange = (monthValue, yearValue) => {
  const { month, year } = getMonthRange(monthValue, yearValue);
  const previous = new Date(year, month - 2, 1);
  return getMonthRange(previous.getMonth() + 1, previous.getFullYear());
};

const getFinancialYearRange = (financialYear = "") => {
  const now = new Date();
  let startYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  const match = String(financialYear).match(/^(\d{4})-\d{2}$/);
  if (match) startYear = Number(match[1]);
  return {
    financialYear: `${startYear}-${String(startYear + 1).slice(-2)}`,
    start: new Date(startYear, 3, 1, 0, 0, 0, 0),
    end: new Date(startYear + 1, 2, 31, 23, 59, 59, 999),
  };
};

const getPercentChange = (current, previous) => {
  if (!previous) return null;
  return Math.round(((current - previous) / previous) * 10000) / 100;
};

const summarizeExpenses = async (match) => {
  const [summary] = await Expense.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$totalAmount" },
        paidAmount: { $sum: "$amountPaid" },
        pendingAmount: { $sum: "$pendingAmount" },
        gstAmount: { $sum: "$gstAmount" },
        count: { $sum: 1 },
        recurringAmount: { $sum: { $cond: ["$isRecurring", "$totalAmount", 0] } },
        reimbursementAmount: { $sum: { $cond: ["$isReimbursement", "$totalAmount", 0] } },
        pendingApprovalCount: {
          $sum: { $cond: [{ $eq: ["$approvalStatus", "Pending Approval"] }, 1, 0] },
        },
        pendingApprovalAmount: {
          $sum: { $cond: [{ $eq: ["$approvalStatus", "Pending Approval"] }, "$totalAmount", 0] },
        },
        highestExpense: { $max: "$totalAmount" },
        cashAmount: { $sum: { $cond: [{ $eq: ["$paymentMethod", "Cash"] }, "$totalAmount", 0] } },
        upiAmount: { $sum: { $cond: [{ $eq: ["$paymentMethod", "UPI"] }, "$totalAmount", 0] } },
        bankAmount: { $sum: { $cond: [{ $in: ["$paymentMethod", ["Bank Transfer", "NEFT", "RTGS", "IMPS"]] }, "$totalAmount", 0] } },
      },
    },
  ]);

  const safeSummary = summary || {};
  return {
    totalAmount: safeSummary.totalAmount || 0,
    paidAmount: safeSummary.paidAmount || 0,
    pendingAmount: safeSummary.pendingAmount || 0,
    gstAmount: safeSummary.gstAmount || 0,
    count: safeSummary.count || 0,
    recurringAmount: safeSummary.recurringAmount || 0,
    reimbursementAmount: safeSummary.reimbursementAmount || 0,
    pendingApprovalCount: safeSummary.pendingApprovalCount || 0,
    pendingApprovalAmount: safeSummary.pendingApprovalAmount || 0,
    highestExpense: safeSummary.highestExpense || 0,
    averageExpense: safeSummary.count ? Math.round((safeSummary.totalAmount / safeSummary.count) * 100) / 100 : 0,
    cashAmount: safeSummary.cashAmount || 0,
    upiAmount: safeSummary.upiAmount || 0,
    bankAmount: safeSummary.bankAmount || 0,
  };
};

const groupByField = async (match, field, limit = 10) =>
  Expense.aggregate([
    { $match: match },
    {
      $group: {
        _id: field,
        totalAmount: { $sum: "$totalAmount" },
        paidAmount: { $sum: "$amountPaid" },
        pendingAmount: { $sum: "$pendingAmount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { totalAmount: -1 } },
    { $limit: limit },
  ]);

const getOverdueBuckets = async (baseMatch) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdue = await Expense.aggregate([
    {
      $match: {
        ...baseMatch,
        dueDate: { $ne: null, $lt: today },
        pendingAmount: { $gt: 0 },
      },
    },
    {
      $project: {
        totalAmount: 1,
        pendingAmount: 1,
        daysOverdue: {
          $dateDiff: { startDate: "$dueDate", endDate: today, unit: "day" },
        },
      },
    },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        amount: { $sum: "$pendingAmount" },
        oneToSeven: { $sum: { $cond: [{ $lte: ["$daysOverdue", 7] }, "$pendingAmount", 0] } },
        eightToFifteen: {
          $sum: {
            $cond: [{ $and: [{ $gte: ["$daysOverdue", 8] }, { $lte: ["$daysOverdue", 15] }] }, "$pendingAmount", 0],
          },
        },
        sixteenToThirty: {
          $sum: {
            $cond: [{ $and: [{ $gte: ["$daysOverdue", 16] }, { $lte: ["$daysOverdue", 30] }] }, "$pendingAmount", 0],
          },
        },
        thirtyPlus: { $sum: { $cond: [{ $gt: ["$daysOverdue", 30] }, "$pendingAmount", 0] } },
      },
    },
  ]);
  return overdue[0] || { count: 0, amount: 0, oneToSeven: 0, eightToFifteen: 0, sixteenToThirty: 0, thirtyPlus: 0 };
};

const activeExpenseMatch = (extra = {}) => ({
  isDeleted: { $ne: true },
  approvalStatus: { $nin: ["Rejected", "Cancelled"] },
  paymentStatus: { $ne: "Cancelled" },
  ...extra,
});

const generateIncomeId = async () => {
  let counter = await Counter.findOne({ id: "incomeId" });
  if (!counter) {
    try {
      counter = await Counter.create({ id: "incomeId", seq: 1000 });
    } catch (e) {
      counter = await Counter.findOne({ id: "incomeId" });
    }
  }

  const updatedCounter = await Counter.findOneAndUpdate(
    { id: "incomeId" },
    { $inc: { seq: 1 } },
    { new: true }
  );

  return `INC-${updatedCounter.seq}`;
};

const generateExpenseId = async (date = new Date()) => {
  const year = date.getFullYear();
  const counterId = `expenseId-${year}`;
  let counter = await Counter.findOne({ id: counterId });
  if (!counter) {
    try {
      counter = await Counter.create({ id: counterId, seq: 0 });
    } catch (e) {
      counter = await Counter.findOne({ id: counterId });
    }
  }

  const updatedCounter = await Counter.findOneAndUpdate(
    { id: counterId },
    { $inc: { seq: 1 } },
    { new: true }
  );

  return `EXP-${year}-${String(updatedCounter.seq).padStart(4, "0")}`;
};

const filesToAttachments = (files = [], userId) =>
  files.map((file) => ({
    label: file.originalname,
    type: "Supporting Document",
    originalName: file.originalname,
    filename: file.filename,
    path: `/uploads/${file.filename}`,
    mimetype: file.mimetype,
    size: file.size,
    uploadedBy: userId,
    uploadedAt: new Date(),
  }));

const buildExpensePayload = async (body, user, existingExpense = null, files = []) => {
  const expenseDate = body.expenseDate || body.date ? new Date(body.expenseDate || body.date) : existingExpense?.expenseDate || new Date();
  if (Number.isNaN(expenseDate.getTime())) {
    throw new AppError("Expense date is invalid", 400, "INVALID_EXPENSE_DATE");
  }

  const baseAmount = toNumber(body.baseAmount ?? body.amount ?? existingExpense?.baseAmount);
  if (!body.expenseTitle?.trim() && !existingExpense?.expenseTitle) {
    throw new AppError("Expense title is required", 400, "MISSING_EXPENSE_TITLE");
  }
  if (baseAmount <= 0 && !existingExpense) {
    throw new AppError("A valid positive expense amount is required", 400, "INVALID_AMOUNT");
  }

  const vendorSnapshot = {
    ...(existingExpense?.vendorSnapshot?.toObject?.() || existingExpense?.vendorSnapshot || {}),
    ...parseMaybeJson(body.vendorSnapshot, {}),
  };
  if (body.paidTo && !vendorSnapshot.vendorName) vendorSnapshot.vendorName = body.paidTo.trim();
  if (body.vendorName) vendorSnapshot.vendorName = body.vendorName.trim();
  if (body.vendorGstin) vendorSnapshot.gstin = body.vendorGstin.trim();

  const recurringConfig = {
    ...(existingExpense?.recurringConfig?.toObject?.() || existingExpense?.recurringConfig || {}),
    ...parseMaybeJson(body.recurringConfig, {}),
  };
  const reimbursement = {
    ...(existingExpense?.reimbursement?.toObject?.() || existingExpense?.reimbursement || {}),
    ...parseMaybeJson(body.reimbursement, {}),
  };

  const payload = {
    expenseTitle: body.expenseTitle?.trim() ?? existingExpense?.expenseTitle,
    description: body.description?.trim() ?? existingExpense?.description ?? "",
    category: body.category || existingExpense?.category || "Miscellaneous",
    categoryGroup: body.categoryGroup || existingExpense?.categoryGroup || "Miscellaneous",
    subcategory: body.subcategory?.trim() ?? existingExpense?.subcategory ?? "",
    expenseDate,
    date: expenseDate,
    financialYear: body.financialYear || getFinancialYear(expenseDate),
    vendorId: asObjectId(body.vendorId) || existingExpense?.vendorId || null,
    vendorSnapshot,
    paidTo: body.paidTo?.trim() || vendorSnapshot.vendorName || existingExpense?.paidTo || "",
    baseAmount: baseAmount || existingExpense?.baseAmount || 0,
    taxableAmount: toNumber(body.taxableAmount ?? baseAmount ?? existingExpense?.taxableAmount),
    gstApplicable: body.gstApplicable === undefined ? existingExpense?.gstApplicable || false : normalizeBoolean(body.gstApplicable),
    gstRate: toNumber(body.gstRate ?? existingExpense?.gstRate),
    gstType: body.gstType || existingExpense?.gstType || "None",
    otherTax: toNumber(body.otherTax ?? existingExpense?.otherTax),
    discount: toNumber(body.discount ?? existingExpense?.discount),
    additionalCharges: toNumber(body.additionalCharges ?? existingExpense?.additionalCharges),
    amountPaid: toNumber(body.amountPaid ?? existingExpense?.amountPaid),
    paymentMethod: body.paymentMethod || existingExpense?.paymentMethod || "Bank Transfer",
    paymentDate: body.paymentDate ? new Date(body.paymentDate) : existingExpense?.paymentDate || null,
    transactionId: body.transactionId?.trim() ?? existingExpense?.transactionId ?? "",
    referenceNumber: body.referenceNumber?.trim() ?? existingExpense?.referenceNumber ?? "",
    bankReferenceNumber: body.bankReferenceNumber?.trim() ?? existingExpense?.bankReferenceNumber ?? "",
    utrNumber: body.utrNumber?.trim() ?? existingExpense?.utrNumber ?? "",
    chequeNumber: body.chequeNumber?.trim() ?? existingExpense?.chequeNumber ?? "",
    chequeDate: body.chequeDate ? new Date(body.chequeDate) : existingExpense?.chequeDate || null,
    bankName: body.bankName?.trim() ?? existingExpense?.bankName ?? "",
    upiTransactionId: body.upiTransactionId?.trim() ?? existingExpense?.upiTransactionId ?? "",
    paymentNotes: body.paymentNotes?.trim() ?? existingExpense?.paymentNotes ?? "",
    billNumber: body.billNumber?.trim() ?? existingExpense?.billNumber ?? "",
    invoiceNumber: body.invoiceNumber?.trim() ?? existingExpense?.invoiceNumber ?? "",
    invoiceDate: body.invoiceDate ? new Date(body.invoiceDate) : existingExpense?.invoiceDate || null,
    dueDate: body.dueDate ? new Date(body.dueDate) : existingExpense?.dueDate || null,
    purchaseOrderNumber: body.purchaseOrderNumber?.trim() ?? existingExpense?.purchaseOrderNumber ?? "",
    billAmount: toNumber(body.billAmount ?? existingExpense?.billAmount),
    vendorInvoiceNumber: body.vendorInvoiceNumber?.trim() ?? existingExpense?.vendorInvoiceNumber ?? "",
    companyGstin: body.companyGstin?.trim() ?? existingExpense?.companyGstin ?? "",
    hsnSacCode: body.hsnSacCode?.trim() ?? existingExpense?.hsnSacCode ?? "",
    inputTaxCreditEligible:
      body.inputTaxCreditEligible === undefined
        ? existingExpense?.inputTaxCreditEligible || false
        : normalizeBoolean(body.inputTaxCreditEligible),
    inputTaxCreditAmount: toNumber(body.inputTaxCreditAmount ?? existingExpense?.inputTaxCreditAmount),
    reverseChargeApplicable:
      body.reverseChargeApplicable === undefined
        ? existingExpense?.reverseChargeApplicable || false
        : normalizeBoolean(body.reverseChargeApplicable),
    isRecurring: body.isRecurring === undefined ? existingExpense?.isRecurring || false : normalizeBoolean(body.isRecurring),
    recurringConfig,
    requestedBy: asObjectId(body.requestedBy) || existingExpense?.requestedBy || null,
    paidBy: asObjectId(body.paidBy) || existingExpense?.paidBy || null,
    employeeId: asObjectId(body.employeeId) || existingExpense?.employeeId || null,
    projectId: asObjectId(body.projectId) || existingExpense?.projectId || null,
    clientId: asObjectId(body.clientId) || existingExpense?.clientId || null,
    department: body.department?.trim() ?? existingExpense?.department ?? "",
    costCenter: body.costCenter?.trim() ?? existingExpense?.costCenter ?? "",
    branchOffice: body.branchOffice?.trim() ?? existingExpense?.branchOffice ?? "",
    isReimbursement:
      body.isReimbursement === undefined ? existingExpense?.isReimbursement || false : normalizeBoolean(body.isReimbursement),
    reimbursement,
    approvalRequired:
      body.approvalRequired === undefined ? existingExpense?.approvalRequired || false : normalizeBoolean(body.approvalRequired),
    approvalStatus: body.approvalStatus || existingExpense?.approvalStatus || "Approved",
    approvalNotes: body.approvalNotes?.trim() ?? existingExpense?.approvalNotes ?? "",
    rejectionReason: body.rejectionReason?.trim() ?? existingExpense?.rejectionReason ?? "",
    priority: body.priority || existingExpense?.priority || "Normal",
    tags: Array.isArray(body.tags)
      ? body.tags
      : String(body.tags || existingExpense?.tags?.join(",") || "")
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
    notes: body.notes?.trim() ?? existingExpense?.notes ?? "",
    internalNotes: body.internalNotes?.trim() ?? existingExpense?.internalNotes ?? "",
    updatedBy: user._id,
  };

  if (!existingExpense) {
    payload.expenseId = await generateExpenseId(expenseDate);
    payload.createdBy = user._id;
  }

  if (files.length) {
    payload.attachments = [...(existingExpense?.attachments || []), ...filesToAttachments(files, user._id)];
  }

  if (!existingExpense && payload.amountPaid > 0) {
    payload.payments = [
      {
        paymentDate: payload.paymentDate || new Date(),
        amount: payload.amountPaid,
        paymentMethod: payload.paymentMethod,
        transactionReference: payload.referenceNumber || payload.transactionId || payload.utrNumber,
        bankReferenceNumber: payload.bankReferenceNumber,
        utrNumber: payload.utrNumber,
        chequeNumber: payload.chequeNumber,
        chequeDate: payload.chequeDate,
        bankName: payload.bankName,
        upiTransactionId: payload.upiTransactionId,
        notes: payload.paymentNotes,
        addedBy: user._id,
      },
    ];
  }

  return payload;
};

// Sync Paid Payroll entries into Expense records
const syncPaidPayrollToExpenses = async () => {
  try {
    const paidPayrolls = await Payroll.find({ paymentStatus: "paid" })
      .populate("employeeId", "name email userId")
      .lean();

    for (const p of paidPayrolls) {
      const existingExpense = await Expense.findOne({ payrollId: p._id });
      if (!existingExpense) {
        const paymentDate = p.paymentDate || p.updatedAt || new Date();
        await Expense.create({
          expenseId: await generateExpenseId(new Date(paymentDate)),
          expenseTitle: `Salary Payment - ${p.employeeId?.name || "Employee"} (${p.month}/${p.year})`,
          category: "Salary",
          categoryGroup: "Employee Expenses",
          baseAmount: p.netSalary || 0,
          taxableAmount: p.netSalary || 0,
          amountPaid: p.netSalary || 0,
          expenseDate: paymentDate,
          date: paymentDate,
          paymentDate,
          paymentMethod: paymentMethods.includes(p.paymentMethod) ? p.paymentMethod : "Bank Transfer",
          paidTo: p.employeeId?.name || "Employee",
          referenceNumber: p.transactionReference || "",
          description: `Auto-synced from Payroll record ${p.month}/${p.year}`,
          payrollId: p._id,
          paymentStatus: "Paid",
          approvalStatus: "Approved",
          createdBy: p.paidBy || p.employeeId?.userId || "000000000000000000000000",
          payments: [
            {
              paymentDate,
              amount: p.netSalary || 0,
              paymentMethod: paymentMethods.includes(p.paymentMethod) ? p.paymentMethod : "Bank Transfer",
              transactionReference: p.transactionReference || "",
              addedBy: p.paidBy || p.employeeId?.userId || "000000000000000000000000",
              notes: "Auto-synced payroll payment",
            },
          ],
        });
      }
    }
  } catch (err) {
    console.error("Failed to sync payroll to expenses:", err);
  }
};

// 1. ACCOUNTS OVERVIEW SUMMARY
export const getAccountsSummary = asyncHandler(async (req, res) => {
  await syncPaidPayrollToExpenses();

  const [projectWorkAgg, invoiceWorkAgg] = await Promise.all([
    Project.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$budget" } } },
    ]),
    Invoice.aggregate([
      { $match: { projectId: { $exists: false } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
  ]);
  const totalWorkAmount = (projectWorkAgg[0]?.total || 0) + (invoiceWorkAgg[0]?.total || 0);

  const [paidInvoicesAgg, partialInvoicesAgg, referralRevAgg, customIncomeAgg] = await Promise.all([
    Invoice.aggregate([{ $match: { paymentStatus: "paid" } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
    Invoice.aggregate([{ $match: { paymentStatus: "partially_paid" } }, { $group: { _id: null, total: { $sum: "$advancePayment" } } }]),
    ReferralClient.aggregate([{ $match: { status: "Converted", isDeleted: false } }, { $group: { _id: null, total: { $sum: "$actualFee" } } }]),
    Income.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
  ]);

  const totalIncome =
    Math.max((paidInvoicesAgg[0]?.total || 0) + (partialInvoicesAgg[0]?.total || 0), referralRevAgg[0]?.total || 0) +
    (customIncomeAgg[0]?.total || 0);

  const [partialPendingAgg, unpaidPendingAgg] = await Promise.all([
    Invoice.aggregate([
      { $match: { paymentStatus: "partially_paid" } },
      { $group: { _id: null, total: { $sum: { $subtract: ["$totalAmount", { $ifNull: ["$advancePayment", 0] }] } } } },
    ]),
    Invoice.aggregate([
      { $match: { paymentStatus: { $in: ["pending", "overdue", "unpaid"] } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
  ]);
  const pendingAmount = (partialPendingAgg[0]?.total || 0) + (unpaidPendingAgg[0]?.total || 0);

  const expenseAgg = await Expense.aggregate([
    { $match: activeExpenseMatch() },
    { $group: { _id: null, total: { $sum: "$totalAmount" }, paid: { $sum: "$amountPaid" }, pending: { $sum: "$pendingAmount" } } },
  ]);
  const totalExpenses = expenseAgg[0]?.total || 0;

  const netProfitLoss = totalIncome - totalExpenses;

  return res.status(200).json({
    success: true,
    data: {
      totalWorkAmount,
      totalIncome,
      pendingAmount,
      totalExpenses,
      expensePaidAmount: expenseAgg[0]?.paid || 0,
      expensePendingAmount: expenseAgg[0]?.pending || 0,
      netProfitLoss: Math.abs(netProfitLoss),
      profitLossStatus: netProfitLoss >= 0 ? "profit" : "loss",
    },
  });
});

// 2. TOTAL WORK AMOUNT DETAILED LIST
export const getTotalWorkAmountList = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = "", status = "", clientId = "" } = req.query;
  const query = { status: { $ne: "cancelled" } };
  if (status) query.status = status;
  if (validObjectId(clientId)) query.clientId = asObjectId(clientId);
  if (search?.trim()) {
    const regex = new RegExp(search.trim(), "i");
    query.$or = [{ projectName: regex }, { category: regex }];
  }
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;
  const [projects, total] = await Promise.all([
    Project.find(query).populate("clientId", "clientName companyName phone email").sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
    Project.countDocuments(query),
  ]);
  return res.status(200).json({ success: true, data: { projects, pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } } });
});

// 3. PENDING AMOUNT DETAILED LIST
export const getPendingAmountList = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = "", status = "", clientId = "" } = req.query;
  const query = { paymentStatus: { $in: ["pending", "partially_paid", "overdue"] } };
  if (status) query.paymentStatus = status;
  if (validObjectId(clientId)) query.clientId = asObjectId(clientId);
  if (search?.trim()) {
    const regex = new RegExp(search.trim(), "i");
    query.$or = [{ invoiceNumber: regex }, { "clientSnapshot.companyName": regex }];
  }
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;
  const [invoices, total] = await Promise.all([
    Invoice.find(query).populate("clientId", "clientName companyName phone email").populate("projectId", "projectName category").sort({ dueDate: 1 }).skip(skip).limit(limitNum).lean(),
    Invoice.countDocuments(query),
  ]);
  const formattedInvoices = invoices.map((inv) => ({
    ...inv,
    receivedAmount: inv.paymentStatus === "partially_paid" ? inv.advancePayment || 0 : 0,
    pendingAmount: inv.totalAmount - (inv.paymentStatus === "partially_paid" ? inv.advancePayment || 0 : 0),
  }));
  return res.status(200).json({ success: true, data: { invoices: formattedInvoices, pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } } });
});

// 4. INCOME CONTROLLERS
export const getIncomeList = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = "", category = "", paymentMethod = "", startDate = "", endDate = "" } = req.query;
  const query = {};
  if (category) query.category = category;
  if (paymentMethod) query.paymentMethod = paymentMethod;
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date.$lte = end;
    }
  }
  if (search?.trim()) {
    const regex = new RegExp(search.trim(), "i");
    query.$or = [{ incomeId: regex }, { clientName: regex }, { description: regex }, { transactionReference: regex }];
  }
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;
  const [incomes, total] = await Promise.all([
    Income.find(query).populate("clientId", "clientName companyName").populate("projectId", "projectName").populate("invoiceId", "invoiceNumber totalAmount").sort({ date: -1 }).skip(skip).limit(limitNum).lean(),
    Income.countDocuments(query),
  ]);
  return res.status(200).json({ success: true, data: { incomes, pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } } });
});

export const createIncome = asyncHandler(async (req, res) => {
  const { clientId, clientName, projectId, invoiceId, category, amount, paymentMethod, transactionReference, description, date } = req.body;
  if (!amount || Number(amount) <= 0) throw new AppError("A valid positive amount is required", 400, "INVALID_AMOUNT");
  const income = await Income.create({
    incomeId: await generateIncomeId(),
    clientId: asObjectId(clientId),
    clientName: clientName || "General Client",
    projectId: asObjectId(projectId),
    invoiceId: asObjectId(invoiceId),
    category: category || "Client Payment",
    amount: Number(amount),
    paymentMethod: paymentMethod || "Bank Transfer",
    transactionReference: transactionReference ? transactionReference.trim() : "",
    description: description ? description.trim() : "",
    date: date ? new Date(date) : new Date(),
    createdBy: req.user._id,
  });
  return res.status(201).json({ success: true, message: "Income record created successfully", data: { income } });
});

export const deleteIncome = asyncHandler(async (req, res) => {
  if (!validObjectId(req.params.id)) throw new AppError("Invalid income ID", 400, "INVALID_ID");
  const income = await Income.findByIdAndDelete(req.params.id);
  if (!income) throw new AppError("Income record not found", 404, "NOT_FOUND");
  return res.status(200).json({ success: true, message: "Income record deleted successfully" });
});

const buildExpenseQuery = (queryParams) => {
  const {
    search = "",
    category = "",
    subcategory = "",
    paymentMethod = "",
    paymentStatus = "",
    approvalStatus = "",
    department = "",
    vendor = "",
    employeeId = "",
    projectId = "",
    clientId = "",
    gst = "",
    recurring = "",
    reimbursement = "",
    range = "",
    startDate = "",
    endDate = "",
  } = queryParams;

  const query = { isDeleted: { $ne: true } };
  if (category) query.category = category;
  if (subcategory) query.subcategory = subcategory;
  if (paymentMethod) query.paymentMethod = paymentMethod;
  if (paymentStatus) query.paymentStatus = paymentStatus;
  if (approvalStatus) query.approvalStatus = approvalStatus;
  if (department) query.department = new RegExp(department, "i");
  if (vendor) query["vendorSnapshot.vendorName"] = new RegExp(vendor, "i");
  if (validObjectId(employeeId)) query.employeeId = asObjectId(employeeId);
  if (validObjectId(projectId)) query.projectId = asObjectId(projectId);
  if (validObjectId(clientId)) query.clientId = asObjectId(clientId);
  if (gst === "gst") query.gstApplicable = true;
  if (gst === "non_gst") query.gstApplicable = false;
  if (recurring === "recurring") query.isRecurring = true;
  if (recurring === "one_time") query.isRecurring = false;
  if (reimbursement === "yes") query.isReimbursement = true;
  if (reimbursement === "no") query.isReimbursement = false;

  const { start, end } = buildDateRange({ range, startDate, endDate });
  if (start || end) {
    query.expenseDate = {};
    if (start) query.expenseDate.$gte = start;
    if (end) query.expenseDate.$lte = end;
  }

  if (search?.trim()) {
    const regex = new RegExp(search.trim(), "i");
    query.$or = [
      { expenseId: regex },
      { expenseTitle: regex },
      { paidTo: regex },
      { "vendorSnapshot.vendorName": regex },
      { invoiceNumber: regex },
      { billNumber: regex },
      { transactionId: regex },
      { referenceNumber: regex },
      { description: regex },
      { notes: regex },
      { category: regex },
      { subcategory: regex },
      { department: regex },
    ];
  }

  return query;
};

const buildExpenseSort = (sortBy = "date", sortOrder = "desc") => {
  const direction = sortOrder === "asc" ? 1 : -1;
  const map = {
    date: "expenseDate",
    amount: "totalAmount",
    pending: "pendingAmount",
    created: "createdAt",
    vendor: "vendorSnapshot.vendorName",
    category: "category",
  };
  return { [map[sortBy] || "expenseDate"]: direction, createdAt: -1 };
};

// 5. EXPENSE CONTROLLERS
export const getExpenseList = asyncHandler(async (req, res) => {
  await syncPaidPayrollToExpenses();
  const { page = 1, limit = 10, sortBy = "date", sortOrder = "desc" } = req.query;
  const query = buildExpenseQuery(req.query);
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [expenses, total, summaryAgg, categoryAgg, monthlyAgg] = await Promise.all([
    Expense.find(query)
      .populate("createdBy", "name email role")
      .populate("projectId", "projectName")
      .populate("clientId", "clientName companyName")
      .sort(buildExpenseSort(sortBy, sortOrder))
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Expense.countDocuments(query),
    Expense.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" },
          paidAmount: { $sum: "$amountPaid" },
          pendingAmount: { $sum: "$pendingAmount" },
          gstAmount: { $sum: "$gstAmount" },
          recurringAmount: { $sum: { $cond: ["$isRecurring", "$totalAmount", 0] } },
        },
      },
    ]),
    Expense.aggregate([{ $match: query }, { $group: { _id: "$category", total: { $sum: "$totalAmount" }, count: { $sum: 1 } } }, { $sort: { total: -1 } }]),
    Expense.aggregate([{ $match: query }, { $group: { _id: "$expenseMonth", total: { $sum: "$totalAmount" } } }, { $sort: { _id: 1 } }]),
  ]);

  return res.status(200).json({
    success: true,
    data: {
      expenses,
      summary: summaryAgg[0] || { totalAmount: 0, paidAmount: 0, pendingAmount: 0, gstAmount: 0, recurringAmount: 0 },
      categoryBreakdown: categoryAgg,
      monthlyTrend: monthlyAgg.map((m) => ({ month: m._id, amount: m.total })),
      categories: expenseCategories,
      paymentMethods,
      pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
    },
  });
});

export const getExpenseDetails = asyncHandler(async (req, res) => {
  if (!validObjectId(req.params.id)) throw new AppError("Invalid expense ID", 400, "INVALID_ID");
  const expense = await Expense.findOne({ _id: req.params.id, isDeleted: { $ne: true } })
    .populate("createdBy", "name email role")
    .populate("updatedBy", "name email role")
    .populate("approvedBy", "name email role")
    .populate("rejectedBy", "name email role")
    .populate("payments.addedBy", "name email role")
    .populate("projectId", "projectName budget status")
    .populate("clientId", "clientName companyName email phone")
    .lean();
  if (!expense) throw new AppError("Expense record not found", 404, "NOT_FOUND");
  return res.status(200).json({ success: true, data: { expense } });
});

export const createExpense = asyncHandler(async (req, res) => {
  const payload = await buildExpensePayload(req.body, req.user, null, req.files || []);
  const expense = await Expense.create(payload);
  return res.status(201).json({ success: true, message: "Expense recorded successfully", data: { expense } });
});

export const updateExpense = asyncHandler(async (req, res) => {
  if (!validObjectId(req.params.id)) throw new AppError("Invalid expense ID", 400, "INVALID_ID");
  const expense = await Expense.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
  if (!expense) throw new AppError("Expense record not found", 404, "NOT_FOUND");
  if (expense.payrollId) throw new AppError("Auto-synced payroll expenses cannot be edited here", 400, "PAYROLL_EXPENSE_LOCKED");
  Object.assign(expense, await buildExpensePayload(req.body, req.user, expense, req.files || []));
  await expense.save();
  return res.status(200).json({ success: true, message: "Expense updated successfully", data: { expense } });
});

export const addExpensePayment = asyncHandler(async (req, res) => {
  if (!validObjectId(req.params.id)) throw new AppError("Invalid expense ID", 400, "INVALID_ID");
  const expense = await Expense.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
  if (!expense) throw new AppError("Expense record not found", 404, "NOT_FOUND");
  const amount = toNumber(req.body.amount);
  if (amount <= 0) throw new AppError("A valid positive payment amount is required", 400, "INVALID_PAYMENT_AMOUNT");
  if (expense.amountPaid + amount > expense.totalAmount) {
    throw new AppError("Payment amount cannot exceed pending expense amount", 400, "PAYMENT_EXCEEDS_PENDING");
  }
  expense.payments.push({
    paymentDate: req.body.paymentDate ? new Date(req.body.paymentDate) : new Date(),
    amount,
    paymentMethod: req.body.paymentMethod || "Bank Transfer",
    transactionReference: req.body.transactionReference || req.body.referenceNumber || "",
    bankReferenceNumber: req.body.bankReferenceNumber || "",
    utrNumber: req.body.utrNumber || "",
    chequeNumber: req.body.chequeNumber || "",
    chequeDate: req.body.chequeDate ? new Date(req.body.chequeDate) : null,
    bankName: req.body.bankName || "",
    upiTransactionId: req.body.upiTransactionId || "",
    notes: req.body.notes || "",
    addedBy: req.user._id,
  });
  expense.amountPaid += amount;
  expense.paymentMethod = req.body.paymentMethod || expense.paymentMethod;
  expense.paymentDate = req.body.paymentDate ? new Date(req.body.paymentDate) : new Date();
  expense.updatedBy = req.user._id;
  await expense.save();
  return res.status(200).json({ success: true, message: "Expense payment recorded successfully", data: { expense } });
});

export const approveExpense = asyncHandler(async (req, res) => {
  if (!validObjectId(req.params.id)) throw new AppError("Invalid expense ID", 400, "INVALID_ID");
  const expense = await Expense.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
  if (!expense) throw new AppError("Expense record not found", 404, "NOT_FOUND");
  expense.approvalStatus = "Approved";
  expense.approvedBy = req.user._id;
  expense.approvedAt = new Date();
  expense.rejectedBy = null;
  expense.rejectedAt = null;
  expense.rejectionReason = "";
  expense.approvalNotes = req.body.approvalNotes || expense.approvalNotes;
  expense.updatedBy = req.user._id;
  await expense.save();
  return res.status(200).json({ success: true, message: "Expense approved successfully", data: { expense } });
});

export const rejectExpense = asyncHandler(async (req, res) => {
  if (!validObjectId(req.params.id)) throw new AppError("Invalid expense ID", 400, "INVALID_ID");
  const expense = await Expense.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
  if (!expense) throw new AppError("Expense record not found", 404, "NOT_FOUND");
  expense.approvalStatus = "Rejected";
  expense.rejectedBy = req.user._id;
  expense.rejectedAt = new Date();
  expense.rejectionReason = req.body.rejectionReason || "";
  expense.approvalNotes = req.body.approvalNotes || expense.approvalNotes;
  expense.updatedBy = req.user._id;
  await expense.save();
  return res.status(200).json({ success: true, message: "Expense rejected successfully", data: { expense } });
});

export const deleteExpense = asyncHandler(async (req, res) => {
  if (!validObjectId(req.params.id)) throw new AppError("Invalid expense ID", 400, "INVALID_ID");
  const expense = await Expense.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
  if (!expense) throw new AppError("Expense record not found", 404, "NOT_FOUND");
  if (expense.payrollId) throw new AppError("Auto-synced payroll expenses cannot be deleted here", 400, "PAYROLL_EXPENSE_LOCKED");
  expense.isDeleted = true;
  expense.deletedAt = new Date();
  expense.deletedBy = req.user._id;
  expense.updatedBy = req.user._id;
  await expense.save();
  return res.status(200).json({ success: true, message: "Expense record deleted successfully" });
});

export const exportExpenses = asyncHandler(async (req, res) => {
  const expenses = await Expense.find(buildExpenseQuery(req.query)).sort(buildExpenseSort(req.query.sortBy, req.query.sortOrder)).lean();
  const headers = [
    "Expense ID",
    "Date",
    "Title",
    "Category",
    "Vendor",
    "Invoice",
    "Bill",
    "Base Amount",
    "GST",
    "Total",
    "Paid",
    "Pending",
    "Payment Method",
    "Payment Status",
    "Approval Status",
    "Department",
    "Project",
    "Notes",
  ];
  const escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const rows = expenses.map((e) =>
    [
      e.expenseId,
      e.expenseDate ? new Date(e.expenseDate).toISOString().slice(0, 10) : "",
      e.expenseTitle,
      e.category,
      e.vendorSnapshot?.vendorName || e.paidTo,
      e.invoiceNumber,
      e.billNumber,
      e.baseAmount,
      e.gstAmount,
      e.totalAmount,
      e.amountPaid,
      e.pendingAmount,
      e.paymentMethod,
      e.paymentStatus,
      e.approvalStatus,
      e.department,
      e.projectId || "",
      e.notes || e.description,
    ].map(escapeCsv).join(",")
  );
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename=expenses-${Date.now()}.csv`);
  return res.status(200).send([headers.map(escapeCsv).join(","), ...rows].join("\n"));
});

export const getExpenseAnalytics = asyncHandler(async (req, res) => {
  await syncPaidPayrollToExpenses();

  const now = new Date();
  const todayRange = getDayRange(req.query.date || now);
  const yesterdaySource = new Date(todayRange.start);
  yesterdaySource.setDate(yesterdaySource.getDate() - 1);
  const yesterdayRange = getDayRange(yesterdaySource);
  const monthRange = getMonthRange(req.query.month, req.query.year);
  const previousMonthRange = getPreviousMonthRange(monthRange.month, monthRange.year);
  const financialYearRange = getFinancialYearRange(req.query.financialYear);
  const lastSixStart = new Date(monthRange.year, monthRange.month - 6, 1, 0, 0, 0, 0);
  const monthlyBudget = toNumber(req.query.monthlyBudget);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

  const filteredEligibleMatch = (start, end) => {
    const query = buildExpenseQuery({ ...req.query, range: "", startDate: "", endDate: "" });
    if (query.approvalStatus && ["Rejected", "Cancelled"].includes(query.approvalStatus)) {
      query.approvalStatus = "__NO_VALID_EXPENSES__";
    }
    if (query.paymentStatus === "Cancelled") {
      query.paymentStatus = "__NO_VALID_EXPENSES__";
    }
    return {
      ...query,
      isDeleted: { $ne: true },
      approvalStatus: query.approvalStatus || { $nin: ["Rejected", "Cancelled"] },
      paymentStatus: query.paymentStatus || { $ne: "Cancelled" },
      expenseDate: { $gte: start, $lte: end },
    };
  };

  const currentMonthMatch = filteredEligibleMatch(monthRange.start, monthRange.end);
  const previousMonthMatch = filteredEligibleMatch(previousMonthRange.start, previousMonthRange.end);
  const todayMatch = filteredEligibleMatch(todayRange.start, todayRange.end);
  const yesterdayMatch = filteredEligibleMatch(yesterdayRange.start, yesterdayRange.end);
  const fyMatch = filteredEligibleMatch(financialYearRange.start, financialYearRange.end);

  const [
    todaySummary,
    yesterdaySummary,
    currentMonthSummary,
    previousMonthSummary,
    financialYearSummary,
    dailyHourly,
    dailyCategory,
    dailyPaymentMethod,
    monthlyDailyTrend,
    monthlyCategory,
    monthlyDepartment,
    monthlyVendor,
    monthlyPaymentMethod,
    monthlyPaymentStatus,
    highestExpenses,
    monthOverMonth,
    fyMonthlyTrend,
    overdue,
    upcomingExpenses,
    recurringProjection,
  ] = await Promise.all([
    summarizeExpenses(todayMatch),
    summarizeExpenses(yesterdayMatch),
    summarizeExpenses(currentMonthMatch),
    summarizeExpenses(previousMonthMatch),
    summarizeExpenses(fyMatch),
    Expense.aggregate([
      { $match: todayMatch },
      {
        $group: {
          _id: { $hour: "$createdAt" },
          totalAmount: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    groupByField(todayMatch, "$category", 12),
    groupByField(todayMatch, "$paymentMethod", 12),
    Expense.aggregate([
      { $match: currentMonthMatch },
      {
        $group: {
          _id: { $dayOfMonth: "$expenseDate" },
          totalAmount: { $sum: "$totalAmount" },
          paidAmount: { $sum: "$amountPaid" },
          pendingAmount: { $sum: "$pendingAmount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    groupByField(currentMonthMatch, "$category", 15),
    groupByField(currentMonthMatch, "$department", 12),
    groupByField(currentMonthMatch, "$vendorSnapshot.vendorName", 12),
    groupByField(currentMonthMatch, "$paymentMethod", 12),
    groupByField(currentMonthMatch, "$paymentStatus", 8),
    Expense.find(currentMonthMatch)
      .select("expenseId expenseTitle category totalAmount vendorSnapshot paidTo expenseDate")
      .sort({ totalAmount: -1 })
      .limit(8)
      .lean(),
    Expense.aggregate([
      {
        $match: {
          ...activeExpenseMatch(),
          expenseDate: { $gte: lastSixStart, $lte: monthRange.end },
        },
      },
      {
        $group: {
          _id: { year: { $year: "$expenseDate" }, month: { $month: "$expenseDate" } },
          totalAmount: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
    Expense.aggregate([
      { $match: fyMatch },
      {
        $group: {
          _id: { year: { $year: "$expenseDate" }, month: { $month: "$expenseDate" } },
          totalAmount: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
    getOverdueBuckets({
      ...activeExpenseMatch(),
    }),
    Expense.find({
      ...activeExpenseMatch(),
      pendingAmount: { $gt: 0 },
      dueDate: { $gte: today, $lte: endOfMonth },
    })
      .select("expenseId expenseTitle dueDate totalAmount pendingAmount vendorSnapshot paidTo")
      .sort({ dueDate: 1 })
      .limit(12)
      .lean(),
    Expense.aggregate([
      {
        $match: {
          ...activeExpenseMatch(),
          isRecurring: true,
        },
      },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: { $ifNull: ["$recurringConfig.recurringAmount", "$totalAmount"] } },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]),
  ]);

  const daysInMonth = new Date(monthRange.year, monthRange.month, 0).getDate();
  const trendByDay = new Map(monthlyDailyTrend.map((item) => [item._id, item]));
  const fullDailyTrend = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const existing = trendByDay.get(day);
    return {
      day,
      label: `${day}`,
      totalAmount: existing?.totalAmount || 0,
      paidAmount: existing?.paidAmount || 0,
      pendingAmount: existing?.pendingAmount || 0,
      count: existing?.count || 0,
    };
  });

  let cumulative = 0;
  const cumulativeTrend = fullDailyTrend.map((item) => {
    cumulative += item.totalAmount;
    return { ...item, cumulativeAmount: cumulative };
  });

  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthOverMonthTrend = monthOverMonth.map((item) => ({
    month: item._id.month,
    year: item._id.year,
    label: `${monthLabels[item._id.month - 1]} ${item._id.year}`,
    totalAmount: item.totalAmount,
    count: item.count,
    budget: monthlyBudget,
    remainingBudget: Math.max(0, monthlyBudget - item.totalAmount),
  }));

  const financialYearMonths = Array.from({ length: 12 }, (_, index) => {
    const startYear = financialYearRange.start.getFullYear();
    const monthIndex = (3 + index) % 12;
    const year = monthIndex >= 3 ? startYear : startYear + 1;
    const existing = fyMonthlyTrend.find((item) => item._id.month === monthIndex + 1 && item._id.year === year);
    return {
      month: monthIndex + 1,
      year,
      label: monthLabels[monthIndex],
      totalAmount: existing?.totalAmount || 0,
      budget: monthlyBudget,
    };
  });

  const difference = currentMonthSummary.totalAmount - previousMonthSummary.totalAmount;
  const budgetUsedPercent = monthlyBudget ? Math.round((currentMonthSummary.totalAmount / monthlyBudget) * 10000) / 100 : null;
  const budgetStatus =
    budgetUsedPercent === null
      ? "Not Set"
      : budgetUsedPercent >= 100
        ? "Exceeded"
        : budgetUsedPercent >= 90
          ? "Near Limit"
          : budgetUsedPercent >= 75
            ? "Warning"
            : "Healthy";

  return res.status(200).json({
    success: true,
    data: {
      selectedDate: todayRange.start,
      selectedMonth: { month: monthRange.month, year: monthRange.year },
      financialYear: financialYearRange.financialYear,
      overview: {
        today: todaySummary,
        yesterday: yesterdaySummary,
        currentMonth: currentMonthSummary,
        previousMonth: previousMonthSummary,
        financialYear: financialYearSummary,
        comparison: {
          difference,
          percentChange: getPercentChange(currentMonthSummary.totalAmount, previousMonthSummary.totalAmount),
          message: previousMonthSummary.totalAmount ? "" : "New spending this period",
        },
        overdue,
        recurringProjection: {
          totalAmount: recurringProjection.reduce((sum, item) => sum + (item.totalAmount || 0), 0),
          categories: recurringProjection,
        },
        budget: {
          monthlyBudget,
          actualAmount: currentMonthSummary.totalAmount,
          remainingAmount: Math.max(0, monthlyBudget - currentMonthSummary.totalAmount),
          usedPercent: budgetUsedPercent,
          status: budgetStatus,
        },
      },
      daily: {
        summary: todaySummary,
        hourlyTrend: dailyHourly.map((item) => ({ hour: item._id, label: `${String(item._id).padStart(2, "0")}:00`, totalAmount: item.totalAmount, count: item.count })),
        categoryBreakdown: dailyCategory,
        paymentMethodBreakdown: dailyPaymentMethod,
      },
      monthly: {
        summary: currentMonthSummary,
        previousSummary: previousMonthSummary,
        comparison: {
          difference,
          percentChange: getPercentChange(currentMonthSummary.totalAmount, previousMonthSummary.totalAmount),
          message: previousMonthSummary.totalAmount ? "" : "New spending this period",
        },
        dailyTrend: fullDailyTrend,
        cumulativeTrend,
        categoryBreakdown: monthlyCategory,
        departmentBreakdown: monthlyDepartment.filter((item) => item._id),
        vendorBreakdown: monthlyVendor.filter((item) => item._id),
        paymentMethodBreakdown: monthlyPaymentMethod,
        paymentStatusBreakdown: monthlyPaymentStatus,
        highestExpenses,
      },
      trends: {
        monthOverMonth: monthOverMonthTrend,
        financialYear: financialYearMonths,
        budgetVsActual: monthOverMonthTrend,
      },
      upcoming: {
        dueToday: upcomingExpenses.filter((item) => getDayRange(item.dueDate).start.getTime() === today.getTime()),
        dueThisWeek: upcomingExpenses.filter((item) => item.dueDate <= nextWeek),
        dueThisMonth: upcomingExpenses,
      },
    },
  });
});

// 6. PROFIT / LOSS SUMMARY & BREAKDOWN BY PERIOD
export const getProfitLossSummary = asyncHandler(async (req, res) => {
  await syncPaidPayrollToExpenses();
  const { range = "this_month", startDate = "", endDate = "" } = req.query;
  const { start, end } = buildDateRange({ range, startDate, endDate });

  const [paidInvoicesAgg, customIncomeCategoryAgg] = await Promise.all([
    Invoice.aggregate([{ $match: { paymentStatus: "paid", paidDate: { $gte: start, $lte: end } } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
    Income.aggregate([{ $match: { date: { $gte: start, $lte: end } } }, { $group: { _id: "$category", total: { $sum: "$amount" } } }]),
  ]);

  const invoiceIncomeSum = paidInvoicesAgg[0]?.total || 0;
  const totalIncome = invoiceIncomeSum + customIncomeCategoryAgg.reduce((acc, cur) => acc + cur.total, 0);

  const expenseCategoryAgg = await Expense.aggregate([
    { $match: activeExpenseMatch({ expenseDate: { $gte: start, $lte: end } }) },
    { $group: { _id: "$category", total: { $sum: "$totalAmount" } } },
  ]);
  const totalExpenses = expenseCategoryAgg.reduce((acc, cur) => acc + cur.total, 0);
  const netProfitLoss = totalIncome - totalExpenses;

  return res.status(200).json({
    success: true,
    data: {
      period: range,
      startDate: start,
      endDate: end,
      totalIncome,
      totalExpenses,
      netProfitLoss: Math.abs(netProfitLoss),
      status: netProfitLoss >= 0 ? "profit" : "loss",
      incomeBreakdown: [{ category: "Client Invoice Payments", amount: invoiceIncomeSum }, ...customIncomeCategoryAgg.map((c) => ({ category: c._id, amount: c.total }))],
      expenseBreakdown: expenseCategoryAgg.map((e) => ({ category: e._id, amount: e.total })),
    },
  });
});
