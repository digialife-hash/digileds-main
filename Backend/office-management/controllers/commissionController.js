import mongoose from "mongoose";
import Commission from "../models/Commission.js";
import CommissionRule from "../models/CommissionRule.js";
import CommissionAdjustment from "../models/CommissionAdjustment.js";
import CommissionApproval from "../models/CommissionApproval.js";
import CommissionPayment from "../models/CommissionPayment.js";
import PaymentProof from "../models/PaymentProof.js";
import CommissionActivityLog from "../models/CommissionActivityLog.js";
import Referral from "../models/Referral.js";
import ReferralPartner from "../models/ReferralPartner.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

// Helper for client metadata
const getClientMeta = (req) => {
  const ipAddress =
    req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
  const userAgent = req.headers["user-agent"] || "";

  let browser = "Browser";
  if (userAgent.includes("Chrome")) browser = "Chrome";
  else if (userAgent.includes("Safari")) browser = "Safari";
  else if (userAgent.includes("Firefox")) browser = "Firefox";

  let device = "Desktop";
  if (/mobile/i.test(userAgent)) device = "Mobile";

  return { ipAddress, browser, device };
};

// Helper for audit logging
const logCommissionActivity = async (req, commissionId, action, description, metadata = {}, paymentId = null) => {
  const { ipAddress, browser, device } = getClientMeta(req);
  await CommissionActivityLog.create({
    commissionId,
    paymentId,
    user: req.user._id,
    role: req.user.role,
    action,
    description,
    ipAddress,
    browser,
    device,
    metadata,
  });
};

// Helper: Get Referral Partner for current user if partner
const getPartnerDocForUser = async (userId) => {
  return await ReferralPartner.findOne({ userId });
};

const assertReferralOwnership = async (req, referral) => {
  if (req.user.role === "super_admin" || req.user.role === "admin") return;
  if (req.user.role !== "referral_partner") {
    throw new AppError("You do not have permission to access commissions", 403, "FORBIDDEN");
  }
  const partner = await getPartnerDocForUser(req.user._id);
  if (!partner || String(referral.partnerId) !== String(partner._id)) {
    throw new AppError("You do not have permission to access this commission", 403, "FORBIDDEN");
  }
};

// Helper: Auto-calculate and create commission when referral is converted
export const autoGenerateCommissionForReferral = async (referralDoc, actorUser) => {
  // Check if commission already exists for this referral
  const existing = await Commission.findOne({
    referralId: referralDoc._id,
    isDeleted: false,
  });
  if (existing) return existing;

  // Find active rule
  const rule = await CommissionRule.findOne({ isActive: true });
  const type = rule?.commissionType || "Percentage Based";
  const percentage = rule?.percentage || 10;
  const fixed = rule?.fixedAmount || 5000;

  const projectValue = referralDoc.estimatedBudget || 0;
  let gross = 0;

  if (type === "Percentage Based") {
    gross = projectValue > 0 ? (projectValue * percentage) / 100 : 2500;
  } else if (type === "Fixed Amount") {
    gross = fixed;
  } else {
    gross = projectValue > 0 ? (projectValue * 0.1) : 3000;
  }

  const deductions = 0;
  const net = gross - deductions;

  const commission = await Commission.create({
    referralId: referralDoc._id,
    partnerId: referralDoc.partnerId,
    projectValue,
    commissionType: type,
    commissionPercentage: percentage,
    grossCommission: gross,
    deductions,
    netCommission: net,
    status: "Pending",
  });

  const now = new Date();
  await CommissionApproval.create({
    commissionId: commission._id,
    previousStatus: "None",
    newStatus: "Pending",
    approvedBy: actorUser?._id || referralDoc.partnerId,
    date: now.toISOString().split("T")[0],
    time: now.toTimeString().split(" ")[0],
    remarks: "Auto-generated on referral conversion",
  });

  // Log activity
  if (actorUser) {
    const ipAddress = "127.0.0.1";
    await CommissionActivityLog.create({
      commissionId: commission._id,
      user: actorUser._id,
      role: actorUser.role,
      action: "Commission Generated",
      description: `Auto-generated commission ${commission.commissionId} of ₹${net}`,
      ipAddress,
    });
  }

  // Notify Partner
  const partner = await ReferralPartner.findById(referralDoc.partnerId).populate("userId");
  if (partner && partner.userId) {
    await Notification.create({
      recipientUser: partner.userId._id,
      title: "New Commission Generated",
      message: `A new commission of ₹${net} has been generated for referral "${referralDoc.clientName}".`,
      type: "commission",
    });
  }

  return commission;
};

// 1. COMMISSION DASHBOARD ANALYTICS
export const getCommissionDashboardAnalytics = asyncHandler(async (req, res) => {
  const query = { isDeleted: false };

  // RBAC scope
  if (req.user.role === "referral_partner") {
    const partnerDoc = await getPartnerDocForUser(req.user._id);
    if (partnerDoc) query.partnerId = partnerDoc._id;
  }

  const commissions = await Commission.find(query).populate("partnerId");

  let totalCommission = 0;
  let pendingCommission = 0;
  let approvedCommission = 0;
  let paidCommission = 0;
  let rejectedCommission = 0;
  let thisMonthCommission = 0;
  let todayCommission = 0;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const statusCounts = {
    Pending: 0,
    "Under Review": 0,
    Approved: 0,
    Rejected: 0,
    Paid: 0,
    Cancelled: 0,
  };

  commissions.forEach((c) => {
    const net = c.netCommission || 0;
    totalCommission += net;

    const st = c.status === "pending" ? "Pending" : c.status === "paid" ? "Paid" : c.status === "rejected" ? "Rejected" : c.status;
    if (statusCounts[st] !== undefined) statusCounts[st]++;

    if (st === "Pending" || st === "Under Review") pendingCommission += net;
    if (st === "Approved") approvedCommission += net;
    if (st === "Paid") paidCommission += net;
    if (st === "Rejected" || st === "Cancelled") rejectedCommission += net;

    const cDate = new Date(c.createdAt);
    if (cDate >= startOfToday) todayCommission += net;
    if (cDate >= startOfMonth) thisMonthCommission += net;
  });

  const totalPaidCount = statusCounts.Paid;
  const outstandingCommission = pendingCommission + approvedCommission;
  const averageCommission = commissions.length > 0 ? (totalCommission / commissions.length).toFixed(0) : 0;

  // Monthly Commission Trend (Last 6 Months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const monthlyTrendAgg = await Commission.aggregate([
    { $match: { ...query, createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        totalNet: { $sum: "$netCommission" },
        paidNet: {
          $sum: {
            $cond: [{ $in: ["$status", ["Paid", "paid"]] }, "$netCommission", 0],
          },
        },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyTrend = monthlyTrendAgg.map((item) => ({
    label: `${monthNames[item._id.month - 1]} ${item._id.year}`,
    total: item.totalNet,
    paid: item.paidNet,
  }));

  // Top Performing Partners breakdown
  const partnerBreakdownAgg = await Commission.aggregate([
    { $match: query },
    {
      $group: {
        _id: "$partnerId",
        totalEarned: { $sum: "$netCommission" },
        commissionCount: { $sum: 1 },
      },
    },
    { $sort: { totalEarned: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "referralpartners",
        localField: "_id",
        foreignField: "_id",
        as: "partner",
      },
    },
    { $unwind: { path: "$partner", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "users",
        localField: "partner.userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        partnerName: { $ifNull: ["$user.name", "Partner"] },
        totalEarned: 1,
        commissionCount: 1,
      },
    },
  ]);

  res.status(200).json({
    success: true,
    message: "Commission analytics retrieved successfully",
    data: {
      metrics: {
        totalCommission,
        pendingCommission,
        approvedCommission,
        paidCommission,
        rejectedCommission,
        thisMonthCommission,
        todayCommission,
        totalCommissionPaid: paidCommission,
        outstandingCommission,
        averageCommission: Number(averageCommission),
      },
      charts: {
        monthlyTrend,
        statusDistribution: Object.keys(statusCounts).map((status) => ({
          status,
          count: statusCounts[status],
        })),
        topPartners: partnerBreakdownAgg,
      },
    },
    error: null,
  });
});

// 2. GET & CONFIGURE COMMISSION RULES (Admin)
export const getCommissionRules = asyncHandler(async (req, res) => {
  const rules = await CommissionRule.find().sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    message: "Commission rules retrieved",
    data: { rules },
    error: null,
  });
});

export const createOrUpdateCommissionRule = asyncHandler(async (req, res) => {
  const { ruleName, commissionType, percentage, fixedAmount, minBudgetThreshold, isActive, description } = req.body;

  if (req.user.role !== "super_admin") {
    throw new AppError("Only Admins can configure commission rules", 403, "PERMISSION_DENIED");
  }

  // Deactivate other rules if this one is active
  if (isActive) {
    await CommissionRule.updateMany({}, { isActive: false });
  }

  const rule = await CommissionRule.create({
    ruleName: ruleName || "Standard Rule",
    commissionType: commissionType || "Percentage Based",
    percentage: Number(percentage) || 10,
    fixedAmount: Number(fixedAmount) || 5000,
    minBudgetThreshold: Number(minBudgetThreshold) || 0,
    isActive: isActive !== undefined ? isActive : true,
    description: description || "",
  });

  res.status(201).json({
    success: true,
    message: "Commission rule saved successfully",
    data: { rule },
    error: null,
  });
});

// 3. PREVIEW & AUTO-GENERATE COMMISSION API
export const previewCommission = asyncHandler(async (req, res) => {
  const { referralId, commissionType, percentage, fixedAmount, deductions } = req.body;

  const referral = await Referral.findById(referralId);
  if (!referral) {
    throw new AppError("Referral not found", 404, "REFERRAL_NOT_FOUND");
  }
  await assertReferralOwnership(req, referral);

  const projectValue = referral.estimatedBudget || 0;
  const type = commissionType || "Percentage Based";
  const pct = percentage !== undefined ? Number(percentage) : 10;
  const fix = fixedAmount !== undefined ? Number(fixedAmount) : 5000;
  const ded = deductions !== undefined ? Number(deductions) : 0;

  let gross = 0;
  if (type === "Percentage Based") {
    gross = (projectValue * pct) / 100;
  } else if (type === "Fixed Amount") {
    gross = fix;
  } else {
    gross = (projectValue * pct) / 100;
  }

  const net = Math.max(0, gross - ded);

  res.status(200).json({
    success: true,
    message: "Commission preview calculated",
    data: {
      referralId: referral.referralId,
      clientName: referral.clientName,
      projectValue,
      commissionType: type,
      commissionPercentage: pct,
      grossCommission: gross,
      deductions: ded,
      netCommission: net,
    },
    error: null,
  });
});

export const autoGenerateCommission = asyncHandler(async (req, res) => {
  const { referralId } = req.body;

  const referral = await Referral.findById(referralId);
  if (!referral) {
    throw new AppError("Referral not found", 404, "REFERRAL_NOT_FOUND");
  }
  if (req.user.role !== "super_admin" && req.user.role !== "admin") {
    throw new AppError("Only admins can generate commissions", 403, "FORBIDDEN");
  }

  const commission = await autoGenerateCommissionForReferral(referral, req.user);

  res.status(201).json({
    success: true,
    message: "Commission generated successfully",
    data: { commission },
    error: null,
  });
});

// 4. GET COMMISSION LIST (Search, Filters, Pagination, RBAC)
export const getCommissions = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    status = "",
    partnerId = "",
    commissionType = "",
    minAmount = "",
    maxAmount = "",
    startDate = "",
    endDate = "",
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const query = { isDeleted: false };

  // RBAC scope
  if (req.user.role === "referral_partner") {
    const partnerDoc = await getPartnerDocForUser(req.user._id);
    if (!partnerDoc) {
      return res.status(200).json({
        success: true,
        message: "Commissions fetched",
        data: { commissions: [], pagination: { total: 0, page: 1, limit: Number(limit), totalPages: 0 } },
        error: null,
      });
    }
    query.partnerId = partnerDoc._id;
  } else if (partnerId) {
    query.partnerId = partnerId;
  }

  if (status) query.status = status;
  if (commissionType) query.commissionType = commissionType;

  if (minAmount || maxAmount) {
    query.netCommission = {};
    if (minAmount) query.netCommission.$gte = Number(minAmount);
    if (maxAmount) query.netCommission.$lte = Number(maxAmount);
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }

  // Global search
  if (search) {
    const searchRegex = new RegExp(search, "i");
    query.$or = [{ commissionId: searchRegex }];
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const skip = (pageNum - 1) * limitNum;
  const sortDir = sortOrder === "asc" ? 1 : -1;

  const total = await Commission.countDocuments(query);
  const commissions = await Commission.find(query)
    .populate("referralId", "referralId clientName companyName estimatedBudget status")
    .populate({
      path: "partnerId",
      populate: { path: "userId", select: "name email phone" },
    })
    .populate("approvedBy", "name email role")
    .populate("paymentId")
    .sort({ [sortBy]: sortDir })
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    message: "Commissions retrieved successfully",
    data: {
      commissions,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    },
    error: null,
  });
});

// 5. GET SINGLE COMMISSION DETAILS
export const getCommissionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const commission = await Commission.findOne({ _id: id, isDeleted: false })
    .populate("referralId")
    .populate({
      path: "partnerId",
      populate: { path: "userId", select: "name email phone" },
    })
    .populate("approvedBy", "name email role")
    .populate("paymentId");

  if (!commission) {
    throw new AppError("Commission not found", 404, "COMMISSION_NOT_FOUND");
  }

  // Security Check
  await assertReferralOwnership(req, commission);

  const adjustments = await CommissionAdjustment.find({ commissionId: id })
    .populate("adjustedBy", "name email role")
    .sort({ createdAt: -1 });

  const approvals = await CommissionApproval.find({ commissionId: id })
    .populate("approvedBy", "name email role")
    .sort({ createdAt: -1 });

  const logs = await CommissionActivityLog.find({ commissionId: id })
    .populate("user", "name email role")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: "Commission details retrieved",
    data: {
      commission,
      adjustments,
      approvals,
      logs,
    },
    error: null,
  });
});

// 6. APPROVE / REJECT COMMISSION (Workflow)
export const approveOrRejectCommission = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, remarks } = req.body;

  if (req.user.role !== "super_admin") {
    throw new AppError("Only Admins can approve or reject commissions", 403, "PERMISSION_DENIED");
  }

  const validStatuses = ["Under Review", "Approved", "Rejected", "Cancelled"];
  if (!status || !validStatuses.includes(status)) {
    throw new AppError("Invalid approval status", 400, "INVALID_STATUS");
  }

  const commission = await Commission.findOne({ _id: id, isDeleted: false }).populate("partnerId");
  if (!commission) {
    throw new AppError("Commission not found", 404, "COMMISSION_NOT_FOUND");
  }

  const previousStatus = commission.status;
  commission.status = status;
  commission.approvedBy = req.user._id;
  commission.approvedAt = new Date();
  await commission.save();

  const now = new Date();
  await CommissionApproval.create({
    commissionId: commission._id,
    previousStatus,
    newStatus: status,
    approvedBy: req.user._id,
    date: now.toISOString().split("T")[0],
    time: now.toTimeString().split(" ")[0],
    remarks: remarks || `Commission status updated to ${status}`,
  });

  await logCommissionActivity(
    req,
    commission._id,
    `Commission ${status}`,
    `Commission ${commission.commissionId} marked as ${status}. Remarks: ${remarks || "None"}`
  );

  // Notify Partner
  if (commission.partnerId && commission.partnerId.userId) {
    await Notification.create({
      recipientUser: commission.partnerId.userId,
      title: `Commission ${status}`,
      message: `Your commission ${commission.commissionId} of ₹${commission.netCommission} has been ${status.toLowerCase()}.`,
      type: "commission",
    });
  }

  res.status(200).json({
    success: true,
    message: `Commission status updated to ${status}`,
    data: { commission },
    error: null,
  });
});

// 7. MANUAL COMMISSION ADJUSTMENT (Increase, Reduce, Bonus, Penalty, Correction)
export const adjustCommission = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { adjustmentType, amount, reason } = req.body;

  if (req.user.role !== "super_admin") {
    throw new AppError("Only Admins can make commission adjustments", 403, "PERMISSION_DENIED");
  }

  if (!adjustmentType || amount === undefined || !reason) {
    throw new AppError("Adjustment type, amount, and reason are required", 400, "MISSING_FIELDS");
  }

  const commission = await Commission.findOne({ _id: id, isDeleted: false });
  if (!commission) {
    throw new AppError("Commission not found", 404, "COMMISSION_NOT_FOUND");
  }

  const adjAmount = Number(amount);
  if (isNaN(adjAmount)) {
    throw new AppError("Invalid adjustment amount", 400, "INVALID_AMOUNT");
  }

  // Adjust netCommission accordingly
  if (adjustmentType === "Increase" || adjustmentType === "Bonus") {
    commission.netCommission += Math.abs(adjAmount);
  } else if (adjustmentType === "Reduce" || adjustmentType === "Penalty") {
    commission.netCommission = Math.max(0, commission.netCommission - Math.abs(adjAmount));
  } else if (adjustmentType === "Correction") {
    commission.netCommission = Math.max(0, commission.netCommission + adjAmount);
  }

  await commission.save();

  const adjustment = await CommissionAdjustment.create({
    commissionId: commission._id,
    adjustmentType,
    amount: adjAmount,
    reason: reason.trim(),
    adjustedBy: req.user._id,
  });

  await logCommissionActivity(
    req,
    commission._id,
    "Commission Adjusted",
    `Applied ${adjustmentType} adjustment of ₹${adjAmount}. Reason: ${reason}`
  );

  res.status(200).json({
    success: true,
    message: "Commission adjusted successfully",
    data: { commission, adjustment },
    error: null,
  });
});

// 8. PROCESS PAYMENT (Single / Bulk Payment processing with Payment Modes)
export const processPayment = asyncHandler(async (req, res) => {
  const {
    commissionIds,
    partnerId,
    amountPaid,
    paymentMode,
    transactionNumber,
    referenceNumber,
    bankName,
    upiId,
    chequeNumber,
    paymentRemarks,
  } = req.body;

  if (req.user.role !== "super_admin") {
    throw new AppError("Only Admins can process payments", 403, "PERMISSION_DENIED");
  }

  if (!partnerId || !amountPaid || !paymentMode) {
    throw new AppError("Partner ID, amount paid, and payment mode are required", 400, "MISSING_FIELDS");
  }

  // Create Payment Record
  const payment = await CommissionPayment.create({
    commissionIds: commissionIds || [],
    partnerId,
    amountPaid: Number(amountPaid),
    paymentMode,
    paymentStatus: "Paid",
    transactionNumber: transactionNumber || "",
    referenceNumber: referenceNumber || "",
    bankName: bankName || "",
    upiId: upiId || "",
    chequeNumber: chequeNumber || "",
    paymentDate: new Date(),
    processedBy: req.user._id,
    paymentRemarks: paymentRemarks || "Commission payment processed",
  });

  // Mark all linked commissions as Paid
  if (commissionIds && commissionIds.length > 0) {
    await Commission.updateMany(
      { _id: { $in: commissionIds } },
      {
        status: "Paid",
        paidAt: new Date(),
        paymentId: payment._id,
      }
    );

    for (const commId of commissionIds) {
      await logCommissionActivity(
        req,
        commId,
        "Payment Processed",
        `Payment of ₹${amountPaid} processed via ${paymentMode}. Transaction #: ${transactionNumber || "N/A"}`,
        {},
        payment._id
      );
    }
  }

  // Notify Partner
  const partner = await ReferralPartner.findById(partnerId).populate("userId");
  if (partner && partner.userId) {
    await Notification.create({
      recipientUser: partner.userId._id,
      title: "Payment Processed",
      message: `A commission payment of ₹${amountPaid} has been processed via ${paymentMode}. Transaction ID: ${payment.paymentId}.`,
      type: "payment",
    });
  }

  res.status(201).json({
    success: true,
    message: "Payment processed successfully",
    data: { payment },
    error: null,
  });
});

// 9. UPLOAD PAYMENT PROOF
export const uploadPaymentProof = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const { proofType } = req.body;

  const payment = await CommissionPayment.findById(paymentId);
  if (!payment) {
    throw new AppError("Payment record not found", 404, "PAYMENT_NOT_FOUND");
  }

  if (!req.files || req.files.length === 0) {
    throw new AppError("No proof files uploaded", 400, "NO_FILES");
  }

  const createdProofs = [];
  for (const file of req.files) {
    const ext = file.originalname.split(".").pop().toLowerCase();
    const proof = await PaymentProof.create({
      paymentId: payment._id,
      uploadedBy: req.user._id,
      proofType: proofType || "Bank Receipt",
      originalName: file.originalname,
      fileName: file.filename,
      filePath: `/uploads/${file.filename}`,
      fileType: ext,
      fileSize: file.size,
    });
    createdProofs.push(proof);
  }

  await logCommissionActivity(
    req,
    null,
    "Payment Proof Uploaded",
    `Uploaded ${createdProofs.length} payment proof file(s)`,
    {},
    payment._id
  );

  res.status(201).json({
    success: true,
    message: "Payment proof uploaded successfully",
    data: { proofs: createdProofs },
    error: null,
  });
});

// 10. EXPORT COMMISSIONS (CSV / Excel format)
export const exportCommissions = asyncHandler(async (req, res) => {
  const { format = "csv", status = "", partnerId = "", commissionType = "" } = req.query;

  const query = { isDeleted: false };
  if (req.user.role === "referral_partner") {
    const partnerDoc = await getPartnerDocForUser(req.user._id);
    if (partnerDoc) query.partnerId = partnerDoc._id;
  } else if (partnerId) {
    query.partnerId = partnerId;
  }

  if (status) query.status = status;
  if (commissionType) query.commissionType = commissionType;

  const commissions = await Commission.find(query)
    .populate("referralId", "referralId clientName")
    .populate({
      path: "partnerId",
      populate: { path: "userId", select: "name email" },
    })
    .sort({ createdAt: -1 });

  const headers = [
    "Commission ID",
    "Referral ID",
    "Client Name",
    "Partner Name",
    "Project Value (INR)",
    "Commission Type",
    "Gross Commission",
    "Deductions",
    "Net Commission",
    "Status",
    "Created Date",
  ];

  const rows = commissions.map((c) => [
    `"${c.commissionId || ""}"`,
    `"${c.referralId ? c.referralId.referralId : ""}"`,
    `"${c.referralId ? c.referralId.clientName : ""}"`,
    `"${c.partnerId && c.partnerId.userId ? c.partnerId.userId.name : ""}"`,
    c.projectValue || 0,
    `"${c.commissionType || ""}"`,
    c.grossCommission || 0,
    c.deductions || 0,
    c.netCommission || 0,
    `"${c.status || ""}"`,
    `"${new Date(c.createdAt).toISOString().split("T")[0]}"`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=commissions-export-${Date.now()}.csv`);
  return res.status(200).send(csvContent);
});
