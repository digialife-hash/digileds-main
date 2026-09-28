import express from "express";
import requireAdmin from "../middleware/admin.middleware.js";
import { asyncHandler } from "../middleware/async-handler.js";
import {
  createSubscriptionOrder,
  listSubscriptionOrders,
  listSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionOrder,
  listSubscriptionPlansManage,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  deleteSubscriptionOrder,
} from "../controllers/subscription.controller.js";

const router = express.Router();
router.get("/api/subscriptions/plans", asyncHandler(listSubscriptionPlans));
router.get(
  "/api/subscriptions/plans/manage",
  requireAdmin,
  asyncHandler(listSubscriptionPlansManage),
);
router.get(
  "/api/subscriptions/orders",
  requireAdmin,
  asyncHandler(listSubscriptionOrders),
);
router.post(
  "/api/subscriptions/plans",
  requireAdmin,
  asyncHandler(createSubscriptionPlan),
);
router.patch(
  "/api/subscriptions/plans/:id",
  requireAdmin,
  asyncHandler(updateSubscriptionPlan),
);
router.delete(
  "/api/subscriptions/plans/:id",
  requireAdmin,
  asyncHandler(deleteSubscriptionPlan),
);
router.post("/api/subscriptions/orders", asyncHandler(createSubscriptionOrder));
router.patch(
  "/api/subscriptions/orders/:id",
  requireAdmin,
  asyncHandler(updateSubscriptionOrder),
);
router.delete(
  "/api/subscriptions/orders/:id",
  requireAdmin,
  asyncHandler(deleteSubscriptionOrder),
);

export default router;
