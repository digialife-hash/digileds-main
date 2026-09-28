import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import {
  getBankSettings,
  getBrandingSettings,
  getCompanySettings,
  updateBankSettings,
  updateBrandingSettings,
  updateCompanySettings,
} from "../controllers/settingsController.js";

const router = express.Router();

router.use(protect, authorizeRoles("super_admin"));

router
  .route("/company")
  .get(getCompanySettings)
  .patch(updateCompanySettings);

router
  .route("/bank")
  .get(getBankSettings)
  .patch(updateBankSettings);

router
  .route("/branding")
  .get(getBrandingSettings)
  .patch(updateBrandingSettings);

export default router;
