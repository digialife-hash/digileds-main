import { toObjectId } from "../config/database.js";
import { TeamMember } from "../models/index.js";

function response(item) {
  const plain = item?.toObject ? item.toObject() : item;
  const { _id, ...data } = plain;
  return { id: String(_id), ...data };
}

function input(body = {}) {
  const name = String(body.name || "").trim();
  const allowedDesignations = new Set([
    "CEO & Founder",
    "Co-Founder & Director",
    "Project Manager",
    "UI/UX Designer",
    "MERN Full Stack Developer",
    "Mobile App Developer",
    "Digital Marketing Specialist",
    "SEO Specialist",
    "Graphic Designer",
    "Other",
  ]);
  const designation = String(body.designation || "").trim();
  if (!name || !designation)
    return { error: "Name and designation are required." };
  if (!allowedDesignations.has(designation)) {
    return { error: "Please select a valid designation." };
  }
  return {
    name,
    designation,
    department: String(body.department || "Team").trim(),
    image: String(body.image || "").trim(),
    description: String(body.description || "").trim(),
    quote: String(body.quote || "").trim(),
    bio: String(body.bio || "").trim(),
    experience: String(body.experience || "").trim(),
    location: String(body.location || "").trim(),
    linkedin: String(body.linkedin || "#").trim(),
    twitter: String(body.twitter || "#").trim(),
    email: String(body.email || "").trim(),
    group:
      designation === "CEO & Founder" || designation === "Co-Founder & Director"
        ? "leadership"
        : body.group === "leadership"
          ? "leadership"
          : "team",
    isActive: body.isActive !== false,
    sortOrder: Number(body.sortOrder) || 0,
  };
}

export async function getTeam(req, res, next) {
  try {
    const members = await TeamMember.find({ tenantId: req.tenantId, isActive: true })
      .sort({ group: 1, sortOrder: 1, createdAt: 1 })
      .lean();
    return res.json({ success: true, data: members.map(response) });
  } catch (error) {
    return next(error);
  }
}

export async function listTeam(req, res, next) {
  try {
    const members = await TeamMember.find({ tenantId: req.tenantId })
      .sort({ group: 1, sortOrder: 1, createdAt: 1 })
      .lean();
    return res.json({ success: true, data: members.map(response) });
  } catch (error) {
    return next(error);
  }
}

export async function createTeamMember(req, res, next) {
  const value = input(req.body);
  if (value.error)
    return res.status(400).json({ success: false, message: value.error });
  try {
    const member = await TeamMember.create({ ...value, tenantId: req.tenantId });
    return res.status(201).json({ success: true, data: response(member) });
  } catch (error) {
    return next(error);
  }
}

export async function updateTeamMember(req, res, next) {
  const id = toObjectId(req.params.id);
  const value = input(req.body);
  if (!id)
    return res
      .status(400)
      .json({ success: false, message: "Invalid team member id." });
  if (value.error)
    return res.status(400).json({ success: false, message: value.error });
  try {
    const result = await TeamMember.findOneAndUpdate(
      { _id: id, tenantId: req.tenantId },
      value,
      {
      new: true,
      lean: true,
      },
    );
    if (!result)
      return res
        .status(404)
        .json({ success: false, message: "Team member not found." });
    return res.json({ success: true, data: response(result) });
  } catch (error) {
    return next(error);
  }
}

export async function deleteTeamMember(req, res, next) {
  const id = toObjectId(req.params.id);
  if (!id)
    return res
      .status(400)
      .json({ success: false, message: "Invalid team member id." });
  try {
    const result = await TeamMember.deleteOne({ _id: id, tenantId: req.tenantId });
    if (!result.deletedCount)
      return res
        .status(404)
        .json({ success: false, message: "Team member not found." });
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
}
