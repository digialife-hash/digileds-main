import ReferralPartner from "../models/ReferralPartner.js";
import User from "../models/User.js";
import ReferralClient from "../models/Referral.js";
import Commission from "../models/Commission.js";
import Certificate from "../models/Certificate.js";
import IDCard from "../models/IDCard.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

// 1. ADMIN PARTNER DASHBOARD ANALYTICS
export const getAdminPartnerDashboard = asyncHandler(async (req, res) => {
  const totalPartners = await ReferralPartner.countDocuments({ isDeleted: false });
  const activePartners = await ReferralPartner.countDocuments({ isDeleted: false, status: "active" });
  const inactivePartners = await ReferralPartner.countDocuments({ isDeleted: false, status: "inactive" });
  const suspendedPartners = await ReferralPartner.countDocuments({ isDeleted: false, status: "suspended" });
  const pendingApprovals = await ReferralPartner.countDocuments({ isDeleted: false, status: "pending" });
  const verifiedPartners = await ReferralPartner.countDocuments({ isDeleted: false, kycStatus: "verified" });

  const totalReferrals = await ReferralClient.countDocuments({ isDeleted: false });
  const convertedReferrals = await ReferralClient.countDocuments({ isDeleted: false, status: "Converted" });

  const revenueAgg = await ReferralClient.aggregate([
    { $match: { isDeleted: false, status: "Converted" } },
    { $group: { _id: null, total: { $sum: "$actualFee" } } },
  ]);
  const revenueGenerated = revenueAgg[0]?.total || 0;

  const commAgg = await Commission.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: null,
        total: { $sum: "$commissionAmount" },
        paid: { $sum: "$paidAmount" },
        pending: { $sum: "$pendingAmount" },
      },
    },
  ]);
  const totalCommission = commAgg[0]?.total || 0;
  const paidCommission = commAgg[0]?.paid || 0;
  const pendingCommission = commAgg[0]?.pending || 0;

  const certificatesIssued = await Certificate.countDocuments({ isDeleted: false });
  const idCardsGenerated = await IDCard.countDocuments({ isDeleted: false });

  res.status(200).json({
    success: true,
    message: "Admin partner dashboard analytics retrieved",
    data: {
      metrics: {
        totalPartners,
        activePartners,
        inactivePartners,
        suspendedPartners,
        pendingApprovals,
        verifiedPartners,
        totalReferrals,
        convertedReferrals,
        revenueGenerated,
        totalCommission,
        paidCommission,
        pendingCommission,
        certificatesIssued,
        idCardsGenerated,
      },
    },
    error: null,
  });
});

// 2. GET ALL PARTNERS DIRECTORY (Admin)
export const getAllPartnersAdmin = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    status = "",
    kycStatus = "",
    partnerLevel = "",
  } = req.query;

  const query = { isDeleted: false };
  if (status) query.status = status;
  if (kycStatus) query.kycStatus = kycStatus;
  if (partnerLevel) query.partnerLevel = partnerLevel;

  if (search) {
    const searchRegex = new RegExp(search, "i");
    const matchedUsers = await User.find({
      $or: [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }],
    }).select("_id");
    const userIds = matchedUsers.map((u) => u._id);

    query.$or = [
      { referralCode: searchRegex },
      { territory: searchRegex },
      { occupation: searchRegex },
      { userId: { $in: userIds } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const skip = (pageNum - 1) * limitNum;

  const total = await ReferralPartner.countDocuments(query);
  const partners = await ReferralPartner.find(query)
    .populate("userId", "name email phone role status lastLogin createdAt")
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    message: "Partner directory retrieved",
    data: {
      partners,
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

// 3. GET SINGLE PARTNER DETAILS (Admin)
export const getPartnerByIdAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const partner = await ReferralPartner.findOne({ _id: id, isDeleted: false })
    .populate("userId", "name email phone role status lastLogin createdAt")
    .populate("createdBy", "name email");

  if (!partner) {
    throw new AppError("Partner not found", 404, "PARTNER_NOT_FOUND");
  }

  const referrals = await ReferralClient.find({ partnerId: id, isDeleted: false }).sort({ createdAt: -1 });
  const commissions = await Commission.find({ partnerId: id, isDeleted: false }).sort({ createdAt: -1 });
  const idCards = await IDCard.find({ partnerId: id, isDeleted: false }).sort({ createdAt: -1 });
  const certificates = await Certificate.find({ partnerId: id, isDeleted: false }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: "Partner details retrieved",
    data: {
      partner,
      referrals,
      commissions,
      idCards,
      certificates,
    },
    error: null,
  });
});

// 4. CREATE PARTNER ACCOUNT (Admin Only)
export const createPartnerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, phone, partnerLevel, territory, occupation } = req.body;

  if (!name || !email || !password) {
    throw new AppError("Name, email and initial password are required", 400, "REQUIRED_FIELDS_MISSING");
  }

  if (password.length < 8) {
    throw new AppError("Password must be at least 8 characters long", 400, "WEAK_PASSWORD");
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new AppError("A user with this email address already exists", 409, "EMAIL_ALREADY_EXISTS");
  }

  // Create User document
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    phone: phone ? phone.trim() : "",
    role: "referral_partner",
    status: "active",
    emailVerified: true,
    emailVerifiedAt: new Date(),
  });

  // Auto-generate Partner Code (referralCode) e.g. RP-PART-1234
  const cleanName = name.replace(/[^A-Za-z]/g, "").substring(0, 4).toUpperCase() || "PART";
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const referralCode = `RP-${cleanName}-${randNum}`;

  // Create ReferralPartner profile
  const adminId = req.user?._id || req.auth?.id || null;

  const partner = await ReferralPartner.create({
    userId: user._id,
    referralCode,
    status: "active",
    kycStatus: "verified",
    partnerLevel: partnerLevel || "Authorized",
    territory: territory ? territory.trim() : "",
    occupation: occupation ? occupation.trim() : "",
    profileCompletion: 80,
    createdBy: adminId,
  });

  user.password = undefined;

  res.status(201).json({
    success: true,
    message: `Referral Partner account created successfully! Partner ID: ${referralCode}`,
    data: { partner, user, referralCode },
    error: null,
  });
});

// 5. UPDATE PARTNER DETAILS (Admin Only)
export const updatePartnerAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, partnerLevel, territory, occupation, status } = req.body;

  const partner = await ReferralPartner.findOne({ _id: id, isDeleted: false });
  if (!partner) {
    throw new AppError("Partner not found", 404, "PARTNER_NOT_FOUND");
  }

  const user = await User.findById(partner.userId);
  if (!user) {
    throw new AppError("Associated user account not found", 404, "USER_NOT_FOUND");
  }

  if (email && email.toLowerCase().trim() !== user.email) {
    const existingUser = await User.findOne({ email: email.toLowerCase().trim(), _id: { $ne: user._id } });
    if (existingUser) {
      throw new AppError("Email address is already in use by another account", 409, "EMAIL_ALREADY_EXISTS");
    }
    user.email = email.toLowerCase().trim();
  }

  if (name) user.name = name.trim();
  if (phone !== undefined) user.phone = phone.trim();

  if (status && ["active", "inactive", "suspended"].includes(status)) {
    user.status = status;
    partner.status = status;
  }

  await user.save();

  if (partnerLevel) partner.partnerLevel = partnerLevel;
  if (territory !== undefined) partner.territory = territory.trim();
  if (occupation !== undefined) partner.occupation = occupation.trim();
  await partner.save();

  res.status(200).json({
    success: true,
    message: "Partner details updated successfully",
    data: { partner, user },
    error: null,
  });
});

// 6. ACTIVATE PARTNER ACCOUNT
export const activatePartnerAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const partner = await ReferralPartner.findOne({ _id: id, isDeleted: false });
  if (!partner) {
    throw new AppError("Partner not found", 404, "PARTNER_NOT_FOUND");
  }

  partner.status = "active";
  partner.kycStatus = "verified";
  await partner.save();

  await User.findByIdAndUpdate(partner.userId, { status: "active" });

  res.status(200).json({
    success: true,
    message: "Partner account activated successfully",
    data: { partner },
    error: null,
  });
});

// 7. DEACTIVATE PARTNER ACCOUNT
export const deactivatePartnerAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const partner = await ReferralPartner.findOne({ _id: id, isDeleted: false });
  if (!partner) {
    throw new AppError("Partner not found", 404, "PARTNER_NOT_FOUND");
  }

  partner.status = "inactive";
  await partner.save();

  await User.findByIdAndUpdate(partner.userId, { status: "inactive" });

  res.status(200).json({
    success: true,
    message: "Partner account deactivated",
    data: { partner },
    error: null,
  });
});

// 8. SUSPEND PARTNER ACCOUNT
export const suspendPartnerAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const partner = await ReferralPartner.findOne({ _id: id, isDeleted: false });
  if (!partner) {
    throw new AppError("Partner not found", 404, "PARTNER_NOT_FOUND");
  }

  partner.status = "suspended";
  partner.kycStatus = "rejected";
  await partner.save();

  await User.findByIdAndUpdate(partner.userId, { status: "suspended" });

  res.status(200).json({
    success: true,
    message: "Partner account suspended",
    data: { partner },
    error: null,
  });
});

// 9. APPROVE PARTNER (For Backwards Compatibility)
export const approvePartner = asyncHandler(async (req, res) => {
  return activatePartnerAdmin(req, res);
});

// 10. REJECT PARTNER (For Backwards Compatibility)
export const rejectPartner = asyncHandler(async (req, res) => {
  return suspendPartnerAdmin(req, res);
});

// 11. UPDATE PARTNER LEVEL TIER
export const updatePartnerLevel = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { partnerLevel } = req.body;

  const validLevels = ["Authorized", "Verified", "Gold", "Platinum"];
  if (!partnerLevel || !validLevels.includes(partnerLevel)) {
    throw new AppError("Invalid partner level tier", 400, "INVALID_LEVEL");
  }

  const partner = await ReferralPartner.findOne({ _id: id, isDeleted: false });
  if (!partner) {
    throw new AppError("Partner not found", 404, "PARTNER_NOT_FOUND");
  }

  partner.partnerLevel = partnerLevel;
  await partner.save();

  res.status(200).json({
    success: true,
    message: `Partner tier upgraded to ${partnerLevel}`,
    data: { partner },
    error: null,
  });
});

// 12. RESET PARTNER PASSWORD (Admin Only)
export const resetPartnerPasswordAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 8) {
    throw new AppError("New password must be at least 8 characters long", 400, "INVALID_PASSWORD");
  }

  const partner = await ReferralPartner.findOne({ _id: id, isDeleted: false });
  if (!partner) {
    throw new AppError("Partner not found", 404, "PARTNER_NOT_FOUND");
  }

  const user = await User.findById(partner.userId);
  if (!user) {
    throw new AppError("Associated user account not found", 404, "USER_NOT_FOUND");
  }

  user.password = newPassword;
  user.passwordChangedAt = new Date();
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  user.sessionVersion = (user.sessionVersion || 0) + 1;
  user.refreshTokenHash = null;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Partner password reset successfully by Admin",
    data: null,
    error: null,
  });
});

// 13. DELETE PARTNER (Soft Delete)
export const deletePartnerAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const partner = await ReferralPartner.findOne({ _id: id, isDeleted: false });
  if (!partner) {
    throw new AppError("Partner not found", 404, "PARTNER_NOT_FOUND");
  }

  partner.isDeleted = true;
  await partner.save();

  await User.findByIdAndUpdate(partner.userId, { status: "inactive" });

  res.status(200).json({
    success: true,
    message: "Partner account deleted successfully",
    data: null,
    error: null,
  });
});
