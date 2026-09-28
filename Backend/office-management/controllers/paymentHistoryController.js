import mongoose from "mongoose";
import CommissionPayment from "../models/CommissionPayment.js";
import PaymentProof from "../models/PaymentProof.js";
import PaymentStatusHistory from "../models/PaymentStatusHistory.js";
import Commission from "../models/Commission.js";
import ReferralPartner from "../models/ReferralPartner.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import Settings from "../models/Settings.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

// Helper to get Referral Partner for current user if partner
const getPartnerDocForUser = async (userId) => {
  return await ReferralPartner.findOne({ userId });
};

// 1. PAYMENT HISTORY DASHBOARD ANALYTICS
export const getPaymentDashboardAnalytics = asyncHandler(async (req, res) => {
  const query = { isDeleted: false };

  // RBAC scope
  if (req.user.role === "referral_partner") {
    const partnerDoc = await getPartnerDocForUser(req.user._id);
    if (partnerDoc) query.partnerId = partnerDoc._id;
  }

  const payments = await CommissionPayment.find(query);

  let totalPayments = 0;
  let totalAmountPaid = 0;
  let pendingAmount = 0;
  let processingAmount = 0;
  let paidAmount = 0;
  let failedAmount = 0;
  let cancelledAmount = 0;
  let monthlyTotalAmount = 0;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const statusCounts = {
    Pending: 0,
    Processing: 0,
    Paid: 0,
    Failed: 0,
    Cancelled: 0,
  };

  const modeCounts = {
    "Bank Transfer": 0,
    UPI: 0,
    Cash: 0,
    Cheque: 0,
  };

  payments.forEach((p) => {
    totalPayments++;
    const amt = p.amountPaid || 0;
    totalAmountPaid += amt;

    const st = p.paymentStatus || "Paid";
    if (statusCounts[st] !== undefined) statusCounts[st]++;

    if (st === "Pending") pendingAmount += amt;
    if (st === "Processing") processingAmount += amt;
    if (st === "Paid") paidAmount += amt;
    if (st === "Failed") failedAmount += amt;
    if (st === "Cancelled") cancelledAmount += amt;

    const pm = p.paymentMode || "Bank Transfer";
    if (modeCounts[pm] !== undefined) modeCounts[pm]++;

    if (new Date(p.paymentDate || p.createdAt) >= startOfMonth) {
      monthlyTotalAmount += amt;
    }
  });

  // Monthly Payment Trend (Last 6 Months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const monthlyTrendAgg = await CommissionPayment.aggregate([
    { $match: { ...query, createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        totalAmount: { $sum: "$amountPaid" },
        paidAmount: {
          $sum: {
            $cond: [{ $eq: ["$paymentStatus", "Paid"] }, "$amountPaid", 0],
          },
        },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyTrend = monthlyTrendAgg.map((item) => ({
    label: `${monthNames[item._id.month - 1]} ${item._id.year}`,
    total: item.totalAmount,
    paid: item.paidAmount,
  }));

  res.status(200).json({
    success: true,
    message: "Payment analytics retrieved successfully",
    data: {
      metrics: {
        totalPayments,
        totalAmountPaid,
        pendingAmount,
        processingAmount,
        paidAmount,
        failedAmount,
        cancelledAmount,
        monthlyTotalAmount,
      },
      charts: {
        monthlyTrend,
        statusDistribution: Object.keys(statusCounts).map((status) => ({
          status,
          count: statusCounts[status],
        })),
        methodDistribution: Object.keys(modeCounts).map((mode) => ({
          mode,
          count: modeCounts[mode],
        })),
      },
    },
    error: null,
  });
});

// 2. GET PAYMENT HISTORY LIST
export const getPaymentHistory = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    status = "",
    paymentMode = "",
    partnerId = "",
    minAmount = "",
    maxAmount = "",
    startDate = "",
    endDate = "",
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const query = { isDeleted: false };

  // RBAC Scope
  if (req.user.role === "referral_partner") {
    const partnerDoc = await getPartnerDocForUser(req.user._id);
    if (!partnerDoc) {
      return res.status(200).json({
        success: true,
        message: "Payment history retrieved",
        data: { payments: [], pagination: { total: 0, page: 1, limit: Number(limit), totalPages: 0 } },
        error: null,
      });
    }
    query.partnerId = partnerDoc._id;
  } else if (partnerId) {
    query.partnerId = partnerId;
  }

  if (status) query.paymentStatus = status;
  if (paymentMode) query.paymentMode = paymentMode;

  if (minAmount || maxAmount) {
    query.amountPaid = {};
    if (minAmount) query.amountPaid.$gte = Number(minAmount);
    if (maxAmount) query.amountPaid.$lte = Number(maxAmount);
  }

  if (startDate || endDate) {
    query.paymentDate = {};
    if (startDate) query.paymentDate.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.paymentDate.$lte = end;
    }
  }

  // Global search
  if (search) {
    const searchRegex = new RegExp(search, "i");
    query.$or = [
      { paymentId: searchRegex },
      { receiptNumber: searchRegex },
      { transactionNumber: searchRegex },
      { referenceNumber: searchRegex },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const skip = (pageNum - 1) * limitNum;
  const sortDir = sortOrder === "asc" ? 1 : -1;

  const total = await CommissionPayment.countDocuments(query);
  const payments = await CommissionPayment.find(query)
    .populate({
      path: "partnerId",
      populate: { path: "userId", select: "name email phone" },
    })
    .populate("processedBy", "name email role")
    .populate({
      path: "commissionIds",
      populate: { path: "referralId", select: "referralId clientName" },
    })
    .sort({ [sortBy]: sortDir })
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    message: "Payment history retrieved successfully",
    data: {
      payments,
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

// 3. GET SINGLE PAYMENT DETAILS
export const getPaymentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const payment = await CommissionPayment.findOne({ _id: id, isDeleted: false })
    .populate({
      path: "partnerId",
      populate: { path: "userId", select: "name email phone" },
    })
    .populate("processedBy", "name email role")
    .populate({
      path: "commissionIds",
      populate: { path: "referralId", select: "referralId clientName companyName" },
    });

  if (!payment) {
    throw new AppError("Payment record not found", 404, "PAYMENT_NOT_FOUND");
  }

  // Security Check
  if (req.user.role === "referral_partner") {
    const partnerDoc = await getPartnerDocForUser(req.user._id);
    if (!partnerDoc || payment.partnerId._id.toString() !== partnerDoc._id.toString()) {
      throw new AppError("Forbidden", 403, "FORBIDDEN");
    }
  }

  const proofs = await PaymentProof.find({ paymentId: id })
    .populate("uploadedBy", "name email role")
    .sort({ createdAt: -1 });

  const statusHistory = await PaymentStatusHistory.find({ paymentId: id })
    .populate("updatedBy", "name email role")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: "Payment details retrieved successfully",
    data: {
      payment,
      proofs,
      statusHistory,
    },
    error: null,
  });
});

// 4. UPDATE PAYMENT STATUS (Pending -> Processing -> Paid / Failed / Cancelled)
export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, remarks } = req.body;

  if (req.user.role !== "super_admin") {
    throw new AppError("Only Admins can update payment status", 403, "PERMISSION_DENIED");
  }

  const validStatuses = ["Pending", "Processing", "Paid", "Failed", "Cancelled"];
  if (!status || !validStatuses.includes(status)) {
    throw new AppError("Invalid payment status", 400, "INVALID_STATUS");
  }

  const payment = await CommissionPayment.findOne({ _id: id, isDeleted: false }).populate("partnerId");
  if (!payment) {
    throw new AppError("Payment record not found", 404, "PAYMENT_NOT_FOUND");
  }

  const previousStatus = payment.paymentStatus;
  payment.paymentStatus = status;
  await payment.save();

  // Also update linked commissions if failed or cancelled
  if (status === "Failed" || status === "Cancelled") {
    await Commission.updateMany(
      { paymentId: payment._id },
      { status: "Approved", paymentId: null }
    );
  }

  const now = new Date();
  await PaymentStatusHistory.create({
    paymentId: payment._id,
    previousStatus,
    newStatus: status,
    updatedBy: req.user._id,
    date: now.toISOString().split("T")[0],
    time: now.toTimeString().split(" ")[0],
    remarks: remarks || `Payment status changed to ${status}`,
  });

  // Notify Partner
  if (payment.partnerId && payment.partnerId.userId) {
    await Notification.create({
      recipientUser: payment.partnerId.userId,
      title: `Payment Status: ${status}`,
      message: `Your payment ${payment.paymentId} status updated to ${status}.`,
      type: "payment",
    });
  }

  res.status(200).json({
    success: true,
    message: `Payment status updated to ${status}`,
    data: { payment },
    error: null,
  });
});

// 5. GENERATE PAYMENT RECEIPT (PDF / Printable View Object)
export const generatePaymentReceipt = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const payment = await CommissionPayment.findOne({ _id: id, isDeleted: false })
    .populate({
      path: "partnerId",
      populate: { path: "userId", select: "name email phone" },
    })
    .populate("processedBy", "name email role")
    .populate({
      path: "commissionIds",
      populate: { path: "referralId", select: "referralId clientName companyName" },
    });

  if (!payment) {
    throw new AppError("Payment record not found", 404, "PAYMENT_NOT_FOUND");
  }

  // Security Check
  if (req.user.role === "referral_partner") {
    const partnerDoc = await getPartnerDocForUser(req.user._id);
    if (!partnerDoc || payment.partnerId._id.toString() !== partnerDoc._id.toString()) {
      throw new AppError("Forbidden", 403, "FORBIDDEN");
    }
  }

  // Fetch company settings if available
  const settings = await Settings.findOne() || {
    companyName: "Digital Alife Pvt Ltd",
    companyAddress: "Tech Park, Building 4B, Silicon Valley, India",
    companyPhone: "+91 9876543210",
    companyEmail: "support@digitalalife.com",
    taxNumber: "GSTIN-29AAACD1234E1Z5",
  };

  const receipt = {
    receiptNumber: payment.receiptNumber || `REC-${payment.paymentId}`,
    paymentId: payment.paymentId,
    amountPaid: payment.amountPaid,
    paymentMode: payment.paymentMode,
    paymentStatus: payment.paymentStatus,
    transactionNumber: payment.transactionNumber || "N/A",
    referenceNumber: payment.referenceNumber || "N/A",
    paymentDate: payment.paymentDate,
    partnerName: payment.partnerId?.userId?.name || "Referral Partner",
    partnerEmail: payment.partnerId?.userId?.email || "N/A",
    partnerPhone: payment.partnerId?.userId?.phone || "N/A",
    partnerCode: payment.partnerId?.referralCode || "PARTNER",
    processedBy: payment.processedBy?.name || "Admin",
    linkedCommissions: payment.commissionIds.map((c) => ({
      commissionId: c.commissionId,
      referralId: c.referralId?.referralId,
      clientName: c.referralId?.clientName,
      netCommission: c.netCommission,
    })),
    company: {
      name: settings.companyName || "Digital Alife Pvt Ltd",
      address: settings.companyAddress || "Tech Park, India",
      phone: settings.companyPhone || "+91 9876543210",
      email: settings.companyEmail || "info@digitalalife.com",
    },
  };

  res.status(200).json({
    success: true,
    message: "Payment receipt generated",
    data: { receipt },
    error: null,
  });
});

// 6. EXPORT PAYMENT HISTORY (CSV / Excel format)
export const exportPaymentHistory = asyncHandler(async (req, res) => {
  const { format = "csv", status = "", paymentMode = "", partnerId = "" } = req.query;

  const query = { isDeleted: false };
  if (req.user.role === "referral_partner") {
    const partnerDoc = await getPartnerDocForUser(req.user._id);
    if (partnerDoc) query.partnerId = partnerDoc._id;
  } else if (partnerId) {
    query.partnerId = partnerId;
  }

  if (status) query.paymentStatus = status;
  if (paymentMode) query.paymentMode = paymentMode;

  const payments = await CommissionPayment.find(query)
    .populate({
      path: "partnerId",
      populate: { path: "userId", select: "name email" },
    })
    .sort({ createdAt: -1 });

  const headers = [
    "Receipt Number",
    "Payment ID",
    "Partner Name",
    "Amount Paid (INR)",
    "Payment Mode",
    "Transaction Number",
    "Payment Status",
    "Payment Date",
  ];

  const rows = payments.map((p) => [
    `"${p.receiptNumber || ""}"`,
    `"${p.paymentId || ""}"`,
    `"${p.partnerId && p.partnerId.userId ? p.partnerId.userId.name : ""}"`,
    p.amountPaid || 0,
    `"${p.paymentMode || ""}"`,
    `"${p.transactionNumber || ""}"`,
    `"${p.paymentStatus || ""}"`,
    `"${new Date(p.paymentDate || p.createdAt).toISOString().split("T")[0]}"`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=payments-export-${Date.now()}.csv`);
  return res.status(200).send(csvContent);
});
