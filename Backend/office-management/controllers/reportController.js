import mongoose from "mongoose";
import ReferralClient from "../models/Referral.js";
import ReferralPartner from "../models/ReferralPartner.js";
import Commission from "../models/Commission.js";
import CommissionPayment from "../models/CommissionPayment.js";
import IDCard from "../models/IDCard.js";
import Certificate from "../models/Certificate.js";
import User from "../models/User.js";
import Employee from "../models/Employee.js";
import Client from "../models/Client.js";
import Lead from "../models/Lead.js";
import Quotation from "../models/Quotation.js";
import Invoice from "../models/Invoice.js";
import Attendance from "../models/Attendance.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import ReportHistory from "../models/ReportHistory.js";
import ScheduledReport from "../models/ScheduledReport.js";
import ReportActivityLog from "../models/ReportActivityLog.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";


// Helper: Log report activity
const logReportAction = async (reportType, action, req, details = "") => {
  try {
    const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
    const userAgent = req.headers["user-agent"] || "";
    await ReportActivityLog.create({
      reportType,
      action,
      performedBy: req.user._id,
      role: req.user.role,
      ipAddress,
      userAgent,
      details,
    });
  } catch (err) {
    console.error("Report audit log error:", err);
  }
};

// Helper: Resolve Partner ObjectId for current user if partner
const getPartnerIdForUser = async (userId) => {
  const partner = await ReferralPartner.findOne({ userId });
  return partner ? partner._id : null;
};

// 1. REPORTS DASHBOARD ANALYTICS
export const getReportsDashboardAnalytics = asyncHandler(async (req, res) => {
  const isPartner = req.user.role === "referral_partner";
  let partnerDocId = null;

  if (isPartner) {
    partnerDocId = await getPartnerIdForUser(req.user._id);
  }

  const referralMatch = { isDeleted: false };
  const commissionMatch = { isDeleted: false };
  const paymentMatch = {};
  const idCardMatch = { isDeleted: false };
  const certMatch = { isDeleted: false };

  if (isPartner && partnerDocId) {
    referralMatch.partnerId = partnerDocId;
    commissionMatch.partnerId = partnerDocId;
    paymentMatch.partnerId = partnerDocId;
    idCardMatch.partnerId = partnerDocId;
    certMatch.partnerId = partnerDocId;
  }

  // 1. Total Referrals & Converted Clients
  const totalReferrals = await ReferralClient.countDocuments(referralMatch);
  const convertedCount = await ReferralClient.countDocuments({ ...referralMatch, status: "Converted" });

  // 2. Partners Count
  const totalPartners = isPartner ? 1 : await ReferralPartner.countDocuments({ isDeleted: false });

  // 3. Revenue Aggregation
  const revenueAgg = await ReferralClient.aggregate([
    { $match: { ...referralMatch, status: "Converted" } },
    { $group: { _id: null, totalRevenue: { $sum: "$actualFee" } } },
  ]);
  const totalRevenueGenerated = revenueAgg[0]?.totalRevenue || 0;

  // 4. Commissions Paid & Pending Aggregation
  const commissionAgg = await Commission.aggregate([
    { $match: commissionMatch },
    {
      $group: {
        _id: null,
        totalEarned: { $sum: "$commissionAmount" },
        totalPaid: { $sum: "$paidAmount" },
        totalPending: { $sum: "$pendingAmount" },
      },
    },
  ]);
  const totalCommissionPaid = commissionAgg[0]?.totalPaid || 0;
  const totalPendingCommission = commissionAgg[0]?.totalPending || 0;

  // 5. Total Payments
  const totalPayments = await CommissionPayment.countDocuments(paymentMatch);

  // 6. Active Certificates & ID Cards
  const activeIDCards = await IDCard.countDocuments({ ...idCardMatch, status: "Active" });
  const activeCertificates = await Certificate.countDocuments({ ...certMatch, status: "Active" });

  // 7. Overall Conversion Rate
  const overallConversionRate = totalReferrals > 0 ? Math.round((convertedCount / totalReferrals) * 100) : 0;

  // 8. Monthly Referral & Revenue Trend
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const monthlyReferralAgg = await ReferralClient.aggregate([
    { $match: { ...referralMatch, createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        count: { $sum: 1 },
        revenue: {
          $sum: {
            $cond: [{ $eq: ["$status", "Converted"] }, "$actualFee", 0],
          },
        },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyTrend = monthlyReferralAgg.map((item) => ({
    label: `${monthNames[item._id.month - 1]} ${item._id.year}`,
    referrals: item.count,
    revenue: item.revenue,
  }));

  // 9. Referral Status Distribution
  const statusAgg = await ReferralClient.aggregate([
    { $match: referralMatch },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  const statusDistribution = statusAgg.map((item) => ({
    status: item._id || "New",
    count: item.count,
  }));

  await logReportAction("Overview", "Report Generated", req, "Viewed Reports Dashboard Analytics");

  res.status(200).json({
    success: true,
    message: "Reports dashboard analytics retrieved",
    data: {
      metrics: {
        totalReferrals,
        totalReferralPartners: totalPartners,
        totalConvertedClients: convertedCount,
        totalRevenueGenerated,
        totalCommissionPaid,
        totalPendingCommission,
        totalPayments,
        activeCertificates,
        activeIDCards,
        overallConversionRate,
      },
      charts: {
        monthlyTrend,
        statusDistribution,
      },
    },
    error: null,
  });
});

// 2. REFERRAL REPORT
export const getReferralReport = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    status = "",
    partnerId = "",
    assignedEmployeeId = "",
    serviceType = "",
    startDate = "",
    endDate = "",
  } = req.query;

  const query = { isDeleted: false };

  if (req.user?.role === "referral_partner") {
    const partnerDocId = await getPartnerIdForUser(req.user._id);
    if (partnerDocId) query.partnerId = partnerDocId;
  } else if (partnerId && mongoose.Types.ObjectId.isValid(partnerId)) {
    query.partnerId = new mongoose.Types.ObjectId(partnerId);
  }

  if (status) query.status = status;
  if (assignedEmployeeId && mongoose.Types.ObjectId.isValid(assignedEmployeeId)) {
    query.assignedEmployee = new mongoose.Types.ObjectId(assignedEmployeeId);
  }
  if (serviceType) query.serviceRequired = serviceType;

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }

  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), "i");
    query.$or = [
      { referralId: searchRegex },
      { clientName: searchRegex },
      { companyName: searchRegex },
      { serviceRequired: searchRegex },
      { email: searchRegex },
      { mobileNumber: searchRegex },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const skip = (pageNum - 1) * limitNum;

  const total = await ReferralClient.countDocuments(query);
  const referrals = await ReferralClient.find(query)
    .populate({
      path: "partnerId",
      populate: { path: "userId", select: "name email phone" },
    })
    .populate("assignedEmployee", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  // Summary Metrics Aggregation
  const summaryAgg = await ReferralClient.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalCount: { $sum: 1 },
        convertedCount: {
          $sum: { $cond: [{ $in: ["$status", ["Converted", "converted"]] }, 1, 0] },
        },
        lostCount: {
          $sum: { $cond: [{ $in: ["$status", ["Lost", "Cancelled", "rejected", "Rejected"]] }, 1, 0] },
        },
        pendingCount: {
          $sum: { $cond: [{ $in: ["$status", ["New", "Assigned", "Contacted", "Interested", "Follow Up", "Negotiation", "pending"]] }, 1, 0] },
        },
        totalRevenue: {
          $sum: { $cond: [{ $in: ["$status", ["Converted", "converted"]] }, { $ifNull: ["$estimatedBudget", 0] }, 0] },
        },
      },
    },
  ]);

  const summary = summaryAgg[0] || {
    totalCount: 0,
    convertedCount: 0,
    lostCount: 0,
    pendingCount: 0,
    totalRevenue: 0,
  };

  const conversionRate = summary.totalCount > 0 ? Math.round((summary.convertedCount / summary.totalCount) * 100) : 0;
  const avgReferralValue = summary.convertedCount > 0 ? Math.round(summary.totalRevenue / summary.convertedCount) : 0;

  res.status(200).json({
    success: true,
    message: "Referral report retrieved",
    data: {
      summary: {
        totalReferrals: summary.totalCount,
        convertedReferrals: summary.convertedCount,
        lostReferrals: summary.lostCount,
        pendingReferrals: summary.pendingCount,
        conversionRate,
        totalRevenue: summary.totalRevenue,
        avgReferralValue,
      },
      referrals,
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

// 3. PARTNER PERFORMANCE REPORT
export const getPartnerPerformanceReport = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;

  const matchQuery = { isDeleted: false };
  if (req.user.role === "referral_partner") {
    const partnerDocId = await getPartnerIdForUser(req.user._id);
    if (partnerDocId) matchQuery._id = partnerDocId;
  }

  const partners = await ReferralPartner.find(matchQuery).populate("userId", "name email phone");

  const performanceList = await Promise.all(
    partners.map(async (p) => {
      const pId = p._id;

      const refAgg = await ReferralClient.aggregate([
        { $match: { partnerId: pId, isDeleted: false } },
        {
          $group: {
            _id: null,
            totalRef: { $sum: 1 },
            convertedRef: {
              $sum: { $cond: [{ $eq: ["$status", "Converted"] }, 1, 0] },
            },
            totalRevenue: {
              $sum: { $cond: [{ $eq: ["$status", "Converted"] }, "$actualFee", 0] },
            },
          },
        },
      ]);

      const commAgg = await Commission.aggregate([
        { $match: { partnerId: pId, isDeleted: false } },
        {
          $group: {
            _id: null,
            totalEarned: { $sum: "$commissionAmount" },
            totalPaid: { $sum: "$paidAmount" },
            totalPending: { $sum: "$pendingAmount" },
          },
        },
      ]);

      const totalRef = refAgg[0]?.totalRef || 0;
      const convertedRef = refAgg[0]?.convertedRef || 0;
      const totalRevenue = refAgg[0]?.totalRevenue || 0;
      const conversionRate = totalRef > 0 ? Math.round((convertedRef / totalRef) * 100) : 0;
      const avgDealValue = convertedRef > 0 ? Math.round(totalRevenue / convertedRef) : 0;

      return {
        partnerId: p._id,
        partnerName: p.userId?.name || "Partner",
        partnerCode: p.referralCode || "REF-00",
        totalReferrals: totalRef,
        convertedReferrals: convertedRef,
        conversionRate,
        revenueGenerated: totalRevenue,
        commissionEarned: commAgg[0]?.totalEarned || 0,
        pendingCommission: commAgg[0]?.totalPending || 0,
        avgDealValue,
      };
    })
  );

  // Sort by Revenue Generated descending to assign rankings
  performanceList.sort((a, b) => b.revenueGenerated - a.revenueGenerated);
  performanceList.forEach((item, idx) => {
    item.ranking = idx + 1;
  });

  res.status(200).json({
    success: true,
    message: "Partner performance report retrieved",
    data: {
      partners: performanceList,
    },
    error: null,
  });
});

// 4. MONTHLY REFERRAL REPORT
export const getMonthlyReferralReport = asyncHandler(async (req, res) => {
  const query = { isDeleted: false };
  if (req.user.role === "referral_partner") {
    const partnerDocId = await getPartnerIdForUser(req.user._id);
    if (partnerDocId) query.partnerId = partnerDocId;
  }

  const monthlyAgg = await ReferralClient.aggregate([
    { $match: query },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        totalReferrals: { $sum: 1 },
        totalConversions: {
          $sum: { $cond: [{ $eq: ["$status", "Converted"] }, 1, 0] },
        },
        totalRevenue: {
          $sum: { $cond: [{ $eq: ["$status", "Converted"] }, "$actualFee", 0] },
        },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
  ]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyData = monthlyAgg.map((item) => ({
    monthYear: `${monthNames[item._id.month - 1]} ${item._id.year}`,
    totalReferrals: item.totalReferrals,
    totalConversions: item.totalConversions,
    totalRevenue: item.totalRevenue,
    conversionRate: item.totalReferrals > 0 ? Math.round((item.totalConversions / item.totalReferrals) * 100) : 0,
  }));

  res.status(200).json({
    success: true,
    message: "Monthly referral report retrieved",
    data: { monthlyData },
    error: null,
  });
});

// 5. CLIENT CONVERSION REPORT (Sales Funnel)
export const getClientConversionReport = asyncHandler(async (req, res) => {
  const query = { isDeleted: false };
  if (req.user.role === "referral_partner") {
    const partnerDocId = await getPartnerIdForUser(req.user._id);
    if (partnerDocId) query.partnerId = partnerDocId;
  }

  const totalLeads = await ReferralClient.countDocuments(query);
  const converted = await ReferralClient.countDocuments({ ...query, status: "Converted" });
  const lost = await ReferralClient.countDocuments({ ...query, status: "Rejected" });
  const inNegotiation = await ReferralClient.countDocuments({ ...query, status: "Contacted" });
  const pending = await ReferralClient.countDocuments({ ...query, status: "Pending" });

  const conversionPercentage = totalLeads > 0 ? Math.round((converted / totalLeads) * 100) : 0;

  res.status(200).json({
    success: true,
    message: "Client conversion report retrieved",
    data: {
      funnel: [
        { stage: "Total Leads Received", count: totalLeads },
        { stage: "Pending Review", count: pending },
        { stage: "Active Negotiation", count: inNegotiation },
        { stage: "Converted Clients", count: converted },
        { stage: "Lost / Rejected", count: lost },
      ],
      metrics: {
        totalLeads,
        convertedClients: converted,
        lostClients: lost,
        conversionPercentage,
      },
    },
    error: null,
  });
});

// 6. COMMISSION REPORT
export const getCommissionReport = asyncHandler(async (req, res) => {
  const query = { isDeleted: false };
  if (req.user.role === "referral_partner") {
    const partnerDocId = await getPartnerIdForUser(req.user._id);
    if (partnerDocId) query.partnerId = partnerDocId;
  }

  const commissions = await Commission.find(query)
    .populate({
      path: "partnerId",
      populate: { path: "userId", select: "name email" },
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: "Commission report retrieved",
    data: { commissions },
    error: null,
  });
});

// 7. PAYMENT REPORT
export const getPaymentReport = asyncHandler(async (req, res) => {
  const query = {};
  if (req.user.role === "referral_partner") {
    const partnerDocId = await getPartnerIdForUser(req.user._id);
    if (partnerDocId) query.partnerId = partnerDocId;
  }

  const payments = await CommissionPayment.find(query)
    .populate({
      path: "partnerId",
      populate: { path: "userId", select: "name email" },
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: "Payment report retrieved",
    data: { payments },
    error: null,
  });
});

// 8. TERRITORY REPORT
export const getTerritoryReport = asyncHandler(async (req, res) => {
  // Aggregate territory info based on partners' address/city or clients' city
  const territoryAgg = await ReferralPartner.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: "$address.city",
        activePartners: { $sum: 1 },
      },
    },
  ]);

  const territories = territoryAgg.map((t) => ({
    city: t._id || "Default Territory",
    activePartners: t.activePartners,
  }));

  res.status(200).json({
    success: true,
    message: "Territory report retrieved",
    data: { territories },
    error: null,
  });
});

// 9. SCHEDULED REPORTS (GET & CREATE)
export const getScheduledReports = asyncHandler(async (req, res) => {
  const scheduled = await ScheduledReport.find({ isActive: true }).sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    message: "Scheduled reports retrieved",
    data: { scheduled },
    error: null,
  });
});

export const createScheduledReport = asyncHandler(async (req, res) => {
  const { reportName, reportType, frequency, recipients, deliveryChannel } = req.body;

  if (req.user.role !== "super_admin") {
    throw new AppError("Only Admins can schedule reports", 403, "PERMISSION_DENIED");
  }

  const schedule = await ScheduledReport.create({
    reportName,
    reportType,
    frequency,
    recipients: recipients || [req.user.email],
    deliveryChannel: deliveryChannel || "Both",
    createdBy: req.user._id,
  });

  await logReportAction(reportType, "Report Scheduled", req, `Scheduled ${frequency} report: ${reportName}`);

  res.status(201).json({
    success: true,
    message: "Report scheduled successfully",
    data: { schedule },
    error: null,
  });
});

// 10. REPORT HISTORY
export const getReportHistory = asyncHandler(async (req, res) => {
  const query = { isDeleted: false };
  if (req.user.role === "referral_partner") {
    query.generatedBy = req.user._id;
  }

  const history = await ReportHistory.find(query)
    .populate("generatedBy", "name email role")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: "Report history retrieved",
    data: { history },
    error: null,
  });
});

// 11. EMPLOYEE REPORT
export const getEmployeeReport = asyncHandler(async (req, res) => {
  const { department = "", month = "", year = "" } = req.query;

  const query = { status: { $ne: "terminated" } };
  if (department) query.department = department;

  const employees = await Employee.find(query).lean();

  const reportData = await Promise.all(
    employees.map(async (emp) => {
      const [attendanceCount, presentCount, leaveCount, taskCount, completedTaskCount] = await Promise.all([
        Attendance.countDocuments({ employeeId: emp._id }),
        Attendance.countDocuments({ employeeId: emp._id, attendanceStatus: { $in: ["present", "half_day"] } }),
        Attendance.countDocuments({ employeeId: emp._id, $or: [{ isPaidLeave: true }, { isUnpaidLeave: true }] }),
        Task.countDocuments({ assignedEmployee: emp._id }),
        Task.countDocuments({ assignedEmployee: emp._id, status: "completed" }),
      ]);

      const attendancePercentage = attendanceCount > 0 ? Math.round((presentCount / attendanceCount) * 100) : 100;
      const taskCompletionRate = taskCount > 0 ? Math.round((completedTaskCount / taskCount) * 100) : 0;

      return {
        _id: emp._id,
        name: emp.name,
        email: emp.email,
        department: emp.department || "General",
        designation: emp.designation || "Staff",
        salary: emp.salary || 0,
        attendancePercentage,
        presentDays: presentCount,
        leaveDays: leaveCount,
        totalTasks: taskCount,
        completedTasks: completedTaskCount,
        taskCompletionRate,
        joiningDate: emp.joiningDate,
        status: emp.status,
      };
    })
  );

  await logReportAction("Employee Performance Report", "Report Generated", req, `Generated employee report for ${employees.length} employees`);

  return res.status(200).json({
    success: true,
    message: "Employee report generated successfully",
    data: { employees: reportData },
  });
});

// 12. SALES REPORT
export const getSalesReport = asyncHandler(async (req, res) => {
  const [totalLeads, convertedLeads, totalQuotations, acceptedQuotations, totalInvoices, paidInvoicesAgg, referralSalesAgg] = await Promise.all([
    Lead.countDocuments({}),
    Lead.countDocuments({ leadStatus: "Converted" }),
    Quotation.countDocuments({}),
    Quotation.countDocuments({ status: { $in: ["Accepted", "Converted"] } }),
    Invoice.countDocuments({}),
    Invoice.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
    ReferralClient.aggregate([
      { $match: { status: "Converted", isDeleted: false } },
      { $group: { _id: null, total: { $sum: "$actualFee" } } },
    ]),
  ]);

  const invoiceSales = paidInvoicesAgg[0]?.total || 0;
  const referralSales = referralSalesAgg[0]?.total || 0;
  const totalSalesRevenue = Math.max(invoiceSales, referralSales);

  const leadConversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;
  const quotationAcceptanceRate = totalQuotations > 0 ? Math.round((acceptedQuotations / totalQuotations) * 100) : 0;

  await logReportAction("Sales Performance Report", "Report Generated", req, `Generated sales report`);

  return res.status(200).json({
    success: true,
    message: "Sales report generated successfully",
    data: {
      metrics: {
        totalLeads,
        convertedLeads,
        leadConversionRate,
        totalQuotations,
        acceptedQuotations,
        quotationAcceptanceRate,
        totalInvoices,
        totalSalesRevenue,
      },
    },
  });
});

// 13. CLIENT REPORT
export const getClientReport = asyncHandler(async (req, res) => {
  const clients = await Client.find({}).lean();

  const reportData = await Promise.all(
    clients.map(async (client) => {
      const [projectsCount, invoices] = await Promise.all([
        Project.countDocuments({ clientId: client._id }),
        Invoice.find({ clientId: client._id }).select("totalAmount advancePayment paymentStatus").lean(),
      ]);

      let totalInvoiced = 0;
      let totalPaid = 0;
      let pendingBalance = 0;

      invoices.forEach((inv) => {
        totalInvoiced += inv.totalAmount || 0;
        if (inv.paymentStatus === "paid") {
          totalPaid += inv.totalAmount || 0;
        } else if (inv.paymentStatus === "partially_paid") {
          const adv = inv.advancePayment || 0;
          totalPaid += adv;
          pendingBalance += inv.totalAmount - adv;
        } else {
          pendingBalance += inv.totalAmount || 0;
        }
      });

      return {
        _id: client._id,
        companyName: client.companyName || client.clientName,
        clientName: client.clientName,
        email: client.email,
        phone: client.phone,
        businessCategory: client.businessCategory || "General",
        status: client.status,
        totalProjects: projectsCount,
        totalInvoiced,
        totalPaid,
        pendingBalance,
        createdAt: client.createdAt,
      };
    })
  );

  await logReportAction("Client Portfolio Report", "Report Generated", req, `Generated client report for ${clients.length} clients`);

  return res.status(200).json({
    success: true,
    message: "Client report generated successfully",
    data: { clients: reportData },
  });
});

