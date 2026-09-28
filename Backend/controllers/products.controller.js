import { toObjectId } from "../config/database.js";
import { Product } from "../models/index.js";
import crypto from "node:crypto";
import { PRODUCT_ASSETS_ROOT } from "../config/environment.js";
import { fs, path, moveFile } from "../utils/file-and-project-utils.js";
import { scanFile } from "../services/upload-security.js";

function managedProductImagePath(url) {
  if (typeof url !== "string" || !url.startsWith("/uploads/product-assets/"))
    return null;
  const relative = url.slice("/uploads/".length).replaceAll("/", path.sep);
  const resolved = path.resolve(
    PRODUCT_ASSETS_ROOT,
    relative.replace(`product-assets${path.sep}`, ""),
  );
  return resolved.startsWith(`${PRODUCT_ASSETS_ROOT}${path.sep}`)
    ? resolved
    : null;
}

const PRODUCT_FIELDS = [
  "title",
  "description",
  "price",
  "image_path",
  "file_link",
  "download_path",
  "is_active",
];

function productResponse(product) {
  if (!product) return null;
  const plain =
    typeof product.toObject === "function" ? product.toObject() : product;
  const { _id, ...data } = plain;
  return { id: String(_id), ...data };
}

function normaliseProductInput(body = {}) {
  const title = String(body.title || "").trim();
  const description = String(body.description || "").trim();
  const price = String(body.price ?? "").trim();

  if (!title || !description || !price) {
    return { error: "Title, description and price are required." };
  }

  const numericPrice = Number(price);
  if (!Number.isFinite(numericPrice) || numericPrice < 0) {
    return { error: "Price must be a valid non-negative number." };
  }

  return {
    value: {
      title,
      description,
      price: numericPrice.toFixed(2),
      image_path: String(body.image_path || "").trim() || null,
      file_link: String(body.file_link || "").trim() || null,
      download_path: String(body.download_path || "").trim() || null,
      is_active:
        body.is_active === undefined ? 1 : Number(Boolean(body.is_active)),
    },
  };
}

export async function listProducts(req, res, next) {
  try {
    const rows = await Product.find({ tenantId: req.tenantId }).sort({ created_at: -1 }).lean();
    return res.json({ success: true, tables: rows.map(productResponse) });
  } catch (error) {
    return next(error);
  }
}

export async function uploadProductImage(req, res, next) {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "Product image is required." });
  }

  try {
    const scan = await scanFile(req.file.path, req.file.originalname);
    if (!scan.clean) {
      await fs.rm(req.file.path, { force: true });
      return res
        .status(400)
        .json({ success: false, message: "Image failed security validation." });
    }

    await fs.mkdir(PRODUCT_ASSETS_ROOT, { recursive: true });
    const filename = `${crypto.randomUUID()}${path.extname(req.file.originalname).toLowerCase()}`;
    await moveFile(req.file.path, path.join(PRODUCT_ASSETS_ROOT, filename));
    return res.status(201).json({
      success: true,
      url: `/uploads/product-assets/${filename}`,
    });
  } catch (error) {
    try {
      await fs.rm(req.file.path, { force: true });
    } catch (cleanupError) {
      console.warn("Product image cleanup failed:", cleanupError.message);
    }
    return next(error);
  }
}

export async function createProduct(req, res, next) {
  const parsed = normaliseProductInput(req.body);
  if (parsed.error) {
    return res.status(400).json({ success: false, message: parsed.error });
  }

  try {
    const product = parsed.value;
    const saved = await Product.create({
      ...product,
      tenantId: req.tenantId,
      created_at: Date.now(),
    });
    return res
      .status(201)
      .json({ success: true, data: productResponse(saved) });
  } catch (error) {
    return next(error);
  }
}

export async function updateProduct(req, res, next) {
  const id = toObjectId(req.params.id);
  const parsed = normaliseProductInput(req.body);
  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid product id." });
  }
  if (parsed.error) {
    return res.status(400).json({ success: false, message: parsed.error });
  }

  try {
    const product = parsed.value;
    const result = await Product.updateOne(
      { _id: id, tenantId: req.tenantId },
      { $set: product },
    );
    if (!result.matchedCount) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }
    return res.json({ success: true, data: { id: String(id), ...product } });
  } catch (error) {
    return next(error);
  }
}

export async function deleteProduct(req, res, next) {
  const id = toObjectId(req.params.id);
  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid product id." });
  }

  try {
    const product = await Product.findOne({ _id: id, tenantId: req.tenantId }).lean();
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }
    await Product.deleteOne({ _id: id, tenantId: req.tenantId });
    const imagePath = managedProductImagePath(product?.image_path);
    if (imagePath) await fs.rm(imagePath, { force: true });
    return res.json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    return next(error);
  }
}
