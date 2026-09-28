import { CareerOpening } from "../models/index.js";
import { toObjectId } from "../config/database.js";

function normalize(body = {}) {
  const data = {
    title: String(body.title || "").trim(),
    category: String(body.category || "").trim(),
    location: String(body.location || "Noida / Hybrid").trim(),
    employmentType: String(body.employmentType || "Full-time").trim(),
    description: String(body.description || "").trim(),
    isActive: body.isActive !== false && body.isActive !== "false",
    sortOrder: Number.isFinite(Number(body.sortOrder))
      ? Number(body.sortOrder)
      : 0,
  };
  if (!data.title || !data.category || !data.description)
    return { error: "Title, category and description are required." };
  return { data };
}

function response(item) {
  const { _id, ...data } = item;
  return { id: String(_id), ...data };
}

export async function listPublicCareerOpenings(req, res, next) {
  try {
    const openings = await CareerOpening.find({ tenantId: req.tenantId, isActive: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();
    return res.json({ success: true, data: openings.map(response) });
  } catch (error) {
    return next(error);
  }
}

export async function listCareerOpenings(req, res, next) {
  try {
    const openings = await CareerOpening.find({ tenantId: req.tenantId })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();
    return res.json({ success: true, data: openings.map(response) });
  } catch (error) {
    return next(error);
  }
}

export async function createCareerOpening(req, res, next) {
  const value = normalize(req.body);
  if (value.error)
    return res.status(400).json({ success: false, message: value.error });
  try {
    const opening = await CareerOpening.create({ ...value.data, tenantId: req.tenantId });
    return res
      .status(201)
      .json({
        success: true,
        data: response(opening.toObject()),
        message: "Career opening created successfully.",
      });
  } catch (error) {
    return next(error);
  }
}

export async function updateCareerOpening(req, res, next) {
  const id = toObjectId(req.params.id);
  const value = normalize(req.body);
  if (!id)
    return res
      .status(400)
      .json({ success: false, message: "Invalid opening id." });
  if (value.error)
    return res.status(400).json({ success: false, message: value.error });
  try {
    const opening = await CareerOpening.findOneAndUpdate(
      { _id: id, tenantId: req.tenantId },
      { $set: value.data },
      { new: true, lean: true },
    );
    if (!opening)
      return res
        .status(404)
        .json({ success: false, message: "Career opening not found." });
    return res.json({ success: true, data: response(opening) });
  } catch (error) {
    return next(error);
  }
}

export async function deleteCareerOpening(req, res, next) {
  const id = toObjectId(req.params.id);
  if (!id)
    return res
      .status(400)
      .json({ success: false, message: "Invalid opening id." });
  try {
    const result = await CareerOpening.deleteOne({ _id: id, tenantId: req.tenantId });
    if (!result.deletedCount)
      return res
        .status(404)
        .json({ success: false, message: "Career opening not found." });
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
}
