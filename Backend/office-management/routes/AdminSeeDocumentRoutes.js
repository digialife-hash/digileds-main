import express from "express";

import {
  protect,
  authorizeRoles,
} from "../middlewares/authMiddleware.js";

import {
  getAllDocuments,
  deleteDocument,
  getAdminClientUploads,
} from "../controllers/ClientDocumnetUpload.js";

import {
  getAllDocumentsEmp,
  deleteDocumentEmp,
} from "../controllers/EmpDocumentUpload.js";
import checkPermission from "../middlewares/checkPermission.js";

const router = express.Router();

// =====================================================
// AUTHENTICATION
// =====================================================

router.use(protect);

// Only Admin / Super Admin can access these routes
router.use(
  authorizeRoles(
    "super_admin",
    "admin",
    "hr"
  )
);

// =====================================================
// CLIENT DOCUMENTS
// =====================================================

// Get all client documents
router.get(
  "/All_Client",
  getAllDocuments
);

// Get client-wise uploads for Admin Dashboard
router.get(
  "/All_Client/uploads",
  getAdminClientUploads
);

// Delete client document
router.delete(
  "/All_Client/:id",
  deleteDocument
);

// =====================================================
// EMPLOYEE DOCUMENTS
// =====================================================

// Get all employee documents
router.get("/All_Employee", checkPermission("documents", "view"), getAllDocumentsEmp);

// Delete employee document
router.delete("/All_Employee/:id", checkPermission("documents", "delete"), deleteDocumentEmp);

export default router;


