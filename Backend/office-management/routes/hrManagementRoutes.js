import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import {
  createHRAccount,
  deleteHRAccount,
  getHRAccounts,
  updateHRAccount,
} from "../controllers/hrManagementController.js";

const router = express.Router();

router.use(protect, authorizeRoles("super_admin"));
router.get("/", getHRAccounts);
router.post("/", createHRAccount);
router.patch("/:id", updateHRAccount);
router.delete("/:id", deleteHRAccount);

export default router;
