import mongoose from "mongoose";
import Quotation, { quotationStatuses } from "../models/Quotation.js";
import Lead from "../models/Lead.js";
import Client from "../models/Client.js";
import Project from "../models/Project.js";
import Invoice from "../models/Invoice.js";
import Counter from "../models/Counter.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

const generateQuotationNumber = async () => {
  let counter = await Counter.findOne({ id: "quotationNumber" });
  if (!counter) {
    try {
      counter = await Counter.create({ id: "quotationNumber", seq: 1000 });
    } catch (e) {
      counter = await Counter.findOne({ id: "quotationNumber" });
    }
  }

  const updatedCounter = await Counter.findOneAndUpdate(
    { id: "quotationNumber" },
    { $inc: { seq: 1 } },
    { new: true }
  );

  return `QT-${updatedCounter.seq}`;
};

const calculateQuotationTotals = (items = [], tax = 0, discount = 0) => {
  if (!Array.isArray(items) || !items.length) {
    throw new AppError("At least one quotation item is required", 400, "ITEMS_REQUIRED");
  }

  const normalizedItems = items.map((item) => {
    const description = item.description?.trim();
    const quantity = Math.max(1, Number(item.quantity || 1));
    const rate = Math.max(0, Number(item.rate || 0));
    const amount = Number((quantity * rate).toFixed(2));

    if (!description) {
      throw new AppError("Item description is required", 400, "INVALID_ITEM");
    }

    return { description, quantity, rate, amount };
  });

  const subtotal = Number(normalizedItems.reduce((acc, item) => acc + item.amount, 0).toFixed(2));
  const taxRate = Math.min(100, Math.max(0, Number(tax || 0)));
  const discountAmount = Math.max(0, Number(discount || 0));
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Number(((taxableAmount * taxRate) / 100).toFixed(2));
  const totalAmount = Number((taxableAmount + taxAmount).toFixed(2));

  return {
    normalizedItems,
    subtotal,
    taxRate,
    discountAmount,
    taxAmount,
    totalAmount,
  };
};

export const createQuotation = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
  }

  const {
    leadId,
    clientId,
    validUntil,
    items = [],
    tax = 0,
    discount = 0,
    termsAndConditions,
    status = "Draft",
  } = req.body;

  if (!validUntil) {
    throw new AppError("Valid until date is required", 400, "MISSING_DATE");
  }

  let clientSnapshot = {};
  let validLeadId = null;
  let validClientId = null;

  if (clientId && mongoose.Types.ObjectId.isValid(clientId)) {
    const client = await Client.findById(clientId).lean();
    if (client) {
      validClientId = client._id;
      clientSnapshot = {
        companyName: client.companyName || "",
        clientName: client.clientName || "",
        phone: client.phone || "",
        email: client.email || "",
        address: client.address || "",
      };
    }
  }

  if (!validClientId && leadId && mongoose.Types.ObjectId.isValid(leadId)) {
    const lead = await Lead.findById(leadId).lean();
    if (lead) {
      validLeadId = lead._id;
      clientSnapshot = {
        companyName: lead.companyName || "",
        clientName: lead.leadName || "",
        phone: lead.phone || "",
        email: lead.email || "",
        address: "",
      };
    }
  }

  if (!validClientId && !validLeadId && req.body.clientSnapshot) {
    clientSnapshot = req.body.clientSnapshot;
  }

  const {
    normalizedItems,
    subtotal,
    taxRate,
    discountAmount,
    taxAmount,
    totalAmount,
  } = calculateQuotationTotals(items, tax, discount);

  const quotationNumber = await generateQuotationNumber();

  const quotation = await Quotation.create({
    quotationNumber,
    leadId: validLeadId,
    clientId: validClientId,
    clientSnapshot,
    quotationDate: new Date(),
    validUntil: new Date(validUntil),
    items: normalizedItems,
    subtotal,
    tax: taxRate,
    taxAmount,
    discount: discountAmount,
    totalAmount,
    termsAndConditions: termsAndConditions ? termsAndConditions.trim() : undefined,
    status: quotationStatuses.includes(status) ? status : "Draft",
    createdBy: req.user._id,
  });

  const createdQuotation = await Quotation.findById(quotation._id)
    .populate("leadId", "leadName companyName phone email")
    .populate("clientId", "clientName companyName phone email")
    .lean();

  return res.status(201).json({
    success: true,
    message: "Quotation created successfully",
    data: { quotation: createdQuotation },
  });
});

export const getAllQuotations = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
  }

  const {
    page = 1,
    limit = 10,
    search = "",
    status = "",
    leadId = "",
    clientId = "",
  } = req.query;

  const query = {};

  if (status) query.status = status;
  if (leadId && mongoose.Types.ObjectId.isValid(leadId)) query.leadId = new mongoose.Types.ObjectId(leadId);
  if (clientId && mongoose.Types.ObjectId.isValid(clientId)) query.clientId = new mongoose.Types.ObjectId(clientId);

  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), "i");
    query.$or = [
      { quotationNumber: searchRegex },
      { "clientSnapshot.companyName": searchRegex },
      { "clientSnapshot.clientName": searchRegex },
      { "clientSnapshot.email": searchRegex },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [quotations, total] = await Promise.all([
    Quotation.find(query)
      .populate("leadId", "leadName companyName phone email")
      .populate("clientId", "clientName companyName phone email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Quotation.countDocuments(query),
  ]);

  return res.status(200).json({
    success: true,
    data: {
      quotations,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    },
  });
});

export const getQuotationById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid quotation ID", 400, "INVALID_ID");
  }

  const quotation = await Quotation.findById(id)
    .populate("leadId", "leadName companyName phone email")
    .populate("clientId", "clientName companyName phone email")
    .populate("convertedProjectId", "projectName status progressPercentage")
    .populate("convertedInvoiceId", "invoiceNumber paymentStatus totalAmount")
    .lean();

  if (!quotation) {
    throw new AppError("Quotation not found", 404, "NOT_FOUND");
  }

  return res.status(200).json({
    success: true,
    data: { quotation },
  });
});

export const updateQuotation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid quotation ID", 400, "INVALID_ID");
  }

  const quotation = await Quotation.findById(id);
  if (!quotation) {
    throw new AppError("Quotation not found", 404, "NOT_FOUND");
  }

  if (req.body.items !== undefined || req.body.tax !== undefined || req.body.discount !== undefined) {
    const {
      normalizedItems,
      subtotal,
      taxRate,
      discountAmount,
      taxAmount,
      totalAmount,
    } = calculateQuotationTotals(
      req.body.items || quotation.items,
      req.body.tax ?? quotation.tax,
      req.body.discount ?? quotation.discount
    );

    quotation.items = normalizedItems;
    quotation.subtotal = subtotal;
    quotation.tax = taxRate;
    quotation.taxAmount = taxAmount;
    quotation.discount = discountAmount;
    quotation.totalAmount = totalAmount;
  }

  if (req.body.status && quotationStatuses.includes(req.body.status)) {
    quotation.status = req.body.status;
  }

  if (req.body.validUntil) {
    quotation.validUntil = new Date(req.body.validUntil);
  }

  if (req.body.termsAndConditions !== undefined) {
    quotation.termsAndConditions = req.body.termsAndConditions;
  }

  await quotation.save();

  const updatedQuotation = await Quotation.findById(quotation._id)
    .populate("leadId", "leadName companyName phone email")
    .populate("clientId", "clientName companyName phone email")
    .lean();

  return res.status(200).json({
    success: true,
    message: "Quotation updated successfully",
    data: { quotation: updatedQuotation },
  });
});

export const deleteQuotation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid quotation ID", 400, "INVALID_ID");
  }

  const quotation = await Quotation.findByIdAndDelete(id);
  if (!quotation) {
    throw new AppError("Quotation not found", 404, "NOT_FOUND");
  }

  return res.status(200).json({
    success: true,
    message: "Quotation deleted successfully",
  });
});

// POST Convert Accepted Quotation -> Project and/or Invoice
export const convertQuotationToProjectAndInvoice = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { createProject = true, createInvoice = true } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid quotation ID", 400, "INVALID_ID");
  }

  const quotation = await Quotation.findById(id);
  if (!quotation) {
    throw new AppError("Quotation not found", 404, "NOT_FOUND");
  }

  // 1. Resolve or Create Client
  let clientId = quotation.clientId;
  if (!clientId && quotation.leadId) {
    const lead = await Lead.findById(quotation.leadId);
    if (lead) {
      let client = await Client.findOne({
        $or: [
          ...(lead.phone ? [{ phone: lead.phone }] : []),
          ...(lead.email ? [{ email: lead.email }] : []),
        ],
      });

      if (!client) {
        client = await Client.create({
          clientName: lead.leadName,
          companyName: lead.companyName || lead.leadName,
          email: lead.email || `client_${Date.now()}@example.com`,
          phone: lead.phone,
          businessCategory: lead.serviceInterested || "General",
          status: "active",
          createdBy: req.user._id,
        });
      }

      lead.leadStatus = "Converted";
      lead.convertedClientId = client._id;
      await lead.save();

      clientId = client._id;
      quotation.clientId = client._id;
    }
  }

  if (!clientId) {
    // Create client from snapshot
    const client = await Client.create({
      clientName: quotation.clientSnapshot.clientName || "Client",
      companyName: quotation.clientSnapshot.companyName || "Company",
      email: quotation.clientSnapshot.email || `client_${Date.now()}@example.com`,
      phone: quotation.clientSnapshot.phone || "0000000000",
      status: "active",
      createdBy: req.user._id,
    });
    clientId = client._id;
    quotation.clientId = client._id;
  }

  let createdProjectObj = null;
  let createdInvoiceObj = null;

  // 2. Create Project if requested
  if (createProject && !quotation.convertedProjectId) {
    const projectName = `${quotation.clientSnapshot.companyName || quotation.clientSnapshot.clientName || "Project"} - ${quotation.items[0]?.description || "Service"}`;

    createdProjectObj = await Project.create({
      projectName,
      clientId,
      category: quotation.items[0]?.description || "General",
      startDate: new Date(),
      deadline: quotation.validUntil,
      budget: quotation.totalAmount,
      status: "in_progress",
      priority: "medium",
      description: `Project generated from Quotation ${quotation.quotationNumber}.\nItems:\n${quotation.items.map((i) => `- ${i.description} (Qty: ${i.quantity}, Rate: ${i.rate})`).join("\n")}`,
      createdBy: req.user._id,
    });

    quotation.convertedProjectId = createdProjectObj._id;
  }

  // 3. Create Invoice if requested
  if (createInvoice && !quotation.convertedInvoiceId) {
    let counter = await Counter.findOne({ id: "invoiceNumber" });
    if (!counter) {
      try {
        counter = await Counter.create({ id: "invoiceNumber", seq: 1000 });
      } catch (e) {
        counter = await Counter.findOne({ id: "invoiceNumber" });
      }
    }
    const updatedCounter = await Counter.findOneAndUpdate(
      { id: "invoiceNumber" },
      { $inc: { seq: 1 } },
      { new: true }
    );
    const invoiceNumber = `DAlife${updatedCounter.seq}`;

    createdInvoiceObj = await Invoice.create({
      invoiceNumber,
      clientId,
      projectId: quotation.convertedProjectId || (createdProjectObj ? createdProjectObj._id : null),
      items: quotation.items.map((i) => ({ description: i.description, amount: i.amount })),
      amount: quotation.subtotal,
      tax: quotation.tax,
      totalAmount: quotation.totalAmount,
      paymentStatus: "pending",
      dueDate: quotation.validUntil,
      clientSnapshot: quotation.clientSnapshot,
      createdBy: req.user._id,
    });

    quotation.convertedInvoiceId = createdInvoiceObj._id;
  }

  quotation.status = "Converted";
  await quotation.save();

  return res.status(200).json({
    success: true,
    message: "Quotation converted successfully",
    data: {
      quotation,
      project: createdProjectObj,
      invoice: createdInvoiceObj,
    },
  });
});
