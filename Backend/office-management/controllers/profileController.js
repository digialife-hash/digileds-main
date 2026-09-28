import bcrypt from "bcryptjs";
import User from "../models/User.js";
import ReferralPartner from "../models/ReferralPartner.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import AdminSession from "../../models/admin-session.model.js";

// Helper: Calculate Profile Completion Percentage
const calculateCompletion = (user, partner) => {
  let score = 0;
  if (user?.name) score += 15;
  if (user?.email) score += 15;
  if (user?.phone) score += 10;
  if (partner?.dob) score += 10;
  if (partner?.gender) score += 10;
  if (partner?.address?.street && partner?.address?.city) score += 15;
  if (partner?.bankDetails?.accountNumber && partner?.bankDetails?.ifscCode) score += 15;
  if (partner?.profilePicture) score += 10;
  return Math.min(100, score);
};

// 1. GET PROFILE DASHBOARD & DETAILS
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  let partner = await ReferralPartner.findOne({ userId: req.user._id });
  if (!partner && req.user.role === "referral_partner") {
    // Auto-create partner doc if missing
    partner = await ReferralPartner.create({
      userId: req.user._id,
      referralCode: `REF-${Math.floor(10000 + Math.random() * 90000)}`,
    });
  }

  const completion = partner ? calculateCompletion(user, partner) : 100;
  if (partner && partner.profileCompletion !== completion) {
    partner.profileCompletion = completion;
    await partner.save();
  }

  res.status(200).json({
    success: true,
    message: "Profile details retrieved",
    data: {
      user,
      partner,
      dashboard: {
        profileCompletion: completion,
        verificationStatus: partner?.kycStatus || "pending",
        accountStatus: partner?.status || "active",
        partnerLevel: partner?.partnerLevel || "Authorized",
        joiningDate: partner?.createdAt || user.createdAt,
        lastLogin: partner?.lastLoginAt || user.updatedAt,
        referralCode: partner?.referralCode || "",
      },
    },
    error: null,
  });
});

// 2. UPDATE PERSONAL DETAILS
export const updatePersonalDetails = asyncHandler(async (req, res) => {
  const { name, dob, gender, occupation, address } = req.body;

  const user = await User.findById(req.user._id);
  if (name) user.name = name;
  await user.save();

  let partner = await ReferralPartner.findOne({ userId: req.user._id });
  if (!partner) {
    partner = new ReferralPartner({ userId: req.user._id, referralCode: `REF-${Math.floor(10000 + Math.random() * 90000)}` });
  }

  if (dob) partner.dob = new Date(dob);
  if (gender) partner.gender = gender;
  if (occupation) partner.occupation = occupation;
  if (address) partner.address = { ...partner.address, ...address };

  partner.profileCompletion = calculateCompletion(user, partner);
  await partner.save();

  res.status(200).json({
    success: true,
    message: "Personal details updated successfully",
    data: { user, partner },
    error: null,
  });
});

// 3. UPDATE CONTACT DETAILS
export const updateContactDetails = asyncHandler(async (req, res) => {
  const { phone, alternateMobile, emergencyContact } = req.body;

  const user = await User.findById(req.user._id);
  if (phone) user.phone = phone;
  await user.save();

  let partner = await ReferralPartner.findOne({ userId: req.user._id });
  if (partner) {
    if (alternateMobile) partner.alternateMobile = alternateMobile;
    if (emergencyContact) partner.emergencyContact = emergencyContact;
    await partner.save();
  }

  res.status(200).json({
    success: true,
    message: "Contact details updated successfully",
    data: { user, partner },
    error: null,
  });
});

// 4. UPDATE BANK DETAILS
export const updateBankDetails = asyncHandler(async (req, res) => {
  const { accountHolderName, bankName, accountNumber, ifscCode, branchName, upiId } = req.body;

  let partner = await ReferralPartner.findOne({ userId: req.user._id });
  if (!partner) {
    partner = new ReferralPartner({ userId: req.user._id, referralCode: `REF-${Math.floor(10000 + Math.random() * 90000)}` });
  }

  partner.bankDetails = {
    accountHolderName: accountHolderName || partner.bankDetails?.accountHolderName || "",
    bankName: bankName || partner.bankDetails?.bankName || "",
    accountNumber: accountNumber || partner.bankDetails?.accountNumber || "",
    ifscCode: ifscCode || partner.bankDetails?.ifscCode || "",
    branchName: branchName || partner.bankDetails?.branchName || "",
    upiId: upiId || partner.bankDetails?.upiId || "",
  };

  const user = await User.findById(req.user._id);
  partner.profileCompletion = calculateCompletion(user, partner);
  await partner.save();

  res.status(200).json({
    success: true,
    message: "Bank details updated successfully",
    data: { bankDetails: partner.bankDetails },
    error: null,
  });
});

// 5. UPLOAD PROFILE PICTURE
export const uploadProfilePicture = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("Profile image file is required", 400, "MISSING_FILE");
  }

  const pictureUrl = `/uploads/${req.file.filename}`;

  if (req.user?._id && req.user._id !== "000000000000000000000000") {
    await User.findByIdAndUpdate(req.user._id, { profilePicture: pictureUrl });
  }

  let partner = await ReferralPartner.findOne({ userId: req.user._id });
  if (partner) {
    partner.profilePicture = pictureUrl;
    await partner.save();
  }

  res.status(200).json({
    success: true,
    message: "Profile picture uploaded successfully",
    data: { profilePicture: pictureUrl },
    error: null,
  });
});

// 6. CHANGE PASSWORD
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError("Current password and new password are required", 400, "MISSING_PASSWORDS");
  }

  const user = await User.findById(req.user._id).select("+password");
  if (!user) {
    throw new AppError("User account not found", 404, "USER_NOT_FOUND");
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new AppError("Current password is incorrect", 401, "INVALID_CURRENT_PASSWORD");
  }

  user.password = newPassword;
  user.passwordChangedAt = new Date();
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  user.sessionVersion = (user.sessionVersion || 0) + 1;
  user.refreshTokenHash = null;
  user.failedLoginAttempts = 0;
  user.failedLoginLockedUntil = null;
  await user.save();
  await AdminSession.updateMany(
    { userId: String(user._id), revokedAt: null },
    { $set: { revokedAt: new Date() } },
  );

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
    data: null,
    error: null,
  });
});
