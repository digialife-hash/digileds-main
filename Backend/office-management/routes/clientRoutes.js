import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import {
  createClient,
  deleteClient,
  getAllClients,
  getClientById,
  getMyAssignedClients,
  updateClient,
  changeClientPassword
} from "../controllers/clientController.js";

const router = express.Router();

router.get(
  "/my-assigned-clients",
  protect,
  authorizeRoles("employee"),
  getMyAssignedClients
);

router
  .route("/")
  .get(protect, authorizeRoles("super_admin", "admin"), getAllClients)
  .post(protect, authorizeRoles("super_admin", "admin"), createClient);

router
  .route("/:id")
  .get(protect, authorizeRoles("super_admin", "admin"), getClientById)
  .patch(protect, authorizeRoles("super_admin", "admin"), updateClient)
  .delete(protect, authorizeRoles("super_admin"), deleteClient);

  router.put(
  "/:clientId/change-password",
  protect,authorizeRoles("super_admin", "admin"),
  changeClientPassword
);

export default router;
