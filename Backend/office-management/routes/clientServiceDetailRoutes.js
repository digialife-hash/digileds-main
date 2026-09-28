import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multer.js";
import {
  getMyAssignedServiceDetails,
  getServiceDetailByType,
  saveServiceDetailDraft,
  submitServiceDetail,
  uploadServiceResource,
  deleteServiceResource,
  adminGetAllServiceDetails,
  adminGetServiceDetailById,
  adminUpdateServiceDetailStatus,
} from "../controllers/clientServiceDetailController.js";

const router = express.Router();

// All routes require JWT authentication
router.use(protect);

// ---------------- CLIENT ROUTES ----------------
// Client view assigned services and their detail records
router.get("/assigned-services", getMyAssignedServiceDetails);

// Get specific service detail by type
router.get("/service-type/:serviceType", getServiceDetailByType);

// Save draft for specific service type
router.post("/service-type/:serviceType/draft", saveServiceDetailDraft);

// Submit service detail for review
router.post("/service-type/:serviceType/submit", submitServiceDetail);

// Upload resource / asset file
router.post(
  "/service-type/:serviceType/resources",
  upload.single("resourceFile"),
  uploadServiceResource
);

// Delete resource file
router.delete(
  "/service-type/:serviceType/resources/:resourceId",
  deleteServiceResource
);

// ---------------- ADMIN & EMPLOYEE ROUTES ----------------
// Admin & Employee view all client service details
router.get(
  "/admin/all",
  authorizeRoles("super_admin", "admin", "employee"),
  adminGetAllServiceDetails
);

// Admin & Employee view single service detail record by ID
router.get(
  "/admin/:id",
  authorizeRoles("super_admin", "admin", "employee"),
  adminGetServiceDetailById
);

// Admin & Employee review actions (Approve, Request Changes, Access Status, Internal Notes)
router.patch(
  "/admin/:id/review",
  authorizeRoles("super_admin", "admin", "employee"),
  adminUpdateServiceDetailStatus
);

export default router;
