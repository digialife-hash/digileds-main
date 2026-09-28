import { toObjectId } from "../config/database.js";
import { PortfolioItem } from "../models/index.js";
import crypto from "node:crypto";
import { PORTFOLIO_ASSETS_ROOT } from "../config/environment.js";
import { fs, path, moveFile } from "../utils/file-and-project-utils.js";
import { scanFile } from "../services/upload-security.js";

function normalisePortfolioInput(body = {}) {
  const title = String(body.title || "").trim();
  const category = String(body.category || "").trim();
  const projectLink = String(body.project_link || "").trim();
  if (!title || !category || !projectLink) {
    return { error: "Title, category and project link are required." };
  }
  return {
    value: {
      title,
      category,
      image_path: String(body.image_path || "").trim() || null,
      project_link: projectLink,
      is_featured:
        body.is_featured === undefined ? 1 : Number(Boolean(body.is_featured)),
      is_active:
        body.is_active === undefined ? 1 : Number(Boolean(body.is_active)),
    },
  };
}

function managedPortfolioImagePath(url) {
  if (typeof url !== "string" || !url.startsWith("/uploads/portfolio-assets/"))
    return null;
  const filename = path.basename(url);
  const resolved = path.resolve(PORTFOLIO_ASSETS_ROOT, filename);
  return resolved.startsWith(`${PORTFOLIO_ASSETS_ROOT}${path.sep}`)
    ? resolved
    : null;
}

function portfolioResponse(item) {
  if (!item) return null;
  const plain = typeof item.toObject === "function" ? item.toObject() : item;
  const { _id, ...data } = plain;
  return { id: String(_id), ...data };
}

export async function getPortfolioItems(req, res, next) {
  try {
    const rows = await PortfolioItem.find({
      tenantId: req.tenantId,
      is_active: 1,
      is_featured: 1,
    })
      .sort({ created_at: 1 })
      .lean();

    return res.json({
      success: true,
      tables: rows.map(portfolioResponse),
    });
  } catch (error) {
    return next(error);
  }
}

export async function listPortfolioItems(req, res, next) {
  try {
    const rows = await PortfolioItem.find({ tenantId: req.tenantId }).sort({ created_at: -1 }).lean();
    return res.json({ success: true, tables: rows.map(portfolioResponse) });
  } catch (error) {
    return next(error);
  }
}

export async function uploadPortfolioImage(req, res, next) {
  if (!req.file)
    return res
      .status(400)
      .json({ success: false, message: "Portfolio image is required." });
  try {
    const scan = await scanFile(req.file.path, req.file.originalname);
    if (!scan.clean) {
      await fs.rm(req.file.path, { force: true });
      return res
        .status(400)
        .json({ success: false, message: "Image failed security validation." });
    }
    await fs.mkdir(PORTFOLIO_ASSETS_ROOT, { recursive: true });
    const filename = `${crypto.randomUUID()}${path.extname(req.file.originalname).toLowerCase()}`;
    await moveFile(req.file.path, path.join(PORTFOLIO_ASSETS_ROOT, filename));
    return res
      .status(201)
      .json({ success: true, url: `/uploads/portfolio-assets/${filename}` });
  } catch (error) {
    try {
      await fs.rm(req.file.path, { force: true });
    } catch (cleanupError) {
      console.warn("Portfolio image cleanup failed:", cleanupError.message);
    }
    return next(error);
  }
}

export async function createPortfolioItem(req, res, next) {
  const parsed = normalisePortfolioInput(req.body);
  if (parsed.error)
    return res.status(400).json({ success: false, message: parsed.error });
  try {
    const item = parsed.value;
    const saved = await PortfolioItem.create({
      ...item,
      tenantId: req.tenantId,
      created_at: Date.now(),
    });
    return res
      .status(201)
      .json({ success: true, data: portfolioResponse(saved) });
  } catch (error) {
    return next(error);
  }
}

export async function updatePortfolioItem(req, res, next) {
  const id = toObjectId(req.params.id);
  const parsed = normalisePortfolioInput(req.body);
  if (!id)
    return res
      .status(400)
      .json({ success: false, message: "Invalid portfolio id." });
  if (parsed.error)
    return res.status(400).json({ success: false, message: parsed.error });
  try {
    const item = parsed.value;
    const old = await PortfolioItem.findOne({ _id: id, tenantId: req.tenantId }).lean();
    const result = await PortfolioItem.updateOne(
      { _id: id, tenantId: req.tenantId },
      { $set: item },
    );
    if (!result.matchedCount)
      return res
        .status(404)
        .json({ success: false, message: "Portfolio item not found." });
    if (old?.image_path !== item.image_path) {
      const oldPath = managedPortfolioImagePath(old?.image_path);
      if (oldPath) await fs.rm(oldPath, { force: true });
    }
    return res.json({ success: true, data: { id: String(id), ...item } });
  } catch (error) {
    return next(error);
  }
}

export async function deletePortfolioItem(req, res, next) {
  const id = toObjectId(req.params.id);
  if (!id)
    return res
      .status(400)
      .json({ success: false, message: "Invalid portfolio id." });
  try {
    const item = await PortfolioItem.findOne({ _id: id, tenantId: req.tenantId }).lean();
    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "Portfolio item not found." });
    await PortfolioItem.deleteOne({ _id: id, tenantId: req.tenantId });
    const imagePath = managedPortfolioImagePath(item?.image_path);
    if (imagePath) await fs.rm(imagePath, { force: true });
    return res.json({
      success: true,
      message: "Portfolio item deleted successfully.",
    });
  } catch (error) {
    return next(error);
  }
}
