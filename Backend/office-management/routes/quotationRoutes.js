import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import {
  createQuotation,
  getAllQuotations,
  getQuotationById,
  updateQuotation,
  deleteQuotation,
  convertQuotationToProjectAndInvoice,
} from "../controllers/quotationController.js";

const router = express.Router();

router.use(protect);

router.post("/", authorizeRoles("super_admin", "admin", "employee"), createQuotation);
router.get("/", getAllQuotations);
router.get("/:id", getQuotationById);
router.put("/:id", authorizeRoles("super_admin", "admin", "employee"), updateQuotation);
router.delete("/:id", authorizeRoles("super_admin", "admin"), deleteQuotation);
router.post("/:id/convert", authorizeRoles("super_admin", "admin", "employee"), convertQuotationToProjectAndInvoice);

export default router;
