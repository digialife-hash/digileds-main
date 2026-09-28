import { SubscriptionOrder, SubscriptionPlan } from "../models/index.js";
import { toObjectId } from "../config/database.js";

function planResponse(plan) {
  const { _id, ...data } = plan;
  return { id: String(_id), ...data };
}

export async function listSubscriptionPlans(req, res, next) {
  try {
    const plans = await SubscriptionPlan.find({
      tenantId: req.tenantId,
      isActive: true,
    })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();
    return res.json({ success: true, data: plans.map(planResponse) });
  } catch (error) {
    return next(error);
  }
}

export async function listSubscriptionPlansManage(req, res, next) {
  try {
    const plans = await SubscriptionPlan.find({ tenantId: req.tenantId })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();
    return res.json({ success: true, data: plans.map(planResponse) });
  } catch (error) {
    return next(error);
  }
}

export async function listSubscriptionOrders(req, res, next) {
  try {
    const orders = await SubscriptionOrder.find({ tenantId: req.tenantId })
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ success: true, data: orders.map(planResponse) });
  } catch (error) {
    return next(error);
  }
}

export async function createSubscriptionPlan(req, res, next) {
  const value = subscriptionPlanInput(req.body);
  if (value.error)
    return res.status(400).json({ success: false, message: value.error });
  try {
    const plan = await SubscriptionPlan.create({
      ...value.data,
      tenantId: req.tenantId,
    });
    return res.status(201).json({ success: true, data: planResponse(plan) });
  } catch (error) {
    return next(error);
  }
}

function subscriptionPlanInput(body = {}) {
  const name = String(body.name || "").trim();
  const description = String(body.description || "").trim();
  const monthlyPrice = Number(body.monthlyPrice);
  const permanentPrice = Number(body.permanentPrice);
  const features = Array.isArray(body.features)
    ? body.features.map((item) => String(item).trim()).filter(Boolean)
    : String(body.features || "")
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);
  if (
    !name ||
    !Number.isFinite(monthlyPrice) ||
    !Number.isFinite(permanentPrice) ||
    monthlyPrice < 0 ||
    permanentPrice < 0
  ) {
    return { error: "Name and valid prices are required." };
  }
  return {
    data: {
      name,
      description,
      monthlyPrice,
      permanentPrice,
      features,
      popular: Boolean(body.popular),
      isActive: body.isActive !== false,
      sortOrder: Number(body.sortOrder) || 0,
    },
  };
}

export async function updateSubscriptionPlan(req, res, next) {
  const id = toObjectId(req.params.id);
  const value = subscriptionPlanInput(req.body);
  if (!id)
    return res
      .status(400)
      .json({ success: false, message: "Invalid subscription plan id." });
  if (value.error)
    return res.status(400).json({ success: false, message: value.error });
  try {
    const plan = await SubscriptionPlan.findOneAndUpdate(
      { _id: id, tenantId: req.tenantId },
      { $set: value.data },
      { new: true, lean: true },
    );
    if (!plan)
      return res
        .status(404)
        .json({ success: false, message: "Subscription plan not found." });
    return res.json({ success: true, data: planResponse(plan) });
  } catch (error) {
    return next(error);
  }
}

export async function deleteSubscriptionPlan(req, res, next) {
  const id = toObjectId(req.params.id);
  if (!id)
    return res
      .status(400)
      .json({ success: false, message: "Invalid subscription plan id." });
  try {
    const result = await SubscriptionPlan.deleteOne({
      _id: id,
      tenantId: req.tenantId,
    });
    if (!result.deletedCount)
      return res
        .status(404)
        .json({ success: false, message: "Subscription plan not found." });
    return res.json({ success: true, message: "Subscription plan deleted." });
  } catch (error) {
    return next(error);
  }
}

export async function updateSubscriptionOrder(req, res, next) {
  const id = toObjectId(req.params.id);
  const status = String(req.body?.status || "").trim();
  if (!id || !["approved", "rejected", "pending"].includes(status)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid order or status." });
  }
  try {
    const updates = {
      status,
      approvedAt: status === "approved" ? new Date() : null,
    };
    if (req.body.customerName !== undefined) {
      const customerName = String(req.body.customerName || "").trim();
      const customerEmail = String(req.body.customerEmail || "")
        .trim()
        .toLowerCase();
      const customerPhone = String(req.body.customerPhone || "").trim();
      if (
        !customerName ||
        !customerEmail ||
        !customerPhone ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Valid customer name, email and phone are required.",
          });
      }
      updates.customerName = customerName;
      updates.customerEmail = customerEmail;
      updates.customerPhone = customerPhone;
      updates.message = String(req.body.message || "").trim();
    }
    const result = await SubscriptionOrder.findOneAndUpdate(
      { _id: id, tenantId: req.tenantId },
      { $set: updates },
      { new: true, lean: true },
    );
    if (!result)
      return res
        .status(404)
        .json({ success: false, message: "Subscription request not found." });
    return res.json({ success: true, data: planResponse(result) });
  } catch (error) {
    return next(error);
  }
}

export async function deleteSubscriptionOrder(req, res, next) {
  const id = toObjectId(req.params.id);
  if (!id)
    return res
      .status(400)
      .json({ success: false, message: "Invalid subscription request id." });
  try {
    const result = await SubscriptionOrder.deleteOne({
      _id: id,
      tenantId: req.tenantId,
    });
    if (!result.deletedCount)
      return res
        .status(404)
        .json({ success: false, message: "Subscription request not found." });
    return res.json({
      success: true,
      message: "Subscription request deleted.",
    });
  } catch (error) {
    return next(error);
  }
}

export async function createSubscriptionOrder(req, res, next) {
  const planId = toObjectId(req.body?.planId);
  const billing = String(req.body?.billing || "").trim();
  const customerName = String(req.body?.customerName || "").trim();
  const customerEmail = String(req.body?.customerEmail || "")
    .trim()
    .toLowerCase();
  const customerPhone = String(req.body?.customerPhone || "").trim();
  const message = String(req.body?.message || "").trim();

  if (
    !planId ||
    !["monthly", "permanent"].includes(billing) ||
    !customerName ||
    !customerEmail ||
    !customerPhone
  ) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Plan, billing cycle, name, email and phone are required.",
      });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    return res
      .status(400)
      .json({ success: false, message: "Please enter a valid email address." });
  }

  try {
    const plan = await SubscriptionPlan.findOne({
      _id: planId,
      tenantId: req.tenantId,
      isActive: true,
    }).lean();
    if (!plan)
      return res
        .status(404)
        .json({ success: false, message: "Subscription plan not found." });
    const amount =
      billing === "monthly" ? plan.monthlyPrice : plan.permanentPrice;
    const order = await SubscriptionOrder.create({
      tenantId: req.tenantId,
      planId,
      planName: plan.name,
      billing,
      amount,
      customerName,
      customerEmail,
      customerPhone,
      message,
    });
    return res
      .status(201)
      .json({
        success: true,
        data: planResponse(order),
        message: "Subscription order created successfully.",
      });
  } catch (error) {
    return next(error);
  }
}
