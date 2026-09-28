import mongoose from "mongoose";
import crypto from "crypto";
import Certificate from "../models/Certificate.js";
import CertificateType from "../models/CertificateType.js";
import CertificateHistory from "../models/CertificateHistory.js";
import CertificateRenewal from "../models/CertificateRenewal.js";
import CertificateRevocation from "../models/CertificateRevocation.js";
import CertificateVerificationLog from "../models/CertificateVerificationLog.js";
import ReferralPartner from "../models/ReferralPartner.js";
import Employee from "../models/Employee.js";
import Settings from "../models/Settings.js";
import Notification from "../models/Notification.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { generateUniqueCertificateNumber } from "../utils/certificateNumberGenerator.js";

// Helper to log audit activity
const logCertificateActivity = async (certificateId, entityType, entityId, action, description, performedByUserId) => {
  await CertificateHistory.create({
    certificateId,
    entityType: entityType || "referral_partner",
    entityId: entityId || null,
    partnerId: entityType === "referral_partner" ? entityId : null,
    employeeId: entityType === "employee" ? entityId : null,
    action,
    description,
    performedBy: performedByUserId,
  });
};

// 1. PUBLIC CERTIFICATE VERIFICATION API (by Token or Certificate Number)
export const verifyCertificatePublic = asyncHandler(async (req, res) => {
  const { certificateNumber, token } = req.params;
  const lookupKey = token || certificateNumber;

  if (!lookupKey) {
    throw new AppError("Certificate number or verification token is required", 400, "MISSING_KEY");
  }

  const cleanKey = lookupKey.trim();
  let certificate = await Certificate.findOne({
    $or: [{ verificationToken: cleanKey }, { certificateNumber: cleanKey.toUpperCase() }],
    isDeleted: false,
  })
    .populate({ path: "partnerId", populate: { path: "userId", select: "name email phone" } })
    .populate({ path: "employeeId", populate: { path: "userId", select: "name email phone" } });

  const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
  const userAgent = req.headers["user-agent"] || "";

  if (!certificate) {
    await CertificateVerificationLog.create({
      certificateNumber: cleanKey,
      statusAtScan: "Not Found",
      ipAddress,
      userAgent,
    });

    return res.status(404).json({
      success: false,
      message: "Certificate not found or invalid",
      data: {
        verificationStatus: "INVALID",
        reason: "Certificate number does not exist in company records",
      },
      error: { code: "CERTIFICATE_NOT_FOUND" },
    });
  }

  const isExpired = new Date() > new Date(certificate.expiryDate);
  let currentStatus = certificate.status;

  if (isExpired && currentStatus === "Active") {
    currentStatus = "Expired";
  }

  await CertificateVerificationLog.create({
    certificateNumber: certificate.certificateNumber,
    statusAtScan: currentStatus,
    ipAddress,
    userAgent,
  });

  let revocationInfo = null;
  if (currentStatus === "Revoked") {
    revocationInfo = await CertificateRevocation.findOne({ certificateId: certificate._id }).sort({ createdAt: -1 });
  }

  const isEmployee = certificate.entityType === "employee";
  const holderName = certificate.partnerName || (isEmployee ? certificate.employeeId?.name : certificate.partnerId?.userId?.name);
  const displayId = certificate.displayId || certificate.partnerCode || (isEmployee ? certificate.employeeId?._id?.toString()?.slice(-6) : certificate.partnerId?.referralCode);

  res.status(200).json({
    success: true,
    message: `Certificate Verification: ${currentStatus.toUpperCase()}`,
    data: {
      verificationStatus: currentStatus,
      isValid: currentStatus === "Active" || currentStatus === "Renewed",
      entityType: certificate.entityType || "referral_partner",
      certificateDetails: {
        certificateNumber: certificate.certificateNumber,
        certificateType: certificate.certificateType,
        holderName,
        displayId,
        designation: certificate.designation,
        department: certificate.department,
        achievement: certificate.achievement,
        description: certificate.description,
        issueDate: certificate.issueDate,
        expiryDate: certificate.expiryDate,
        authorizedSignatory: certificate.authorizedSignatory,
        entityType: certificate.entityType || "referral_partner",
      },
      companyDetails: {
        name: certificate.companyName,
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

// 2. DASHBOARD ANALYTICS
export const getCertificateDashboardAnalytics = asyncHandler(async (req, res) => {
  const query = { isDeleted: false };

  if (req.user.role === "referral_partner") {
    const partnerDoc = await ReferralPartner.findOne({ userId: req.user._id });
    if (!partnerDoc) {
      return res.status(200).json({
        success: true,
        data: { metrics: { totalCertificates: 0, activeCertificates: 0, employeeCerts: 0, partnerCerts: 0 } },
      });
    }
    query.$or = [{ partnerId: partnerDoc._id }, { entityId: partnerDoc._id }];
  } else if (req.user.role === "employee") {
    const empDoc = await Employee.findOne({ userId: req.user._id });
    if (!empDoc) {
      return res.status(200).json({
        success: true,
        data: { metrics: { totalCertificates: 0, activeCertificates: 0, employeeCerts: 0, partnerCerts: 0 } },
      });
    }
    query.$or = [{ employeeId: empDoc._id }, { entityId: empDoc._id }];
  }

  const certificates = await Certificate.find(query);

  let totalCertificates = 0;
  let activeCertificates = 0;
  let expiredCertificates = 0;
  let renewedCertificates = 0;
  let revokedCertificates = 0;
  let employeeCerts = 0;
  let partnerCerts = 0;

  certificates.forEach((cert) => {
    totalCertificates++;
    const isExpired = new Date() > new Date(cert.expiryDate);
    let certStatus = cert.status;
    if (isExpired && certStatus === "Active") certStatus = "Expired";

    if (certStatus === "Active") activeCertificates++;
    if (certStatus === "Expired") expiredCertificates++;
    if (certStatus === "Renewed") renewedCertificates++;
    if (certStatus === "Revoked") revokedCertificates++;

    if (cert.entityType === "employee") {
      employeeCerts++;
    } else {
      partnerCerts++;
    }
  });

  res.status(200).json({
    success: true,
    data: {
      metrics: {
        totalCertificates,
        activeCertificates,
        employeeCerts,
        partnerCerts,
        expiredCertificates,
        renewedCertificates,
        revokedCertificates,
      },
    },
    error: null,
  });
});

// 3. GENERATE CERTIFICATE (Admin / HR) - Supports both Employee & Referral Partner
export const generateCertificate = asyncHandler(async (req, res) => {
  const {
    entityType = "referral_partner",
    entityId,
    employeeId,
    partnerId,
    certificateType,
    partnerName: customHolderName,
    partnerCode: customDisplayId,
    designation: customDesignation,
    department: customDepartment,
    achievement,
    description,
    companyName,
    authorizedSignatory,
    issueDate,
    expiryDate,
    orientation,
    paperSize,
  } = req.body;

  if (req.user.role !== "super_admin" && req.user.role !== "admin") {
    throw new AppError("Only Admins can issue Certificates", 403, "PERMISSION_DENIED");
  }

  const targetEntityType = (entityType || (employeeId ? "employee" : "referral_partner")).toLowerCase();
  const targetEntityId = entityId || (targetEntityType === "employee" ? employeeId : partnerId);

  let employeeDoc = null;
  let partnerDoc = null;
  let finalName = customHolderName?.trim() || "";
  let finalCode = customDisplayId?.trim() || "";
  let finalDesignation = customDesignation?.trim() || "";
  let finalDepartment = customDepartment?.trim() || "";
  let photoUrl = "";

  if (targetEntityType === "employee") {
    if (!targetEntityId) {
      throw new AppError("Please select an employee", 400, "MISSING_EMPLOYEE_ID");
    }

    employeeDoc = await Employee.findById(targetEntityId).populate("userId");
    if (!employeeDoc) {
      throw new AppError("Employee record not found", 404, "EMPLOYEE_NOT_FOUND");
    }

    finalName = finalName || employeeDoc.name;
    finalCode = finalCode || employeeDoc.email?.split("@")[0]?.toUpperCase() || `EMP-${employeeDoc._id.toString().slice(-4)}`;
    finalDesignation = finalDesignation || employeeDoc.designation || "Employee";
    finalDepartment = finalDepartment || employeeDoc.department || "General";
    photoUrl = employeeDoc.userId?.profilePicture || "";
  } else {
    if (targetEntityId && mongoose.Types.ObjectId.isValid(targetEntityId)) {
      partnerDoc = await ReferralPartner.findById(targetEntityId).populate("userId");
      if (partnerDoc) {
        finalName = finalName || partnerDoc.userId?.name || "Partner Name";
        finalCode = finalCode || partnerDoc.referralCode || `RP-${partnerDoc._id.toString().slice(-4)}`;
        finalDesignation = finalDesignation || "Authorized Referral Partner";
        photoUrl = partnerDoc.profilePicture || partnerDoc.userId?.profilePicture || "";
      }
    }
  }

  if (req.file) {
    photoUrl = `/uploads/${req.file.filename}`;
  }

  if (!finalName) {
    throw new AppError("Holder name is required", 400, "MISSING_NAME");
  }

  if (!finalCode) {
    finalCode = targetEntityType === "employee" ? `EMP-${Math.floor(1000 + Math.random() * 9000)}` : `RP-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  const certificateNumber = await generateUniqueCertificateNumber(targetEntityType, finalCode);
  const verificationToken = crypto.randomBytes(16).toString("hex");

  const defaultExpiry = new Date();
  defaultExpiry.setFullYear(defaultExpiry.getFullYear() + 2);

  const qrData = `http://localhost:5173/verify-certificate/${certificateNumber}`;

  const certificate = await Certificate.create({
    entityType: targetEntityType,
    entityId: targetEntityType === "employee" ? (employeeDoc?._id || null) : (partnerDoc?._id || null),
    employeeId: targetEntityType === "employee" ? (employeeDoc?._id || null) : null,
    partnerId: targetEntityType === "referral_partner" ? (partnerDoc?._id || null) : null,
    certificateNumber,
    displayId: finalCode,
    certificateType: certificateType || (targetEntityType === "employee" ? "Employee Certificate of Recognition" : "Authorized Partner Certificate"),
    partnerName: finalName,
    partnerCode: finalCode,
    partnerPhoto: photoUrl,
    designation: finalDesignation,
    department: finalDepartment,
    achievement: achievement || (targetEntityType === "employee" ? "Outstanding Contributions & Employee Excellence" : "Excellence in Referral Partnership"),
    description: description || "This is to certify that the recipient has fulfilled all professional performance standards and compliance requirements.",
    companyName: companyName || "Digital Alife Pvt Ltd",
    authorizedSignatory: authorizedSignatory || "Managing Director",
    issueDate: issueDate ? new Date(issueDate) : new Date(),
    expiryDate: expiryDate ? new Date(expiryDate) : defaultExpiry,
    status: "Active",
    verificationToken,
    qrCodeData: qrData,
    orientation: orientation || "Landscape",
    paperSize: paperSize || "A4",
    issuedBy: req.user._id,
  });

  await logCertificateActivity(
    certificate._id,
    targetEntityType,
    targetEntityType === "employee" ? employeeDoc?._id : partnerDoc?._id,
    "Certificate Issued",
    `Issued Certificate (${certificateNumber}) to ${finalName}`,
    req.user._id
  );

  // Send Notification
  const recipientUserId = targetEntityType === "employee" ? employeeDoc?.userId?._id : partnerDoc?.userId?._id;
  if (recipientUserId) {
    await Notification.create({
      recipientUser: recipientUserId,
      title: "Digital Certificate Issued",
      message: `An official Certificate (${certificateNumber}) has been issued to you. View it in your dashboard.`,
      type: "certificate",
    });
  }

  res.status(201).json({
    success: true,
    message: "Certificate generated successfully",
    data: { certificate },
    error: null,
  });
});

// 4. GET CERTIFICATES (Search, Filter by entityType, Status, Pagination)
export const getCertificates = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    status = "",
    entityType = "",
    partnerId = "",
    employeeId = "",
    certificateType = "",
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

  if (certificateType) {
    query.certificateType = { $regex: certificateType, $options: "i" };
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
      { certificateNumber: { $regex: s, $options: "i" } },
      { partnerCode: { $regex: s, $options: "i" } },
      { displayId: { $regex: s, $options: "i" } },
      { certificateType: { $regex: s, $options: "i" } },
    ];
  }

  // RBAC scope
  if (req.user.role === "referral_partner") {
    const partnerDoc = await ReferralPartner.findOne({ userId: req.user._id });
    if (!partnerDoc) {
      return res.status(200).json({
        success: true,
        data: { certificates: [], pagination: { total: 0, page: 1, pages: 0 } },
      });
    }
    query.$or = [{ partnerId: partnerDoc._id }, { entityId: partnerDoc._id }];
  } else if (req.user.role === "employee") {
    const empDoc = await Employee.findOne({ userId: req.user._id });
    if (!empDoc) {
      return res.status(200).json({
        success: true,
        data: { certificates: [], pagination: { total: 0, page: 1, pages: 0 } },
      });
    }
    query.$or = [{ employeeId: empDoc._id }, { entityId: empDoc._id }];
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  const total = await Certificate.countDocuments(query);
  const certificates = await Certificate.find(query)
    .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
    .skip(skip)
    .limit(limitNum)
    .populate({ path: "partnerId", populate: { path: "userId", select: "name email phone" } })
    .populate({ path: "employeeId", populate: { path: "userId", select: "name email phone" } });

  res.status(200).json({
    success: true,
    data: {
      certificates,
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

// 5. GET MY CERTIFICATES (Logged-in Employee or Referral Partner)
export const getMyCertificates = asyncHandler(async (req, res) => {
  let query = { isDeleted: false };

  if (req.user.role === "employee") {
    const emp = await Employee.findOne({ userId: req.user._id });
    if (!emp) {
      return res.status(404).json({
        success: false,
        message: "No employee record found for your user account",
        data: { certificates: [] },
      });
    }
    query.$or = [{ employeeId: emp._id }, { entityId: emp._id }];
  } else if (req.user.role === "referral_partner") {
    const partner = await ReferralPartner.findOne({ userId: req.user._id });
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "No partner record found for your user account",
        data: { certificates: [] },
      });
    }
    query.$or = [{ partnerId: partner._id }, { entityId: partner._id }];
  } else {
    throw new AppError("My Certificates is available only for Employees or Referral Partners", 400, "INVALID_ROLE");
  }

  const certificates = await Certificate.find(query).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: { certificates },
    error: null,
  });
});

// 6. GET SINGLE CERTIFICATE BY ID
export const getCertificateById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const certificate = await Certificate.findOne({ _id: id, isDeleted: false })
    .populate({ path: "partnerId", populate: { path: "userId", select: "name email phone" } })
    .populate({ path: "employeeId", populate: { path: "userId", select: "name email phone" } });

  if (!certificate) {
    throw new AppError("Certificate not found", 404, "NOT_FOUND");
  }

  const history = await CertificateHistory.find({ certificateId: certificate._id })
    .sort({ createdAt: -1 })
    .populate("performedBy", "name email role");

  res.status(200).json({
    success: true,
    data: {
      certificate,
      history,
    },
    error: null,
  });
});

// 7. RENEW CERTIFICATE
export const renewCertificate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { newExpiryDate, renewalReason } = req.body;

  if (req.user.role !== "super_admin" && req.user.role !== "admin") {
    throw new AppError("Only Admins can renew Certificates", 403, "PERMISSION_DENIED");
  }

  const certificate = await Certificate.findOne({ _id: id, isDeleted: false });
  if (!certificate) {
    throw new AppError("Certificate not found", 404, "NOT_FOUND");
  }

  const previousExpiryDate = certificate.expiryDate;
  const expiry = newExpiryDate ? new Date(newExpiryDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  certificate.expiryDate = expiry;
  certificate.status = "Active";
  await certificate.save();

  await CertificateRenewal.create({
    certificateId: certificate._id,
    entityType: certificate.entityType,
    entityId: certificate.entityId,
    previousExpiryDate,
    newExpiryDate: expiry,
    renewedBy: req.user._id,
    reason: renewalReason || "Renewal",
  });

  await logCertificateActivity(
    certificate._id,
    certificate.entityType,
    certificate.entityId,
    "Certificate Renewed",
    `Renewed until ${expiry.toISOString().split("T")[0]}.`,
    req.user._id
  );

  res.status(200).json({
    success: true,
    message: "Certificate renewed successfully",
    data: { certificate },
    error: null,
  });
});

// 8. REVOKE CERTIFICATE
export const revokeCertificate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason, remarks } = req.body;

  if (req.user.role !== "super_admin" && req.user.role !== "admin") {
    throw new AppError("Only Admins can revoke Certificates", 403, "PERMISSION_DENIED");
  }

  if (!reason || !reason.trim()) {
    throw new AppError("Revocation reason is required", 400, "MISSING_REASON");
  }

  const certificate = await Certificate.findOne({ _id: id, isDeleted: false });
  if (!certificate) {
    throw new AppError("Certificate not found", 404, "NOT_FOUND");
  }

  certificate.status = "Revoked";
  await certificate.save();

  const now = new Date();
  await CertificateRevocation.create({
    certificateId: certificate._id,
    entityType: certificate.entityType,
    entityId: certificate.entityId,
    reason: reason.trim(),
    remarks: remarks?.trim() || "",
    revokedBy: req.user._id,
    date: now.toISOString().split("T")[0],
    time: now.toLocaleTimeString("en-US"),
  });

  await logCertificateActivity(
    certificate._id,
    certificate.entityType,
    certificate.entityId,
    "Certificate Revoked",
    `Revoked. Reason: ${reason.trim()}`,
    req.user._id
  );

  res.status(200).json({
    success: true,
    message: "Certificate revoked successfully",
    data: { certificate },
    error: null,
  });
});

// 9. DELETE CERTIFICATE
export const deleteCertificate = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const certificate = await Certificate.findOne({ _id: id, isDeleted: false });
  if (!certificate) {
    throw new AppError("Certificate not found", 404, "NOT_FOUND");
  }

  certificate.isDeleted = true;
  certificate.deletedAt = new Date();
  await certificate.save();

  res.status(200).json({
    success: true,
    message: "Certificate deleted successfully",
    data: null,
    error: null,
  });
});

// 10. GET CERTIFICATE TYPES
export const getCertificateTypes = asyncHandler(async (req, res) => {
  const types = await CertificateType.find({ isDeleted: false });
  res.status(200).json({
    success: true,
    data: { types },
    error: null,
  });
});
