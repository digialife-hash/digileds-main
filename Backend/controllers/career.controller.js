import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { CareerApplication } from "../models/index.js";
import { STORAGE_UPLOADS_ROOT } from "../config/environment.js";
import { toObjectId } from "../config/database.js";

const resumeTypes = {
  pdf: {
    mime: "application/pdf",
    signature: (buffer) => buffer.subarray(0, 5).toString("ascii") === "%PDF-",
  },
  doc: {
    mime: "application/msword",
    signature: (buffer) =>
      buffer.subarray(0, 8).equals(Buffer.from("d0cf11e0a1b11ae1", "hex")),
  },
  docx: {
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    signature: (buffer) => buffer.subarray(0, 4).equals(Buffer.from("504b0304", "hex")),
  },
};

function response(item) {
  const { _id, ...data } = item;
  return { id: String(_id), ...data };
}

function input(body = {}) {
  const value = Object.fromEntries(
    [
      "firstName",
      "lastName",
      "email",
      "phone",
      "city",
      "state",
      "opening",
      "experience",
      "qualification",
      "currentCompany",
      "currentCtc",
      "expectedCtc",
      "noticePeriod",
      "linkedin",
      "github",
      "portfolio",
      "skills",
      "coverLetter",
      "motivation",
    ].map((key) => [key, String(body[key] || "").trim()]),
  );
  if (
    Object.values(value).some(
      (item, index) =>
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 11, 12, 13, 16, 18].includes(index) &&
        !item,
    )
  ) {
    return { error: "Please complete all required application fields." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email))
    return { error: "Please enter a valid email address." };
  return { data: value };
}

export async function createCareerApplication(req, res, next) {
  const value = input(req.body);
  if (value.error)
    return res.status(400).json({ success: false, message: value.error });
  if (!req.file)
    return res
      .status(400)
      .json({ success: false, message: "Resume file is required." });
  try {
    const extension = path.extname(req.file.originalname).slice(1).toLowerCase();
    const resumeType = resumeTypes[extension];
    if (
      !resumeType
      || req.file.mimetype !== resumeType.mime
      || !resumeType.signature(req.file.buffer)
    ) {
      return res.status(415).json({
        success: false,
        message: "The resume file is invalid or has an unsupported format.",
      });
    }

    const resumesRoot = path.join(STORAGE_UPLOADS_ROOT, "career-resumes");
    await fs.mkdir(resumesRoot, { recursive: true });
    const filename = `${crypto.randomUUID()}.${extension}`;
    const target = path.join(resumesRoot, filename);
    await fs.writeFile(target, req.file.buffer);
    try {
      const application = await CareerApplication.create({
        ...value.data,
        tenantId: req.tenantId,
        resumeUrl: `/api/career-applications/resume/${filename}`,
        resumeName: req.file.originalname,
      });
      return res
        .status(201)
        .json({
          success: true,
          data: response(application.toObject()),
          message: "Application submitted successfully.",
        });
    } catch (error) {
      await fs.rm(target, { force: true });
      throw error;
    }
  } catch (error) {
    return next(error);
  }
}

export async function downloadCareerResume(req, res, next) {
  try {
    const id = toObjectId(req.params.id);
    const application = id ? await CareerApplication.findById(id).lean() : null;
    if (!application) {
      return res.status(404).json({ success: false, message: "Resume not found." });
    }

    const filename = path.basename(
      String(application.resumeUrl || "").split("/").pop() || "",
    );
    if (!/^[0-9a-f-]{36}\.(pdf|doc|docx)$/i.test(filename)) {
      return res.status(404).json({ success: false, message: "Resume not found." });
    }

    const filePath = path.join(STORAGE_UPLOADS_ROOT, "career-resumes", filename);
    await fs.access(filePath);
    const extension = path.extname(filename).slice(1).toLowerCase();
    const resumeType = resumeTypes[extension];
    res.setHeader("Content-Type", resumeType.mime);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${path.basename(application.resumeName).replace(/["\\\r\n]/g, "_")}"`,
    );
    return res.sendFile(filePath);
  } catch (error) {
    if (error.code === "ENOENT") {
      return res.status(404).json({ success: false, message: "Resume not found." });
    }
    return next(error);
  }
}

export async function listCareerApplications(req, res, next) {
  try {
    const rows = await CareerApplication.find({ tenantId: req.tenantId })
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ success: true, data: rows.map(response) });
  } catch (error) {
    return next(error);
  }
}

export async function updateCareerApplication(req, res, next) {
  const id = toObjectId(req.params.id);
  if (!id)
    return res
      .status(400)
      .json({ success: false, message: "Invalid application id." });
  const status = String(req.body?.status || "new").trim();
  if (
    !["new", "reviewing", "shortlisted", "rejected", "hired"].includes(status)
  )
    return res
      .status(400)
      .json({ success: false, message: "Invalid application status." });
  try {
    const application = await CareerApplication.findByIdAndUpdate(
      id,
      { $set: { status, adminNote: String(req.body?.adminNote || "").trim() } },
      { new: true, lean: true },
    );
    if (!application)
      return res
        .status(404)
        .json({ success: false, message: "Application not found." });
    return res.json({ success: true, data: response(application) });
  } catch (error) {
    return next(error);
  }
}

export async function deleteCareerApplication(req, res, next) {
  const id = toObjectId(req.params.id);
  if (!id)
    return res
      .status(400)
      .json({ success: false, message: "Invalid application id." });
  try {
    const application = await CareerApplication.findByIdAndDelete(id).lean();
    if (!application)
      return res
        .status(404)
        .json({ success: false, message: "Application not found." });
    if (application.resumeUrl?.startsWith("/uploads/career-resumes/")) {
      await fs.rm(
        path.join(
          STORAGE_UPLOADS_ROOT,
          "career-resumes",
          path.basename(application.resumeUrl),
        ),
        { force: true },
      );
    }
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
}
