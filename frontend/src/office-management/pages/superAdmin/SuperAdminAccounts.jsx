import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  BriefcaseBusiness,
  Calendar,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  CreditCard,
  Download,
  Edit,
  Eye,
  FileText,
  Filter,
  Plus,
  Receipt,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
  Upload,
  Wallet,
  X,
} from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import PageBackButton from "../../components/common/PageBackButton";
import { getClients } from "../../services/clientService";
import { getProjects } from "../../services/projectService";
import { getEmployees } from "../../services/employeeService";
import {
  addExpensePaymentApi,
  approveExpenseApi,
  createExpenseApi,
  createIncomeApi,
  deleteExpenseApi,
  deleteIncomeApi,
  exportExpensesApi,
  getAccountsSummaryApi,
  getExpenseAnalyticsApi,
  getExpenseDetailsApi,
  getExpenseListApi,
  getIncomeListApi,
  getPendingAmountListApi,
  getProfitLossSummaryApi,
  getTotalWorkAmountListApi,
  rejectExpenseApi,
  updateExpenseApi,
} from "../../services/accountsService";

const expenseCategories = [
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
  "Digital Marketing",
  "Social Media Ads",
  "Google Ads",
  "Facebook/Instagram Ads",
  "Printing & Branding",
  "Banner",
  "Promotional Material",
  "Event Expense",
  "Sponsorship",
  "Consultant Fee",
  "Accountant Fee",
  "CA Fee",
  "Legal Fee",
  "Freelancer Payment",
  "Contractor Payment",
  "Professional Service",
  "Bank Charges",
  "Payment Gateway Charges",
  "Interest",
  "Loan EMI",
  "Credit Card Charges",
  "Penalty",
  "Tax Payment",
  "GST Payment",
  "Donation",
  "Electricity",
  "Internet",
  "Software",
  "Marketing",
  "Travel",
  "Equipment",
  "Maintenance",
  "Stationery",
  "Petty Cash",
  "Miscellaneous Expense",
  "Other",
  "Miscellaneous",
];

const paymentMethods = [
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

const emptyExpenseForm = {
  expenseTitle: "",
  description: "",
  category: "Miscellaneous",
  subcategory: "",
  expenseDate: new Date().toISOString().slice(0, 10),
  baseAmount: "",
  taxableAmount: "",
  gstApplicable: false,
  gstRate: "18",
  gstType: "CGST_SGST",
  otherTax: "",
  discount: "",
  additionalCharges: "",
  amountPaid: "",
  paymentMethod: "Bank Transfer",
  paymentDate: "",
  transactionId: "",
  referenceNumber: "",
  bankReferenceNumber: "",
  utrNumber: "",
  chequeNumber: "",
  chequeDate: "",
  bankName: "",
  upiTransactionId: "",
  paymentNotes: "",
  paidTo: "",
  vendorName: "",
  vendorGstin: "",
  vendorSnapshot: {
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    pan: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    upiId: "",
  },
  invoiceNumber: "",
  invoiceDate: "",
  billNumber: "",
  dueDate: "",
  purchaseOrderNumber: "",
  vendorInvoiceNumber: "",
  hsnSacCode: "",
  inputTaxCreditEligible: false,
  reverseChargeApplicable: false,
  isRecurring: false,
  recurringConfig: {
    frequency: "Monthly",
    startDate: "",
    endDate: "",
    nextDueDate: "",
    recurringAmount: "",
    autoCreate: false,
    reminderDaysBeforeDueDate: "",
  },
  isReimbursement: false,
  reimbursement: {
    expenseType: "",
    claimedAmount: "",
    approvedAmount: "",
    claimReason: "",
    status: "Draft",
  },
  approvalRequired: false,
  approvalStatus: "Approved",
  department: "",
  employeeId: "",
  projectId: "",
  clientId: "",
  priority: "Normal",
  tags: "",
  notes: "",
  internalNotes: "",
  attachments: [],
};

const emptyExpenseFilters = {
  search: "",
  range: "",
  startDate: "",
  endDate: "",
  category: "",
  paymentStatus: "",
  paymentMethod: "",
  approvalStatus: "",
  gst: "",
  recurring: "",
  reimbursement: "",
  projectId: "",
  clientId: "",
  employeeId: "",
  sortBy: "date",
  sortOrder: "desc",
};

const expenseViewTabs = [
  ["overview", "Overview"],
  ["daily", "Daily Expenses"],
  ["monthly", "Monthly Expenses"],
  ["all", "All Expenses"],
  ["recurring", "Recurring Expenses"],
  ["reimbursements", "Reimbursements"],
  ["reports", "Reports"],
  ["budgets", "Budgets"],
];

const formatCurrency = (val) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(val || 0));

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
};

const formatDateInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const statusClass = {
  Paid: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  "Partially Paid": "bg-amber-50 text-amber-700 ring-amber-100",
  Unpaid: "bg-slate-100 text-slate-700 ring-slate-200",
  Overdue: "bg-rose-50 text-rose-700 ring-rose-100",
  Cancelled: "bg-slate-100 text-slate-500 ring-slate-200",
  Approved: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  "Pending Approval": "bg-blue-50 text-blue-700 ring-blue-100",
  Draft: "bg-slate-100 text-slate-700 ring-slate-200",
  Rejected: "bg-rose-50 text-rose-700 ring-rose-100",
};

const toneIconClass = {
  rose: "text-rose-600",
  emerald: "text-emerald-600",
  amber: "text-amber-600",
  blue: "text-blue-600",
  slate: "text-slate-600",
};

const metricToneClass = {
  emerald: {
    card: "border-emerald-200 bg-emerald-50/50",
    label: "text-emerald-700",
    value: "text-emerald-950",
  },
  rose: {
    card: "border-rose-200 bg-rose-50/50",
    label: "text-rose-700",
    value: "text-rose-950",
  },
};

const StatusBadge = ({ value }) => (
  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ring-1 ${statusClass[value] || "bg-slate-100 text-slate-700 ring-slate-200"}`}>
    {value || "N/A"}
  </span>
);

const SuperAdminAccounts = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    () => searchParams.get("tab") || "overview",
  );

  useEffect(() => {
    const nextTab = searchParams.get("tab") || "overview";
    setActiveTab((currentTab) =>
      currentTab === nextTab ? currentTab : nextTab,
    );
  }, [searchParams]);
  const [summary, setSummary] = useState({
    totalWorkAmount: 0,
    totalIncome: 0,
    pendingAmount: 0,
    totalExpenses: 0,
    expensePaidAmount: 0,
    expensePendingAmount: 0,
    netProfitLoss: 0,
    profitLossStatus: "profit",
  });
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [workList, setWorkList] = useState([]);
  const [pendingList, setPendingList] = useState([]);
  const [incomeList, setIncomeList] = useState([]);
  const [expenseList, setExpenseList] = useState([]);
  const [expenseSummary, setExpenseSummary] = useState(null);
  const [expenseReports, setExpenseReports] = useState({ categoryBreakdown: [], monthlyTrend: [] });
  const [profitLossData, setProfitLossData] = useState(null);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [incomeModal, setIncomeModal] = useState({ isOpen: false });
  const [expenseModal, setExpenseModal] = useState({ isOpen: false, mode: "create", expense: null });
  const [detailsDrawer, setDetailsDrawer] = useState({ isOpen: false, expense: null, isLoading: false });
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, expense: null });
  const [incomeForm, setIncomeForm] = useState({
    clientName: "",
    category: "Client Payment",
    amount: "",
    paymentMethod: "Bank Transfer",
    transactionReference: "",
    description: "",
  });
  const [expenseForm, setExpenseForm] = useState(emptyExpenseForm);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentMethod: "Bank Transfer",
    paymentDate: new Date().toISOString().slice(0, 10),
    transactionReference: "",
    bankReferenceNumber: "",
    utrNumber: "",
    chequeNumber: "",
    chequeDate: "",
    bankName: "",
    upiTransactionId: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [plRange, setPlRange] = useState("this_month");
  const [searchTerm, setSearchTerm] = useState("");
  const [expenseFilters, setExpenseFilters] = useState(emptyExpenseFilters);
  const [expenseView, setExpenseView] = useState("overview");
  const [expenseAnalytics, setExpenseAnalytics] = useState(null);
  const [isExpenseAnalyticsLoading, setIsExpenseAnalyticsLoading] = useState(false);
  const [dailyDate, setDailyDate] = useState(new Date().toISOString().slice(0, 10));
  const [monthlySelection, setMonthlySelection] = useState({
    month: String(new Date().getMonth() + 1),
    year: String(new Date().getFullYear()),
  });
  const [financialYear, setFinancialYear] = useState(() => {
    const now = new Date();
    const startYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    return `${startYear}-${String(startYear + 1).slice(-2)}`;
  });
  const [monthlyBudget, setMonthlyBudget] = useState(() => localStorage.getItem("officeExpenseMonthlyBudget") || "");

  const calculatedExpense = useMemo(() => {
    const baseAmount = Number(expenseForm.baseAmount || 0);
    const taxableAmount = Number(expenseForm.taxableAmount || expenseForm.baseAmount || 0);
    const gstAmount = expenseForm.gstApplicable ? (taxableAmount * Number(expenseForm.gstRate || 0)) / 100 : 0;
    const totalAmount = Math.max(
      0,
      baseAmount + gstAmount + Number(expenseForm.otherTax || 0) + Number(expenseForm.additionalCharges || 0) - Number(expenseForm.discount || 0)
    );
    const amountPaid = Math.min(Number(expenseForm.amountPaid || 0), totalAmount);
    return {
      gstAmount,
      cgst: expenseForm.gstType === "IGST" ? 0 : gstAmount / 2,
      sgst: expenseForm.gstType === "IGST" ? 0 : gstAmount / 2,
      igst: expenseForm.gstType === "IGST" ? gstAmount : 0,
      totalAmount,
      amountPaid,
      pendingAmount: Math.max(0, totalAmount - amountPaid),
    };
  }, [expenseForm]);

  const fetchSummary = async () => {
    try {
      setIsSummaryLoading(true);
      const res = await getAccountsSummaryApi();
      setSummary(res.data);
    } catch (err) {
      setErrorMessage(err.message || "Failed to load accounts summary");
    } finally {
      setIsSummaryLoading(false);
    }
  };

  const fetchReferenceData = async () => {
    try {
      const [clientRes, projectRes, employeeRes] = await Promise.all([
        getClients({ limit: 100 }),
        getProjects({ limit: 100 }),
        getEmployees({ limit: 100 }),
      ]);
      setClients(clientRes.data?.clients || clientRes.data || []);
      setProjects(projectRes.data?.projects || projectRes.data || []);
      setEmployees(employeeRes.data?.employees || employeeRes.data || []);
    } catch {
      // Reference dropdowns are optional. Main expense workflows still work without them.
    }
  };

  const getScopedExpenseFilters = () => {
    const scopedFilters = { ...expenseFilters, search: expenseFilters.search || searchTerm };
    if (expenseView === "daily") {
      scopedFilters.startDate = dailyDate;
      scopedFilters.endDate = dailyDate;
      scopedFilters.range = "";
    } else if (expenseView === "monthly") {
      const start = new Date(Number(monthlySelection.year), Number(monthlySelection.month) - 1, 1);
      const end = new Date(Number(monthlySelection.year), Number(monthlySelection.month), 0);
      scopedFilters.startDate = start.toISOString().slice(0, 10);
      scopedFilters.endDate = end.toISOString().slice(0, 10);
      scopedFilters.range = "";
    } else if (expenseView === "recurring") {
      scopedFilters.recurring = "recurring";
    } else if (expenseView === "reimbursements") {
      scopedFilters.reimbursement = "yes";
    }
    return scopedFilters;
  };

  const fetchTabContent = async () => {
    setIsTabLoading(true);
    try {
      if (activeTab === "work") {
        const res = await getTotalWorkAmountListApi({ search: searchTerm });
        setWorkList(res.data.projects || []);
      } else if (activeTab === "pending") {
        const res = await getPendingAmountListApi({ search: searchTerm });
        setPendingList(res.data.invoices || []);
      } else if (activeTab === "income") {
        const res = await getIncomeListApi({ search: searchTerm });
        setIncomeList(res.data.incomes || []);
      } else if (activeTab === "expenses") {
        const res = await getExpenseListApi(getScopedExpenseFilters());
        setExpenseList(res.data.expenses || []);
        setExpenseSummary(res.data.summary || null);
        setExpenseReports({
          categoryBreakdown: res.data.categoryBreakdown || [],
          monthlyTrend: res.data.monthlyTrend || [],
        });
      } else if (activeTab === "profit_loss") {
        const res = await getProfitLossSummaryApi({ range: plRange });
        setProfitLossData(res.data);
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to load accounts data");
    } finally {
      setIsTabLoading(false);
    }
  };

  const fetchExpenseAnalytics = async () => {
    if (activeTab !== "expenses") return;
    try {
      setIsExpenseAnalyticsLoading(true);
      const res = await getExpenseAnalyticsApi({
        ...expenseFilters,
        date: dailyDate,
        month: monthlySelection.month,
        year: monthlySelection.year,
        financialYear,
        monthlyBudget,
        search: expenseFilters.search || searchTerm,
      });
      setExpenseAnalytics(res.data);
    } catch (err) {
      setErrorMessage(err.message || "Failed to load expense analytics");
    } finally {
      setIsExpenseAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchReferenceData();
  }, []);

  useEffect(() => {
    fetchTabContent();
  }, [activeTab, plRange, searchTerm, expenseFilters, expenseView, dailyDate, monthlySelection]);

  useEffect(() => {
    fetchExpenseAnalytics();
  }, [activeTab, expenseFilters, dailyDate, monthlySelection, financialYear, monthlyBudget, searchTerm]);

  useEffect(() => {
    localStorage.setItem("officeExpenseMonthlyBudget", monthlyBudget || "");
  }, [monthlyBudget]);

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  const buildExpenseFormData = () => {
    const formData = new FormData();
    const vendorSnapshot = {
      ...expenseForm.vendorSnapshot,
      vendorName: expenseForm.vendorName || expenseForm.paidTo,
      gstin: expenseForm.vendorGstin,
    };
    const fields = {
      ...expenseForm,
      amount: expenseForm.baseAmount,
      vendorSnapshot: JSON.stringify(vendorSnapshot),
      recurringConfig: JSON.stringify(expenseForm.recurringConfig),
      reimbursement: JSON.stringify(expenseForm.reimbursement),
      tags: expenseForm.tags,
    };
    delete fields.attachments;
    Object.entries(fields).forEach(([key, value]) => {
      if (typeof value === "object" && value !== null) return;
      formData.append(key, value ?? "");
    });
    Array.from(expenseForm.attachments || []).forEach((file) => {
      formData.append("attachments", file);
    });
    return formData;
  };

  const handleCreateIncome = async (e) => {
    e.preventDefault();
    if (!incomeForm.amount || Number(incomeForm.amount) <= 0) {
      setErrorMessage("Please enter a valid income amount");
      return;
    }
    try {
      setIsSubmitting(true);
      await createIncomeApi(incomeForm);
      showSuccess("Income record added successfully");
      setIncomeModal({ isOpen: false });
      setIncomeForm({ clientName: "", category: "Client Payment", amount: "", paymentMethod: "Bank Transfer", transactionReference: "", description: "" });
      fetchSummary();
      fetchTabContent();
    } catch (err) {
      setErrorMessage(err.message || "Failed to add income");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveExpense = async (e) => {
    e.preventDefault();
    if (!expenseForm.expenseTitle || !expenseForm.baseAmount || Number(expenseForm.baseAmount) <= 0) {
      setErrorMessage("Please enter expense title and valid base amount");
      return;
    }
    try {
      setIsSubmitting(true);
      const payload = buildExpenseFormData();
      if (expenseModal.mode === "edit" && expenseModal.expense?._id) {
        await updateExpenseApi(expenseModal.expense._id, payload);
        showSuccess("Expense updated successfully");
      } else {
        await createExpenseApi(payload);
        showSuccess("Expense recorded successfully");
      }
      setExpenseModal({ isOpen: false, mode: "create", expense: null });
      setExpenseForm(emptyExpenseForm);
      fetchSummary();
      fetchTabContent();
    } catch (err) {
      setErrorMessage(err.message || "Failed to save expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteIncome = async (id) => {
    if (!window.confirm("Delete this income entry?")) return;
    try {
      await deleteIncomeApi(id);
      showSuccess("Income record deleted");
      fetchSummary();
      fetchTabContent();
    } catch (err) {
      setErrorMessage(err.message || "Failed to delete income");
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm("Delete this expense entry? This will soft-delete the financial record.")) return;
    try {
      await deleteExpenseApi(id);
      showSuccess("Expense record deleted");
      fetchSummary();
      fetchTabContent();
    } catch (err) {
      setErrorMessage(err.message || "Failed to delete expense");
    }
  };

  const openExpenseModal = (expense = null) => {
    if (!expense) {
      setExpenseForm(emptyExpenseForm);
      setExpenseModal({ isOpen: true, mode: "create", expense: null });
      return;
    }
    setExpenseForm({
      ...emptyExpenseForm,
      ...expense,
      expenseDate: formatDateInput(expense.expenseDate || expense.date),
      baseAmount: expense.baseAmount || expense.amount || "",
      taxableAmount: expense.taxableAmount || "",
      amountPaid: expense.amountPaid || "",
      paymentDate: formatDateInput(expense.paymentDate),
      invoiceDate: formatDateInput(expense.invoiceDate),
      dueDate: formatDateInput(expense.dueDate),
      chequeDate: formatDateInput(expense.chequeDate),
      vendorName: expense.vendorSnapshot?.vendorName || expense.paidTo || "",
      vendorGstin: expense.vendorSnapshot?.gstin || "",
      vendorSnapshot: {
        ...emptyExpenseForm.vendorSnapshot,
        ...(expense.vendorSnapshot || {}),
      },
      recurringConfig: {
        ...emptyExpenseForm.recurringConfig,
        ...(expense.recurringConfig || {}),
        startDate: formatDateInput(expense.recurringConfig?.startDate),
        endDate: formatDateInput(expense.recurringConfig?.endDate),
        nextDueDate: formatDateInput(expense.recurringConfig?.nextDueDate),
      },
      reimbursement: {
        ...emptyExpenseForm.reimbursement,
        ...(expense.reimbursement || {}),
      },
      tags: Array.isArray(expense.tags) ? expense.tags.join(", ") : "",
      attachments: [],
    });
    setExpenseModal({ isOpen: true, mode: "edit", expense });
  };

  const openDetailsDrawer = async (expense) => {
    setDetailsDrawer({ isOpen: true, expense, isLoading: true });
    try {
      const res = await getExpenseDetailsApi(expense._id);
      setDetailsDrawer({ isOpen: true, expense: res.data.expense, isLoading: false });
    } catch (err) {
      setErrorMessage(err.message || "Failed to load expense details");
      setDetailsDrawer({ isOpen: false, expense: null, isLoading: false });
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (!paymentModal.expense?._id || Number(paymentForm.amount || 0) <= 0) {
      setErrorMessage("Please enter a valid payment amount");
      return;
    }
    try {
      setIsSubmitting(true);
      await addExpensePaymentApi(paymentModal.expense._id, paymentForm);
      showSuccess("Expense payment recorded successfully");
      setPaymentModal({ isOpen: false, expense: null });
      setPaymentForm({
        amount: "",
        paymentMethod: "Bank Transfer",
        paymentDate: new Date().toISOString().slice(0, 10),
        transactionReference: "",
        bankReferenceNumber: "",
        utrNumber: "",
        chequeNumber: "",
        chequeDate: "",
        bankName: "",
        upiTransactionId: "",
        notes: "",
      });
      fetchSummary();
      fetchTabContent();
    } catch (err) {
      setErrorMessage(err.message || "Failed to record payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveExpense = async (expense) => {
    try {
      await approveExpenseApi(expense._id);
      showSuccess("Expense approved");
      fetchSummary();
      fetchTabContent();
    } catch (err) {
      setErrorMessage(err.message || "Failed to approve expense");
    }
  };

  const handleRejectExpense = async (expense) => {
    const rejectionReason = window.prompt("Reason for rejecting this expense?");
    if (rejectionReason === null) return;
    try {
      await rejectExpenseApi(expense._id, { rejectionReason });
      showSuccess("Expense rejected");
      fetchSummary();
      fetchTabContent();
    } catch (err) {
      setErrorMessage(err.message || "Failed to reject expense");
    }
  };

  const handleExportExpenses = async () => {
    try {
      const response = await exportExpensesApi(getScopedExpenseFilters());
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `expenses-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setErrorMessage(err.message || "Failed to export expenses");
    }
  };

  const updateExpenseForm = (key, value) => setExpenseForm((prev) => ({ ...prev, [key]: value }));
  const updateNestedExpenseForm = (section, key, value) =>
    setExpenseForm((prev) => ({ ...prev, [section]: { ...prev[section], [key]: value } }));

  const summaryCards = [
    { title: "Total Expenses", value: expenseSummary?.totalAmount || summary.totalExpenses, icon: Receipt, tone: "rose" },
    { title: "Paid Expenses", value: expenseSummary?.paidAmount || summary.expensePaidAmount, icon: CheckCircle2, tone: "emerald" },
    { title: "Pending Expenses", value: expenseSummary?.pendingAmount || summary.expensePendingAmount, icon: Clock, tone: "amber" },
    { title: "GST Expenses", value: expenseSummary?.gstAmount || 0, icon: FileText, tone: "blue" },
    { title: "Recurring", value: expenseSummary?.recurringAmount || 0, icon: Calendar, tone: "slate" },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <PageBackButton />
            <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">
              Accounts & Financial Management
            </h1>
          </div>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Real-time financial breakdown of work amount, income, pending balances, office expenses, and net profit.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-700">
          <AlertCircle size={16} /> {errorMessage}
          <button type="button" onClick={() => setErrorMessage("")} className="ml-auto text-rose-500"><X size={16} /></button>
        </div>
      )}

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-700">
          {successMessage}
        </div>
      )}

      {isSummaryLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Total Work Amount</p>
            <h3 className="mt-2 text-2xl font-black text-slate-950">{formatCurrency(summary.totalWorkAmount)}</h3>
            <p className="mt-1 text-[10px] font-bold text-slate-400">Accepted Projects & Services</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-xs">
            <p className="text-[11px] font-extrabold text-emerald-700 uppercase tracking-wider">Total Income</p>
            <h3 className="mt-2 text-2xl font-black text-emerald-950">{formatCurrency(summary.totalIncome)}</h3>
            <p className="mt-1 text-[10px] font-bold text-emerald-600">Payments & Collections</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-xs">
            <p className="text-[11px] font-extrabold text-amber-700 uppercase tracking-wider">Pending Amount</p>
            <h3 className="mt-2 text-2xl font-black text-amber-950">{formatCurrency(summary.pendingAmount)}</h3>
            <p className="mt-1 text-[10px] font-bold text-amber-600">Uncollected Invoices</p>
          </div>
          <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-5 shadow-xs">
            <p className="text-[11px] font-extrabold text-rose-700 uppercase tracking-wider">Total Expenses</p>
            <h3 className="mt-2 text-2xl font-black text-rose-950">{formatCurrency(summary.totalExpenses)}</h3>
            <p className="mt-1 text-[10px] font-bold text-rose-600">Approved office expenses</p>
          </div>
          <div className={`rounded-2xl border p-5 shadow-xs ${summary.profitLossStatus === "profit" ? "border-emerald-300 bg-emerald-600 text-white" : "border-rose-300 bg-rose-600 text-white"}`}>
            <p className="text-[11px] font-extrabold uppercase tracking-wider opacity-90">Net {summary.profitLossStatus}</p>
            <h3 className="mt-2 text-2xl font-black">{formatCurrency(summary.netProfitLoss)}</h3>
            <p className="mt-1 text-[10px] font-bold opacity-80">Income - Expenses</p>
          </div>
        </div>
      )}

      <div className="flex border-b border-slate-200 bg-white px-4 pt-2 gap-2 overflow-x-auto">
        {[
          ["overview", Wallet, "Overview"],
          ["work", BriefcaseBusiness, "Total Work Amount"],
          ["pending", Clock, "Pending Amount"],
          ["income", TrendingUp, "Income"],
          ["expenses", TrendingDown, "Expenses"],
          ["profit_loss", CircleDollarSign, "Profit / Loss"],
        ].map(([tab, Icon, label]) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-extrabold transition ${
              activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {activeTab !== "expenses" && activeTab !== "overview" && activeTab !== "profit_loss" && (
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search records..."
            className="w-full bg-transparent text-xs font-semibold text-slate-900 outline-none placeholder:text-slate-400"
          />
        </div>
      )}

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="text-base font-black text-slate-900 mb-4">Financial Health Breakdown</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Total Work Signed:</span>
                <span className="font-black text-slate-950">{formatCurrency(summary.totalWorkAmount)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Realized Collections:</span>
                <span className="font-black text-emerald-600">{formatCurrency(summary.totalIncome)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Outstanding Receivables:</span>
                <span className="font-black text-amber-600">{formatCurrency(summary.pendingAmount)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-700 border-t border-slate-100 pt-3">
                <span>Approved Office Expenses:</span>
                <span className="font-black text-rose-600">{formatCurrency(summary.totalExpenses)}</span>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="text-base font-black text-slate-900 mb-2">Net Business Profitability</h3>
            <p className="text-xs font-semibold text-slate-500">Calculated from collected income minus approved, non-cancelled expenses.</p>
            <div className="mt-6 rounded-xl bg-slate-50 p-6 text-center border border-slate-200">
              <p className="text-xs font-extrabold text-slate-400 uppercase">Net Financial Status</p>
              <h2 className={`mt-2 text-4xl font-black ${summary.profitLossStatus === "profit" ? "text-emerald-600" : "text-rose-600"}`}>
                {formatCurrency(summary.netProfitLoss)}
              </h2>
              <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-extrabold capitalize ${summary.profitLossStatus === "profit" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                {summary.profitLossStatus}
              </span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "work" && (
        <SimpleTable
          isLoading={isTabLoading}
          emptyText="No active work records found."
          headers={["Client", "Project / Service", "Work Amount", "Start Date", "Status"]}
          rows={workList.map((item) => [
            item.clientId?.companyName || item.clientId?.clientName || "Client",
            item.projectName,
            formatCurrency(item.budget),
            formatDate(item.startDate),
            item.status,
          ])}
        />
      )}

      {activeTab === "pending" && (
        <SimpleTable
          isLoading={isTabLoading}
          emptyText="No pending invoice amounts found."
          headers={["Invoice #", "Client", "Total Amount", "Received", "Pending", "Due Date", "Status"]}
          rows={pendingList.map((item) => [
            item.invoiceNumber,
            item.clientId?.companyName || item.clientSnapshot?.companyName || "Client",
            formatCurrency(item.totalAmount),
            formatCurrency(item.receivedAmount),
            formatCurrency(item.pendingAmount),
            formatDate(item.dueDate),
            item.paymentStatus,
          ])}
        />
      )}

      {activeTab === "income" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-900">Income Records</h3>
            <button type="button" onClick={() => setIncomeModal({ isOpen: true })} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-extrabold text-white hover:bg-emerald-700">
              <Plus size={16} /> Record Custom Income
            </button>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            {isTabLoading ? (
              <div className="flex h-64 items-center justify-center"><LoadingSpinner /></div>
            ) : incomeList.length === 0 ? (
              <div className="p-12 text-center text-xs font-bold text-slate-500">No income records found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-semibold text-slate-700">
                  <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    <tr>
                      {["Income ID", "Date", "Client", "Category", "Amount", "Payment Method", "Actions"].map((h) => <th key={h} className="px-5 py-4">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {incomeList.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-4 font-black text-slate-900">{item.incomeId}</td>
                        <td className="px-5 py-4">{formatDate(item.date)}</td>
                        <td className="px-5 py-4 font-bold text-slate-900">{item.clientName}</td>
                        <td className="px-5 py-4">{item.category}</td>
                        <td className="px-5 py-4 font-black text-emerald-700">{formatCurrency(item.amount)}</td>
                        <td className="px-5 py-4">{item.paymentMethod}</td>
                        <td className="px-5 py-4">
                          <button type="button" onClick={() => handleDeleteIncome(item._id)} className="text-xs font-bold text-rose-600 hover:text-rose-700">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "expenses" && (
        <div className="space-y-5">
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white px-3 pt-2 shadow-xs">
            <div className="flex min-w-max gap-2">
              {expenseViewTabs.map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setExpenseView(key)}
                  className={`border-b-2 px-3 py-3 text-xs font-extrabold transition ${
                    expenseView === key ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-black text-slate-900">
                <Filter size={16} /> Expense Filters
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setExpenseFilters(emptyExpenseFilters)} className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200">Reset</button>
                <button type="button" onClick={handleExportExpenses} className="flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800">
                  <Download size={14} /> Export CSV
                </button>
                <button type="button" onClick={() => openExpenseModal()} className="flex items-center gap-2 rounded-xl bg-rose-600 px-3 py-2 text-xs font-extrabold text-white hover:bg-rose-700">
                  <Plus size={14} /> Add Expense
                </button>
              </div>
            </div>
            {expenseView === "daily" && (
              <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <button type="button" onClick={() => setDailyDate(new Date().toISOString().slice(0, 10))} className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700">Today</button>
                <button
                  type="button"
                  onClick={() => {
                    const date = new Date();
                    date.setDate(date.getDate() - 1);
                    setDailyDate(date.toISOString().slice(0, 10));
                  }}
                  className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700"
                >
                  Yesterday
                </button>
                <FilterInput label="Custom Date" type="date" value={dailyDate} onChange={setDailyDate} />
              </div>
            )}
            {expenseView === "monthly" && (
              <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <FilterSelect
                  label="Month"
                  value={monthlySelection.month}
                  onChange={(value) => setMonthlySelection((prev) => ({ ...prev, month: value }))}
                  options={Array.from({ length: 12 }, (_, index) => [String(index + 1), new Date(2026, index, 1).toLocaleString("en-IN", { month: "long" })])}
                />
                <FilterInput label="Year" type="number" value={monthlySelection.year} onChange={(value) => setMonthlySelection((prev) => ({ ...prev, year: value }))} />
                <FilterInput label="Monthly Budget" type="number" value={monthlyBudget} onChange={setMonthlyBudget} />
              </div>
            )}
            {(expenseView === "reports" || expenseView === "budgets") && (
              <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <FilterInput label="Financial Year" value={financialYear} onChange={setFinancialYear} />
                <FilterInput label="Monthly Budget" type="number" value={monthlyBudget} onChange={setMonthlyBudget} />
                <FilterSelect label="Sort Direction" value={expenseFilters.sortOrder} onChange={(value) => setExpenseFilters((p) => ({ ...p, sortOrder: value }))} options={[["desc", "Highest First"], ["asc", "Lowest First"]]} />
              </div>
            )}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-6">
              <FilterInput label="Search" value={expenseFilters.search} onChange={(value) => setExpenseFilters((p) => ({ ...p, search: value }))} />
              <FilterSelect label="Date Range" value={expenseFilters.range} onChange={(value) => setExpenseFilters((p) => ({ ...p, range: value }))} options={[["", "All"], ["today", "Today"], ["this_week", "This Week"], ["this_month", "This Month"], ["last_month", "Last Month"], ["this_quarter", "This Quarter"], ["this_financial_year", "Financial Year"]]} />
              <FilterSelect label="Category" value={expenseFilters.category} onChange={(value) => setExpenseFilters((p) => ({ ...p, category: value }))} options={[["", "All"], ...expenseCategories.map((c) => [c, c])]} />
              <FilterSelect label="Payment" value={expenseFilters.paymentStatus} onChange={(value) => setExpenseFilters((p) => ({ ...p, paymentStatus: value }))} options={[["", "All"], ["Unpaid", "Unpaid"], ["Partially Paid", "Partially Paid"], ["Paid", "Paid"], ["Overdue", "Overdue"]]} />
              <FilterSelect label="Approval" value={expenseFilters.approvalStatus} onChange={(value) => setExpenseFilters((p) => ({ ...p, approvalStatus: value }))} options={[["", "All"], ["Draft", "Draft"], ["Pending Approval", "Pending Approval"], ["Approved", "Approved"], ["Rejected", "Rejected"]]} />
              <FilterSelect label="GST" value={expenseFilters.gst} onChange={(value) => setExpenseFilters((p) => ({ ...p, gst: value }))} options={[["", "All"], ["gst", "GST"], ["non_gst", "Non-GST"]]} />
              <FilterInput label="Start Date" type="date" value={expenseFilters.startDate} onChange={(value) => setExpenseFilters((p) => ({ ...p, startDate: value }))} />
              <FilterInput label="End Date" type="date" value={expenseFilters.endDate} onChange={(value) => setExpenseFilters((p) => ({ ...p, endDate: value }))} />
              <FilterSelect label="Payment Method" value={expenseFilters.paymentMethod} onChange={(value) => setExpenseFilters((p) => ({ ...p, paymentMethod: value }))} options={[["", "All"], ...paymentMethods.map((m) => [m, m])]} />
              <FilterSelect label="Project" value={expenseFilters.projectId} onChange={(value) => setExpenseFilters((p) => ({ ...p, projectId: value }))} options={[["", "All"], ...projects.map((p) => [p._id, p.projectName])]} />
              <FilterSelect label="Client" value={expenseFilters.clientId} onChange={(value) => setExpenseFilters((p) => ({ ...p, clientId: value }))} options={[["", "All"], ...clients.map((c) => [c._id, c.companyName || c.clientName])]} />
              <FilterSelect label="Sort" value={expenseFilters.sortBy} onChange={(value) => setExpenseFilters((p) => ({ ...p, sortBy: value }))} options={[["date", "Date"], ["amount", "Amount"], ["pending", "Pending"], ["created", "Created"], ["vendor", "Vendor"], ["category", "Category"]]} />
            </div>
            <ActiveFilterChips
              filters={expenseFilters}
              expenseView={expenseView}
              dailyDate={dailyDate}
              monthlySelection={monthlySelection}
              financialYear={financialYear}
              onClear={() => setExpenseFilters(emptyExpenseFilters)}
            />
          </div>

          {isExpenseAnalyticsLoading ? (
            <div className="flex h-56 items-center justify-center rounded-2xl border border-slate-200 bg-white"><LoadingSpinner /></div>
          ) : (
            <>
              {expenseView === "overview" && <ExpenseOverviewAnalytics analytics={expenseAnalytics} onCategoryClick={(category) => setExpenseFilters((p) => ({ ...p, category }))} />}
              {expenseView === "daily" && <DailyExpenseAnalytics analytics={expenseAnalytics} selectedDate={dailyDate} onCategoryClick={(category) => setExpenseFilters((p) => ({ ...p, category }))} />}
              {expenseView === "monthly" && <MonthlyExpenseAnalytics analytics={expenseAnalytics} monthlySelection={monthlySelection} monthlyBudget={monthlyBudget} onCategoryClick={(category) => setExpenseFilters((p) => ({ ...p, category }))} />}
              {expenseView === "reports" && <ExpenseReportsAnalytics analytics={expenseAnalytics} financialYear={financialYear} />}
              {expenseView === "budgets" && <ExpenseBudgetAnalytics analytics={expenseAnalytics} monthlyBudget={monthlyBudget} />}
              {expenseView === "recurring" && <RecurringExpenseAnalytics analytics={expenseAnalytics} />}
              {expenseView === "reimbursements" && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <SummaryCard title="Reimbursement Total" value={expenseSummary?.totalAmount || 0} icon={Receipt} tone="rose" />
                  <SummaryCard title="Paid" value={expenseSummary?.paidAmount || 0} icon={CheckCircle2} tone="emerald" />
                  <SummaryCard title="Pending" value={expenseSummary?.pendingAmount || 0} icon={Clock} tone="amber" />
                </div>
              )}
              {(expenseView === "all" || expenseView === "overview") && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  {summaryCards.map(({ title, value, icon, tone }) => <SummaryCard key={title} title={title} value={value} icon={icon} tone={tone} />)}
                </div>
              )}
            </>
          )}

          <ExpenseRecordsTable
            isLoading={isTabLoading}
            expenses={expenseList}
            onView={openDetailsDrawer}
            onEdit={openExpenseModal}
            onPayment={(expense) => setPaymentModal({ isOpen: true, expense })}
            onApprove={handleApproveExpense}
            onReject={handleRejectExpense}
            onDelete={handleDeleteExpense}
          />

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {expenseView === "all" ? (
              <>
                <ReportPanel title="Category-Wise Expense Report" rows={expenseReports.categoryBreakdown.map((item) => ({ label: item._id || "Uncategorized", value: item.total }))} />
                <ReportPanel title="Monthly Expense Trend" rows={expenseReports.monthlyTrend.map((item) => ({ label: item.month || "N/A", value: item.amount }))} />
              </>
            ) : (
              <>
                <ReportPanel title="Top Vendors" rows={(expenseAnalytics?.monthly?.vendorBreakdown || []).map((item) => ({ label: item._id || "Unknown Vendor", value: item.totalAmount }))} />
                <ReportPanel title="Payment Method Analysis" rows={(expenseAnalytics?.monthly?.paymentMethodBreakdown || []).map((item) => ({ label: item._id || "Unknown", value: item.totalAmount }))} />
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === "profit_loss" && profitLossData && (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-extrabold text-slate-700">Select Time Range:</p>
            <div className="flex flex-wrap gap-2">
              {["today", "this_week", "this_month", "this_quarter", "this_year"].map((r) => (
                <button key={r} type="button" onClick={() => setPlRange(r)} className={`rounded-xl px-3 py-1.5 text-xs font-extrabold uppercase transition ${plRange === r ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                  {r.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <MetricCard title="Period Income" value={profitLossData.totalIncome} tone="emerald" />
            <MetricCard title="Period Expenses" value={profitLossData.totalExpenses} tone="rose" />
            <div className={`rounded-2xl border p-6 shadow-xs text-white ${profitLossData.status === "profit" ? "bg-emerald-600 border-emerald-600" : "bg-rose-600 border-rose-600"}`}>
              <p className="text-xs font-extrabold uppercase opacity-90">Period Net {profitLossData.status}</p>
              <h3 className="mt-2 text-3xl font-black">{formatCurrency(profitLossData.netProfitLoss)}</h3>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ReportPanel title="Income Category Breakdown" rows={(profitLossData.incomeBreakdown || []).map((item) => ({ label: item.category, value: item.amount }))} positive />
            <ReportPanel title="Expense Category Breakdown" rows={(profitLossData.expenseBreakdown || []).map((item) => ({ label: item.category, value: item.amount }))} />
          </div>
        </div>
      )}

      {incomeModal.isOpen && (
        <Modal title="Record Custom Income" onClose={() => setIncomeModal({ isOpen: false })} maxWidth="max-w-md">
          <form onSubmit={handleCreateIncome} className="space-y-4">
            <Field label="Client / Payer Name"><input type="text" value={incomeForm.clientName} onChange={(e) => setIncomeForm((p) => ({ ...p, clientName: e.target.value }))} className="field-input" /></Field>
            <Field label="Income Category"><select value={incomeForm.category} onChange={(e) => setIncomeForm((p) => ({ ...p, category: e.target.value }))} className="field-input"><option>Client Payment</option><option>Project Payment</option><option>Service Payment</option><option>Other Income</option></select></Field>
            <Field label="Amount (INR) *"><input type="number" required value={incomeForm.amount} onChange={(e) => setIncomeForm((p) => ({ ...p, amount: e.target.value }))} className="field-input" /></Field>
            <Field label="Payment Method"><select value={incomeForm.paymentMethod} onChange={(e) => setIncomeForm((p) => ({ ...p, paymentMethod: e.target.value }))} className="field-input">{paymentMethods.map((m) => <option key={m}>{m}</option>)}</select></Field>
            <Field label="Transaction Reference"><input type="text" value={incomeForm.transactionReference} onChange={(e) => setIncomeForm((p) => ({ ...p, transactionReference: e.target.value }))} className="field-input" /></Field>
            <Field label="Description"><textarea value={incomeForm.description} onChange={(e) => setIncomeForm((p) => ({ ...p, description: e.target.value }))} className="field-input min-h-20" /></Field>
            <ModalActions onCancel={() => setIncomeModal({ isOpen: false })} submitLabel="Save Income" disabled={isSubmitting} />
          </form>
        </Modal>
      )}

      {expenseModal.isOpen && (
        <ExpenseModal
          mode={expenseModal.mode}
          form={expenseForm}
          updateForm={updateExpenseForm}
          updateNested={updateNestedExpenseForm}
          calculated={calculatedExpense}
          clients={clients}
          projects={projects}
          employees={employees}
          isSubmitting={isSubmitting}
          onSubmit={handleSaveExpense}
          onClose={() => setExpenseModal({ isOpen: false, mode: "create", expense: null })}
        />
      )}

      {paymentModal.isOpen && (
        <Modal title={`Record Payment - ${paymentModal.expense?.expenseId || ""}`} onClose={() => setPaymentModal({ isOpen: false, expense: null })} maxWidth="max-w-lg">
          <form onSubmit={handleAddPayment} className="space-y-4">
            <div className="rounded-xl bg-amber-50 p-3 text-xs font-bold text-amber-700">
              Pending amount: {formatCurrency(paymentModal.expense?.pendingAmount)}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Amount *"><input type="number" required max={paymentModal.expense?.pendingAmount} value={paymentForm.amount} onChange={(e) => setPaymentForm((p) => ({ ...p, amount: e.target.value }))} className="field-input" /></Field>
              <Field label="Payment Date"><input type="date" value={paymentForm.paymentDate} onChange={(e) => setPaymentForm((p) => ({ ...p, paymentDate: e.target.value }))} className="field-input" /></Field>
              <Field label="Payment Method"><select value={paymentForm.paymentMethod} onChange={(e) => setPaymentForm((p) => ({ ...p, paymentMethod: e.target.value }))} className="field-input">{paymentMethods.map((m) => <option key={m}>{m}</option>)}</select></Field>
              <Field label="Transaction Reference"><input value={paymentForm.transactionReference} onChange={(e) => setPaymentForm((p) => ({ ...p, transactionReference: e.target.value }))} className="field-input" /></Field>
              <Field label="UTR Number"><input value={paymentForm.utrNumber} onChange={(e) => setPaymentForm((p) => ({ ...p, utrNumber: e.target.value }))} className="field-input" /></Field>
              <Field label="Bank Name"><input value={paymentForm.bankName} onChange={(e) => setPaymentForm((p) => ({ ...p, bankName: e.target.value }))} className="field-input" /></Field>
            </div>
            <Field label="Payment Notes"><textarea value={paymentForm.notes} onChange={(e) => setPaymentForm((p) => ({ ...p, notes: e.target.value }))} className="field-input min-h-20" /></Field>
            <ModalActions onCancel={() => setPaymentModal({ isOpen: false, expense: null })} submitLabel="Save Payment" disabled={isSubmitting} />
          </form>
        </Modal>
      )}

      {detailsDrawer.isOpen && (
        <ExpenseDetailsDrawer
          drawer={detailsDrawer}
          onClose={() => setDetailsDrawer({ isOpen: false, expense: null, isLoading: false })}
        />
      )}
    </div>
  );
};

const SimpleTable = ({ isLoading, emptyText, headers, rows }) => (
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
    {isLoading ? (
      <div className="flex h-64 items-center justify-center"><LoadingSpinner /></div>
    ) : rows.length === 0 ? (
      <div className="p-12 text-center text-xs font-bold text-slate-500">{emptyText}</div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-semibold text-slate-700">
          <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
            <tr>{headers.map((h) => <th key={h} className="px-5 py-4">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((row, index) => (
              <tr key={index} className="hover:bg-slate-50/50">
                {row.map((cell, cellIndex) => <td key={cellIndex} className="px-5 py-4 font-bold text-slate-800">{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

const SummaryCard = ({ title, value, icon: Icon, tone = "slate", meta = "" }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
    <div className="flex items-center justify-between">
      <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">{title}</p>
      <Icon className={`h-4 w-4 ${toneIconClass[tone] || toneIconClass.slate}`} />
    </div>
    <p className="mt-2 text-xl font-black text-slate-950">{formatCurrency(value)}</p>
    {meta && <p className="mt-1 text-[10px] font-bold text-slate-400">{meta}</p>}
  </div>
);

const AnalyticsCards = ({ items }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
    {items.map((item) => <SummaryCard key={item.title} {...item} />)}
  </div>
);

const BarChartPanel = ({ title, rows, labelKey = "label", valueKey = "value", onBarClick }) => {
  const cleanedRows = rows.filter((row) => Number(row[valueKey] || 0) > 0);
  const max = Math.max(...cleanedRows.map((row) => Number(row[valueKey] || 0)), 1);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <h4 className="mb-4 text-sm font-black text-slate-900">{title}</h4>
      {cleanedRows.length === 0 ? (
        <p className="text-xs font-bold text-slate-500">No expense data available for this period.</p>
      ) : (
        <div className="space-y-3">
          {cleanedRows.slice(0, 12).map((row) => (
            <button
              key={row[labelKey]}
              type="button"
              onClick={() => onBarClick?.(row[labelKey])}
              className="block w-full text-left"
            >
              <div className="mb-1 flex justify-between gap-3 text-xs font-bold">
                <span className="truncate text-slate-700">{row[labelKey]}</span>
                <span className="shrink-0 text-rose-700">{formatCurrency(row[valueKey])}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-rose-500" style={{ width: `${Math.max(3, (Number(row[valueKey] || 0) / max) * 100)}%` }} />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const LineChartPanel = ({ title, rows, valueKey = "totalAmount", labelKey = "label" }) => {
  const width = 640;
  const height = 190;
  const values = rows.map((row) => Number(row[valueKey] || 0));
  const max = Math.max(...values, 1);
  const step = rows.length > 1 ? width / (rows.length - 1) : width;
  const points = rows.map((row, index) => {
    const x = index * step;
    const y = height - (Number(row[valueKey] || 0) / max) * (height - 24) - 12;
    return { x, y, row };
  });
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <h4 className="mb-4 text-sm font-black text-slate-900">{title}</h4>
      {rows.every((row) => Number(row[valueKey] || 0) === 0) ? (
        <p className="text-xs font-bold text-slate-500">No expense data available for this period.</p>
      ) : (
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${width} ${height}`} className="h-56 min-w-[520px] w-full" role="img" aria-label={title}>
            <path d={path} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {points.map((point, index) => (
              <g key={`${point.row[labelKey]}-${index}`}>
                <circle cx={point.x} cy={point.y} r="4" fill="#2563eb">
                  <title>{`${point.row[labelKey]}: ${formatCurrency(point.row[valueKey])}`}</title>
                </circle>
                {index % Math.ceil(rows.length / 8 || 1) === 0 && (
                  <text x={point.x} y={height - 2} textAnchor="middle" fontSize="10" fill="#64748b">{point.row[labelKey]}</text>
                )}
              </g>
            ))}
          </svg>
        </div>
      )}
    </div>
  );
};

const ExpenseOverviewAnalytics = ({ analytics, onCategoryClick }) => {
  const overview = analytics?.overview || {};
  const month = overview.currentMonth || {};
  const comparison = overview.comparison || {};
  const budget = overview.budget || {};
  return (
    <div className="space-y-5">
      <AnalyticsCards items={[
        { title: "Today's Expenses", value: overview.today?.totalAmount || 0, icon: Calendar, tone: "blue", meta: `${overview.today?.count || 0} transactions` },
        { title: "This Month", value: month.totalAmount || 0, icon: TrendingDown, tone: "rose", meta: comparison.percentChange === null ? comparison.message : `${comparison.percentChange}% vs last month` },
        { title: "Last Month", value: overview.previousMonth?.totalAmount || 0, icon: Clock, tone: "slate" },
        { title: "Financial Year", value: overview.financialYear?.totalAmount || 0, icon: BriefcaseBusiness, tone: "emerald" },
        { title: "Overdue Amount", value: overview.overdue?.amount || 0, icon: AlertCircle, tone: "amber", meta: `${overview.overdue?.count || 0} overdue` },
      ]} />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <LineChartPanel title="Monthly Expense Trend - Last 6 Months" rows={analytics?.trends?.monthOverMonth || []} />
        <BarChartPanel title="Expenses by Category - Selected Month" rows={(analytics?.monthly?.categoryBreakdown || []).map((item) => ({ label: item._id || "Uncategorized", value: item.totalAmount }))} onBarClick={onCategoryClick} />
        <BudgetProgressCard budget={budget} />
      </div>
    </div>
  );
};

const DailyExpenseAnalytics = ({ analytics, selectedDate, onCategoryClick }) => {
  const daily = analytics?.daily || {};
  const summary = daily.summary || {};
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Daily Expenses</p>
        <h3 className="mt-1 text-xl font-black text-slate-950">{formatDate(selectedDate)}</h3>
      </div>
      <AnalyticsCards items={[
        { title: "Total Expense", value: summary.totalAmount || 0, icon: Receipt, tone: "rose", meta: `${summary.count || 0} transactions` },
        { title: "Paid Amount", value: summary.paidAmount || 0, icon: CheckCircle2, tone: "emerald" },
        { title: "Pending Amount", value: summary.pendingAmount || 0, icon: Clock, tone: "amber" },
        { title: "GST Amount", value: summary.gstAmount || 0, icon: FileText, tone: "blue" },
        { title: "Highest Expense", value: summary.highestExpense || 0, icon: TrendingUp, tone: "slate", meta: `Avg ${formatCurrency(summary.averageExpense || 0)}` },
      ]} />
      <AnalyticsCards items={[
        { title: "Cash Expense", value: summary.cashAmount || 0, icon: Wallet, tone: "slate" },
        { title: "UPI Expense", value: summary.upiAmount || 0, icon: CreditCard, tone: "blue" },
        { title: "Bank Expense", value: summary.bankAmount || 0, icon: CircleDollarSign, tone: "emerald" },
      ]} />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <BarChartPanel title="Expense by Time" rows={(daily.hourlyTrend || []).map((item) => ({ label: item.label, value: item.totalAmount }))} />
        <BarChartPanel title="Daily Category Breakdown" rows={(daily.categoryBreakdown || []).map((item) => ({ label: item._id || "Uncategorized", value: item.totalAmount }))} onBarClick={onCategoryClick} />
      </div>
    </div>
  );
};

const MonthlyExpenseAnalytics = ({ analytics, monthlySelection, monthlyBudget, onCategoryClick }) => {
  const monthly = analytics?.monthly || {};
  const summary = monthly.summary || {};
  const comparison = monthly.comparison || {};
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Monthly Expenses</p>
        <h3 className="mt-1 text-xl font-black text-slate-950">
          {new Date(Number(monthlySelection.year), Number(monthlySelection.month) - 1, 1).toLocaleString("en-IN", { month: "long", year: "numeric" })}
        </h3>
        <p className="mt-1 text-xs font-bold text-slate-500">
          {comparison.percentChange === null ? comparison.message : `${comparison.difference >= 0 ? "Increase" : "Decrease"} ${formatCurrency(Math.abs(comparison.difference || 0))} (${comparison.percentChange}%) vs previous month`}
        </p>
      </div>
      <AnalyticsCards items={[
        { title: "Monthly Expense", value: summary.totalAmount || 0, icon: Receipt, tone: "rose", meta: `${summary.count || 0} transactions` },
        { title: "Paid Amount", value: summary.paidAmount || 0, icon: CheckCircle2, tone: "emerald" },
        { title: "Pending Amount", value: summary.pendingAmount || 0, icon: Clock, tone: "amber" },
        { title: "GST Amount", value: summary.gstAmount || 0, icon: FileText, tone: "blue" },
        { title: "Reimbursements", value: summary.reimbursementAmount || 0, icon: Wallet, tone: "slate", meta: `Recurring ${formatCurrency(summary.recurringAmount || 0)}` },
      ]} />
      <div className="grid grid-cols-1 gap-5">
        <LineChartPanel title="Monthly Daily Expense Trend" rows={monthly.dailyTrend || []} labelKey="day" />
        <LineChartPanel title="Monthly Cumulative Expense" rows={monthly.cumulativeTrend || []} valueKey="cumulativeAmount" labelKey="day" />
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <BarChartPanel title="Monthly Category Chart" rows={(monthly.categoryBreakdown || []).map((item) => ({ label: item._id || "Uncategorized", value: item.totalAmount }))} onBarClick={onCategoryClick} />
        <BarChartPanel title="Monthly Department Chart" rows={(monthly.departmentBreakdown || []).map((item) => ({ label: item._id || "General", value: item.totalAmount }))} />
        <BarChartPanel title="Expense by Payment Method" rows={(monthly.paymentMethodBreakdown || []).map((item) => ({ label: item._id || "Unknown", value: item.totalAmount }))} />
        <BarChartPanel title="Payment Status Visualization" rows={(monthly.paymentStatusBreakdown || []).map((item) => ({ label: `${item._id || "Unknown"} (${item.count})`, value: item.totalAmount }))} />
      </div>
      <BudgetProgressCard budget={{ monthlyBudget: Number(monthlyBudget || 0), actualAmount: summary.totalAmount || 0, remainingAmount: Math.max(0, Number(monthlyBudget || 0) - (summary.totalAmount || 0)), usedPercent: monthlyBudget ? ((summary.totalAmount || 0) / Number(monthlyBudget)) * 100 : null }} />
      <HighestExpenses expenses={monthly.highestExpenses || []} />
    </div>
  );
};

const ExpenseReportsAnalytics = ({ analytics, financialYear }) => (
  <div className="space-y-5">
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Financial Year Expense View</p>
      <h3 className="mt-1 text-xl font-black text-slate-950">{financialYear}</h3>
    </div>
    <LineChartPanel title="Financial Year Monthly Expense Trend (Apr - Mar)" rows={analytics?.trends?.financialYear || []} />
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <BarChartPanel title="Category-Wise Report" rows={(analytics?.monthly?.categoryBreakdown || []).map((item) => ({ label: item._id || "Uncategorized", value: item.totalAmount }))} />
      <BarChartPanel title="Department-Wise Report" rows={(analytics?.monthly?.departmentBreakdown || []).map((item) => ({ label: item._id || "General", value: item.totalAmount }))} />
      <BarChartPanel title="Vendor-Wise Report" rows={(analytics?.monthly?.vendorBreakdown || []).map((item) => ({ label: item._id || "Unknown Vendor", value: item.totalAmount }))} />
      <BarChartPanel title="Payment Method Report" rows={(analytics?.monthly?.paymentMethodBreakdown || []).map((item) => ({ label: item._id || "Unknown", value: item.totalAmount }))} />
    </div>
  </div>
);

const ExpenseBudgetAnalytics = ({ analytics, monthlyBudget }) => (
  <div className="space-y-5">
    <BudgetProgressCard budget={analytics?.overview?.budget || { monthlyBudget: Number(monthlyBudget || 0), actualAmount: 0, remainingAmount: 0 }} />
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <BarChartPanel title="Budget vs Actual Expense" rows={(analytics?.trends?.budgetVsActual || []).map((item) => ({ label: item.label, value: item.totalAmount }))} />
      <BarChartPanel title="Category Budget Usage" rows={(analytics?.monthly?.categoryBreakdown || []).map((item) => ({ label: item._id || "Uncategorized", value: item.totalAmount }))} />
    </div>
  </div>
);

const RecurringExpenseAnalytics = ({ analytics }) => {
  const projection = analytics?.overview?.recurringProjection || {};
  return (
    <div className="space-y-5">
      <AnalyticsCards items={[
        { title: "Expected Recurring / Month", value: projection.totalAmount || 0, icon: Calendar, tone: "blue", meta: "Projection only" },
        { title: "Actual Recurring This Month", value: analytics?.monthly?.summary?.recurringAmount || 0, icon: Receipt, tone: "rose" },
      ]} />
      <BarChartPanel title="Recurring Expense Projection by Category" rows={(projection.categories || []).map((item) => ({ label: item._id || "Recurring", value: item.totalAmount }))} />
    </div>
  );
};

const BudgetProgressCard = ({ budget = {} }) => {
  const usedPercent = budget.usedPercent ?? (budget.monthlyBudget ? (budget.actualAmount / budget.monthlyBudget) * 100 : null);
  const status = budget.status || (usedPercent === null ? "Not Set" : usedPercent >= 100 ? "Exceeded" : usedPercent >= 90 ? "Near Limit" : usedPercent >= 75 ? "Warning" : "Healthy");
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-black text-slate-900">Budget vs Actual</h4>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold text-slate-700">{status}</span>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 text-xs font-bold text-slate-700 sm:grid-cols-3">
        <span>Budget: {formatCurrency(budget.monthlyBudget || 0)}</span>
        <span>Actual: {formatCurrency(budget.actualAmount || 0)}</span>
        <span>Remaining: {formatCurrency(budget.remainingAmount || 0)}</span>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.min(100, Math.max(0, usedPercent || 0))}%` }} />
      </div>
      <p className="mt-2 text-xs font-bold text-slate-500">{usedPercent === null ? "Set a monthly budget to track usage." : `${Math.round(usedPercent * 100) / 100}% used`}</p>
    </div>
  );
};

const HighestExpenses = ({ expenses }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
    <h4 className="mb-4 text-sm font-black text-slate-900">Highest Individual Expenses</h4>
    {expenses.length === 0 ? (
      <p className="text-xs font-bold text-slate-500">No expense data available for this period.</p>
    ) : (
      <div className="space-y-2">
        {expenses.map((expense) => (
          <div key={expense._id} className="flex justify-between gap-3 rounded-xl bg-slate-50 p-3 text-xs font-bold">
            <span className="truncate text-slate-800">{expense.expenseTitle}</span>
            <span className="shrink-0 text-rose-700">{formatCurrency(expense.totalAmount)}</span>
          </div>
        ))}
      </div>
    )}
  </div>
);

const ActiveFilterChips = ({ filters, expenseView, dailyDate, monthlySelection, financialYear, onClear }) => {
  const chips = Object.entries(filters)
    .filter(([key, value]) => value && !["sortBy", "sortOrder"].includes(key))
    .map(([key, value]) => `${key}: ${value}`);
  if (expenseView === "daily") chips.unshift(`Date: ${dailyDate}`);
  if (expenseView === "monthly") chips.unshift(`Month: ${monthlySelection.month}/${monthlySelection.year}`);
  if (expenseView === "reports" || expenseView === "budgets") chips.unshift(`FY: ${financialYear}`);
  if (chips.length === 0) return null;
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <span key={chip} className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-extrabold text-blue-700">{chip}</span>
      ))}
      <button type="button" onClick={onClear} className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-extrabold text-slate-600 hover:bg-slate-200">Clear All Filters</button>
    </div>
  );
};

const ExpenseRecordsTable = ({ isLoading, expenses, onView, onEdit, onPayment, onApprove, onReject, onDelete }) => (
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
    {isLoading ? (
      <div className="flex h-64 items-center justify-center"><LoadingSpinner /></div>
    ) : expenses.length === 0 ? (
      <div className="p-12 text-center text-xs font-bold text-slate-500">No expense records found.</div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1180px] text-left text-xs font-semibold text-slate-700">
          <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
            <tr>
              {["Expense ID", "Time/Date", "Title", "Category", "Vendor", "Department", "Amount", "Paid", "Pending", "Method", "Payment", "Approval", "Actions"].map((header) => (
                <th key={header} className="px-4 py-4">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {expenses.map((item) => (
              <tr key={item._id} className="hover:bg-slate-50/50">
                <td className="px-4 py-4 font-black text-slate-900">{item.expenseId || "N/A"}</td>
                <td className="px-4 py-4">{formatDate(item.expenseDate || item.date)}</td>
                <td className="px-4 py-4 font-black text-slate-900">{item.expenseTitle}</td>
                <td className="px-4 py-4">{item.category}</td>
                <td className="px-4 py-4 font-bold text-slate-800">{item.vendorSnapshot?.vendorName || item.paidTo || "Vendor"}</td>
                <td className="px-4 py-4">{item.department || "General"}</td>
                <td className="px-4 py-4 font-black text-rose-700">{formatCurrency(item.totalAmount || item.amount)}</td>
                <td className="px-4 py-4 font-bold text-emerald-700">{formatCurrency(item.amountPaid)}</td>
                <td className="px-4 py-4 font-bold text-amber-700">{formatCurrency(item.pendingAmount)}</td>
                <td className="px-4 py-4">{item.paymentMethod}</td>
                <td className="px-4 py-4"><StatusBadge value={item.paymentStatus} /></td>
                <td className="px-4 py-4"><StatusBadge value={item.approvalStatus} /></td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1.5">
                    <IconButton title="View" onClick={() => onView(item)} icon={Eye} />
                    {!item.payrollId && <IconButton title="Edit" onClick={() => onEdit(item)} icon={Edit} />}
                    {item.pendingAmount > 0 && <IconButton title="Record Payment" onClick={() => onPayment(item)} icon={CreditCard} />}
                    {item.approvalStatus === "Pending Approval" && <IconButton title="Approve" onClick={() => onApprove(item)} icon={CheckCircle2} />}
                    {item.approvalStatus === "Pending Approval" && <IconButton title="Reject" onClick={() => onReject(item)} icon={X} />}
                    {!item.payrollId && <IconButton title="Delete" onClick={() => onDelete(item._id)} icon={Trash2} danger />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

const MetricCard = ({ title, value, tone }) => (
  <div className={`rounded-2xl border p-6 shadow-xs ${metricToneClass[tone]?.card || "border-slate-200 bg-white"}`}>
    <p className={`text-xs font-extrabold uppercase ${metricToneClass[tone]?.label || "text-slate-700"}`}>{title}</p>
    <h3 className={`mt-2 text-3xl font-black ${metricToneClass[tone]?.value || "text-slate-950"}`}>{formatCurrency(value)}</h3>
  </div>
);

const ReportPanel = ({ title, rows, positive = false }) => {
  const max = Math.max(...rows.map((row) => Number(row.value || 0)), 1);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      <h4 className="text-sm font-black text-slate-900 mb-4">{title}</h4>
      {rows.length === 0 ? (
        <p className="text-xs font-bold text-slate-500">No report data available.</p>
      ) : (
        <div className="space-y-3">
          {rows.slice(0, 10).map((item) => (
            <div key={item.label}>
              <div className="mb-1 flex justify-between text-xs font-bold">
                <span className="text-slate-700">{item.label}</span>
                <span className={positive ? "text-emerald-700" : "text-rose-700"}>{formatCurrency(item.value)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${positive ? "bg-emerald-500" : "bg-rose-500"}`} style={{ width: `${Math.max(4, (Number(item.value || 0) / max) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const FilterInput = ({ label, type = "text", value, onChange }) => (
  <label className="block">
    <span className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">{label}</span>
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500" />
  </label>
);

const FilterSelect = ({ label, value, onChange, options }) => (
  <label className="block">
    <span className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">{label}</span>
    <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500">
      {options.map(([optionValue, labelText]) => <option key={`${optionValue}-${labelText}`} value={optionValue}>{labelText}</option>)}
    </select>
  </label>
);

const IconButton = ({ title, onClick, icon: Icon, danger = false }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={`rounded-lg p-1.5 transition ${danger ? "text-rose-600 hover:bg-rose-50" : "text-slate-500 hover:bg-slate-100 hover:text-blue-600"}`}
  >
    <Icon size={15} />
  </button>
);

const Modal = ({ title, onClose, children, maxWidth = "max-w-5xl" }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
    <div className={`max-h-[92vh] w-full ${maxWidth} overflow-y-auto rounded-2xl bg-white p-6 shadow-xl`}>
      <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-4">
        <h3 className="text-lg font-black text-slate-900">{title}</h3>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
      </div>
      {children}
    </div>
  </div>
);

const ModalActions = ({ onCancel, submitLabel, disabled }) => (
  <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
    <button type="button" onClick={onCancel} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600">Cancel</button>
    <button type="submit" disabled={disabled} className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-extrabold text-white disabled:opacity-60">{submitLabel}</button>
  </div>
);

const Field = ({ label, children }) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-extrabold text-slate-700">{label}</span>
    {children}
  </label>
);

const ExpenseModal = ({ mode, form, updateForm, updateNested, calculated, clients, projects, employees, isSubmitting, onSubmit, onClose }) => (
  <Modal title={mode === "edit" ? "Edit Expense" : "Add Office Expense"} onClose={onClose}>
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field label="Expense Title *"><input required value={form.expenseTitle} onChange={(e) => updateForm("expenseTitle", e.target.value)} className="field-input" /></Field>
        <Field label="Expense Date *"><input type="date" required value={form.expenseDate} onChange={(e) => updateForm("expenseDate", e.target.value)} className="field-input" /></Field>
        <Field label="Category *"><select value={form.category} onChange={(e) => updateForm("category", e.target.value)} className="field-input">{expenseCategories.map((c) => <option key={c}>{c}</option>)}</select></Field>
        <Field label="Subcategory"><input value={form.subcategory} onChange={(e) => updateForm("subcategory", e.target.value)} className="field-input" /></Field>
        <Field label="Department"><input value={form.department} onChange={(e) => updateForm("department", e.target.value)} className="field-input" /></Field>
        <Field label="Priority"><select value={form.priority} onChange={(e) => updateForm("priority", e.target.value)} className="field-input"><option>Normal</option><option>Important</option><option>Urgent</option></select></Field>
      </div>

      <SectionTitle title="Amount & GST" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Field label="Base Amount *"><input type="number" required min="0" value={form.baseAmount} onChange={(e) => updateForm("baseAmount", e.target.value)} className="field-input" /></Field>
        <Field label="Taxable Amount"><input type="number" min="0" value={form.taxableAmount} onChange={(e) => updateForm("taxableAmount", e.target.value)} className="field-input" /></Field>
        <Field label="Discount"><input type="number" min="0" value={form.discount} onChange={(e) => updateForm("discount", e.target.value)} className="field-input" /></Field>
        <Field label="Additional Charges"><input type="number" min="0" value={form.additionalCharges} onChange={(e) => updateForm("additionalCharges", e.target.value)} className="field-input" /></Field>
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-xs font-bold text-slate-700"><input type="checkbox" checked={form.gstApplicable} onChange={(e) => updateForm("gstApplicable", e.target.checked)} /> GST Applicable</label>
        {form.gstApplicable && (
          <>
            <Field label="GST Rate %"><input type="number" min="0" max="100" value={form.gstRate} onChange={(e) => updateForm("gstRate", e.target.value)} className="field-input" /></Field>
            <Field label="GST Type"><select value={form.gstType} onChange={(e) => updateForm("gstType", e.target.value)} className="field-input"><option value="CGST_SGST">CGST + SGST</option><option value="IGST">IGST</option></select></Field>
            <Field label="Vendor GSTIN"><input value={form.vendorGstin} onChange={(e) => updateForm("vendorGstin", e.target.value)} className="field-input" /></Field>
            <Field label="HSN/SAC Code"><input value={form.hsnSacCode} onChange={(e) => updateForm("hsnSacCode", e.target.value)} className="field-input" /></Field>
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-xs font-bold text-slate-700"><input type="checkbox" checked={form.inputTaxCreditEligible} onChange={(e) => updateForm("inputTaxCreditEligible", e.target.checked)} /> ITC Eligible</label>
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-xs font-bold text-slate-700"><input type="checkbox" checked={form.reverseChargeApplicable} onChange={(e) => updateForm("reverseChargeApplicable", e.target.checked)} /> Reverse Charge</label>
          </>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 text-xs font-bold text-slate-700 md:grid-cols-5">
        <span>GST: {formatCurrency(calculated.gstAmount)}</span>
        <span>CGST: {formatCurrency(calculated.cgst)}</span>
        <span>SGST: {formatCurrency(calculated.sgst)}</span>
        <span>IGST: {formatCurrency(calculated.igst)}</span>
        <span>Total: {formatCurrency(calculated.totalAmount)}</span>
      </div>

      <SectionTitle title="Vendor, Bill & Payment" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field label="Vendor / Payee"><input value={form.paidTo} onChange={(e) => { updateForm("paidTo", e.target.value); updateForm("vendorName", e.target.value); }} className="field-input" /></Field>
        <Field label="Contact Person"><input value={form.vendorSnapshot.contactPerson} onChange={(e) => updateNested("vendorSnapshot", "contactPerson", e.target.value)} className="field-input" /></Field>
        <Field label="Phone"><input value={form.vendorSnapshot.phone} onChange={(e) => updateNested("vendorSnapshot", "phone", e.target.value)} className="field-input" /></Field>
        <Field label="Email"><input type="email" value={form.vendorSnapshot.email} onChange={(e) => updateNested("vendorSnapshot", "email", e.target.value)} className="field-input" /></Field>
        <Field label="PAN"><input value={form.vendorSnapshot.pan} onChange={(e) => updateNested("vendorSnapshot", "pan", e.target.value)} className="field-input" /></Field>
        <Field label="UPI ID"><input value={form.vendorSnapshot.upiId} onChange={(e) => updateNested("vendorSnapshot", "upiId", e.target.value)} className="field-input" /></Field>
        <Field label="Invoice Number"><input value={form.invoiceNumber} onChange={(e) => updateForm("invoiceNumber", e.target.value)} className="field-input" /></Field>
        <Field label="Invoice Date"><input type="date" value={form.invoiceDate} onChange={(e) => updateForm("invoiceDate", e.target.value)} className="field-input" /></Field>
        <Field label="Bill Number"><input value={form.billNumber} onChange={(e) => updateForm("billNumber", e.target.value)} className="field-input" /></Field>
        <Field label="Due Date"><input type="date" value={form.dueDate} onChange={(e) => updateForm("dueDate", e.target.value)} className="field-input" /></Field>
        <Field label="Amount Paid"><input type="number" min="0" max={calculated.totalAmount} value={form.amountPaid} onChange={(e) => updateForm("amountPaid", e.target.value)} className="field-input" /></Field>
        <Field label="Payment Method"><select value={form.paymentMethod} onChange={(e) => updateForm("paymentMethod", e.target.value)} className="field-input">{paymentMethods.map((m) => <option key={m}>{m}</option>)}</select></Field>
        <Field label="Payment Date"><input type="date" value={form.paymentDate} onChange={(e) => updateForm("paymentDate", e.target.value)} className="field-input" /></Field>
        <Field label="Transaction / Reference"><input value={form.referenceNumber} onChange={(e) => updateForm("referenceNumber", e.target.value)} className="field-input" /></Field>
        <Field label="UTR Number"><input value={form.utrNumber} onChange={(e) => updateForm("utrNumber", e.target.value)} className="field-input" /></Field>
      </div>
      <div className="rounded-xl bg-amber-50 p-3 text-xs font-bold text-amber-700">
        Paid: {formatCurrency(calculated.amountPaid)} | Pending: {formatCurrency(calculated.pendingAmount)}
      </div>

      <SectionTitle title="Responsibility, Recurring & Reimbursement" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field label="Project"><select value={form.projectId} onChange={(e) => updateForm("projectId", e.target.value)} className="field-input"><option value="">None</option>{projects.map((p) => <option key={p._id} value={p._id}>{p.projectName}</option>)}</select></Field>
        <Field label="Client"><select value={form.clientId} onChange={(e) => updateForm("clientId", e.target.value)} className="field-input"><option value="">None</option>{clients.map((c) => <option key={c._id} value={c._id}>{c.companyName || c.clientName}</option>)}</select></Field>
        <Field label="Employee"><select value={form.employeeId} onChange={(e) => updateForm("employeeId", e.target.value)} className="field-input"><option value="">None</option>{employees.map((emp) => <option key={emp._id} value={emp.userId?._id || emp.userId || emp._id}>{emp.name || emp.employeeName || emp.userId?.name}</option>)}</select></Field>
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-xs font-bold text-slate-700"><input type="checkbox" checked={form.isRecurring} onChange={(e) => updateForm("isRecurring", e.target.checked)} /> Recurring Expense</label>
        {form.isRecurring && (
          <>
            <Field label="Frequency"><select value={form.recurringConfig.frequency} onChange={(e) => updateNested("recurringConfig", "frequency", e.target.value)} className="field-input"><option>Daily</option><option>Weekly</option><option>Monthly</option><option>Quarterly</option><option>Half-Yearly</option><option>Yearly</option><option>Custom</option></select></Field>
            <Field label="Next Due Date"><input type="date" value={form.recurringConfig.nextDueDate} onChange={(e) => updateNested("recurringConfig", "nextDueDate", e.target.value)} className="field-input" /></Field>
          </>
        )}
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-xs font-bold text-slate-700"><input type="checkbox" checked={form.isReimbursement} onChange={(e) => updateForm("isReimbursement", e.target.checked)} /> Employee Reimbursement</label>
        {form.isReimbursement && (
          <>
            <Field label="Claimed Amount"><input type="number" value={form.reimbursement.claimedAmount} onChange={(e) => updateNested("reimbursement", "claimedAmount", e.target.value)} className="field-input" /></Field>
            <Field label="Claim Reason"><input value={form.reimbursement.claimReason} onChange={(e) => updateNested("reimbursement", "claimReason", e.target.value)} className="field-input" /></Field>
          </>
        )}
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-xs font-bold text-slate-700"><input type="checkbox" checked={form.approvalRequired} onChange={(e) => updateForm("approvalRequired", e.target.checked)} /> Approval Required</label>
        <Field label="Approval Status"><select value={form.approvalStatus} onChange={(e) => updateForm("approvalStatus", e.target.value)} className="field-input"><option>Draft</option><option>Pending Approval</option><option>Approved</option><option>Rejected</option><option>Cancelled</option></select></Field>
        <Field label="Tags"><input value={form.tags} onChange={(e) => updateForm("tags", e.target.value)} placeholder="monthly, hosting, urgent" className="field-input" /></Field>
      </div>

      <SectionTitle title="Attachments & Notes" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Upload Bills / Receipts / GST Invoice">
          <div className="rounded-xl border border-dashed border-slate-300 p-4">
            <Upload className="mb-2 h-5 w-5 text-slate-400" />
            <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={(e) => updateForm("attachments", e.target.files)} className="text-xs font-semibold text-slate-700" />
          </div>
        </Field>
        <Field label="Expense Notes"><textarea value={form.notes} onChange={(e) => updateForm("notes", e.target.value)} className="field-input min-h-24" /></Field>
        <Field label="Internal Notes"><textarea value={form.internalNotes} onChange={(e) => updateForm("internalNotes", e.target.value)} className="field-input min-h-24" /></Field>
        <Field label="Description"><textarea value={form.description} onChange={(e) => updateForm("description", e.target.value)} className="field-input min-h-24" /></Field>
      </div>

      <ModalActions onCancel={onClose} submitLabel={mode === "edit" ? "Update Expense" : "Save Expense"} disabled={isSubmitting} />
    </form>
  </Modal>
);

const SectionTitle = ({ title }) => (
  <h4 className="border-b border-slate-200 pb-2 text-sm font-black text-slate-900">{title}</h4>
);

const ExpenseDetailsDrawer = ({ drawer, onClose }) => {
  const expense = drawer.expense;
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40">
      <div className="h-full w-full max-w-3xl overflow-y-auto bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">{expense?.expenseId || "Expense Details"}</h3>
            <p className="text-xs font-semibold text-slate-500">{expense?.expenseTitle}</p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
        </div>
        {drawer.isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="space-y-5">
            <DetailGrid title="Expense Information" rows={[
              ["Title", expense.expenseTitle],
              ["Category", expense.category],
              ["Subcategory", expense.subcategory],
              ["Date", formatDate(expense.expenseDate || expense.date)],
              ["Department", expense.department || "General"],
              ["Project", expense.projectId?.projectName || "N/A"],
              ["Client", expense.clientId?.companyName || expense.clientId?.clientName || "N/A"],
            ]} />
            <DetailGrid title="Amount Breakdown" rows={[
              ["Base Amount", formatCurrency(expense.baseAmount)],
              ["GST Amount", formatCurrency(expense.gstAmount)],
              ["CGST", formatCurrency(expense.cgst)],
              ["SGST", formatCurrency(expense.sgst)],
              ["IGST", formatCurrency(expense.igst)],
              ["Discount", formatCurrency(expense.discount)],
              ["Additional Charges", formatCurrency(expense.additionalCharges)],
              ["Total Amount", formatCurrency(expense.totalAmount)],
              ["Paid Amount", formatCurrency(expense.amountPaid)],
              ["Pending Amount", formatCurrency(expense.pendingAmount)],
            ]} />
            <DetailGrid title="Vendor & Bill Information" rows={[
              ["Vendor", expense.vendorSnapshot?.vendorName || expense.paidTo || "N/A"],
              ["GSTIN", expense.vendorSnapshot?.gstin || "N/A"],
              ["PAN", expense.vendorSnapshot?.pan || "N/A"],
              ["Invoice Number", expense.invoiceNumber || "N/A"],
              ["Bill Number", expense.billNumber || "N/A"],
              ["Due Date", formatDate(expense.dueDate)],
            ]} />
            <DetailGrid title="Approval Information" rows={[
              ["Approval Status", expense.approvalStatus],
              ["Approved By", expense.approvedBy?.name || "N/A"],
              ["Approved At", formatDate(expense.approvedAt)],
              ["Rejected By", expense.rejectedBy?.name || "N/A"],
              ["Rejection Reason", expense.rejectionReason || "N/A"],
            ]} />
            <div className="rounded-2xl border border-slate-200 p-4">
              <h4 className="mb-3 text-sm font-black text-slate-900">Payment History</h4>
              {expense.payments?.length ? (
                <div className="space-y-2">
                  {expense.payments.map((payment) => (
                    <div key={payment._id} className="rounded-xl bg-slate-50 p-3 text-xs font-semibold text-slate-700">
                      {formatDate(payment.paymentDate)} | {formatCurrency(payment.amount)} | {payment.paymentMethod} | {payment.transactionReference || payment.utrNumber || "No reference"}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs font-semibold text-slate-500">No payment history recorded.</p>
              )}
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <h4 className="mb-3 text-sm font-black text-slate-900">Attachments</h4>
              {expense.attachments?.length ? (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {expense.attachments.map((file) => (
                    <a key={file._id || file.path} href={file.path} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 p-3 text-xs font-bold text-blue-600 hover:bg-blue-50">
                      {file.originalName || file.label || "Attachment"}
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-xs font-semibold text-slate-500">No attachments uploaded.</p>
              )}
            </div>
            <DetailGrid title="Audit Information" rows={[
              ["Created By", expense.createdBy?.name || "N/A"],
              ["Created At", formatDate(expense.createdAt)],
              ["Updated By", expense.updatedBy?.name || "N/A"],
              ["Updated At", formatDate(expense.updatedAt)],
            ]} />
          </div>
        )}
      </div>
    </div>
  );
};

const DetailGrid = ({ title, rows }) => (
  <div className="rounded-2xl border border-slate-200 p-4">
    <h4 className="mb-3 text-sm font-black text-slate-900">{title}</h4>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {rows.map(([label, value]) => (
        <div key={label}>
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{label}</p>
          <p className="mt-1 text-xs font-bold text-slate-800">{value || "N/A"}</p>
        </div>
      ))}
    </div>
  </div>
);

export default SuperAdminAccounts;
