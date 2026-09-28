import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  Plus,
  Save,
  Search,
  Trash2,
  UserRound,
  Wallet,
  X,
  Check,
  RotateCcw,
  Sparkles,
  Calculator,
} from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import MonthDropdown from "../../components/common/MonthDropdown";
import PageBackButton from "../../components/common/PageBackButton";
import { useAuth } from "../../context/authStore";
import { ROUTES } from "../../routes/routeConstants";
import { getEmployees } from "../../services/employeeService";
import {
  createPayroll,
  deletePayroll,
  getPayrolls,
  updatePayroll,
  getPayrollPreview,
  generateBulkPayroll,
  approvePayroll,
  recalculatePayroll,
} from "../../services/payrollService";

const currentYear = new Date().getFullYear();

const defaultPayrollForm = {
  employeeId: "",
  month: String(new Date().getMonth() + 1),
  year: String(currentYear),
  basicSalary: "",
  bonus: "0",
  deduction: "0",
  paidAmount: "0",
  remarks: "",
};

const monthOptions = [
  ["", "All months"],
  ["1", "January"],
  ["2", "February"],
  ["3", "March"],
  ["4", "April"],
  ["5", "May"],
  ["6", "June"],
  ["7", "July"],
  ["8", "August"],
  ["9", "September"],
  ["10", "October"],
  ["11", "November"],
  ["12", "December"],
];

const paymentStatusBadgeClass = {
  unpaid: "bg-red-50 text-red-700 ring-red-100",
  partially_paid: "bg-amber-50 text-amber-700 ring-amber-100",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-100",
};

const paymentStatusOptions = [
  ["", "All statuses"],
  ["unpaid", "Unpaid"],
  ["partially_paid", "Partially Paid"],
  ["paid", "Paid"],
];

const formatLabel = (value = "") => value.replaceAll("_", " ");

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
};

const getEmployeeId = (employee) => {
  if (!employee) return "";
  if (typeof employee === "string") return employee;
  return employee._id || "";
};

const getEmployeeName = (employee) => {
  if (!employee) return "Unknown employee";
  if (typeof employee === "string") return employee;
  return employee.name || "Employee";
};

const getMonthLabel = (month) => {
  const option = monthOptions.find(([value]) => Number(value) === Number(month));
  return option?.[1] || `Month ${month}`;
};

const SuperAdminPayroll = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEmbeddedDashboard =
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/admin/dashboard");
  const isSuperAdmin = ["super_admin", "admin"].includes(user?.role);
  const canViewPayroll = ["super_admin", "admin"].includes(user?.role);

  const [activeTab, setActiveTab] = useState("records");

  // Preview tab states
  const [previewMonth, setPreviewMonth] = useState(new Date().getMonth() + 1);
  const [previewYear, setPreviewYear] = useState(new Date().getFullYear());
  const [previewList, setPreviewList] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    employeeId: "",
    month: "",
    year: "",
    paymentStatus: "",
  });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formModal, setFormModal] = useState({
    isOpen: false,
    mode: "create",
    payroll: null,
  });
  const [formData, setFormData] = useState(defaultPayrollForm);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    payroll: null,
  });
  const [actionId, setActionId] = useState("");

  const employeeOptions = useMemo(
    () => [
      ["", "All employees"],
      ...employees.map((employee) => [employee._id, employee.name]),
    ],
    [employees]
  );

  const formEmployeeOptions = useMemo(
    () => [
      ["", "Select employee"],
      ...employees.map((employee) => [
        employee._id,
        `${employee.name} - ${employee.department || "No department"}`,
      ]),
    ],
    [employees]
  );

  const requestParams = useMemo(
    () => ({
      page,
      limit: pagination.limit,
      search: filters.search || undefined,
      employeeId: filters.employeeId || undefined,
      month: filters.month || undefined,
      year: filters.year || undefined,
      paymentStatus: filters.paymentStatus || undefined,
    }),
    [filters, page, pagination.limit]
  );

  const fetchPayrolls = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const result = await getPayrolls(requestParams);
      setPayrolls(result.data.payrolls || []);
      setPagination(result.data.pagination || pagination);
    } catch (error) {
      if (error.status === 401) {
        navigate(ROUTES.LOGIN, { replace: true });
        return;
      }
      if (error.status === 403) {
        if (isEmbeddedDashboard) {
          setErrorMessage(error.message);
          return;
        }
        navigate(ROUTES.UNAUTHORIZED, { replace: true });
        return;
      }
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployeeOptions = async () => {
    try {
      const result = await getEmployees({ limit: 100 });
      setEmployees(result.data.employees || []);
    } catch {
      setEmployees([]);
    }
  };

  // Preview tab fetches
  const fetchPreviewData = async () => {
    try {
      setPreviewLoading(true);
      setErrorMessage("");
      const res = await getPayrollPreview({
        month: previewMonth,
        year: previewYear,
      });
      if (res?.success) {
        setPreviewList(res.data);
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setPreviewLoading(false);
    }
  };

  // Bulk generate
  const handleBulkGenerate = async () => {
    try {
      setPreviewLoading(true);
      setSuccessMessage("");
      const res = await generateBulkPayroll({
        month: previewMonth,
        year: previewYear,
      });
      if (res?.success) {
        setSuccessMessage(res.message);
        void fetchPreviewData();
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setPreviewLoading(false);
    }
  };

  // Action decision
  const handleApprovalAction = async (id, action) => {
    try {
      setPreviewLoading(true);
      setSuccessMessage("");
      const res = await approvePayroll(id, action);
      if (res?.success) {
        setSuccessMessage(res.message);
        void fetchPreviewData();
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setPreviewLoading(false);
    }
  };

  // Recalculate
  const handleRecalculate = async (id) => {
    try {
      setPreviewLoading(true);
      setSuccessMessage("");
      const res = await recalculatePayroll(id);
      if (res?.success) {
        setSuccessMessage(res.message);
        void fetchPreviewData();
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setPreviewLoading(false);
    }
  };

  useEffect(() => {
    if (user && !canViewPayroll && !isEmbeddedDashboard) {
      navigate(ROUTES.UNAUTHORIZED, { replace: true });
    }
  }, [canViewPayroll, isEmbeddedDashboard, navigate, user]);

  useEffect(() => {
    void fetchEmployeeOptions();
  }, []);

  useEffect(() => {
    if (activeTab === "records") {
      const timeoutId = window.setTimeout(() => {
        void fetchPayrolls();
      }, 300);
      return () => window.clearTimeout(timeoutId);
    } else {
      void fetchPreviewData();
    }
  }, [activeTab, requestParams, previewMonth, previewYear]);

  const updateFilter = (name, value) => {
    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
    setPage(1);
  };

  const goToPage = (nextPage) => {
    if (nextPage < 1 || nextPage > pagination.totalPages) return;
    setPage(nextPage);
  };

  return (
    <section className="h-full space-y-6 overflow-y-auto pb-8 px-4">
      <PageBackButton fallbackPath={ROUTES.SUPER_ADMIN_DASHBOARD} />

      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Salary Management
          </p>
          <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
            Payroll Ledger
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => {
            setActiveTab("records");
            setSuccessMessage("");
            setErrorMessage("");
          }}
          className={`pb-3 text-sm font-bold transition border-b-2 ${
            activeTab === "records"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Payroll Records
        </button>
        <button
          onClick={() => {
            setActiveTab("preview");
            setSuccessMessage("");
            setErrorMessage("");
          }}
          className={`pb-3 text-sm font-bold transition border-b-2 ${
            activeTab === "preview"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Automation Preview & Approval
        </button>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
          {successMessage}
        </div>
      )}

      {/* TAB CONTROLLERS */}

      {activeTab === "records" && (
        <>
          <div className="filter-bar gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <label className="filter-control relative block">
              <Search
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={filters.search}
                onChange={(event) => updateFilter("search", event.target.value)}
                placeholder="Search employee name, email, phone"
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <MonthDropdown
              name="employeeId"
              value={filters.employeeId}
              options={employeeOptions}
              onChange={(event) => updateFilter("employeeId", event.target.value)}
              wrapperClassName="filter-control"
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />

            <MonthDropdown
              name="month"
              value={filters.month}
              options={monthOptions}
              onChange={(event) => updateFilter("month", event.target.value)}
              wrapperClassName="filter-control"
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />

            <MonthDropdown
              name="paymentStatus"
              value={filters.paymentStatus}
              options={paymentStatusOptions}
              onChange={(event) => updateFilter("paymentStatus", event.target.value)}
              wrapperClassName="filter-control"
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {isLoading ? (
            <div className="flex min-h-96 items-center justify-center rounded-lg border border-slate-200 bg-white">
              <LoadingSpinner />
            </div>
          ) : payrolls.length === 0 ? (
            <div className="flex min-h-96 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-center shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                <Wallet size={25} />
              </div>
              <h2 className="mt-4 text-lg font-black text-slate-950">No payroll records</h2>
              <p className="mt-1 max-w-md text-sm text-slate-500 font-semibold">
                Generate or configure monthly salary logs.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
                <table className="w-full min-w-[900px] table-fixed">
                  <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="w-2.5/12 px-6 py-4">Employee</th>
                      <th className="w-1.5/12 px-6 py-4">Period</th>
                      <th className="w-1.5/12 px-6 py-4">Basic Salary</th>
                      <th className="w-1.5/12 px-6 py-4">Overtime / Bonus</th>
                      <th className="w-1.5/12 px-6 py-4">Deductions</th>
                      <th className="w-1.5/12 px-6 py-4">Net Salary</th>
                      <th className="w-1.5/12 px-6 py-4">Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
                    {payrolls.map((payroll) => (
                      <tr key={payroll._id} className="transition hover:bg-slate-50/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-600">
                              <UserRound size={18} />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-slate-950">
                                {getEmployeeName(payroll.employeeId)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getMonthLabel(payroll.month)}, {payroll.year}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-900">
                          {formatCurrency(payroll.basicSalary)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-900">
                          {formatCurrency(payroll.bonus)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-red-600">
                          -{formatCurrency(payroll.deduction)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-900 font-bold">
                          {formatCurrency(payroll.netSalary || (payroll.basicSalary + payroll.bonus - payroll.deduction))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset ${
                              paymentStatusBadgeClass[payroll.paymentStatus]
                            }`}
                          >
                            {formatLabel(payroll.paymentStatus)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                  className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft size={16} />
                  Prev
                </button>
                <span className="text-sm font-bold text-slate-600">
                  Page {page} of {pagination.totalPages || 1}
                </span>
                <button
                  type="button"
                  onClick={() => goToPage(page + 1)}
                  disabled={page === pagination.totalPages || pagination.totalPages === 0}
                  className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </>
          )}
        </>
      )}

      {/* TAB 2: Preview & Automation */}
      {activeTab === "preview" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-end gap-4 bg-white p-4 rounded-lg border shadow-sm">
            <div className="w-40">
              <label className="block text-xs font-bold text-slate-500 mb-1">Month</label>
              <select
                value={previewMonth}
                onChange={(e) => setPreviewMonth(Number(e.target.value))}
                className="w-full h-10 rounded border px-3 text-sm"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2000, i, 1).toLocaleDateString("en-US", { month: "long" })}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-40">
              <label className="block text-xs font-bold text-slate-500 mb-1">Year</label>
              <select
                value={previewYear}
                onChange={(e) => setPreviewYear(Number(e.target.value))}
                className="w-full h-10 rounded border px-3 text-sm"
              >
                {[2025, 2026, 2027, 2028].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleBulkGenerate}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-sm font-bold text-white shadow"
            >
              <Sparkles size={16} /> Bulk Generate Payroll
            </button>
            <button
              onClick={() => setIsSummaryModalOpen(true)}
              disabled={previewList.length === 0}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Calculator size={16} className="text-blue-600" /> See Total Payroll Summary
            </button>
          </div>

          {previewLoading ? (
            <div className="flex min-h-96 items-center justify-center"><LoadingSpinner /></div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
              <table className="w-full min-w-[900px] table-fixed">
                <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500 border-b">
                  <tr>
                    <th className="px-6 py-4 w-2.5/12">Employee</th>
                    <th className="px-6 py-4 w-1.5/12">Expected Salary</th>
                    <th className="px-6 py-4 w-1.5/12">Overtime (OT)</th>
                    <th className="px-6 py-4 w-1.5/12">OT Amount</th>
                    <th className="px-6 py-4 w-1.5/12">Deductions</th>
                    <th className="px-6 py-4 w-1.5/12">Final Net</th>
                    <th className="px-6 py-4 w-2/12 text-right">Approval Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
                  {previewList.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <p className="text-slate-950 font-bold">{item.employee?.name}</p>
                        <p className="text-xs text-slate-400">{item.employee?.email}</p>
                      </td>
                      <td className="px-6 py-4">{formatCurrency(item.basicSalary)}</td>
                      <td className="px-6 py-4">{item.overtimeHours} hrs</td>
                      <td className="px-6 py-4 text-emerald-600">+{formatCurrency(item.overtimeAmount)}</td>
                      <td className="px-6 py-4 text-red-600">-{formatCurrency(item.lateDeduction)}</td>
                      <td className="px-6 py-4 font-bold text-slate-950">{formatCurrency(item.netSalary)}</td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <span className={`inline-flex rounded px-2 py-0.5 text-xs font-black uppercase mr-2 ${
                          item.status === "approved" ? "bg-emerald-50 text-emerald-800" :
                          item.status === "rejected" ? "bg-red-50 text-red-800" : "bg-blue-50 text-blue-800"
                        }`}>
                          {item.status}
                        </span>
                        
                        {item.payrollId && item.status === "generated" && (
                          <div className="inline-flex gap-1.5">
                            <button
                              onClick={() => handleApprovalAction(item.payrollId, "approve")}
                              className="p-1.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              title="Approve Salary Slip"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => handleApprovalAction(item.payrollId, "reject")}
                              className="p-1.5 rounded bg-red-50 text-red-700 hover:bg-red-100"
                              title="Reject Salary Slip"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        )}

                        {item.payrollId && (
                          <button
                            onClick={() => handleRecalculate(item.payrollId)}
                            className="p-1.5 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 ml-1.5"
                            title="Recalculate Details"
                          >
                            <RotateCcw size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Summary Modal */}
      {isSummaryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Calculator size={18} className="text-blue-600" />
                Payroll Summary ({getMonthLabel(previewMonth)} {previewYear})
              </h3>
              <button
                type="button"
                onClick={() => setIsSummaryModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Consolidated Payroll Calculations Based on Monthly Attendance:
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Total Employees</span>
                  <p className="mt-1 text-xl font-black text-slate-900">
                    {previewList.length}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Basic Salaries</span>
                  <p className="mt-1 text-xl font-black text-slate-900">
                    {formatCurrency(previewList.reduce((acc, item) => acc + (item.basicSalary || 0), 0))}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Total OT Hours</span>
                  <p className="mt-1 text-xl font-black text-slate-900">
                    {previewList.reduce((acc, item) => acc + (item.overtimeHours || 0), 0)} hrs
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Total OT Paid</span>
                  <p className="mt-1 text-xl font-black text-emerald-600">
                    +{formatCurrency(previewList.reduce((acc, item) => acc + (item.overtimeAmount || 0), 0))}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 col-span-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Total Late Deductions</span>
                  <p className="mt-1 text-xl font-black text-red-600">
                    -{formatCurrency(previewList.reduce((acc, item) => acc + (item.lateDeduction || 0), 0))}
                  </p>
                </div>
              </div>

              {/* Total payout */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-5 mt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-blue-700 uppercase">Total Net Payout</span>
                    <p className="mt-1 text-2xl font-black text-blue-900">
                      {formatCurrency(previewList.reduce((acc, item) => acc + (item.netSalary || 0), 0))}
                    </p>
                  </div>
                  <div className="rounded-xl bg-blue-100 p-2.5 text-blue-700">
                    <Wallet size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setIsSummaryModalOpen(false)}
                className="rounded-lg bg-slate-900 hover:bg-slate-800 px-4 py-2 text-sm font-bold text-white shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SuperAdminPayroll;
