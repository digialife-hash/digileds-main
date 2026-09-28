import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import {
  createSystemUser,
  deleteSystemUser,
  listSystemUsers,
  updateSystemUser,
} from "../controllers/systemUserController.js";

const router = express.Router();
router.use(protect, authorizeRoles("super_admin", "admin"));
router.get("/", listSystemUsers);
router.post("/", createSystemUser);
router.patch("/:id", updateSystemUser);
router.delete("/:id", deleteSystemUser);

export default router;
