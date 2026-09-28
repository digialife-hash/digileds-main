import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import NotificationTemplate from "../models/NotificationTemplate.js";
import NotificationPreference from "../models/NotificationPreference.js";
import NotificationLog from "../models/NotificationLog.js";
import NotificationQueue from "../models/NotificationQueue.js";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendCentralNotification } from "../services/notificationService.js";

// 1. NOTIFICATION DASHBOARD ANALYTICS
export const getNotificationDashboardAnalytics = asyncHandler(async (req, res) => {
  const query = { isDeleted: false };

  // RBAC scope
  if (req.user.role === "referral_partner") {
    query.recipientUser = req.user._id;
  }

  const notifications = await Notification.find(query);

  let totalNotifications = 0;
  let unreadNotifications = 0;
  let readNotifications = 0;
  let emailNotificationsSent = 0;
  let smsNotificationsSent = 0;
  let whatsAppNotificationsSent = 0;
  let failedNotifications = 0;
  let todaysNotifications = 0;
  let monthlyNotifications = 0;

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const typeCounts = {};
  const channelCounts = { Dashboard: 0, Email: 0, SMS: 0, WhatsApp: 0 };

  notifications.forEach((n) => {
    totalNotifications++;

    if (!n.readAt) unreadNotifications++;
    else readNotifications++;

    if (n.status === "Failed") failedNotifications++;

    const ch = n.deliveryChannel || "Dashboard";
    if (channelCounts[ch] !== undefined) channelCounts[ch]++;

    if (ch === "Email" && n.status !== "Failed") emailNotificationsSent++;
    if (ch === "SMS" && n.status !== "Failed") smsNotificationsSent++;
    if (ch === "WhatsApp" && n.status !== "Failed") whatsAppNotificationsSent++;

    const createdAt = new Date(n.createdAt);
    if (createdAt >= startOfDay) todaysNotifications++;
    if (createdAt >= startOfMonth) monthlyNotifications++;

    const category = n.category || "Account Updates";
    typeCounts[category] = (typeCounts[category] || 0) + 1;
  });

  // Notification Trend (Last 6 Months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const monthlyTrendAgg = await Notification.aggregate([
    { $match: { ...query, createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyTrend = monthlyTrendAgg.map((item) => ({
    label: `${monthNames[item._id.month - 1]} ${item._id.year}`,
    total: item.count,
  }));

  const deliverySuccessRate =
    totalNotifications > 0
      ? Math.round(((totalNotifications - failedNotifications) / totalNotifications) * 100)
      : 100;

  res.status(200).json({
    success: true,
    message: "Notification analytics retrieved",
    data: {
      metrics: {
        totalNotifications,
        unreadNotifications,
        readNotifications,
        emailNotificationsSent,
        smsNotificationsSent,
        whatsAppNotificationsSent,
        failedNotifications,
        todaysNotifications,
        monthlyNotifications,
        deliverySuccessRate,
      },
      charts: {
        monthlyTrend,
        channelDistribution: Object.keys(channelCounts).map((ch) => ({
          channel: ch,
          count: channelCounts[ch],
        })),
        typeDistribution: Object.keys(typeCounts).map((cat) => ({
          category: cat,
          count: typeCounts[cat],
        })),
        readVsUnread: [
          { status: "Read", count: readNotifications },
          { status: "Unread", count: unreadNotifications },
        ],
      },
    },
    error: null,
  });
});

// 2. GET NOTIFICATION LIST (In-App Bell & Full Center)
export const getNotifications = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    category = "",
    deliveryChannel = "",
    status = "",
    isRead = "",
    startDate = "",
    endDate = "",
  } = req.query;

  const query = { isDeleted: false };

  // RBAC scope
  if (req.user.role === "referral_partner") {
    query.recipientUser = req.user._id;
  }

  if (category) query.category = category;
  if (deliveryChannel) query.deliveryChannel = deliveryChannel;
  if (status) query.status = status;

  if (isRead === "true") query.readAt = { $ne: null };
  if (isRead === "false") query.readAt = null;

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }

  if (search) {
    const searchRegex = new RegExp(search, "i");
    query.$or = [
      { title: searchRegex },
      { message: searchRegex },
      { notificationId: searchRegex },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const skip = (pageNum - 1) * limitNum;

  const unreadCount = await Notification.countDocuments({
    recipientUser: req.user._id,
    readAt: null,
    isDeleted: false,
  });

  const total = await Notification.countDocuments(query);
  const notifications = await Notification.find(query)
    .populate("recipientUser", "name email role phone")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    message: "Notifications retrieved successfully",
    data: {
      unreadCount,
      notifications,
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

// 3. GET SINGLE NOTIFICATION DETAILS
export const getNotificationById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findOne({ _id: id, isDeleted: false }).populate(
    "recipientUser",
    "name email role"
  );

  if (!notification) {
    throw new AppError("Notification not found", 404, "NOTIFICATION_NOT_FOUND");
  }

  // Security Check
  if (req.user.role === "referral_partner") {
    if (notification.recipientUser._id.toString() !== req.user._id.toString()) {
      throw new AppError("Forbidden", 403, "FORBIDDEN");
    }
  }

  // Auto-mark read when inspecting details
  if (!notification.readAt) {
    notification.readAt = new Date();
    notification.status = "Read";
    await notification.save();
  }

  const logs = await NotificationLog.find({ notificationId: id }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: "Notification details retrieved",
    data: {
      notification,
      logs,
    },
    error: null,
  });
});

// 4. MARK SINGLE NOTIFICATION AS READ
export const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findOne({ _id: id, isDeleted: false });
  if (!notification) {
    throw new AppError("Notification not found", 404, "NOTIFICATION_NOT_FOUND");
  }

  if (req.user.role === "referral_partner" && notification.recipientUser.toString() !== req.user._id.toString()) {
    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }

  notification.readAt = new Date();
  notification.status = "Read";
  await notification.save();

  res.status(200).json({
    success: true,
    message: "Notification marked as read",
    data: { notification },
    error: null,
  });
});

// 5. MARK ALL NOTIFICATIONS AS READ
export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipientUser: req.user._id, readAt: null, isDeleted: false },
    { readAt: new Date(), status: "Read" }
  );

  res.status(200).json({
    success: true,
    message: "All notifications marked as read",
    data: null,
    error: null,
  });
});

// 6. DELETE NOTIFICATION (Soft delete)
export const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findOne({ _id: id, isDeleted: false });
  if (!notification) {
    throw new AppError("Notification not found", 404, "NOTIFICATION_NOT_FOUND");
  }

  if (req.user.role === "referral_partner" && notification.recipientUser.toString() !== req.user._id.toString()) {
    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }

  notification.isDeleted = true;
  notification.deletedAt = new Date();
  await notification.save();

  res.status(200).json({
    success: true,
    message: "Notification deleted",
    data: null,
    error: null,
  });
});

// 7. ARCHIVE NOTIFICATION
export const archiveNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findOne({ _id: id, isDeleted: false });
  if (!notification) {
    throw new AppError("Notification not found", 404, "NOTIFICATION_NOT_FOUND");
  }

  notification.status = "Archived";
  notification.archivedAt = new Date();
  await notification.save();

  res.status(200).json({
    success: true,
    message: "Notification archived",
    data: { notification },
    error: null,
  });
});

// 8. GET & UPDATE NOTIFICATION PREFERENCES
export const getNotificationPreferences = asyncHandler(async (req, res) => {
  let pref = await NotificationPreference.findOne({ userId: req.user._id });

  if (!pref) {
    pref = await NotificationPreference.create({
      userId: req.user._id,
      channels: { dashboard: true, email: true, sms: true, whatsApp: true },
      categories: {
        referralUpdates: true,
        commissionUpdates: true,
        paymentUpdates: true,
        certificateUpdates: true,
        idCardUpdates: true,
        accountUpdates: true,
        documentExpiry: true,
      },
    });
  }

  res.status(200).json({
    success: true,
    message: "Notification preferences retrieved",
    data: { preference: pref },
    error: null,
  });
});

export const updateNotificationPreferences = asyncHandler(async (req, res) => {
  const { channels, categories } = req.body;

  let pref = await NotificationPreference.findOne({ userId: req.user._id });
  if (!pref) {
    pref = new NotificationPreference({ userId: req.user._id });
  }

  if (channels) pref.channels = { ...pref.channels, ...channels };
  if (categories) pref.categories = { ...pref.categories, ...categories };

  await pref.save();

  res.status(200).json({
    success: true,
    message: "Notification preferences updated",
    data: { preference: pref },
    error: null,
  });
});

// 9. TEMPLATES (GET & CREATE/UPDATE)
export const getNotificationTemplates = asyncHandler(async (req, res) => {
  let templates = await NotificationTemplate.find().sort({ templateCode: 1 });

  // Seed default templates if empty
  if (templates.length === 0) {
    const defaults = [
      {
        templateCode: "NEW_REFERRAL_ACCEPTED",
        title: "New Referral Accepted",
        category: "Referral Updates",
        dashboardTemplate: "Your referral for {partnerName} has been accepted.",
        emailTemplate: "Hello {partnerName}, your referral has been accepted by our team.",
      },
      {
        templateCode: "REFERRAL_CONVERTED",
        title: "Referral Converted",
        category: "Referral Updates",
        dashboardTemplate: "Congratulations! Referral {referralNumber} converted.",
        emailTemplate: "Great news! Referral {referralNumber} for {partnerName} has converted.",
      },
      {
        templateCode: "COMMISSION_APPROVED",
        title: "Commission Approved",
        category: "Commission Updates",
        dashboardTemplate: "Commission of ₹{commissionAmount} approved for referral {referralNumber}.",
        emailTemplate: "Your commission payout of ₹{commissionAmount} has been approved.",
      },
      {
        templateCode: "PAYMENT_RELEASED",
        title: "Payment Processed",
        category: "Payment Updates",
        dashboardTemplate: "Payment of ₹{paymentAmount} released via {paymentMode}.",
        emailTemplate: "Payment of ₹{paymentAmount} has been disbursed to your account.",
      },
    ];
    templates = await NotificationTemplate.insertMany(defaults);
  }

  res.status(200).json({
    success: true,
    message: "Notification templates retrieved",
    data: { templates },
    error: null,
  });
});

export const createOrUpdateNotificationTemplate = asyncHandler(async (req, res) => {
  const { templateCode, title, category, dashboardTemplate, emailTemplate, smsTemplate, whatsAppTemplate } = req.body;

  if (req.user.role !== "super_admin") {
    throw new AppError("Only Admins can manage notification templates", 403, "PERMISSION_DENIED");
  }

  if (!templateCode || !title) {
    throw new AppError("Template code and title are required", 400, "MISSING_FIELDS");
  }

  const code = templateCode.toUpperCase().trim();
  let template = await NotificationTemplate.findOne({ templateCode: code });

  if (template) {
    template.title = title;
    if (category) template.category = category;
    if (dashboardTemplate !== undefined) template.dashboardTemplate = dashboardTemplate;
    if (emailTemplate !== undefined) template.emailTemplate = emailTemplate;
    if (smsTemplate !== undefined) template.smsTemplate = smsTemplate;
    if (whatsAppTemplate !== undefined) template.whatsAppTemplate = whatsAppTemplate;
    await template.save();
  } else {
    template = await NotificationTemplate.create({
      templateCode: code,
      title,
      category: category || "Account Updates",
      dashboardTemplate,
      emailTemplate,
      smsTemplate,
      whatsAppTemplate,
    });
  }

  res.status(200).json({
    success: true,
    message: "Notification template saved",
    data: { template },
    error: null,
  });
});

// 10. RESEND NOTIFICATION (Admin Only)
export const resendNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== "super_admin") {
    throw new AppError("Only Admins can resend notifications", 403, "PERMISSION_DENIED");
  }

  const notification = await Notification.findOne({ _id: id, isDeleted: false });
  if (!notification) {
    throw new AppError("Notification not found", 404, "NOTIFICATION_NOT_FOUND");
  }

  await sendCentralNotification({
    recipientUser: notification.recipientUser,
    title: notification.title,
    message: notification.message,
    category: notification.category,
    deliveryChannel: notification.deliveryChannel,
    link: notification.link,
    type: notification.type,
  });

  res.status(200).json({
    success: true,
    message: "Notification resent successfully",
    data: null,
    error: null,
  });
});

// 11. EXPORT NOTIFICATIONS (CSV format)
export const exportNotifications = asyncHandler(async (req, res) => {
  const { category = "", deliveryChannel = "", status = "" } = req.query;

  const query = { isDeleted: false };
  if (req.user.role === "referral_partner") {
    query.recipientUser = req.user._id;
  }

  if (category) query.category = category;
  if (deliveryChannel) query.deliveryChannel = deliveryChannel;
  if (status) query.status = status;

  const notifications = await Notification.find(query)
    .populate("recipientUser", "name email")
    .sort({ createdAt: -1 });

  const headers = [
    "Notification ID",
    "Recipient Name",
    "Title",
    "Category",
    "Channel",
    "Status",
    "Created Date",
    "Read Date",
  ];

  const rows = notifications.map((n) => [
    `"${n.notificationId || ""}"`,
    `"${n.recipientUser ? n.recipientUser.name : ""}"`,
    `"${n.title || ""}"`,
    `"${n.category || ""}"`,
    `"${n.deliveryChannel || ""}"`,
    `"${n.status || ""}"`,
    `"${new Date(n.createdAt).toISOString().split("T")[0]}"`,
    `"${n.readAt ? new Date(n.readAt).toISOString().split("T")[0] : "Unread"}"`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=notifications-export-${Date.now()}.csv`);
  return res.status(200).send(csvContent);
});
