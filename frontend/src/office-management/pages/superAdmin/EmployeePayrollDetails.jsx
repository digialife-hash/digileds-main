import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  Download,
  Edit3,
  FileText,
  Save,
  UserRound,
  Wallet,
  X,
} from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import SelectDropdown from "../../components/common/SelectDropdown";
import { useAuth } from "../../context/authStore";
import { ROUTES } from "../../routes/routeConstants";
import { getEmployeeById } from "../../services/employeeService";
import {
  getPayrollByEmployee,
  updatePayroll,
} from "../../services/payrollService";

const currentYear = new Date().getFullYear();

const monthOptions = [
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

const defaultFormData = {
  basicSalary: "",
  bonus: "0",
  deduction: "0",
  paidAmount: "0",
  remarks: "",
};

const formatLabel = (value = "") => value.replaceAll("_", " ");

const formatDate = (value) => {
  if (!value) return "Not set";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
};

const getMonthLabel = (month) => {
  const option = monthOptions.find(([value]) => Number(value) === Number(month));
  return option?.[1] || `Month ${month}`;
};

const getPayrollFormData = (payroll) => ({
  basicSalary: payroll?.basicSalary ?? "",
  bonus: payroll?.bonus ?? "0",
  deduction: payroll?.deduction ?? "0",
  paidAmount: payroll?.paidAmount ?? "0",
  remarks: payroll?.remarks || "",
});

const buildPayrollPayload = (formData) => ({
  basicSalary: Number(formData.basicSalary),
  bonus: formData.bonus === "" ? 0 : Number(formData.bonus),
  deduction: formData.deduction === "" ? 0 : Number(formData.deduction),
  paidAmount: formData.paidAmount === "" ? 0 : Number(formData.paidAmount),
  remarks: formData.remarks.trim(),
});

const SummaryCard = ({ label, value, icon: Icon, tone = "text-slate-950" }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
      {Icon && <Icon size={15} />}
      {label}
    </div>
    <p className={`mt-2 text-xl font-black ${tone}`}>{value}</p>
  </div>
);

const PlaceholderCard = ({ title, icon: Icon, text }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <Icon size={20} />
      </div>
      <div>
        <h2 className="text-base font-black text-slate-950">{title}</h2>
        <p className="text-sm text-slate-500">{text}</p>
      </div>
    </div>
  </div>
);

const EmployeePayrollDetails = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [employee, setEmployee] = useState(null);
  const [payrolls, setPayrolls] = useState([]);
  const [filters, setFilters] = useState({
    year: "",
    paymentStatus: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isNotFound, setIsNotFound] = useState(false);
  const [formModal, setFormModal] = useState({
    isOpen: false,
    payroll: null,
  });
  const [formData, setFormData] = useState(defaultFormData);
  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const isSuperAdmin = user?.role === "super_admin";
  const canViewPayroll = isSuperAdmin;

  const requestParams = useMemo(
    () => ({
      year: filters.year || undefined,
      paymentStatus: filters.paymentStatus || undefined,
    }),
    [filters]
  );

  const totals = useMemo(
    () =>
      payrolls.reduce(
        (summary, payroll) => ({
          paidAmount: summary.paidAmount + Number(payroll.paidAmount || 0),
          dueAmount: summary.dueAmount + Number(payroll.dueAmount || 0),
        }),
        { paidAmount: 0, dueAmount: 0 }
      ),
    [payrolls]
  );

  const fetchDetails = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      setIsNotFound(false);

      const [employeeResult, payrollResult] = await Promise.all([
        getEmployeeById(employeeId),
        getPayrollByEmployee(employeeId, requestParams),
      ]);

      setEmployee(employeeResult.data.employee);
      setPayrolls(payrollResult.data.payrolls || []);
    } catch (error) {
      if (error.status === 401) {
        navigate(ROUTES.LOGIN, { replace: true });
        return;
      }

      if (error.status === 403) {
        navigate(ROUTES.UNAUTHORIZED, { replace: true });
        return;
      }

      if (error.status === 404) {
        setIsNotFound(true);
        return;
      }

      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && !canViewPayroll) {
      navigate(ROUTES.UNAUTHORIZED, { replace: true });
    }
  }, [canViewPayroll, navigate, user]);

  useEffect(() => {
    void fetchDetails();
  }, [employeeId, requestParams]);

  const updateFilter = (name, value) => {
    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const openEditModal = (payroll) => {
    setFormData(getPayrollFormData(payroll));
    setFormErrors({});
    setFormModal({
      isOpen: true,
      payroll,
    });
  };

  const closeEditModal = () => {
    if (isSaving) return;

    setFormModal({
      isOpen: false,
      payroll: null,
    });
    setFormErrors({});
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors((current) => ({
        ...current,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const totalPayable =
      Number(formData.basicSalary || 0) +
      Number(formData.bonus || 0) -
      Number(formData.deduction || 0);

    if (formData.basicSalary === "") {
      errors.basicSalary = "Basic salary is required";
    }

    ["basicSalary", "bonus", "deduction", "paidAmount"].forEach((field) => {
      if (formData[field] !== "" && Number(formData[field]) < 0) {
        errors[field] = "Amount cannot be negative";
      }
    });

    if (Number(formData.deduction || 0) > Number(formData.basicSalary || 0) + Number(formData.bonus || 0)) {
      errors.deduction = "Deduction cannot exceed salary plus bonus";
    }

    if (Number(formData.paidAmount || 0) > totalPayable) {
      errors.paidAmount = "Paid amount cannot exceed total payable";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdatePayroll = async () => {
    if (!validateForm() || !formModal.payroll) return;

    try {
      setIsSaving(true);
      setErrorMessage("");

      await updatePayroll(formModal.payroll._id, buildPayrollPayload(formData));
      closeEditModal();
      await fetchDetails();
    } catch (error) {
      if (error.status === 401) {
        navigate(ROUTES.LOGIN, { replace: true });
        return;
      }

      if (error.status === 403) {
        navigate(ROUTES.UNAUTHORIZED, { replace: true });
        return;
      }

      setErrorMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-96 items-center justify-center rounded-lg border border-slate-200 bg-white">
        <LoadingSpinner />
      </div>
    );
  }

  if (isNotFound) {
    return (
      <section className="flex min-h-96 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-center shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
          <UserRound size={25} />
        </div>
        <h1 className="mt-4 text-xl font-black text-slate-950">
          Employee payroll not found
        </h1>
        <p className="mt-1 max-w-md text-sm text-slate-500">
          The employee may have been deleted or the link may be incorrect.
        </p>
        <button
          type="button"
          onClick={() => navigate(ROUTES.SUPER_ADMIN_PAYROLL)}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
        >
          <ArrowLeft size={17} />
          Back to Payroll
        </button>
      </section>
    );
  }

  return (
    <section className="h-full space-y-6 overflow-y-auto pb-8">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => navigate(ROUTES.SUPER_ADMIN_PAYROLL)}
            className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-slate-950"
          >
            <ArrowLeft size={16} />
            Back to Payroll
          </button>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Employee Payroll
          </p>
          <h1 className="mt-1 break-words text-2xl font-black text-slate-950 sm:text-3xl">
            {employee?.name}
          </h1>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
          {[
            ["Email", employee?.email],
            ["Phone", employee?.phone],
            ["Department", employee?.department || "Not set"],
            ["Designation", employee?.designation || "Not set"],
            ["Joining Date", formatDate(employee?.joiningDate)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-slate-50 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {label}
              </p>
              <p className="mt-1 break-words text-sm font-semibold text-slate-900">
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SummaryCard
          label="Total Paid"
          value={formatCurrency(totals.paidAmount)}
          icon={Wallet}
          tone="text-emerald-700"
        />
        <SummaryCard
          label="Total Due"
          value={formatCurrency(totals.dueAmount)}
          icon={Wallet}
          tone="text-red-700"
        />
      </div>

      <div className="filter-bar gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <input
          type="number"
          value={filters.year}
          onChange={(event) => updateFilter("year", event.target.value)}
          placeholder={`Year, e.g. ${currentYear}`}
          className="filter-control h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />

        <SelectDropdown
          value={filters.paymentStatus}
          options={paymentStatusOptions}
          onChange={(event) => updateFilter("paymentStatus", event.target.value)}
          wrapperClassName="filter-control"
          className="filter-control h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {payrolls.length === 0 ? (
        <div className="flex min-h-80 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-center shadow-sm">
          <Wallet size={28} className="text-slate-400" />
          <h2 className="mt-4 text-lg font-black text-slate-950">
            No payroll records found
          </h2>
          <p className="mt-1 max-w-md text-sm text-slate-500">
            Try a different year or payment status filter.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {payrolls.map((payroll) => (
            <article
              key={payroll._id}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="inline-flex items-center gap-2 font-black text-slate-950">
                    <CalendarDays size={17} className="text-slate-400" />
                    {getMonthLabel(payroll.month)} {payroll.year}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Paid {formatCurrency(payroll.paidAmount)} - Due{" "}
                    {formatCurrency(payroll.dueAmount)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${
                      paymentStatusBadgeClass[payroll.paymentStatus] ||
                      paymentStatusBadgeClass.unpaid
                    }`}
                  >
                    {formatLabel(payroll.paymentStatus)}
                  </span>
                  {isSuperAdmin && (
                    <button
                      type="button"
                      onClick={() => openEditModal(payroll)}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
                    >
                      <Edit3 size={15} />
                      Update Payroll
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {[
                  ["Basic Salary", payroll.basicSalary],
                  ["Bonus", payroll.bonus],
                  ["Deduction", payroll.deduction],
                  ["Paid Amount", payroll.paidAmount],
                  ["Due Amount", payroll.dueAmount],
                ].map(([label, amount]) => (
                  <div key={label} className="rounded-lg bg-slate-50 px-3 py-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      {label}
                    </p>
                    <p className="mt-1 text-sm font-black text-slate-950">
                      {formatCurrency(amount)}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <PlaceholderCard
          title="Salary Slip Generation"
          icon={FileText}
          text="Generate salary slips from finalized payroll records."
        />
        <PlaceholderCard
          title="PDF Download"
          icon={Download}
          text="Download signed salary statements as PDFs."
        />
        <PlaceholderCard
          title="Attendance Deduction"
          icon={ClipboardList}
          text="Coming soon: attendance-based deduction summaries will appear here."
        />
        <PlaceholderCard
          title="Leave Deduction"
          icon={ClipboardList}
          text="Leave deduction rules can be connected later."
        />
      </div>

      {formModal.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Update Payroll
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-950">
                  {getMonthLabel(formModal.payroll?.month)} {formModal.payroll?.year}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                disabled={isSaving}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Close payroll form"
              >
                <X size={20} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ["basicSalary", "Basic Salary"],
                  ["bonus", "Bonus"],
                  ["deduction", "Deduction"],
                  ["paidAmount", "Paid Amount"],
                ].map(([name, label]) => (
                  <label key={name} className="block">
                    <span className="text-sm font-bold text-slate-700">
                      {label}
                    </span>
                    <input
                      type="number"
                      min="0"
                      name={name}
                      value={formData[name]}
                      onChange={handleFormChange}
                      className={`mt-2 h-11 w-full rounded-lg border bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:ring-2 ${
                        formErrors[name]
                          ? "border-red-300 focus:border-red-300 focus:ring-red-100"
                          : "border-slate-200 focus:border-blue-300 focus:ring-blue-100"
                      }`}
                    />
                    {formErrors[name] && (
                      <p className="mt-1 text-xs font-semibold text-red-600">
                        {formErrors[name]}
                      </p>
                    )}
                  </label>
                ))}

                <label className="block md:col-span-2">
                  <span className="text-sm font-bold text-slate-700">Remarks</span>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleFormChange}
                    rows={3}
                    className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeEditModal}
                disabled={isSaving}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdatePayroll}
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Save size={17} />
                {isSaving ? "Saving..." : "Save Payroll"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default EmployeePayrollDetails;
