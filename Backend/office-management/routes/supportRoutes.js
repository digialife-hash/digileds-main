import express from "express";
import {
  getSupportTickets,
  getTicketById,
  createTicket,
  replyTicket,
  closeTicket,
  getFAQs,
  createFAQ,
  submitFeedback,
  getFeedbacks,
} from "../controllers/supportController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.use(protect);

router.get("/faqs", getFAQs);
router.post("/faqs", authorizeRoles("super_admin"), createFAQ);

router.get("/tickets", getSupportTickets);
router.post("/tickets", upload.array("attachments", 5), createTicket);
router.get("/tickets/:id", getTicketById);
router.post("/tickets/:id/reply", upload.array("attachments", 5), replyTicket);
router.put("/tickets/:id/close", closeTicket);

router.post("/feedback", submitFeedback);
router.get("/feedbacks", authorizeRoles("super_admin"), getFeedbacks);

export default router;
