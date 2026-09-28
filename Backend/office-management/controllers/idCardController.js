import mongoose from "mongoose";
import crypto from "crypto";
import IDCard from "../models/IDCard.js";
import IDCardHistory from "../models/IDCardHistory.js";
import IDCardRenewal from "../models/IDCardRenewal.js";
import IDCardRevocation from "../models/IDCardRevocation.js";
import QRVerificationLog from "../models/QRVerificationLog.js";
import ReferralPartner from "../models/ReferralPartner.js";
import Employee from "../models/Employee.js";
import Settings from "../models/Settings.js";
import Notification from "../models/Notification.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { generateUniqueCardNumber } from "../utils/idCardNumberGenerator.js";

// Helper to log audit activity
const logIDCardActivity = async (idCardId, entityType, entityId, action, description, performedByUserId) => {
  await IDCardHistory.create({
    idCardId,
    entityType: entityType || "referral_partner",
    entityId: entityId || null,
    partnerId: entityType === "referral_partner" ? entityId : null,
    employeeId: entityType === "employee" ? entityId : null,
    action,
    description,
    performedBy: performedByUserId,
  });
};

// Fetch company settings helper
const getCompanySettingsSnapshot = async () => {
  try {
    const settings = await Settings.findOne();
    if (settings && settings.company) {
      return {
        companyName: settings.company.companyName || "Digital Alife Pvt Ltd",
        companyAddress: settings.company.companyAddress || "Tech Park, Silicon Valley, India",
        companyPhone: settings.company.companyPhone || "+91 9876543210",
        companyEmail: settings.company.companyEmail || "info@digitalalife.com",
        companyWebsite: settings.company.website || "www.digitalalife.com",
      };
    }
  } catch (err) {
    console.error("Error loading company settings snapshot:", err.message);
  }
  return {
    companyName: "Digital Alife Pvt Ltd",
    companyAddress: "Tech Park, Building 4B, Silicon Valley, India",
    companyPhone: "+91 9876543210",
    companyEmail: "info@digitalalife.com",
    companyWebsite: "www.digitalalife.com",
  };
};

// 1. PUBLIC QR VERIFICATION API (by Token or Card Number)
export const verifyQRCodePublic = asyncHandler(async (req, res) => {
  const { cardNumber, token } = req.params;
  const lookupKey = token || cardNumber;

  if (!lookupKey) {
    throw new AppError("Verification token or card number is required", 400, "MISSING_KEY");
  }

  const cleanKey = lookupKey.trim();
  let idCard = await IDCard.findOne({
    $or: [{ verificationToken: cleanKey }, { cardNumber: cleanKey.toUpperCase() }],
    isDeleted: false,
  })
    .populate({ path: "partnerId", populate: { path: "userId", select: "name email phone" } })
    .populate({ path: "employeeId", populate: { path: "userId", select: "name email phone" } });

  const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
  const userAgent = req.headers["user-agent"] || "";

  if (!idCard) {
    await QRVerificationLog.create({
      cardNumber: cleanKey,
      statusAtScan: "Not Found",
      ipAddress,
      userAgent,
    });

    return res.status(404).json({
      success: false,
      message: "ID Card not found or invalid",
      data: {
        verificationStatus: "INVALID",
        reason: "Card or verification token does not exist in company records",
      },
      error: { code: "CARD_NOT_FOUND" },
    });
  }

  // Check Expiry Date
  const isExpired = new Date() > new Date(idCard.expiryDate);
  let currentStatus = idCard.status;

  if (isExpired && currentStatus === "Active") {
    currentStatus = "Expired";
  }

  await QRVerificationLog.create({
    cardNumber: idCard.cardNumber,
    statusAtScan: currentStatus,
    ipAddress,
    userAgent,
  });

  let revocationInfo = null;
  if (currentStatus === "Revoked") {
    revocationInfo = await IDCardRevocation.findOne({ idCardId: idCard._id }).sort({ createdAt: -1 });
  }

  const isEmployee = idCard.entityType === "employee";
  const holderName = idCard.partnerName || (isEmployee ? idCard.employeeId?.name : idCard.partnerId?.userId?.name);
  const displayId = idCard.displayId || idCard.partnerCode || (isEmployee ? idCard.employeeId?._id?.toString()?.slice(-6) : idCard.partnerId?.referralCode);

  res.status(200).json({
    success: true,
    message: `ID Card Verification: ${currentStatus.toUpperCase()}`,
    data: {
      verificationStatus: currentStatus,
      isValid: currentStatus === "Active" || currentStatus === "Renewed",
      entityType: idCard.entityType || "referral_partner",
      cardNumber: idCard.cardNumber,
      holderDetails: {
        name: holderName,
        displayId,
        designation: idCard.designation,
        department: idCard.department || (isEmployee ? idCard.employeeId?.department : ""),
        photo: idCard.partnerPhoto,
        joiningDate: idCard.joiningDate,
        issueDate: idCard.issueDate,
        expiryDate: idCard.expiryDate,
        entityType: idCard.entityType || "referral_partner",
      },
      companyDetails: {
        name: idCard.companyName,
        address: idCard.companyAddress,
        phone: idCard.companyPhone,
        email: idCard.companyEmail,
        website: idCard.companyWebsite,
      },
      revocationDetails: revocationInfo
        ? {
            reason: revocationInfo.reason,
            date: revocationInfo.date,
            time: revocationInfo.time,
            remarks: revocationInfo.remarks,
          }
        : null,
    },
    error: null,
  });
});

// 2. DASHBOARD ANALYTICS (GLOBAL EMPLOYEE & PARTNER)
export const getIDCardDashboardAnalytics = asyncHandler(async (req, res) => {
  const query = { isDeleted: false };

  // RBAC scope
  if (req.user.role === "referral_partner") {
    const partnerDoc = await ReferralPartner.findOne({ userId: req.user._id });
    if (!partnerDoc) {
      return res.status(200).json({
        success: true,
        data: { metrics: { totalIDCards: 0, activeIDCards: 0, employeeCards: 0, partnerCards: 0 } },
      });
    }
    query.$or = [{ partnerId: partnerDoc._id }, { entityId: partnerDoc._id }];
  } else if (req.user.role === "employee") {
    const empDoc = await Employee.findOne({ userId: req.user._id });
    if (!empDoc) {
      return res.status(200).json({
        success: true,
        data: { metrics: { totalIDCards: 0, activeIDCards: 0, employeeCards: 0, partnerCards: 0 } },
      });
    }
    query.$or = [{ employeeId: empDoc._id }, { entityId: empDoc._id }];
  }

  const idCards = await IDCard.find(query);

  let totalIDCards = 0;
  let activeIDCards = 0;
  let expiredIDCards = 0;
  let renewedIDCards = 0;
  let revokedIDCards = 0;
  let suspendedCards = 0;
  let employeeCards = 0;
  let partnerCards = 0;

  idCards.forEach((card) => {
    totalIDCards++;
    const isExpired = new Date() > new Date(card.expiryDate);
    let cardStatus = card.status;
    if (isExpired && cardStatus === "Active") cardStatus = "Expired";

    if (cardStatus === "Active") activeIDCards++;
    if (cardStatus === "Expired") expiredIDCards++;
    if (cardStatus === "Renewed") renewedIDCards++;
    if (cardStatus === "Revoked") revokedIDCards++;
    if (cardStatus === "Suspended") suspendedCards++;

    if (card.entityType === "employee") {
      employeeCards++;
    } else {
      partnerCards++;
    }
  });

  res.status(200).json({
    success: true,
    data: {
      metrics: {
        totalIDCards,
        activeIDCards,
        employeeCards,
        partnerCards,
        expiredIDCards,
        renewedIDCards,
        revokedIDCards,
        suspendedCards,
      },
    },
    error: null,
  });
});

// 3. GENERATE ID CARD (Admin / HR) - Supports both Employee & Referral Partner
export const generateIDCard = asyncHandler(async (req, res) => {
  const {
    entityType = "referral_partner",
    entityId,
    employeeId,
    partnerId,
    partnerName: customPartnerName,
    partnerCode: customPartnerCode,
    designation: customDesignation,
    department: customDepartment,
    joiningDate: customJoiningDate,
    expiryDate: customExpiryDate,
    companyName: customCompanyName,
    cardOrientation,
    cardSize,
  } = req.body;

  if (req.user.role !== "super_admin" && req.user.role !== "admin") {
    throw new AppError("Only Admins can generate ID Cards", 403, "PERMISSION_DENIED");
  }

  const targetEntityType = (entityType || (employeeId ? "employee" : "referral_partner")).toLowerCase();
  const targetEntityId = entityId || (targetEntityType === "employee" ? employeeId : partnerId);

  let employeeDoc = null;
  let partnerDoc = null;
  let finalName = customPartnerName?.trim() || "";
  let finalCode = customPartnerCode?.trim() || "";
  let finalDesignation = customDesignation?.trim() || "";
  let finalDepartment = customDepartment?.trim() || "";
  let finalJoiningDate = customJoiningDate ? new Date(customJoiningDate) : new Date();
  let photoUrl = "";

  const companySnapshot = await getCompanySettingsSnapshot();

  if (targetEntityType === "employee") {
    if (!targetEntityId) {
      throw new AppError("Please select an employee", 400, "MISSING_EMPLOYEE_ID");
    }

    employeeDoc = await Employee.findById(targetEntityId).populate("userId");
    if (!employeeDoc) {
      throw new AppError("Employee record not found", 404, "EMPLOYEE_NOT_FOUND");
    }

    // Check if active card already exists for employee
    const existingActiveCard = await IDCard.findOne({
      $or: [{ entityId: employeeDoc._id }, { employeeId: employeeDoc._id }],
      isDeleted: false,
      status: { $in: ["Active", "Renewed"] },
    });

    if (existingActiveCard) {
      throw new AppError(
        `An active ID Card (${existingActiveCard.cardNumber}) already exists for ${employeeDoc.name}`,
        400,
        "DUPLICATE_ACTIVE_CARD"
      );
    }

    finalName = finalName || employeeDoc.name;
    finalCode = finalCode || employeeDoc.email?.split("@")[0]?.toUpperCase() || `EMP-${employeeDoc._id.toString().slice(-4)}`;
    finalDesignation = finalDesignation || employeeDoc.designation || "Employee";
    finalDepartment = finalDepartment || employeeDoc.department || "General";
    finalJoiningDate = employeeDoc.joiningDate ? new Date(employeeDoc.joiningDate) : finalJoiningDate;

    photoUrl = employeeDoc.userId?.profilePicture || "";
  } else {
    // Referral Partner
    if (targetEntityId && mongoose.Types.ObjectId.isValid(targetEntityId)) {
      partnerDoc = await ReferralPartner.findById(targetEntityId).populate("userId");
      if (partnerDoc) {
        finalName = finalName || partnerDoc.userId?.name || "Partner Name";
        finalCode = finalCode || partnerDoc.referralCode || `RP-${partnerDoc._id.toString().slice(-4)}`;
        finalDesignation = finalDesignation || "Authorized Referral Partner";
        finalJoiningDate = partnerDoc.createdAt ? new Date(partnerDoc.createdAt) : finalJoiningDate;
        photoUrl = partnerDoc.profilePicture || partnerDoc.userId?.profilePicture || "";
      }
    }
  }

  // Handle uploaded photo if passed
  if (req.file) {
    photoUrl = `/uploads/${req.file.filename}`;
  }

  if (!finalName) {
    throw new AppError("Holder name is required", 400, "MISSING_NAME");
  }

  if (!finalCode) {
    finalCode = targetEntityType === "employee" ? `EMP-${Math.floor(1000 + Math.random() * 9000)}` : `RP-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  const cardNumber = await generateUniqueCardNumber(targetEntityType, finalCode);
  const verificationToken = crypto.randomBytes(16).toString("hex");

  const defaultExpiry = new Date();
  defaultExpiry.setFullYear(defaultExpiry.getFullYear() + 1);

  const qrData = `http://localhost:5173/verify-id-card/${verificationToken}`;

  const idCard = await IDCard.create({
    entityType: targetEntityType,
    entityId: targetEntityType === "employee" ? (employeeDoc?._id || null) : (partnerDoc?._id || null),
    employeeId: targetEntityType === "employee" ? (employeeDoc?._id || null) : null,
    partnerId: targetEntityType === "referral_partner" ? (partnerDoc?._id || null) : null,
    cardNumber,
    displayId: finalCode,
    partnerPhoto: photoUrl,
    partnerName: finalName,
    partnerCode: finalCode,
    designation: finalDesignation || (targetEntityType === "employee" ? "Employee" : "Authorized Referral Partner"),
    department: finalDepartment,
    joiningDate: finalJoiningDate,
    issueDate: new Date(),
    expiryDate: customExpiryDate ? new Date(customExpiryDate) : defaultExpiry,
    status: "Active",
    verificationToken,
    qrCodeData: qrData,
    companyName: customCompanyName || companySnapshot.companyName,
    companyAddress: companySnapshot.companyAddress,
    companyPhone: companySnapshot.companyPhone,
    companyEmail: companySnapshot.companyEmail,
    companyWebsite: companySnapshot.companyWebsite,
    cardOrientation: cardOrientation || "Portrait",
    cardSize: cardSize || "PVC Card",
    issuedBy: req.user._id,
  });

  await logIDCardActivity(
    idCard._id,
    targetEntityType,
    targetEntityType === "employee" ? employeeDoc?._id : partnerDoc?._id,
    "ID Generated",
    `Generated ${targetEntityType.toUpperCase()} ID Card (${cardNumber}) for ${finalName}`,
    req.user._id
  );

  // Send Notification if recipient user exists
  const recipientUserId = targetEntityType === "employee" ? employeeDoc?.userId?._id : partnerDoc?.userId?._id;
  if (recipientUserId) {
    await Notification.create({
      recipientUser: recipientUserId,
      title: "Digital ID Card Generated",
      message: `Your official digital ID Card (${cardNumber}) has been generated. You can view, preview, or print it in your dashboard.`,
      type: "id_card",
    });
  }

  res.status(201).json({
    success: true,
    message: "ID Card generated successfully",
    data: { idCard },
    error: null,
  });
});

// 4. GET ID CARDS (Search, Filter by entityType, Status, Department, Pagination)
export const getIDCards = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    status = "",
    entityType = "",
    partnerId = "",
    employeeId = "",
    department = "",
    designation = "",
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const query = { isDeleted: false };

  if (entityType && entityType !== "all") {
    query.entityType = entityType;
  }

  if (status && status !== "all") {
    query.status = status;
  }

  if (department) {
    query.department = { $regex: department, $options: "i" };
  }

  if (partnerId) {
    query.$or = [{ partnerId }, { entityId: partnerId }];
  }

  if (employeeId) {
    query.$or = [{ employeeId }, { entityId: employeeId }];
  }

  if (search.trim()) {
    const s = search.trim();
    query.$or = [
      { partnerName: { $regex: s, $options: "i" } },
      { cardNumber: { $regex: s, $options: "i" } },
      { partnerCode: { $regex: s, $options: "i" } },
      { displayId: { $regex: s, $options: "i" } },
      { designation: { $regex: s, $options: "i" } },
      { department: { $regex: s, $options: "i" } },
    ];
  }

  // RBAC scope for Partners & Employees
  if (req.user.role === "referral_partner") {
    const partnerDoc = await ReferralPartner.findOne({ userId: req.user._id });
    if (!partnerDoc) {
      return res.status(200).json({
        success: true,
        data: { idCards: [], pagination: { total: 0, page: 1, pages: 0 } },
      });
    }
    query.$or = [{ partnerId: partnerDoc._id }, { entityId: partnerDoc._id }];
  } else if (req.user.role === "employee") {
    const empDoc = await Employee.findOne({ userId: req.user._id });
    if (!empDoc) {
      return res.status(200).json({
        success: true,
        data: { idCards: [], pagination: { total: 0, page: 1, pages: 0 } },
      });
    }
    query.$or = [{ employeeId: empDoc._id }, { entityId: empDoc._id }];
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  const total = await IDCard.countDocuments(query);
  const idCards = await IDCard.find(query)
    .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
    .skip(skip)
    .limit(limitNum)
    .populate({ path: "partnerId", populate: { path: "userId", select: "name email phone" } })
    .populate({ path: "employeeId", populate: { path: "userId", select: "name email phone" } });

  res.status(200).json({
    success: true,
    data: {
      idCards,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    },
    error: null,
  });
});

// 5. GET MY ID CARD (Logged-in Employee or Referral Partner)
export const getMyIDCard = asyncHandler(async (req, res) => {
  let query = { isDeleted: false };

  if (req.user.role === "employee") {
    const emp = await Employee.findOne({ userId: req.user._id });
    if (!emp) {
      return res.status(404).json({
        success: false,
        message: "No employee record associated with your user account",
        data: null,
      });
    }
    query.$or = [{ employeeId: emp._id }, { entityId: emp._id }];
  } else if (req.user.role === "referral_partner") {
    const partner = await ReferralPartner.findOne({ userId: req.user._id });
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "No partner record associated with your user account",
        data: null,
      });
    }
    query.$or = [{ partnerId: partner._id }, { entityId: partner._id }];
  } else {
    throw new AppError("My ID Card is available only for Employees or Referral Partners", 400, "INVALID_ROLE");
  }

  const idCard = await IDCard.findOne(query).sort({ createdAt: -1 });

  if (!idCard) {
    return res.status(404).json({
      success: false,
      message: "No ID Card has been generated for your profile yet.",
      data: null,
    });
  }

  res.status(200).json({
    success: true,
    data: { idCard },
    error: null,
  });
});

// 6. GET SINGLE ID CARD BY ID
export const getIDCardById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const idCard = await IDCard.findOne({ _id: id, isDeleted: false })
    .populate({ path: "partnerId", populate: { path: "userId", select: "name email phone" } })
    .populate({ path: "employeeId", populate: { path: "userId", select: "name email phone" } });

  if (!idCard) {
    throw new AppError("ID Card not found", 404, "NOT_FOUND");
  }

  const history = await IDCardHistory.find({ idCardId: idCard._id })
    .sort({ createdAt: -1 })
    .populate("performedBy", "name email role");

  const renewals = await IDCardRenewal.find({ idCardId: idCard._id })
    .sort({ createdAt: -1 })
    .populate("renewedBy", "name email");

  const revocations = await IDCardRevocation.find({ idCardId: idCard._id })
    .sort({ createdAt: -1 })
    .populate("revokedBy", "name email");

  res.status(200).json({
    success: true,
    data: {
      idCard,
      history,
      renewals,
      revocations,
    },
    error: null,
  });
});

// 7. RENEW ID CARD
export const renewIDCard = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { newExpiryDate, renewalReason } = req.body;

  if (req.user.role !== "super_admin" && req.user.role !== "admin") {
    throw new AppError("Only Admins can renew ID Cards", 403, "PERMISSION_DENIED");
  }

  const idCard = await IDCard.findOne({ _id: id, isDeleted: false });
  if (!idCard) {
    throw new AppError("ID Card not found", 404, "NOT_FOUND");
  }

  const previousExpiryDate = idCard.expiryDate;
  const expiry = newExpiryDate ? new Date(newExpiryDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  idCard.expiryDate = expiry;
  idCard.status = "Active";
  idCard.renewedBy = req.user._id;
  idCard.renewedAt = new Date();
  await idCard.save();

  await IDCardRenewal.create({
    idCardId: idCard._id,
    entityType: idCard.entityType,
    entityId: idCard.entityId,
    previousExpiryDate,
    newExpiryDate: expiry,
    renewedBy: req.user._id,
    reason: renewalReason || "Annual Renewal",
  });

  await logIDCardActivity(
    idCard._id,
    idCard.entityType,
    idCard.entityId,
    "ID Renewed",
    `Renewed until ${expiry.toISOString().split("T")[0]}. Reason: ${renewalReason || "Regular renewal"}`,
    req.user._id
  );

  res.status(200).json({
    success: true,
    message: "ID Card renewed successfully",
    data: { idCard },
    error: null,
  });
});

// 8. REVOKE ID CARD
export const revokeIDCard = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason, remarks } = req.body;

  if (req.user.role !== "super_admin" && req.user.role !== "admin") {
    throw new AppError("Only Admins can revoke ID Cards", 403, "PERMISSION_DENIED");
  }

  if (!reason || !reason.trim()) {
    throw new AppError("Revocation reason is required", 400, "MISSING_REASON");
  }

  const idCard = await IDCard.findOne({ _id: id, isDeleted: false });
  if (!idCard) {
    throw new AppError("ID Card not found", 404, "NOT_FOUND");
  }

  idCard.status = "Revoked";
  idCard.revokedBy = req.user._id;
  idCard.revokedAt = new Date();
  idCard.revocationReason = reason.trim();
  await idCard.save();

  const now = new Date();
  await IDCardRevocation.create({
    idCardId: idCard._id,
    entityType: idCard.entityType,
    entityId: idCard.entityId,
    reason: reason.trim(),
    remarks: remarks?.trim() || "",
    revokedBy: req.user._id,
    date: now.toISOString().split("T")[0],
    time: now.toLocaleTimeString("en-US"),
  });

  await logIDCardActivity(
    idCard._id,
    idCard.entityType,
    idCard.entityId,
    "ID Revoked",
    `Revoked. Reason: ${reason.trim()}`,
    req.user._id
  );

  res.status(200).json({
    success: true,
    message: "ID Card revoked successfully",
    data: { idCard },
    error: null,
  });
});

// 9. SUSPEND ID CARD
export const suspendIDCard = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (req.user.role !== "super_admin" && req.user.role !== "admin") {
    throw new AppError("Only Admins can suspend ID Cards", 403, "PERMISSION_DENIED");
  }

  const idCard = await IDCard.findOne({ _id: id, isDeleted: false });
  if (!idCard) {
    throw new AppError("ID Card not found", 404, "NOT_FOUND");
  }

  const newStatus = idCard.status === "Suspended" ? "Active" : "Suspended";
  idCard.status = newStatus;
  await idCard.save();

  await logIDCardActivity(
    idCard._id,
    idCard.entityType,
    idCard.entityId,
    `ID ${newStatus}`,
    `Card status changed to ${newStatus}. ${reason ? `Reason: ${reason}` : ""}`,
    req.user._id
  );

  res.status(200).json({
    success: true,
    message: `ID Card status updated to ${newStatus}`,
    data: { idCard },
    error: null,
  });
});

// 10. REGENERATE QR TOKEN
export const regenerateQRToken = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== "super_admin" && req.user.role !== "admin") {
    throw new AppError("Only Admins can regenerate QR tokens", 403, "PERMISSION_DENIED");
  }

  const idCard = await IDCard.findOne({ _id: id, isDeleted: false });
  if (!idCard) {
    throw new AppError("ID Card not found", 404, "NOT_FOUND");
  }

  const newToken = crypto.randomBytes(16).toString("hex");
  idCard.verificationToken = newToken;
  idCard.qrCodeData = `http://localhost:5173/verify-id-card/${newToken}`;
  await idCard.save();

  await logIDCardActivity(
    idCard._id,
    idCard.entityType,
    idCard.entityId,
    "QR Regenerated",
    `Regenerated secure QR verification token.`,
    req.user._id
  );

  res.status(200).json({
    success: true,
    message: "QR verification token regenerated successfully",
    data: { idCard },
    error: null,
  });
});

// 11. UPDATE ID CARD
export const updateIDCard = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const idCard = await IDCard.findOne({ _id: id, isDeleted: false });
  if (!idCard) {
    throw new AppError("ID Card not found", 404, "NOT_FOUND");
  }

  if (req.file) {
    updates.partnerPhoto = `/uploads/${req.file.filename}`;
  }

  Object.assign(idCard, updates);
  await idCard.save();

  res.status(200).json({
    success: true,
    message: "ID Card updated successfully",
    data: { idCard },
    error: null,
  });
});

// 12. DELETE ID CARD (Soft Delete)
export const deleteIDCard = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const idCard = await IDCard.findOne({ _id: id, isDeleted: false });
  if (!idCard) {
    throw new AppError("ID Card not found", 404, "NOT_FOUND");
  }

  idCard.isDeleted = true;
  idCard.deletedAt = new Date();
  await idCard.save();

  res.status(200).json({
    success: true,
    message: "ID Card deleted successfully",
    data: null,
    error: null,
  });
});

// 13. EXPORT ID CARDS
export const exportIDCards = asyncHandler(async (req, res) => {
  const idCards = await IDCard.find({ isDeleted: false }).sort({ createdAt: -1 });

  const csvRows = [
    [
      "Card Number",
      "Entity Type",
      "Holder Name",
      "Display ID",
      "Designation",
      "Department",
      "Status",
      "Issue Date",
      "Expiry Date",
    ].join(","),
  ];

  idCards.forEach((c) => {
    csvRows.push(
      [
        `"${c.cardNumber}"`,
        `"${c.entityType || "referral_partner"}"`,
        `"${c.partnerName}"`,
        `"${c.partnerCode || c.displayId}"`,
        `"${c.designation}"`,
        `"${c.department || ""}"`,
        `"${c.status}"`,
        `"${c.issueDate ? c.issueDate.toISOString().split("T")[0] : ""}"`,
        `"${c.expiryDate ? c.expiryDate.toISOString().split("T")[0] : ""}"`,
      ].join(",")
    );
  });

  const csvString = csvRows.join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=id-cards-export-${Date.now()}.csv`);
  res.status(200).send(csvString);
});
