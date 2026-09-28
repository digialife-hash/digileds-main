import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import {
  createInvoice,
  getAllInvoices,
  getMyEmployeeInvoiceOptions,
  getMyEmployeeInvoices,
  getMyInvoices,
  updateInvoice,
  deleteInvoice
} from "../controllers/invoiceController.js";

const router = express.Router();

router.get("/client/my-invoices", protect, authorizeRoles("client"), getMyInvoices);
router.get(
  "/employee/my-bills",
  protect,
  authorizeRoles("employee"),
  getMyEmployeeInvoices
);
router.get(
  "/employee/options",
  protect,
  authorizeRoles("employee"),
  getMyEmployeeInvoiceOptions
);

router
  .route("/")
  .get(protect, authorizeRoles("super_admin", "admin"), getAllInvoices)
  .post(protect, authorizeRoles("super_admin", "employee"), createInvoice);

router.patch("/:id", protect, authorizeRoles("super_admin", "admin"), updateInvoice);

router.delete("/:id", protect, authorizeRoles("super_admin"), deleteInvoice);

export default router;
