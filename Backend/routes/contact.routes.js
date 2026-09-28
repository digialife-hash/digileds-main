import express from "express";
import requireAdmin from "../middleware/admin.middleware.js";
import { asyncHandler } from "../middleware/async-handler.js";
import {
  createContactEnquiry,
  deleteContactEnquiry,
  listContactEnquiries,
  updateContactEnquiry,
} from "../controllers/contact.controller.js";

const router = express.Router();
router.post("/api/contact-enquiries", asyncHandler(createContactEnquiry));
router.get(
  "/api/contact-enquiries",
  requireAdmin,
  asyncHandler(listContactEnquiries),
);
router.patch(
  "/api/contact-enquiries/:id",
  requireAdmin,
  asyncHandler(updateContactEnquiry),
);
router.delete(
  "/api/contact-enquiries/:id",
  requireAdmin,
  asyncHandler(deleteContactEnquiry),
);

export default router;
