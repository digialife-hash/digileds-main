import express from "express";
import {
  getAdminPartnerDashboard,
  getAllPartnersAdmin,
  getPartnerByIdAdmin,
  createPartnerAdmin,
  updatePartnerAdmin,
  activatePartnerAdmin,
  deactivatePartnerAdmin,
  suspendPartnerAdmin,
  approvePartner,
  rejectPartner,
  updatePartnerLevel,
  resetPartnerPasswordAdmin,
  deletePartnerAdmin,
} from "../controllers/adminPartnerController.js";
import {
  uploadPartnerCompanyDocuments,
  getPartnerCompanyDocuments,
  updatePartnerCompanyDocument,
  deletePartnerCompanyDocument,
  downloadPartnerCompanyDocument,
} from "../controllers/partnerCompanyDocumentController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.use(protect, authorizeRoles("super_admin", "admin"));

router.get("/dashboard/analytics", getAdminPartnerDashboard);
router.get("/", getAllPartnersAdmin);
router.post("/", createPartnerAdmin);

// Partner Company Documents APIs (Admin)
router.post("/:partnerId/company-documents", upload.array("files", 10), uploadPartnerCompanyDocuments);
router.get("/:partnerId/company-documents", getPartnerCompanyDocuments);
router.put("/company-documents/:id", upload.single("file"), updatePartnerCompanyDocument);
router.delete("/company-documents/:id", deletePartnerCompanyDocument);
router.get("/company-documents/:id/download", downloadPartnerCompanyDocument);

router.get("/:id", getPartnerByIdAdmin);
router.put("/:id", updatePartnerAdmin);
router.put("/:id/activate", activatePartnerAdmin);
router.put("/:id/deactivate", deactivatePartnerAdmin);
router.put("/:id/suspend", suspendPartnerAdmin);
router.put("/:id/approve", approvePartner);
router.put("/:id/reject", rejectPartner);
router.put("/:id/level", updatePartnerLevel);
router.put("/:id/reset-password", resetPartnerPasswordAdmin);
router.delete("/:id", deletePartnerAdmin);

export default router;
