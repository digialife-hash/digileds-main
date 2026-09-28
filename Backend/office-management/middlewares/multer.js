import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { OFFICE_UPLOADS_ROOT } from "../../config/environment.js";

// Ensure uploads folder exists
if (!fs.existsSync(OFFICE_UPLOADS_ROOT)) {
  fs.mkdirSync(OFFICE_UPLOADS_ROOT, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, OFFICE_UPLOADS_ROOT);
  },

  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const randomName = crypto.randomBytes(16).toString("hex");
    const uniqueName = `ref-${Date.now()}-${randomName}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = [
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
    ".txt",
    ".csv",
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".zip",
    ".rar",
  ];

  const allowedMimeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "text/csv",
    "application/csv",
    "text/x-comma-separated-values",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "application/zip",
    "application/x-zip-compressed",
    "application/x-zip",
    "application/vnd.rar",
    "application/x-rar-compressed",
    "application/x-rar",
  ];

  const extension = path.extname(file.originalname).toLowerCase();

  if (
    allowedExtensions.includes(extension) &&
    allowedMimeTypes.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Allowed formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, JPG, JPEG, PNG, WEBP, SVG, ZIP, RAR"
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB limit
  },
});

export default upload;