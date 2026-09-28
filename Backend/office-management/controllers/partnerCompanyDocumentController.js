import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import ReferralPartner from "../models/ReferralPartner.js";
import PartnerCompanyDocument from "../models/PartnerCompanyDocument.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import logActivity from "../utils/logActivity.js";

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);
};

const getIdString = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (value._id) return String(value._id);
  return String(value);
};

const safelyUnlinkFile = async (filePath) => {
  if (!filePath) return;

  try {
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(process.cwd(), filePath.replace(/^\/+/, ""));

    if (fs.existsSync(absolutePath)) {
      await fs.promises.unlink(absolutePath);
    }
  } catch (err) {
    console.error("Failed to delete local company document file:", err.message);
  }
};

const findLinkedPartnerForUser = async (user) => {
  if (!user) return null;
  const partner = await ReferralPartner.findOne({ userId: user._id }).select("_id referralCode").lean();
  return partner;
};

export const uploadPartnerCompanyDocuments = asyncHandler(async (req, res) => {
  const { partnerId } = req.params;

  if (!isValidObjectId(partnerId)) {
    throw new AppError("Invalid partner ID", 400, "INVALID_PARTNER_ID");
  }

  const partner = await ReferralPartner.findById(partnerId)
    .populate("userId", "name email")
    .lean();

  if (!partner) {
    throw new AppError("Referral Partner not found", 404, "PARTNER_NOT_FOUND");
  }

  let filesToProcess = [];
  if (req.files) {
    if (Array.isArray(req.files)) {
      filesToProcess = req.files;
    } else if (typeof req.files === "object") {
      Object.values(req.files).forEach((fileArray) => {
        if (Array.isArray(fileArray)) filesToProcess.push(...fileArray);
      });
    }
  } else if (req.file) {
    filesToProcess = [req.file];
  }

  if (!filesToProcess.length) {
    throw new AppError("Please select at least one document to upload", 400, "NO_FILE_UPLOADED");
  }

  const defaultTitle = req.body.title?.trim() || "";
  const description = req.body.description?.trim() || "";
  const category = req.body.category?.trim() || "General";
  const version = req.body.version?.trim() || "1.0";

  const createdDocuments = [];

  for (let idx = 0; idx < filesToProcess.length; idx++) {
    const file = filesToProcess[idx];
    const extension = path.extname(file.originalname).toLowerCase();
    const storedName = file.filename;
    const filePath = `/uploads/${storedName}`;
    const docTitle =
      filesToProcess.length === 1 && defaultTitle
        ? defaultTitle
        : path.basename(file.originalname, extension).replace(/[-_]/g, " ");

    const newDoc = await PartnerCompanyDocument.create({
      partner_id: partner._id,
      title: docTitle,
      description,
      category,
      version,
      original_name: file.originalname,
      stored_name: storedName,
      file_path: filePath,
      extension,
      mime_type: file.mimetype,
      file_size: file.size,
      uploaded_by: req.user._id,
      status: "active",
    });

    const populatedDoc = await PartnerCompanyDocument.findById(newDoc._id)
      .populate("uploaded_by", "name email role")
      .lean();

    createdDocuments.push(populatedDoc);

    await logActivity({
      req,
      action: "upload_partner_company_document",
      module: "referrals",
      targetId: partner._id,
      targetModel: "ReferralPartner",
      description: `Admin uploaded company document '${docTitle}' for partner ${partner.userId?.name || partner.referralCode}`,
      metadata: {
        documentId: newDoc._id,
        originalName: file.originalname,
        category,
        version,
      },
    });
  }

  return res.status(201).json({
    success: true,
    message: `${createdDocuments.length} company document(s) uploaded successfully`,
    data: {
      documents: createdDocuments,
    },
    error: null,
  });
});

export const getPartnerCompanyDocuments = asyncHandler(async (req, res) => {
  const { partnerId } = req.params;

  if (!isValidObjectId(partnerId)) {
    throw new AppError("Invalid partner ID", 400, "INVALID_PARTNER_ID");
  }

  const isSuperAdmin = ["super_admin", "admin"].includes(req.user.role);

  if (!isSuperAdmin && req.user.role === "referral_partner") {
    const userPartner = await findLinkedPartnerForUser(req.user);
    if (!userPartner || getIdString(userPartner._id) !== partnerId) {
      throw new AppError("Access denied: You can only view your own documents", 403, "FORBIDDEN");
    }
  }

  const documents = await PartnerCompanyDocument.find({
    partner_id: partnerId,
    status: "active",
  })
    .populate("uploaded_by", "name email role")
    .sort({ createdAt: -1 })
    .lean();

  return res.status(200).json({
    success: true,
    message: "Company documents fetched successfully",
    data: {
      documents,
      count: documents.length,
    },
    error: null,
  });
});

export const getMyCompanyDocuments = asyncHandler(async (req, res) => {
  const partner = await findLinkedPartnerForUser(req.user);

  if (!partner) {
    throw new AppError("Referral Partner profile not found", 404, "PARTNER_NOT_FOUND");
  }

  const documents = await PartnerCompanyDocument.find({
    partner_id: partner._id,
    status: "active",
  })
    .populate("uploaded_by", "name email role")
    .sort({ createdAt: -1 })
    .lean();

  return res.status(200).json({
    success: true,
    message: "My company documents fetched successfully",
    data: {
      documents,
      count: documents.length,
    },
    error: null,
  });
});

export const updatePartnerCompanyDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new AppError("Invalid document ID", 400, "INVALID_DOCUMENT_ID");
  }

  const document = await PartnerCompanyDocument.findById(id);
  if (!document) {
    throw new AppError("Company document not found", 404, "DOCUMENT_NOT_FOUND");
  }

  const updateFields = {};

  if (req.body.title !== undefined) updateFields.title = req.body.title.trim();
  if (req.body.description !== undefined) updateFields.description = req.body.description.trim();
  if (req.body.category !== undefined) updateFields.category = req.body.category.trim();
  if (req.body.version !== undefined) updateFields.version = req.body.version.trim();
  if (req.body.status !== undefined) updateFields.status = req.body.status;

  if (req.file) {
    await safelyUnlinkFile(document.file_path);

    const file = req.file;
    updateFields.extension = path.extname(file.originalname).toLowerCase();
    updateFields.original_name = file.originalname;
    updateFields.stored_name = file.filename;
    updateFields.file_path = `/uploads/${file.filename}`;
    updateFields.mime_type = file.mimetype;
    updateFields.file_size = file.size;
  }

  const updatedDocument = await PartnerCompanyDocument.findByIdAndUpdate(id, updateFields, {
    new: true,
    runValidators: true,
  })
    .populate("uploaded_by", "name email role")
    .lean();

  await logActivity({
    req,
    action: "update_partner_company_document",
    module: "referrals",
    targetId: document.partner_id,
    targetModel: "ReferralPartner",
    description: `Admin updated company document '${updatedDocument.title}'`,
    metadata: {
      documentId: id,
      originalName: updatedDocument.original_name,
    },
  });

  return res.status(200).json({
    success: true,
    message: "Company document updated successfully",
    data: {
      document: updatedDocument,
    },
    error: null,
  });
});

export const deletePartnerCompanyDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new AppError("Invalid document ID", 400, "INVALID_DOCUMENT_ID");
  }

  const document = await PartnerCompanyDocument.findById(id);
  if (!document) {
    throw new AppError("Company document not found", 404, "DOCUMENT_NOT_FOUND");
  }

  await safelyUnlinkFile(document.file_path);
  await PartnerCompanyDocument.findByIdAndDelete(id);

  await logActivity({
    req,
    action: "delete_partner_company_document",
    module: "referrals",
    targetId: document.partner_id,
    targetModel: "ReferralPartner",
    description: `Admin deleted company document '${document.title}'`,
    metadata: {
      documentId: id,
      originalName: document.original_name,
    },
  });

  return res.status(200).json({
    success: true,
    message: "Company document deleted successfully",
    data: null,
    error: null,
  });
});

export const downloadPartnerCompanyDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new AppError("Invalid document ID", 400, "INVALID_DOCUMENT_ID");
  }

  const document = await PartnerCompanyDocument.findById(id);
  if (!document) {
    throw new AppError("Company document not found", 404, "DOCUMENT_NOT_FOUND");
  }

  const isSuperAdmin = ["super_admin", "admin"].includes(req.user.role);

  if (!isSuperAdmin && req.user.role === "referral_partner") {
    const partner = await findLinkedPartnerForUser(req.user);
    if (!partner || getIdString(partner._id) !== getIdString(document.partner_id)) {
      throw new AppError("Access denied: You cannot download this document", 403, "FORBIDDEN");
    }
  }

  const safeFilename = path.basename(document.stored_name);
  const absolutePath = path.join(process.cwd(), "uploads", safeFilename);

  if (!fs.existsSync(absolutePath)) {
    throw new AppError("Physical file not found on server", 404, "FILE_NOT_FOUND");
  }

  return res.download(absolutePath, document.original_name);
});
