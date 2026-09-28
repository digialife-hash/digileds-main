import mongoose from "mongoose";

export const expenseCategoryGroups = {
  "Office & Administration": [
    "Office Rent",
    "Electricity Bill",
    "Water Bill",
    "Internet Bill",
    "Telephone Bill",
    "Mobile Recharge",
    "Office Maintenance",
    "Cleaning",
    "Security",
    "Stationery",
    "Printing",
    "Courier",
    "Postage",
    "Office Supplies",
    "Furniture",
    "Office Equipment",
  ],
  "Employee Expenses": [
    "Salary",
    "Employee Reimbursement",
    "Travel Expense",
    "Fuel Expense",
    "Local Conveyance",
    "Cab/Taxi",
    "Hotel",
    "Food",
    "Refreshments",
    "Employee Welfare",
    "Team Lunch",
    "Training",
    "Recruitment",
    "Medical Expense",
    "Incentive",
    "Bonus",
  ],
  Technology: [
    "Software Subscription",
    "Hosting",
    "Domain",
    "Server/VPS",
    "Cloud Services",
    "SaaS Subscription",
    "Email Services",
    "API Charges",
    "Software License",
    "Computer/Laptop",
    "Mobile Device",
    "Networking Equipment",
    "Repair & Maintenance",
    "IT Accessories",
  ],
  Marketing: [
    "Digital Marketing",
    "Social Media Ads",
    "Google Ads",
    "Facebook/Instagram Ads",
    "Printing & Branding",
    "Banner",
    "Promotional Material",
    "Event Expense",
    "Sponsorship",
  ],
  "Professional Services": [
    "Consultant Fee",
    "Accountant Fee",
    "CA Fee",
    "Legal Fee",
    "Freelancer Payment",
    "Contractor Payment",
    "Professional Service",
  ],
  "Financial Expenses": [
    "Bank Charges",
    "Payment Gateway Charges",
    "Interest",
    "Loan EMI",
    "Credit Card Charges",
    "Penalty",
    "Tax Payment",
    "GST Payment",
  ],
  Miscellaneous: [
    "Electricity",
    "Internet",
    "Software",
    "Marketing",
    "Travel",
    "Equipment",
    "Maintenance",
    "Stationery",
    "Donation",
    "Petty Cash",
    "Miscellaneous Expense",
    "Other",
    "Miscellaneous",
  ],
};

export const expenseCategories = Object.values(expenseCategoryGroups).flat();

export const paymentMethods = [
  "Cash",
  "UPI",
  "Bank Transfer",
  "NEFT",
  "RTGS",
  "IMPS",
  "Debit Card",
  "Credit Card",
  "Cheque",
  "Wallet",
  "Petty Cash",
  "Other",
];

export const paymentStatuses = ["Unpaid", "Partially Paid", "Paid", "Overdue", "Cancelled"];
export const approvalStatuses = ["Draft", "Pending Approval", "Approved", "Rejected", "Cancelled"];
export const reimbursementStatuses = [
  "Draft",
  "Submitted",
  "Under Review",
  "Approved",
  "Partially Approved",
  "Rejected",
  "Paid",
];

const attachmentSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, default: "Supporting Document" },
    type: {
      type: String,
      enum: [
        "Bill",
        "Invoice",
        "Receipt",
        "Payment Screenshot",
        "Bank Receipt",
        "GST Invoice",
        "Purchase Order",
        "Agreement",
        "Supporting Document",
      ],
      default: "Supporting Document",
    },
    originalName: { type: String, trim: true, default: "" },
    filename: { type: String, trim: true, default: "" },
    path: { type: String, trim: true, default: "" },
    mimetype: { type: String, trim: true, default: "" },
    size: { type: Number, min: 0, default: 0 },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const paymentSchema = new mongoose.Schema(
  {
    paymentDate: { type: Date, default: Date.now },
    amount: { type: Number, min: [0, "Payment amount cannot be negative"], required: true },
    paymentMethod: { type: String, enum: paymentMethods, default: "Bank Transfer" },
    transactionReference: { type: String, trim: true, default: "" },
    bankReferenceNumber: { type: String, trim: true, default: "" },
    utrNumber: { type: String, trim: true, default: "" },
    chequeNumber: { type: String, trim: true, default: "" },
    chequeDate: { type: Date, default: null },
    bankName: { type: String, trim: true, default: "" },
    upiTransactionId: { type: String, trim: true, default: "" },
    notes: { type: String, trim: true, default: "" },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const expenseSchema = new mongoose.Schema(
  {
    expenseId: { type: String, unique: true, sparse: true, trim: true },
    expenseTitle: {
      type: String,
      required: [true, "Expense title is required"],
      trim: true,
      maxlength: [180, "Expense title cannot exceed 180 characters"],
    },
    description: { type: String, trim: true, default: "", maxlength: 3000 },
    category: {
      type: String,
      enum: { values: expenseCategories, message: "Invalid expense category: {VALUE}" },
      default: "Miscellaneous",
    },
    categoryGroup: { type: String, trim: true, default: "Miscellaneous" },
    subcategory: { type: String, trim: true, default: "" },
    expenseDate: { type: Date, default: Date.now },
    date: { type: Date, default: Date.now },
    entryDate: { type: Date, default: Date.now },
    expenseMonth: { type: String, trim: true, default: "" },
    financialYear: { type: String, trim: true, default: "" },

    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", default: null },
    vendorSnapshot: {
      vendorName: { type: String, trim: true, default: "" },
      contactPerson: { type: String, trim: true, default: "" },
      phone: { type: String, trim: true, default: "" },
      email: { type: String, trim: true, default: "" },
      address: { type: String, trim: true, default: "" },
      city: { type: String, trim: true, default: "" },
      state: { type: String, trim: true, default: "" },
      pinCode: { type: String, trim: true, default: "" },
      gstin: { type: String, trim: true, uppercase: true, default: "" },
      pan: { type: String, trim: true, uppercase: true, default: "" },
      bankName: { type: String, trim: true, default: "" },
      accountNumber: { type: String, trim: true, default: "" },
      ifscCode: { type: String, trim: true, uppercase: true, default: "" },
      upiId: { type: String, trim: true, default: "" },
    },
    paidTo: { type: String, trim: true, default: "" },

    baseAmount: { type: Number, min: 0, default: 0 },
    taxableAmount: { type: Number, min: 0, default: 0 },
    gstApplicable: { type: Boolean, default: false },
    gstRate: { type: Number, min: 0, max: 100, default: 0 },
    gstType: { type: String, enum: ["None", "CGST_SGST", "IGST"], default: "None" },
    cgst: { type: Number, min: 0, default: 0 },
    sgst: { type: Number, min: 0, default: 0 },
    igst: { type: Number, min: 0, default: 0 },
    gstAmount: { type: Number, min: 0, default: 0 },
    otherTax: { type: Number, min: 0, default: 0 },
    discount: { type: Number, min: 0, default: 0 },
    additionalCharges: { type: Number, min: 0, default: 0 },
    totalAmount: { type: Number, min: 0, default: 0 },
    amount: { type: Number, min: [0, "Amount cannot be negative"], default: 0 },
    amountPaid: { type: Number, min: 0, default: 0 },
    pendingAmount: { type: Number, min: 0, default: 0 },

    paymentStatus: { type: String, enum: paymentStatuses, default: "Unpaid" },
    paymentMethod: { type: String, enum: paymentMethods, default: "Bank Transfer" },
    paymentDate: { type: Date, default: null },
    transactionId: { type: String, trim: true, default: "" },
    referenceNumber: { type: String, trim: true, default: "" },
    bankReferenceNumber: { type: String, trim: true, default: "" },
    utrNumber: { type: String, trim: true, default: "" },
    chequeNumber: { type: String, trim: true, default: "" },
    chequeDate: { type: Date, default: null },
    bankName: { type: String, trim: true, default: "" },
    upiTransactionId: { type: String, trim: true, default: "" },
    paymentNotes: { type: String, trim: true, default: "" },
    payments: { type: [paymentSchema], default: [] },

    billNumber: { type: String, trim: true, default: "" },
    invoiceNumber: { type: String, trim: true, default: "" },
    invoiceDate: { type: Date, default: null },
    dueDate: { type: Date, default: null },
    purchaseOrderNumber: { type: String, trim: true, default: "" },
    billAmount: { type: Number, min: 0, default: 0 },
    vendorInvoiceNumber: { type: String, trim: true, default: "" },
    companyGstin: { type: String, trim: true, uppercase: true, default: "" },
    hsnSacCode: { type: String, trim: true, default: "" },
    inputTaxCreditEligible: { type: Boolean, default: false },
    inputTaxCreditAmount: { type: Number, min: 0, default: 0 },
    reverseChargeApplicable: { type: Boolean, default: false },

    attachments: { type: [attachmentSchema], default: [] },

    isRecurring: { type: Boolean, default: false },
    recurringConfig: {
      frequency: {
        type: String,
        enum: ["Daily", "Weekly", "Monthly", "Quarterly", "Half-Yearly", "Yearly", "Custom", ""],
        default: "",
      },
      startDate: { type: Date, default: null },
      endDate: { type: Date, default: null },
      nextDueDate: { type: Date, default: null },
      recurringAmount: { type: Number, min: 0, default: 0 },
      autoCreate: { type: Boolean, default: false },
      reminderDaysBeforeDueDate: { type: Number, min: 0, default: 0 },
    },

    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client", default: null },
    department: { type: String, trim: true, default: "" },
    costCenter: { type: String, trim: true, default: "" },
    branchOffice: { type: String, trim: true, default: "" },

    isReimbursement: { type: Boolean, default: false },
    reimbursement: {
      expenseType: { type: String, trim: true, default: "" },
      claimedAmount: { type: Number, min: 0, default: 0 },
      approvedAmount: { type: Number, min: 0, default: 0 },
      rejectedAmount: { type: Number, min: 0, default: 0 },
      claimReason: { type: String, trim: true, default: "" },
      status: { type: String, enum: reimbursementStatuses, default: "Draft" },
      reimbursementDate: { type: Date, default: null },
    },

    approvalRequired: { type: Boolean, default: false },
    approvalStatus: { type: String, enum: approvalStatuses, default: "Approved" },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    approvedAt: { type: Date, default: null },
    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    rejectedAt: { type: Date, default: null },
    rejectionReason: { type: String, trim: true, default: "" },
    approvalNotes: { type: String, trim: true, default: "" },

    priority: { type: String, enum: ["Normal", "Important", "Urgent"], default: "Normal" },
    tags: { type: [String], default: [] },
    notes: { type: String, trim: true, default: "" },
    internalNotes: { type: String, trim: true, default: "" },

    payrollId: { type: mongoose.Schema.Types.ObjectId, ref: "Payroll", default: null },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

const toNumber = (value) => {
  const numberValue = Number(value || 0);
  return Number.isFinite(numberValue) ? Math.max(0, numberValue) : 0;
};

const getFinancialYear = (date) => {
  const month = date.getMonth();
  const year = date.getFullYear();
  const startYear = month >= 3 ? year : year - 1;
  return `${startYear}-${String(startYear + 1).slice(-2)}`;
};

expenseSchema.pre("validate", function (next) {
  const expenseDate = this.expenseDate || this.date || new Date();
  this.expenseDate = expenseDate;
  this.date = expenseDate;
  this.entryDate = this.entryDate || new Date();
  this.expenseMonth = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, "0")}`;
  this.financialYear = this.financialYear || getFinancialYear(expenseDate);

  if (!this.baseAmount && this.amount) this.baseAmount = this.amount;
  if (!this.taxableAmount) this.taxableAmount = this.baseAmount;

  const taxableAmount = toNumber(this.taxableAmount || this.baseAmount);
  const gstRate = this.gstApplicable ? toNumber(this.gstRate) : 0;
  const gstAmount = this.gstApplicable ? (taxableAmount * gstRate) / 100 : 0;
  this.gstAmount = Math.round(gstAmount * 100) / 100;

  if (!this.gstApplicable) {
    this.gstType = "None";
    this.cgst = 0;
    this.sgst = 0;
    this.igst = 0;
  } else if (this.gstType === "IGST") {
    this.igst = this.gstAmount;
    this.cgst = 0;
    this.sgst = 0;
  } else {
    this.gstType = "CGST_SGST";
    this.cgst = Math.round((this.gstAmount / 2) * 100) / 100;
    this.sgst = Math.round((this.gstAmount / 2) * 100) / 100;
    this.igst = 0;
  }

  this.totalAmount = Math.max(
    0,
    Math.round(
      (toNumber(this.baseAmount) +
        this.gstAmount +
        toNumber(this.otherTax) +
        toNumber(this.additionalCharges) -
        toNumber(this.discount)) *
        100
    ) / 100
  );
  this.amount = this.totalAmount;

  const paymentHistoryTotal = this.payments.reduce((sum, payment) => sum + toNumber(payment.amount), 0);
  this.amountPaid = Math.round(Math.max(toNumber(this.amountPaid), paymentHistoryTotal) * 100) / 100;
  this.pendingAmount = Math.max(0, Math.round((this.totalAmount - this.amountPaid) * 100) / 100);

  if (this.paymentStatus !== "Cancelled") {
    if (this.amountPaid <= 0) this.paymentStatus = "Unpaid";
    else if (this.amountPaid >= this.totalAmount) this.paymentStatus = "Paid";
    else this.paymentStatus = "Partially Paid";
  }

  if (this.approvalRequired && this.approvalStatus === "Approved" && !this.approvedAt) {
    this.approvalStatus = "Pending Approval";
  }

  next();
});

expenseSchema.index({ date: 1 });
expenseSchema.index({ expenseDate: 1 });
expenseSchema.index({ category: 1 });
expenseSchema.index({ financialYear: 1 });
expenseSchema.index({ paymentStatus: 1 });
expenseSchema.index({ approvalStatus: 1 });
expenseSchema.index({ department: 1 });
expenseSchema.index({ payrollId: 1 });
expenseSchema.index({ projectId: 1 });
expenseSchema.index({ clientId: 1 });
expenseSchema.index({ "vendorSnapshot.vendorName": 1 });
expenseSchema.index({ isDeleted: 1 });

const Expense = mongoose.model("Expense", expenseSchema);
export default Expense;
