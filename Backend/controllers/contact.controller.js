import { ContactEnquiry } from "../models/index.js";
import { toObjectId } from "../config/database.js";

function response(item) {
  const { _id, ...data } = item;
  return { id: String(_id), ...data };
}

function input(body = {}) {
  const name = String(body.name || "").trim();
  const phone = String(body.phone || "").trim();
  const email = String(body.email || "")
    .trim()
    .toLowerCase();
  const service = String(body.service || "").trim();
  const message = String(body.message || "").trim();
  if (!name || !phone || !email || !message) {
    return { error: "Name, phone, email and message are required." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }
  return { data: { name, phone, email, service, message } };
}

export async function createContactEnquiry(req, res, next) {
  const value = input(req.body);
  if (value.error)
    return res.status(400).json({ success: false, message: value.error });
  try {
    const enquiry = await ContactEnquiry.create({
      ...value.data,
      tenantId: req.tenantId,
    });
    return res.status(201).json({
      success: true,
      data: response(enquiry.toObject()),
      message: "Your enquiry has been received.",
    });
  } catch (error) {
    return next(error);
  }
}

export async function listContactEnquiries(req, res, next) {
  try {
    const enquiries = await ContactEnquiry.find({ tenantId: req.tenantId })
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ success: true, data: enquiries.map(response) });
  } catch (error) {
    return next(error);
  }
}

export async function updateContactEnquiry(req, res, next) {
  const id = toObjectId(req.params.id);
  const value = input(req.body);
  const status = String(req.body?.status || "new").trim();
  if (!id)
    return res
      .status(400)
      .json({ success: false, message: "Invalid enquiry id." });
  if (value.error)
    return res.status(400).json({ success: false, message: value.error });
  if (!["new", "contacted", "closed"].includes(status)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid enquiry status." });
  }
  try {
    const enquiry = await ContactEnquiry.findOneAndUpdate(
      { _id: id, tenantId: req.tenantId },
      {
        $set: {
          ...value.data,
          status,
          adminNote: String(req.body?.adminNote || "").trim(),
        },
      },
      { new: true, lean: true },
    );
    if (!enquiry)
      return res
        .status(404)
        .json({ success: false, message: "Enquiry not found." });
    return res.json({ success: true, data: response(enquiry) });
  } catch (error) {
    return next(error);
  }
}

export async function deleteContactEnquiry(req, res, next) {
  const id = toObjectId(req.params.id);
  if (!id)
    return res
      .status(400)
      .json({ success: false, message: "Invalid enquiry id." });
  try {
    const result = await ContactEnquiry.deleteOne({ _id: id, tenantId: req.tenantId });
    if (!result.deletedCount)
      return res
        .status(404)
        .json({ success: false, message: "Enquiry not found." });
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
}
