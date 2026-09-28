import { LeadApplication } from "../models/index.js";
import { toObjectId } from "../config/database.js";

const statuses = ["new", "contacted", "qualified", "converted", "closed"];
const required = [
  "fullName",
  "email",
  "phoneCode",
  "phone",
  "address",
  "city",
  "state",
  "country",
  "companyName",
  "companyEmail",
  "companyPhone",
  "companyAddress",
  "productName",
  "productCategory",
];

function normalize(body = {}) {
  const data = {
    fullName: String(body.fullName || "").trim(),
    email: String(body.email || "")
      .trim()
      .toLowerCase(),
    phoneCode: String(body.phoneCode || "").trim(),
    phone: String(body.phone || "").trim(),
    address: String(body.address || "").trim(),
    city: String(body.city || "").trim(),
    state: String(body.state || "").trim(),
    country: String(body.country || "").trim(),
    companyName: String(body.companyName || "").trim(),
    companyEmail: String(body.companyEmail || "")
      .trim()
      .toLowerCase(),
    companyPhone: String(body.companyPhone || "").trim(),
    website: String(body.website || "").trim(),
    companyAddress: String(body.companyAddress || "").trim(),
    productName: String(body.productName || "").trim(),
    productCategory: String(body.productCategory || "").trim(),
    estimatedBudget: String(body.estimatedBudget || "").trim(),
    expectedTimeline: String(body.expectedTimeline || "").trim(),
    requirements: String(body.requirements || "").trim(),
  };
  if (required.some((key) => !data[key]))
    return { error: "Please complete all required lead details." };
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.companyEmail)
  ) {
    return { error: "Please enter valid email addresses." };
  }
  return { data };
}

function response(item) {
  const { _id, ...data } = item;
  return { id: String(_id), ...data };
}

export async function createLeadApplication(req, res, next) {
  const value = normalize(req.body);
  if (value.error)
    return res.status(400).json({ success: false, message: value.error });
  try {
    const lead = await LeadApplication.create({ ...value.data, tenantId: req.tenantId });
    return res
      .status(201)
      .json({
        success: true,
        data: response(lead.toObject()),
        message: "Lead application submitted successfully.",
      });
  } catch (error) {
    return next(error);
  }
}

export async function listLeadApplications(req, res, next) {
  try {
    const leads = await LeadApplication.find({ tenantId: req.tenantId }).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: leads.map(response) });
  } catch (error) {
    return next(error);
  }
}

export async function updateLeadApplication(req, res, next) {
  const id = toObjectId(req.params.id);
  const status = String(req.body?.status || "new").trim();
  if (!id)
    return res
      .status(400)
      .json({ success: false, message: "Invalid lead id." });
  if (!statuses.includes(status))
    return res
      .status(400)
      .json({ success: false, message: "Invalid lead status." });
  try {
    const lead = await LeadApplication.findOneAndUpdate(
      { _id: id, tenantId: req.tenantId },
      { $set: { status, adminNote: String(req.body?.adminNote || "").trim() } },
      { new: true, lean: true },
    );
    if (!lead)
      return res
        .status(404)
        .json({ success: false, message: "Lead application not found." });
    return res.json({ success: true, data: response(lead) });
  } catch (error) {
    return next(error);
  }
}

export async function deleteLeadApplication(req, res, next) {
  const id = toObjectId(req.params.id);
  if (!id)
    return res
      .status(400)
      .json({ success: false, message: "Invalid lead id." });
  try {
    const result = await LeadApplication.deleteOne({ _id: id, tenantId: req.tenantId });
    if (!result.deletedCount)
      return res
        .status(404)
        .json({ success: false, message: "Lead application not found." });
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
}

export async function deleteAllLeadApplications(req, res, next) {
  try {
    const result = await LeadApplication.deleteMany({ tenantId: req.tenantId });
    return res.json({
      success: true,
      deletedCount: result.deletedCount || 0,
      message: `${result.deletedCount || 0} lead applications deleted successfully.`,
    });
  } catch (error) {
    return next(error);
  }
}
