import mongoose from "mongoose";
import User from "../models/User.js";
import ReferralPartner from "../models/ReferralPartner.js";
import Referral from "../models/Referral.js";
import Commission from "../models/Commission.js";
import Certificate from "../models/Certificate.js";
import IDCard from "../models/IDCard.js";
import ReferralActivity from "../models/ReferralActivity.js";
import ReferralNotification from "../models/ReferralNotification.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

// Helper: generate referral code
const generateReferralCode = (name = "PARTNER") => {
  const cleanName = name.replace(/[^A-Za-z]/g, "").substring(0, 4).toUpperCase();
  const randNum = Math.floor(1000 + Math.random() * 9000);
  return `${cleanName}${randNum}`;
};

// Register Referral Partner (Public registration disabled - Admin control only)
export const registerPartner = asyncHandler(async (req, res) => {
  throw new AppError(
    "Public referral partner registration is disabled. Partner accounts are created directly by System Administrators.",
    403,
    "PUBLIC_REGISTRATION_DISABLED"
  );
});

// Helper to fetch Partner Profile by logged-in User ID
const getPartnerByUserId = async (userId, reqUser = null) => {
  const targetUserId = userId || reqUser?._id;
  if (!targetUserId) {
    throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
  }

  let realUserId = targetUserId;
  let user = null;

  // If targetUserId is the dev bypass mock ID, map to an actual User document in MongoDB
  if (targetUserId === "000000000000000000000000" || targetUserId?.toString() === "000000000000000000000000") {
    user = await User.findOne({ email: "developer@localhost" });
    if (!user) {
      user = await User.findOne({ role: "referral_partner" });
    }
    if (!user) {
      user = await User.create({
        name: "Developer Partner",
        email: "developer@localhost",
        password: "Password123!",
        role: "referral_partner",
        status: "active",
      });
    }
    realUserId = user._id;
  } else {
    user = await User.findById(targetUserId);
    if (!user && reqUser && reqUser._id && reqUser._id !== "000000000000000000000000") {
      user = await User.findById(reqUser._id);
    }
  }

  if (!user) {
    throw new AppError("Authenticated user record not found", 404, "USER_NOT_FOUND");
  }

  let partner = await ReferralPartner.findOne({ userId: realUserId, isDeleted: false }).populate("userId");

  if (!partner) {
    const existingPartner = await ReferralPartner.findOne({ userId: realUserId });
    if (existingPartner) {
      if (existingPartner.isDeleted) {
        throw new AppError(
          "This partner account has been deactivated. Please contact support.",
          403,
          "PARTNER_DEACTIVATED"
        );
      }
      partner = await existingPartner.populate("userId");
    }
  }

  if (!partner) {
    const cleanName = (user.name || "PARTNER").replace(/[^A-Za-z]/g, "").substring(0, 4).toUpperCase();
    const randNum = Math.floor(1000 + Math.random() * 9000);

    try {
      partner = await ReferralPartner.create({
        userId: user._id,
        referralCode: `${cleanName}${randNum}`,
        status: "active",
        profileCompletion: 100,
        kycStatus: "verified",
      });
    } catch (err) {
      if (err.code === 11000) {
        partner = await ReferralPartner.findOne({ userId: realUserId }).populate("userId");
      } else {
        throw err;
      }
    }

    if (partner && !partner.userId) {
      partner = await partner.populate("userId");
    }
  }

  return partner;
};

// Get Dashboard Stats
export const getDashboardStats = asyncHandler(async (req, res) => {
  const partner = await getPartnerByUserId(req.auth?.id || req.user?._id, req.user);

  // Aggregation of Referral statistics
  const referralStats = await Referral.aggregate([
    { $match: { partnerId: partner._id } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
        converted: {
          $sum: {
            $cond: [
              { $or: [{ $eq: ["$status", "Converted"] }, { $eq: ["$status", "converted"] }] },
              1,
              0,
            ],
          },
        },
        rejected: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } },
      },
    },
  ]);

  const refStats = referralStats[0] || { total: 0, active: 0, pending: 0, converted: 0, rejected: 0 };

  // Aggregation of Commission statistics
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const commissionStats = await Commission.aggregate([
    { $match: { partnerId: partner._id } },
    {
      $group: {
        _id: null,
        totalEarned: { $sum: { $cond: [{ $ne: ["$status", "rejected"] }, "$netCommission", 0] } },
        pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, "$netCommission", 0] } },
        paid: { $sum: { $cond: [{ $eq: ["$status", "paid"] }, "$netCommission", 0] } },
        currentMonth: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: ["$status", "rejected"] },
                  { $gte: ["$createdAt", startOfMonth] },
                ],
              },
              "$netCommission",
              0,
            ],
          },
        },
      },
    },
  ]);

  const commStats = commissionStats[0] || { totalEarned: 0, pending: 0, paid: 0, currentMonth: 0 };

  // Document status checks
  const cert = await Certificate.findOne({ partnerId: partner._id });
  const idCard = await IDCard.findOne({ partnerId: partner._id });

  return res.status(200).json({
    success: true,
    message: "Dashboard statistics fetched successfully",
    data: {
      partner: {
        id: partner._id,
        name: partner.userId.name,
        email: partner.userId.email,
        phone: partner.userId.phone,
        referralCode: partner.referralCode,
        status: partner.status,
        memberSince: partner.createdAt,
        lastLogin: partner.userId.lastLogin,
        profilePicture: partner.profilePicture,
        profileCompletion: partner.profileCompletion,
        kycStatus: partner.kycStatus,
      },
      statistics: {
        referrals: refStats,
        commissions: {
          totalEarned: commStats.totalEarned,
          pending: commStats.pending,
          paid: commStats.paid,
          currentMonth: commStats.currentMonth,
          lifetimeEarnings: commStats.totalEarned,
        },
        documents: {
          idCardStatus: idCard ? "Available" : "Pending",
          idCardUrl: idCard?.url || "",
          certificateStatus: cert ? "Active" : "Pending",
          certificateUrl: cert?.url || "",
        },
      },
    },
    error: null,
  });
});

// Get Dashboard Analytics
export const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const partner = await getPartnerByUserId(req.auth?.id || req.user?._id, req.user);

  // Group referrals by month
  const monthlyReferrals = await Referral.aggregate([
    { $match: { partnerId: partner._id } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        count: { $sum: 1 },
        converted: {
          $sum: {
            $cond: [
              { $or: [{ $eq: ["$status", "Converted"] }, { $eq: ["$status", "converted"] }] },
              1,
              0,
            ],
          },
        },
        pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  // Group commissions by month
  const monthlyCommissions = await Commission.aggregate([
    { $match: { partnerId: partner._id, status: { $ne: "rejected" } } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        earned: { $sum: "$netCommission" },
        paid: { $sum: { $cond: [{ $eq: ["$status", "paid"] }, "$netCommission", 0] } },
        pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, "$netCommission", 0] } },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  // Format responses for charts
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const referralData = monthlyReferrals.map(item => ({
    label: `${months[item._id.month - 1]} ${item._id.year}`,
    total: item.count,
    converted: item.converted,
    pending: item.pending,
  }));

  const commissionData = monthlyCommissions.map(item => ({
    label: `${months[item._id.month - 1]} ${item._id.year}`,
    earned: item.earned,
    paid: item.paid,
    pending: item.pending,
  }));

  return res.status(200).json({
    success: true,
    message: "Dashboard analytics fetched successfully",
    data: {
      referralsTrend: referralData,
      commissionsTrend: commissionData,
    },
    error: null,
  });
});

// Get Paginated Activities
export const getActivities = asyncHandler(async (req, res) => {
  const partner = await getPartnerByUserId(req.auth?.id || req.user?._id, req.user);
  const pageNum = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 5));
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";

  const query = { partnerId: partner._id };
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const [activities, total] = await Promise.all([
    ReferralActivity.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    ReferralActivity.countDocuments(query),
  ]);

  return res.status(200).json({
    success: true,
    message: "Activities fetched successfully",
    data: {
      activities: activities || [],
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 0,
      },
    },
    error: null,
  });
});

// Get Notifications
export const getNotifications = asyncHandler(async (req, res) => {
  const partner = await getPartnerByUserId(req.auth?.id || req.user?._id, req.user);

  const notifications = await ReferralNotification.find({ partnerId: partner._id })
    .sort({ createdAt: -1 })
    .limit(10);

  const unreadCount = await ReferralNotification.countDocuments({
    partnerId: partner._id,
    isRead: false,
  });

  return res.status(200).json({
    success: true,
    message: "Notifications fetched successfully",
    data: {
      notifications,
      unreadCount,
    },
    error: null,
  });
});

// Mark Notification as Read
export const markNotificationRead = asyncHandler(async (req, res) => {
  const partner = await getPartnerByUserId(req.auth?.id || req.user?._id, req.user);
  const { id } = req.params;

  await ReferralNotification.findOneAndUpdate(
    { _id: id, partnerId: partner._id },
    { isRead: true }
  );

  return res.status(200).json({
    success: true,
    message: "Notification marked as read",
    data: null,
    error: null,
  });
});

// Mark All Notifications as Read
export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const partner = await getPartnerByUserId(req.auth?.id || req.user?._id, req.user);

  await ReferralNotification.updateMany(
    { partnerId: partner._id, isRead: false },
    { isRead: true }
  );

  return res.status(200).json({
    success: true,
    message: "All notifications marked as read",
    data: null,
    error: null,
  });
});

// Refer a Client
export const referClient = asyncHandler(async (req, res) => {
  const partner = await getPartnerByUserId(req.auth?.id || req.user?._id, req.user);
  const { clientName, clientEmail, clientPhone } = req.body;

  if (!clientName || !clientEmail || !clientPhone) {
    throw new AppError("Client name, email and phone are required", 400, "REQUIRED_FIELDS_MISSING");
  }

  const referral = await Referral.create({
    partnerId: partner._id,
    clientName,
    clientEmail: clientEmail.toLowerCase().trim(),
    clientPhone,
    status: "pending",
  });

  // Log activity
  await ReferralActivity.create({
    partnerId: partner._id,
    title: "New Referral Submitted",
    description: `Referred ${clientName} (${clientEmail})`,
    type: "referral",
  });

  // Notification
  await ReferralNotification.create({
    partnerId: partner._id,
    title: "Referral Submitted",
    message: `Your referral for ${clientName} was successfully submitted and is under review.`,
  });

  return res.status(201).json({
    success: true,
    message: "Client referred successfully",
    data: {
      referral,
    },
    error: null,
  });
});

// Get List of Referrals
export const getReferrals = asyncHandler(async (req, res) => {
  const partner = await getPartnerByUserId(req.auth?.id || req.user?._id, req.user);

  const referrals = await Referral.find({ partnerId: partner._id }).sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    message: "Referrals fetched successfully",
    data: {
      referrals,
    },
    error: null,
  });
});

// Get List of Commissions
export const getCommissions = asyncHandler(async (req, res) => {
  const partner = await getPartnerByUserId(req.auth?.id || req.user?._id, req.user);

  const commissions = await Commission.find({ partnerId: partner._id })
    .populate("referralId")
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    message: "Commissions fetched successfully",
    data: {
      commissions,
    },
    error: null,
  });
});

// Update Partner Profile Details
export const updatePartnerProfile = asyncHandler(async (req, res) => {
  const partner = await getPartnerByUserId(req.auth?.id || req.user?._id, req.user);
  const { name, phone, profilePicture } = req.body;

  // Update user name / phone
  const user = await User.findById(partner.userId._id);
  if (name) user.name = name;
  if (phone) user.phone = phone;
  await user.save();

  // Update partner picture
  if (profilePicture !== undefined) {
    partner.profilePicture = profilePicture;
  }
  partner.profileCompletion = 100; // Profile fully complete
  await partner.save();

  // Log activity
  await ReferralActivity.create({
    partnerId: partner._id,
    title: "Profile Updated",
    description: "Your partner profile details have been updated successfully.",
    type: "profile",
  });

  return res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: {
      partner: {
        ...partner.toObject(),
        userId: user,
      },
    },
    error: null,
  });
});

// Get All Referral Partners (Admin Only)
export const getAllReferralPartners = asyncHandler(async (req, res) => {
  const partners = await ReferralPartner.find()
    .populate("userId", "name email phone status role")
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    message: "Referral partners retrieved",
    data: { partners },
    error: null,
  });
});
