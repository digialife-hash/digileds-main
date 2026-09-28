import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import {
  convertServiceRequestToProject,
  createServiceRequest,
  createServiceRequestBySuperAdmin,
  deleteServiceRequest,
  getAllServiceRequests,
  getMyServiceRequestById,
  getMyServiceRequests,
  getServiceRequestByIdForSuperAdmin,
  updateServiceRequestBySuperAdmin,
  updateServiceRequestByClient,
  updateServiceRequestStatus,
} from "../controllers/serviceRequestController.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("client"), createServiceRequest);

router.post(
  "/super-admin",
  protect,
  authorizeRoles("super_admin", "admin"),
  createServiceRequestBySuperAdmin
);

router.get(
  "/my-requests",
  protect,
  authorizeRoles("client"),
  getMyServiceRequests
);

router
  .route("/my-requests/:id")
  .get(protect, authorizeRoles("client"), getMyServiceRequestById)
  .patch(protect, authorizeRoles("client"), updateServiceRequestByClient);

router.get(
  "/",
  protect,
  authorizeRoles("super_admin", "admin"),
  getAllServiceRequests
);

router.patch(
  "/:id/status",
  protect,
  authorizeRoles("super_admin", "admin"),
  updateServiceRequestStatus
);

router.post(
  "/:id/convert-to-project",
  protect,
  authorizeRoles("super_admin", "admin"),
  convertServiceRequestToProject
);

router
  .route("/:id")
  .get(
    protect,
    authorizeRoles("super_admin", "admin"),
    getServiceRequestByIdForSuperAdmin
  )
  .patch(
    protect,
    authorizeRoles("super_admin", "admin"),
    updateServiceRequestBySuperAdmin
  )
  .delete(protect, authorizeRoles("super_admin", "admin"), deleteServiceRequest);

export default router;
