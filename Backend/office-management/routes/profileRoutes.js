import express from "express";
import {
  getProfile,
  updatePersonalDetails,
  updateContactDetails,
  updateBankDetails,
  uploadProfilePicture,
  changePassword,
} from "../controllers/profileController.js";
import { protect } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.use(protect);

router.get("/", getProfile);
router.put("/personal", updatePersonalDetails);
router.put("/contact", updateContactDetails);
router.put("/bank", updateBankDetails);
router.post("/picture", upload.single("profilePicture"), uploadProfilePicture);
router.put("/change-password", changePassword);

export default router;
