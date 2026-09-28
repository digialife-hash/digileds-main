import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import {
  createAdminAccount,
  deleteAdminAccount,
  getAdminAccounts,
  updateAdminAccount,
} from "../controllers/adminManagementController.js";

const router = express.Router();

router.use(protect, authorizeRoles("super_admin"));
router.get("/", getAdminAccounts);
router.post("/", createAdminAccount);
router.patch("/:id", updateAdminAccount);
router.delete("/:id", deleteAdminAccount);

export default router;
