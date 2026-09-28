import SupportTicket from "../models/SupportTicket.js";
import FAQ from "../models/FAQ.js";
import Feedback from "../models/Feedback.js";
import ReferralPartner from "../models/ReferralPartner.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

// Helper: Get Partner ID for User
const getPartnerIdForUser = async (userId) => {
  const partner = await ReferralPartner.findOne({ userId });
  return partner ? partner._id : null;
};

// 1. GET TICKETS
export const getSupportTickets = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = "", category = "", status = "" } = req.query;

  const query = { isDeleted: false };
  if (req.user.role === "referral_partner") {
    query.userId = req.user._id;
  }

  if (category) query.category = category;
  if (status) query.status = status;

  if (search) {
    const searchRegex = new RegExp(search, "i");
    query.$or = [{ ticketNumber: searchRegex }, { subject: searchRegex }, { description: searchRegex }];
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const skip = (pageNum - 1) * limitNum;

  const total = await SupportTicket.countDocuments(query);
  const tickets = await SupportTicket.find(query)
    .populate("userId", "name email role")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    message: "Support tickets retrieved",
    data: {
      tickets,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    },
    error: null,
  });
});

// 2. GET TICKET BY ID
export const getTicketById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const ticket = await SupportTicket.findOne({ _id: id, isDeleted: false })
    .populate("userId", "name email role")
    .populate("replies.sender", "name email role");

  if (!ticket) {
    throw new AppError("Support ticket not found", 404, "TICKET_NOT_FOUND");
  }

  if (req.user.role === "referral_partner" && ticket.userId._id.toString() !== req.user._id.toString()) {
    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }

  res.status(200).json({
    success: true,
    message: "Ticket details retrieved",
    data: { ticket },
    error: null,
  });
});

// 3. CREATE SUPPORT TICKET
export const createTicket = asyncHandler(async (req, res) => {
  const { subject, category, priority, description } = req.body;

  if (!subject || !description) {
    throw new AppError("Subject and description are required", 400, "MISSING_FIELDS");
  }

  const partnerId = await getPartnerIdForUser(req.user._id);

  const randNum = Math.floor(1000 + Math.random() * 9000);
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const ticketNumber = `TICK-${dateStr}-${randNum}`;

  let attachments = [];
  if (req.files && req.files.length > 0) {
    attachments = req.files.map((file) => `/uploads/${file.filename}`);
  }

  const ticket = await SupportTicket.create({
    ticketNumber,
    partnerId,
    userId: req.user._id,
    subject,
    category: category || "Technical Issues",
    priority: priority || "Medium",
    description,
    attachments,
  });

  res.status(201).json({
    success: true,
    message: "Support ticket raised successfully",
    data: { ticket },
    error: null,
  });
});

// 4. REPLY TO TICKET
export const replyTicket = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  if (!message || !message.trim()) {
    throw new AppError("Reply message is required", 400, "MISSING_MESSAGE");
  }

  const ticket = await SupportTicket.findOne({ _id: id, isDeleted: false });
  if (!ticket) {
    throw new AppError("Support ticket not found", 404, "TICKET_NOT_FOUND");
  }

  let attachments = [];
  if (req.files && req.files.length > 0) {
    attachments = req.files.map((file) => `/uploads/${file.filename}`);
  }

  ticket.replies.push({
    sender: req.user._id,
    message: message.trim(),
    attachments,
  });

  if (req.user.role === "super_admin") {
    ticket.status = "Waiting for Customer";
  } else {
    ticket.status = "In Progress";
  }

  await ticket.save();

  res.status(200).json({
    success: true,
    message: "Reply added to ticket",
    data: { ticket },
    error: null,
  });
});

// 5. CLOSE TICKET
export const closeTicket = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const ticket = await SupportTicket.findOne({ _id: id, isDeleted: false });
  if (!ticket) {
    throw new AppError("Support ticket not found", 404, "TICKET_NOT_FOUND");
  }

  ticket.status = "Closed";
  ticket.closedAt = new Date();
  await ticket.save();

  res.status(200).json({
    success: true,
    message: "Ticket closed successfully",
    data: { ticket },
    error: null,
  });
});

// 6. FAQS (GET & CREATE)
export const getFAQs = asyncHandler(async (req, res) => {
  const { category = "", search = "" } = req.query;

  const query = { isActive: true };
  if (category) query.category = category;

  if (search) {
    const searchRegex = new RegExp(search, "i");
    query.$or = [{ question: searchRegex }, { answer: searchRegex }];
  }

  let faqs = await FAQ.find(query).sort({ order: 1, createdAt: -1 });

  // Seed default FAQs if empty
  if (faqs.length === 0) {
    const defaults = [
      {
        question: "How do I submit a new client referral?",
        answer: "Navigate to the Referral Client Management page and click on 'Add Referral'. Enter client details and click submit.",
        category: "Referral",
      },
      {
        question: "When are referral commissions credited?",
        answer: "Commissions are automatically generated when a referral status becomes 'Converted' and are paid after admin payout approval.",
        category: "Commission",
      },
      {
        question: "How can I verify my digital partner certificate?",
        answer: "Scan the QR code on your certificate or share the public verification URL with clients for instant verification.",
        category: "Certificate",
      },
    ];
    faqs = await FAQ.insertMany(defaults);
  }

  res.status(200).json({
    success: true,
    message: "FAQs retrieved successfully",
    data: { faqs },
    error: null,
  });
});

export const createFAQ = asyncHandler(async (req, res) => {
  const { question, answer, category } = req.body;

  if (req.user.role !== "super_admin") {
    throw new AppError("Only Admins can create FAQs", 403, "PERMISSION_DENIED");
  }

  const faq = await FAQ.create({
    question,
    answer,
    category: category || "Account",
  });

  res.status(201).json({
    success: true,
    message: "FAQ created successfully",
    data: { faq },
    error: null,
  });
});

// 7. FEEDBACK (SUBMIT & GET)
export const submitFeedback = asyncHandler(async (req, res) => {
  const { rating, category, comments } = req.body;

  if (!rating || !comments) {
    throw new AppError("Rating and comments are required", 400, "MISSING_FIELDS");
  }

  const partnerId = await getPartnerIdForUser(req.user._id);

  const feedback = await Feedback.create({
    partnerId,
    userId: req.user._id,
    rating: Number(rating),
    category: category || "Suggestions",
    comments,
  });

  res.status(201).json({
    success: true,
    message: "Feedback submitted successfully! Thank you.",
    data: { feedback },
    error: null,
  });
});

export const getFeedbacks = asyncHandler(async (req, res) => {
  if (req.user.role !== "super_admin") {
    throw new AppError("Only Admins can view feedback list", 403, "PERMISSION_DENIED");
  }

  const feedbacks = await Feedback.find()
    .populate("userId", "name email role")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: "Feedbacks retrieved",
    data: { feedbacks },
    error: null,
  });
});
