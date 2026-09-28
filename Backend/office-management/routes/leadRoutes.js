import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import {
  createLead,
  getAllLeads,
  getLeadById,
  updateLead,
  deleteLead,
  convertLeadToClient,
} from "../controllers/leadController.js";

const router = express.Router();

router.use(protect);

router.post("/", authorizeRoles("super_admin", "admin", "employee"), createLead);
router.get("/", getAllLeads);
router.get("/:id", getLeadById);
router.put("/:id", authorizeRoles("super_admin", "admin", "employee"), updateLead);
router.delete("/:id", authorizeRoles("super_admin", "admin"), deleteLead);
router.post("/:id/convert", authorizeRoles("super_admin", "admin", "employee"), convertLeadToClient);

export default router;
