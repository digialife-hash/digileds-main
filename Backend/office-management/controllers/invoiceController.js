import mongoose from "mongoose";
import Client from "../models/Client.js";
import ClientServiceDetail from "../models/ClientServiceDetail.js";
import Employee from "../models/Employee.js";
import Invoice, { invoicePaymentStatuses,invoicePaymentModes  } from "../models/Invoice.js";
import Notification from "../models/Notification.js";
import Counter from "../models/Counter.js";
import Project from "../models/Project.js";
import Team from "../models/Team.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";


const INVOICE_LIST_FIELDS =
  "invoiceNumber clientId projectId serviceDetailId serviceType items amount tax taxExempt totalAmount paymentStatus paymentMode dueDate createdBy createdAt updatedAt invoiceDate invoiceTime advancePayments totalAdvancePaid advancePayment advancePaymentDate advancePaymentTime balanceAmount clientSnapshot";
// const INVOICE_LIST_FIELDS =
//   "invoiceNumber clientId projectId serviceDetailId serviceType items amount tax taxExempt totalAmount paymentStatus paymentMode dueDate createdBy createdAt updatedAt invoiceDate invoiceTime advancePayment advancePaymentDate advancePaymentTime balanceAmount clientSnapshot";
// const INVOICE_LIST_FIELDS = "invoiceNumber clientId projectId serviceDetailId serviceType items amount tax taxExempt totalAmount paymentStatus dueDate paidDate createdBy createdAt updatedAt invoiceDate invoiceTime advancePayment balanceAmount clientSnapshot";
const CLIENT_FIELDS = "clientName companyName email phone status";
const PROJECT_FIELDS = "projectName category status deadline clientId";
const SERVICE_DETAIL_FIELDS = "serviceName serviceType clientId status";
const USER_FIELDS = "name email role";

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);
};

const requireSuperAdmin = (user) => {
  if (!user) {
    throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
  }

  if (!["super_admin", "admin"].includes(user.role)) {
    throw new AppError("Only super admin can manage invoices", 403, "FORBIDDEN");
  }
};

const requireClient = (user) => {
  if (!user) {
    throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
  }

  if (user.role !== "client") {
    throw new AppError("Only clients can view their invoices", 403, "FORBIDDEN");
  }
};

const getPagination = (query = {}) => {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 10, 1), 100);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

const requireEmployee = (user) => {
  if (!user) {
    throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
  }

  if (user.role !== "employee") {
    throw new AppError("Only employees can view assigned bills", 403, "FORBIDDEN");
  }
};

const requireInvoiceCreator = (user) => {
  if (!user) {
    throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
  }

  if (!["super_admin", "employee"].includes(user.role)) {
    throw new AppError("Only super admin or employees can generate invoices", 403, "FORBIDDEN");
  }
};

const normalizeItems = (items = []) => {
  if (!Array.isArray(items) || !items.length) {
    throw new AppError("At least one invoice item is required", 400, "ITEMS_REQUIRED");
  }

  return items.map((item) => {
    const description = item.description?.trim();
    const amount = Number(item.amount);

    if (!description) {
      throw new AppError("Item description is required", 400, "ITEM_DESCRIPTION_REQUIRED");
    }

    if (!Number.isFinite(amount) || amount < 0) {
      throw new AppError("Item amount must be a valid positive number", 400, "INVALID_ITEM_AMOUNT");
    }

    return {
      description,
      amount,
    };
  });
};

const populateInvoiceQuery = (query) => {
  return query
    .populate("clientId", CLIENT_FIELDS)
    .populate("projectId", PROJECT_FIELDS)
    .populate("serviceDetailId", SERVICE_DETAIL_FIELDS)
    .populate("createdBy", USER_FIELDS);
};

const findClientProfilesForUser = async (user) => {
  const lookup = [];
  if (user.email) lookup.push({ email: user.email });
  if (user.phone) lookup.push({ phone: user.phone });
  if (!lookup.length) return [];

  return Client.find({ $or: lookup }).select("_id").lean();
};

const uniqueIds = (values = []) => {
  return [...new Set(values.map((value) => String(value)).filter(Boolean))];
};

const findEmployeeProfileForUser = async (user) => {
  const lookup = [];
  if (user._id) lookup.push({ userId: user._id });
  if (user.email) lookup.push({ email: user.email });
  if (user.phone) lookup.push({ phone: user.phone });
  if (!lookup.length) return null;

  return Employee.findOne({ $or: lookup }).select("_id").lean();
};

const getEmployeeInvoiceProjectIds = async (user) => {
  const employeeProfile = await findEmployeeProfileForUser(user);
  const assignedIdentityIds = uniqueIds([user?._id, employeeProfile?._id]);

  const teams = employeeProfile?._id
    ? await Team.find({
        status: "active",
        $or: [{ members: employeeProfile._id }, { teamLead: employeeProfile._id }],
      })
        .select("_id assignedProjects")
        .lean()
    : [];

  const teamIds = teams.map((team) => team._id);
  const teamProjectIds = uniqueIds(
    teams.flatMap((team) => team.assignedProjects || [])
  );

  if (!assignedIdentityIds.length && !teamIds.length && !teamProjectIds.length) {
    return [];
  }

  const projects = await Project.find({
    $or: [
      ...(assignedIdentityIds.length
        ? [
            { assignedTeam: { $in: assignedIdentityIds } },
            { "assignedTeam.user": { $in: assignedIdentityIds } },
          ]
        : []),
      ...(teamIds.length ? [{ assignedTeams: { $in: teamIds } }] : []),
      ...(teamProjectIds.length ? [{ _id: { $in: teamProjectIds } }] : []),
    ],
  })
    .select("_id")
    .lean();

  return projects.map((project) => project._id);
};

const calculateInvoiceTotals = (items, tax, taxExempt = false) => {
  const normalizedItems = normalizeItems(items);
  const amount = normalizedItems.reduce((total, item) => total + item.amount, 0);
  const isTaxExempt = taxExempt === true;
  const taxRate = isTaxExempt ? 0 : Number(tax || 0);

  if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100) {
    throw new AppError(
      "Tax must be a valid percentage between 0 and 100",
      400,
      "INVALID_TAX"
    );
  }

  const taxAmount = Number(((amount * taxRate) / 100).toFixed(2));
  const totalAmount = Number((amount + taxAmount).toFixed(2));

  return {
    normalizedItems,
    amount,
    taxRate,
    taxExempt: isTaxExempt,
    totalAmount,
  };
};

const generateInvoiceNumber = async () => {
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

  return `DAlife${updatedCounter.seq}`;
};

const buildInvoiceFilter = (query = {}) => {
  const filter = {};
  const {
    clientId,
    projectId,
    serviceDetailId,
    serviceType,
    paymentStatus,
    deadlineFrom,
    deadlineTo,
  } = query;

  if (clientId) {
    if (!isValidObjectId(clientId)) {
      throw new AppError("Invalid client id", 400, "INVALID_CLIENT_ID");
    }
    filter.clientId = clientId;
  }

  if (projectId) {
    if (!isValidObjectId(projectId)) {
      throw new AppError("Invalid project id", 400, "INVALID_PROJECT_ID");
    }
    filter.projectId = projectId;
  }

  if (serviceDetailId) {
    if (!isValidObjectId(serviceDetailId)) {
      throw new AppError("Invalid service detail id", 400, "INVALID_SERVICE_DETAIL_ID");
    }
    filter.serviceDetailId = serviceDetailId;
  }

  if (serviceType) {
    filter.serviceType = String(serviceType).trim();
  }

  if (paymentStatus) {
    if (!invoicePaymentStatuses.includes(paymentStatus)) {
      throw new AppError("Invalid payment status", 400, "INVALID_PAYMENT_STATUS");
    }
    filter.paymentStatus = paymentStatus;
  }

  if (deadlineFrom || deadlineTo) {
    filter.dueDate = {};

    if (deadlineFrom) filter.dueDate.$gte = new Date(deadlineFrom);
    if (deadlineTo) {
      const deadlineEnd = new Date(deadlineTo);
      deadlineEnd.setHours(23, 59, 59, 999);
      filter.dueDate.$lte = deadlineEnd;
    }
  }

  return filter;
};
 











//admin
export const createInvoice = asyncHandler(async (req, res) => {
  requireInvoiceCreator(req.user);

  const {
    clientId,
    projectId,
    serviceDetailId,
    serviceType,
    items = [],
    tax = 0,
    taxExempt = false,
    paymentStatus = "pending",
    paymentMode = "offline",
    dueDate,
    // paidDate,
    invoiceDate,
    invoiceTime,
    // NEW: array of individual advance payment entries, each shaped like
    // { amount, mode, receivedBy, recordedAt }. Replaces the old single
    // advancePayment / advancePaymentDate / advancePaymentTime fields.
    advancePayments = [],
  } = req.body;

  if (!isValidObjectId(clientId)) {
    throw new AppError("Invalid client id", 400, "INVALID_CLIENT_ID");
  }

  if (projectId && !isValidObjectId(projectId)) {
    throw new AppError("Invalid project id", 400, "INVALID_PROJECT_ID");
  }

  if (serviceDetailId && !isValidObjectId(serviceDetailId)) {
    throw new AppError("Invalid service detail id", 400, "INVALID_SERVICE_DETAIL_ID");
  }

  if (!invoicePaymentStatuses.includes(paymentStatus)) {
    throw new AppError("Invalid payment status", 400, "INVALID_PAYMENT_STATUS");
  }

  if (paymentMode && !invoicePaymentModes.includes(paymentMode)) {
    throw new AppError("Invalid payment mode", 400, "INVALID_PAYMENT_MODE");
  }

  const parsedDueDate = new Date(dueDate);
  if (!dueDate || Number.isNaN(parsedDueDate.getTime())) {
    throw new AppError("Valid due date is required", 400, "INVALID_DUE_DATE");
  }

  if (!Array.isArray(advancePayments)) {
    throw new AppError("Advance payments must be an array", 400, "INVALID_ADVANCE_PAYMENTS");
  }

  const employeeProjectIds =
    req.user.role === "employee" ? await getEmployeeInvoiceProjectIds(req.user) : [];

  if (
    req.user.role === "employee" &&
    (!projectId ||
      !employeeProjectIds.some((allowedProjectId) => String(allowedProjectId) === String(projectId)))
  ) {
    throw new AppError(
      "Employees can generate invoices only for assigned projects",
      403,
      "PROJECT_NOT_ASSIGNED"
    );
  }

  const [client, project, requestedServiceDetail] = await Promise.all([
    Client.findById(clientId).lean(),
    projectId
      ? Project.findOne({ _id: projectId, clientId }).select("_id projectName clientId category").lean()
      : null,
    serviceDetailId
      ? ClientServiceDetail.findOne({ _id: serviceDetailId, clientId })
          .select("_id serviceName serviceType clientId")
          .lean()
      : null,
  ]);

  if (!client) {
    throw new AppError("Client not found", 404, "CLIENT_NOT_FOUND");
  }

  if (projectId && !project) {
    throw new AppError("Project not found for selected client", 404, "PROJECT_NOT_FOUND");
  }

  if (serviceDetailId && !requestedServiceDetail) {
    throw new AppError("Service detail not found for selected client", 404, "SERVICE_DETAIL_NOT_FOUND");
  }

  const trimmedServiceType = String(
    requestedServiceDetail?.serviceType || serviceType || project?.category || ""
  ).trim();
  const matchedServiceDetail =
    requestedServiceDetail ||
    (trimmedServiceType
      ? await ClientServiceDetail.findOne({ clientId, serviceType: trimmedServiceType })
          .select("_id serviceName serviceType clientId")
          .lean()
      : null);

  const { normalizedItems, amount, taxRate, totalAmount } =
    calculateInvoiceTotals(items, tax, taxExempt);

  const finalTotalAmount =
    req.body.totalAmount !== undefined && req.body.totalAmount !== ""
      ? Number(req.body.totalAmount)
      : totalAmount;

  // NEW: validate + normalize each advance payment entry individually so
  // amount/mode/receivedBy/recordedAt are all stored per-entry instead of
  // collapsing into a single running number.
  const normalizedAdvancePayments = advancePayments.map((payment, index) => {
    const entryAmount = Number(payment?.amount || 0);
    if (!Number.isFinite(entryAmount) || entryAmount < 0) {
      throw new AppError(
        `Advance payment #${index + 1} has an invalid amount`,
        400,
        "INVALID_ADVANCE_PAYMENT"
      );
    }
    const mode = invoicePaymentModes.includes(payment?.mode) ? payment.mode : "offline";
    const receivedBy = String(payment?.receivedBy || "").trim();
    const parsedRecordedAt = payment?.recordedAt ? new Date(payment.recordedAt) : new Date();
    return {
      amount: entryAmount,
      mode,
      receivedBy,
      recordedAt: Number.isNaN(parsedRecordedAt.getTime()) ? new Date() : parsedRecordedAt,
    };
  });

  const totalAdvancePaid = Number(
    normalizedAdvancePayments.reduce((sum, payment) => sum + payment.amount, 0).toFixed(2)
  );

  if (totalAdvancePaid < 0) {
    throw new AppError("Advance payment cannot be negative", 400, "INVALID_ADVANCE_PAYMENT");
  }
  if (totalAdvancePaid > finalTotalAmount) {
    throw new AppError("Advance payment cannot exceed the invoice total", 400, "INVALID_ADVANCE_PAYMENT");
  }
  const finalBalanceAmount = Number((finalTotalAmount - totalAdvancePaid).toFixed(2));

  const now = new Date();
  const defaultDate = now.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const defaultTime = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const finalInvoiceDate = invoiceDate || defaultDate;
  const finalInvoiceTime = invoiceTime || defaultTime;

  const clientSnapshot = {
    companyName: client.companyName || "",
    clientName: client.clientName || "",
    phone: client.phone || "",
    gstNumber: client.gstNumber || "",
    email: client.email || "",
    address: client.address || "",
    city: client.city || "",
    state: client.state || "",
    pincode: client.pincode || "",
  };

  const invoice = await Invoice.create({
    invoiceNumber: await generateInvoiceNumber(),
    clientId,
    projectId: projectId || null,
    serviceDetailId: matchedServiceDetail?._id || null,
    serviceType: matchedServiceDetail?.serviceType || trimmedServiceType,
    items: normalizedItems,
    amount,
    tax: taxRate,
    taxExempt: taxExempt === true,
    totalAmount: finalTotalAmount,
    paymentStatus,
    // paymentMode: invoicePaymentModes.includes(paymentMode) ? paymentMode : "offline",
    dueDate: parsedDueDate,
    // paidDate: paidDate ? new Date(paidDate) : paymentStatus === "paid" ? new Date() : null,
    invoiceDate: finalInvoiceDate,
    invoiceTime: finalInvoiceTime,
    // NEW: itemized advance payments + running total
    advancePayments: normalizedAdvancePayments,
    totalAdvancePaid,
    balanceAmount: finalBalanceAmount,
    clientSnapshot,
    createdBy: req.user._id,
  });

  await Notification.create({
    recipientClient: client._id,
    recipientUser: null,
    title: `Invoice ${invoice.invoiceNumber}`,
    message: "A new invoice has been generated for your project.",
    type: "invoice",
    relatedInvoice: invoice._id,
  });

  const createdInvoice = await populateInvoiceQuery(
    Invoice.findById(invoice._id).select(INVOICE_LIST_FIELDS)
  ).lean();

  return res.status(201).json({
    success: true,
    message: "Invoice generated successfully",
    data: {
      invoice: createdInvoice,
    },
    error: null,
  });
});

export const updateInvoice = asyncHandler(async (req, res) => {
  requireSuperAdmin(req.user);

  const { id } = req.params;
  const {
    items,
    tax,
    taxExempt,
    paymentStatus,
    paymentMode,
    dueDate,
    // NEW: full advancePayments array — whenever this is sent, it fully
    // replaces the invoice's existing advance payment entries (the
    // frontend always sends the complete current list on save).
    advancePayments,
    totalAmount,
  } = req.body;

  if (!isValidObjectId(id)) {
    throw new AppError("Invalid invoice id", 400, "INVALID_INVOICE_ID");
  }

  const invoice = await Invoice.findById(id);

  if (!invoice) {
    throw new AppError("Invoice not found", 404, "INVOICE_NOT_FOUND");
  }

  if (paymentStatus !== undefined) {
    if (!invoicePaymentStatuses.includes(paymentStatus)) {
      throw new AppError("Invalid payment status", 400, "INVALID_PAYMENT_STATUS");
    }
    invoice.paymentStatus = paymentStatus;
  }

  if (dueDate !== undefined) {
    const parsedDueDate = new Date(dueDate);
    if (Number.isNaN(parsedDueDate.getTime())) {
      throw new AppError("Valid due date is required", 400, "INVALID_DUE_DATE");
    }
    invoice.dueDate = parsedDueDate;
  }

  if (paymentMode !== undefined) {
    if (!invoicePaymentModes.includes(paymentMode)) {
      throw new AppError("Invalid payment mode", 400, "INVALID_PAYMENT_MODE");
    }
    invoice.paymentMode = paymentMode;
  }

  // if (paidDate !== undefined) {
  //   invoice.paidDate = paidDate ? new Date(paidDate) : null;
  // } else if (paymentStatus === "paid" && !invoice.paidDate) {
  //   invoice.paidDate = new Date();
  // } else if (paymentStatus && paymentStatus !== "paid") {
  //   invoice.paidDate = null;
  // }

  // NEW: validate + normalize + replace the advance payments array
  if (advancePayments !== undefined) {
    if (!Array.isArray(advancePayments)) {
      throw new AppError("Advance payments must be an array", 400, "INVALID_ADVANCE_PAYMENTS");
    }

    const normalizedAdvancePayments = advancePayments.map((payment, index) => {
      const entryAmount = Number(payment?.amount || 0);
      if (!Number.isFinite(entryAmount) || entryAmount < 0) {
        throw new AppError(
          `Advance payment #${index + 1} has an invalid amount`,
          400,
          "INVALID_ADVANCE_PAYMENT"
        );
      }
      const mode = invoicePaymentModes.includes(payment?.mode) ? payment.mode : "offline";
      const receivedBy = String(payment?.receivedBy || "").trim();
      const parsedRecordedAt = payment?.recordedAt ? new Date(payment.recordedAt) : new Date();
      return {
        amount: entryAmount,
        mode,
        receivedBy,
        recordedAt: Number.isNaN(parsedRecordedAt.getTime()) ? new Date() : parsedRecordedAt,
      };
    });

    invoice.advancePayments = normalizedAdvancePayments;
    invoice.totalAdvancePaid = Number(
      normalizedAdvancePayments.reduce((sum, payment) => sum + payment.amount, 0).toFixed(2)
    );
  }

  if (items !== undefined || tax !== undefined || taxExempt !== undefined || totalAmount !== undefined) {
    const { normalizedItems, amount, taxRate, totalAmount: calculatedTotal } =
      calculateInvoiceTotals(
        items || invoice.items,
        tax ?? invoice.tax,
        taxExempt ?? invoice.taxExempt
      );

    invoice.items = normalizedItems;
    invoice.amount = amount;
    invoice.tax = taxRate;
    invoice.taxExempt = taxExempt === undefined ? invoice.taxExempt : taxExempt === true;
    invoice.totalAmount = totalAmount !== undefined && totalAmount !== "" ? Number(totalAmount) : calculatedTotal;
  }

  // NEW: advance total can never exceed the (possibly just-updated) invoice total
  if ((invoice.totalAdvancePaid || 0) > invoice.totalAmount) {
    throw new AppError(
      "Advance payment cannot exceed the invoice total",
      400,
      "INVALID_ADVANCE_PAYMENT"
    );
  }

  // Recalculate balanceAmount off the itemized advance total
  invoice.balanceAmount = Number(
    (invoice.totalAmount - (invoice.totalAdvancePaid || 0)).toFixed(2)
  );

  await invoice.save();

  const updatedInvoice = await populateInvoiceQuery(
    Invoice.findById(invoice._id).select(INVOICE_LIST_FIELDS)
  ).lean();

  return res.status(200).json({
    success: true,
    message: "Invoice updated successfully",
    data: {
      invoice: updatedInvoice,
    },
    error: null,
  });
});

export const getAllInvoices = asyncHandler(async (req, res) => {
  requireSuperAdmin(req.user);

  const { page, limit, skip } = getPagination(req.query);
  const filter = buildInvoiceFilter(req.query);

  const [invoices, totalInvoices] = await Promise.all([
    populateInvoiceQuery(
      Invoice.find(filter)
        .select(INVOICE_LIST_FIELDS)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
    ).lean(),
    Invoice.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    message: "Invoices fetched successfully",
    data: {
      invoices,
      pagination: {
        page,
        limit,
        total: totalInvoices,
        totalPages: Math.ceil(totalInvoices / limit),
      },
    },
    error: null,
  });
});

export const deleteInvoice = asyncHandler(async (req, res) => {
  requireSuperAdmin(req.user);

  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new AppError(
      "Invalid invoice id",
      400,
      "INVALID_INVOICE_ID"
    );
  }

  const invoice = await Invoice.findById(id);

  if (!invoice) {
    throw new AppError(
      "Invoice not found",
      404,
      "INVOICE_NOT_FOUND"
    );
  }

  await Invoice.findByIdAndDelete(id);

  // Optional: invoice ki related notification bhi delete karni ho
  await Notification.deleteMany({
    relatedInvoice: invoice._id,
  });

  return res.status(200).json({
    success: true,
    message: "Invoice deleted successfully",
    data: {
      invoiceId: invoice._id,
    },
    error: null,
  });
});




//employee
export const getMyEmployeeInvoices = asyncHandler(async (req, res) => {
  requireEmployee(req.user);

  const { page, limit, skip } = getPagination(req.query);
  const projectIds = await getEmployeeInvoiceProjectIds(req.user);

  if (!projectIds.length) {
    return res.status(200).json({
      success: true,
      message: "Employee bills fetched successfully",
      data: {
        invoices: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      },
      error: null,
    });
  }

  const requestedFilter = buildInvoiceFilter(req.query);
  const filter = {
    ...requestedFilter,
    projectId: { $in: projectIds },
  };

  const [invoices, totalInvoices] = await Promise.all([
    populateInvoiceQuery(
      Invoice.find(filter)
        .select(INVOICE_LIST_FIELDS)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
    ).lean(),
    Invoice.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    message: "Employee bills fetched successfully",
    data: {
      invoices,
      pagination: {
        page,
        limit,
        total: totalInvoices,
        totalPages: Math.ceil(totalInvoices / limit),
      },
    },
    error: null,
  });
});

export const getMyEmployeeInvoiceOptions = asyncHandler(async (req, res) => {
  requireEmployee(req.user);

  const projectIds = await getEmployeeInvoiceProjectIds(req.user);

  if (!projectIds.length) {
    return res.status(200).json({
      success: true,
      message: "Employee invoice options fetched successfully",
      data: {
        projects: [],
        clients: [],
      },
      error: null,
    });
  }

  const projects = await Project.find({ _id: { $in: projectIds } })
    .select("_id projectName clientId category status deadline")
    .populate("clientId", CLIENT_FIELDS)
    .sort({ projectName: 1 })
    .lean();

  const clientMap = new Map();
  projects.forEach((project) => {
    if (project.clientId?._id) {
      clientMap.set(String(project.clientId._id), project.clientId);
    }
  });

  return res.status(200).json({
    success: true,
    message: "Employee invoice options fetched successfully",
    data: {
      projects,
      clients: [...clientMap.values()],
    },
    error: null,
  });
});


// //clinet
export const getMyInvoices = asyncHandler(async (req, res) => {
  requireClient(req.user);
  
  const { page, limit, skip } = getPagination(req.query);
  const clientProfiles = await findClientProfilesForUser(req.user);
  const clientIds = clientProfiles.map((client) => client._id);
  
  if (!clientIds.length) {
    return res.status(200).json({
      success: true,
      message: "Client invoices fetched successfully",
      data: {
        invoices: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      },
      error: null,
    });
  }
  
  const requestedFilter = buildInvoiceFilter(req.query);
  const filter = {
    ...requestedFilter,
    clientId: { $in: clientIds },
  };


  const clinet = await Client.find({ email: req.user.email })
  

  const [invoices, totalInvoices] = await Promise.all([
    populateInvoiceQuery(
      Invoice.find({ clientId:clinet[0]._id })
        .select(INVOICE_LIST_FIELDS)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
      ).lean(),
      Invoice.countDocuments({ clientId: clinet[0]._id })
    ]);
  
    // 6a96a2e80dafdd3b35022d24

    console.log("invoices", clinet , req.user)
    
  return res.status(200).json({
    success: true,
    message: "Client invoices fetched successfully",
    data: {
      invoices,
      pagination: {
        page,
        limit,
        total: totalInvoices,
        totalPages: Math.ceil(totalInvoices / limit),
      },
    },
    error: null,
  });
});








// export const createInvoice = asyncHandler(async (req, res) => {
//   requireInvoiceCreator(req.user);

//   const {
//     clientId,
//     projectId,
//     serviceDetailId,
//     serviceType,
//     items = [],
//     tax = 0,
//     taxExempt = false,
//     paymentStatus = "pending",
//     paymentMode = "offline",
//     dueDate,
//     // paidDate,
//     invoiceDate,
//     invoiceTime,
//     advancePayment = 0,
//     advancePaymentDate,
//     advancePaymentTime
//   } = req.body;

  
//   if (!isValidObjectId(clientId)) {
//     throw new AppError("Invalid client id", 400, "INVALID_CLIENT_ID");
//   }
  
//   if (projectId && !isValidObjectId(projectId)) {
//     throw new AppError("Invalid project id", 400, "INVALID_PROJECT_ID");
//   }
  
//   if (serviceDetailId && !isValidObjectId(serviceDetailId)) {
//     throw new AppError("Invalid service detail id", 400, "INVALID_SERVICE_DETAIL_ID");
//   }
  
//   if (!invoicePaymentStatuses.includes(paymentStatus)) {
//     throw new AppError("Invalid payment status", 400, "INVALID_PAYMENT_STATUS");
//   }

//   if (paymentMode && !invoicePaymentModes.includes(paymentMode)) {
//     throw new AppError("Invalid payment mode", 400, "INVALID_PAYMENT_MODE");
//   }

//   const parsedDueDate = new Date(dueDate);
//   if (!dueDate || Number.isNaN(parsedDueDate.getTime())) {
//     throw new AppError("Valid due date is required", 400, "INVALID_DUE_DATE");
//   }

//   const employeeProjectIds =
//     req.user.role === "employee" ? await getEmployeeInvoiceProjectIds(req.user) : [];

//   if (
//     req.user.role === "employee" &&
//     (!projectId ||
//       !employeeProjectIds.some((allowedProjectId) => String(allowedProjectId) === String(projectId)))
//   ) {
//     throw new AppError(
//       "Employees can generate invoices only for assigned projects",
//       403,
//       "PROJECT_NOT_ASSIGNED"
//     );
//   }

//   const [client, project, requestedServiceDetail] = await Promise.all([
//     Client.findById(clientId).lean(),
//     projectId
//       ? Project.findOne({ _id: projectId, clientId }).select("_id projectName clientId category").lean()
//       : null,
//     serviceDetailId
//       ? ClientServiceDetail.findOne({ _id: serviceDetailId, clientId })
//           .select("_id serviceName serviceType clientId")
//           .lean()
//       : null,
//   ]);

//   if (!client) {
//     throw new AppError("Client not found", 404, "CLIENT_NOT_FOUND");
//   }

//   if (projectId && !project) {
//     throw new AppError("Project not found for selected client", 404, "PROJECT_NOT_FOUND");
//   }

//   if (serviceDetailId && !requestedServiceDetail) {
//     throw new AppError("Service detail not found for selected client", 404, "SERVICE_DETAIL_NOT_FOUND");
//   }

//   const trimmedServiceType = String(
//     requestedServiceDetail?.serviceType || serviceType || project?.category || ""
//   ).trim();
//   const matchedServiceDetail =
//     requestedServiceDetail ||
//     (trimmedServiceType
//       ? await ClientServiceDetail.findOne({ clientId, serviceType: trimmedServiceType })
//           .select("_id serviceName serviceType clientId")
//           .lean()
//       : null);

//   const { normalizedItems, amount, taxRate, totalAmount } =
//     calculateInvoiceTotals(items, tax, taxExempt);

//   const finalTotalAmount = req.body.totalAmount !== undefined && req.body.totalAmount !== "" ? Number(req.body.totalAmount) : totalAmount;

//   const finalAdvancePayment = Number(advancePayment || 0);
//   if (finalAdvancePayment < 0) {
//     throw new AppError("Advance payment cannot be negative", 400, "INVALID_ADVANCE_PAYMENT");
//   }
//   if (finalAdvancePayment > finalTotalAmount) {
//     throw new AppError("Advance payment cannot exceed the invoice total", 400, "INVALID_ADVANCE_PAYMENT");
//   }
//   const finalBalanceAmount = Number((finalTotalAmount - finalAdvancePayment).toFixed(2));

//   const now = new Date();
//   const defaultDate = now.toLocaleDateString("en-IN", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//   });
//   const defaultTime = now.toLocaleTimeString("en-US", {
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: true,
//   });

//   const finalInvoiceDate = invoiceDate || defaultDate;
//   const finalInvoiceTime = invoiceTime || defaultTime;

//   const clientSnapshot = {
//     companyName: client.companyName || "",
//     clientName: client.clientName || "",
//     phone: client.phone || "",
//     gstNumber: client.gstNumber || "",
//     email: client.email || "",
//     address: client.address || "",
//     city: client.city || "",
//     state: client.state || "",
//     pincode: client.pincode || "",
//   };

//   const invoice = await Invoice.create({
//     invoiceNumber: await generateInvoiceNumber(),
//     clientId,
//     projectId: projectId || null,
//     serviceDetailId: matchedServiceDetail?._id || null,
//     serviceType: matchedServiceDetail?.serviceType || trimmedServiceType,
//     items: normalizedItems,
//     amount,
//     tax: taxRate,
//     taxExempt: taxExempt === true,
//     totalAmount: finalTotalAmount,
//     paymentStatus,
//     paymentMode: invoicePaymentModes.includes(paymentMode) ? paymentMode : "offline",
//     dueDate: parsedDueDate,
//     // paidDate: paidDate ? new Date(paidDate) : paymentStatus === "paid" ? new Date() : null,
//     invoiceDate: finalInvoiceDate,
//     invoiceTime: finalInvoiceTime,
//     advancePayment: finalAdvancePayment,
//      advancePaymentDate: advancePaymentDate || "",
//     advancePaymentTime: advancePaymentTime || "", 
//     balanceAmount: finalBalanceAmount,
//     clientSnapshot,
//     createdBy: req.user._id,
//   });

//   await Notification.create({
//     recipientClient: client._id,
//     recipientUser: null,
//     title: `Invoice ${invoice.invoiceNumber}`,
//     message: "A new invoice has been generated for your project.",
//     type: "invoice",
//     relatedInvoice: invoice._id,
//   });

//   const createdInvoice = await populateInvoiceQuery(
//     Invoice.findById(invoice._id).select(INVOICE_LIST_FIELDS)
//   ).lean();

//   return res.status(201).json({
//     success: true,
//     message: "Invoice generated successfully",
//     data: {
//       invoice: createdInvoice,
//     },
//     error: null,
//   });
// });

// export const updateInvoice = asyncHandler(async (req, res) => {
//   requireSuperAdmin(req.user);


//   const { id } = req.params;
//   const { items, tax, taxExempt, paymentStatus,paymentMode, dueDate, advancePayment,advancePaymentDate,advancePaymentTime, totalAmount } = req.body;

//   if (!isValidObjectId(id)) {
//     throw new AppError("Invalid invoice id", 400, "INVALID_INVOICE_ID");
//   }

//   const invoice = await Invoice.findById(id);

//   if (!invoice) {
//     throw new AppError("Invoice not found", 404, "INVOICE_NOT_FOUND");
//   }

//   if (paymentStatus !== undefined) {
//     if (!invoicePaymentStatuses.includes(paymentStatus)) {
//       throw new AppError("Invalid payment status", 400, "INVALID_PAYMENT_STATUS");
//     }
//     invoice.paymentStatus = paymentStatus;
//   }

//     if (dueDate !== undefined) {
//     const parsedDueDate = new Date(dueDate);
//     if (Number.isNaN(parsedDueDate.getTime())) {
//       throw new AppError("Valid due date is required", 400, "INVALID_DUE_DATE");
//     }
//     invoice.dueDate = parsedDueDate;
//   }


//     if (paymentMode !== undefined) {
//     if (!invoicePaymentModes.includes(paymentMode)) {
//       throw new AppError("Invalid payment mode", 400, "INVALID_PAYMENT_MODE");
//     }
//     invoice.paymentMode = paymentMode;
//   }


//   // if (paidDate !== undefined) {
//   //   invoice.paidDate = paidDate ? new Date(paidDate) : null;
//   // } else if (paymentStatus === "paid" && !invoice.paidDate) {
//   //   invoice.paidDate = new Date();
//   // } else if (paymentStatus && paymentStatus !== "paid") {
//   //   invoice.paidDate = null;
//   // }

  
//   if (advancePayment !== undefined) {
//     const finalAdvancePayment = Number(advancePayment || 0);
//     if (finalAdvancePayment < 0) {
//       throw new AppError("Advance payment cannot be negative", 400, "INVALID_ADVANCE_PAYMENT");
//     }
//     invoice.advancePayment = finalAdvancePayment;
//   }

//   if (advancePaymentDate !== undefined) {
//     invoice.advancePaymentDate = advancePaymentDate || "";
//   }
//   if (advancePaymentTime !== undefined) {
//     invoice.advancePaymentTime = advancePaymentTime || "";
//   }

//   if (items !== undefined || tax !== undefined || taxExempt !== undefined || totalAmount !== undefined) {
//     const { normalizedItems, amount, taxRate, totalAmount: calculatedTotal } =
//       calculateInvoiceTotals(
//         items || invoice.items,
//         tax ?? invoice.tax,
//         taxExempt ?? invoice.taxExempt
//       );

//     invoice.items = normalizedItems;
//     invoice.amount = amount;
//     invoice.tax = taxRate;
//     invoice.taxExempt = taxExempt === undefined ? invoice.taxExempt : taxExempt === true;
//     invoice.totalAmount = totalAmount !== undefined && totalAmount !== "" ? Number(totalAmount) : calculatedTotal;
//   }

//   // Recalculate balanceAmount
//   invoice.balanceAmount = Number((invoice.totalAmount - (invoice.advancePayment || 0)).toFixed(2));

//   await invoice.save();

//   const updatedInvoice = await populateInvoiceQuery(
//     Invoice.findById(invoice._id).select(INVOICE_LIST_FIELDS)
//   ).lean();

//   return res.status(200).json({
//     success: true,
//     message: "Invoice updated successfully",
//     data: {
//       invoice: updatedInvoice,
//     },
//     error: null,
//   });
// });

// export const getAllInvoices = asyncHandler(async (req, res) => {
//   requireSuperAdmin(req.user);

//   const { page, limit, skip } = getPagination(req.query);
//   const filter = buildInvoiceFilter(req.query);

//   const [invoices, totalInvoices] = await Promise.all([
//     populateInvoiceQuery(
//       Invoice.find(filter)
//         .select(INVOICE_LIST_FIELDS)
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit)
//     ).lean(),
//     Invoice.countDocuments(filter),
//   ]);

//   return res.status(200).json({
//     success: true,
//     message: "Invoices fetched successfully",
//     data: {
//       invoices,
//       pagination: {
//         page,
//         limit,
//         total: totalInvoices,
//         totalPages: Math.ceil(totalInvoices / limit),
//       },
//     },
//     error: null,
//   });
// });