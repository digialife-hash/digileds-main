import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calculator, Save } from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import MonthDropdown from "../../components/common/MonthDropdown";
import SelectDropdown from "../../components/common/SelectDropdown";
import { useAuth } from "../../context/authStore";
import { ROUTES } from "../../routes/routeConstants";
import { getEmployees } from "../../services/employeeService";
import {
  createPayroll,
  getPayrollById,
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

const initialFormData = {
  employeeId: "",
  month: String(new Date().getMonth() + 1),
  year: String(currentYear),
  basicSalary: "",
  bonus: "0",
  deduction: "0",
  paidAmount: "0",
  paymentDate: "",
  remarks: "",
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
};

const formatDateInput = (value) => {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
};

const getEmployeeId = (employee) => {
  if (!employee) return "";
  if (typeof employee === "string") return employee;
  return employee._id || "";
};

const getEmployeeLabel = (employee) => {
  if (!employee || typeof employee === "string") return "Selected employee";
  return `${employee.name || "Employee"} - ${employee.department || "No department"}`;
};

const toSafeNumber = (value) => {
  if (value === "" || value === null || value === undefined) return 0;

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const getPayrollFormData = (payroll) => ({
  employeeId: getEmployeeId(payroll?.employeeId),
  month: String(payroll?.month || new Date().getMonth() + 1),
  year: String(payroll?.year || currentYear),
  basicSalary: payroll?.basicSalary ?? "",
  bonus: payroll?.bonus ?? "0",
  deduction: payroll?.deduction ?? "0",
  paidAmount: payroll?.paidAmount ?? "0",
  paymentDate: formatDateInput(payroll?.paymentDate),
  remarks: payroll?.remarks || "",
});

const buildCreatePayload = (formData) => ({
  employeeId: formData.employeeId,
  month: Number(formData.month),
  year: Number(formData.year),
  basicSalary: Number(formData.basicSalary),
  bonus: formData.bonus === "" ? 0 : Number(formData.bonus),
  deduction: formData.deduction === "" ? 0 : Number(formData.deduction),
  paidAmount: formData.paidAmount === "" ? 0 : Number(formData.paidAmount),
  paymentDate: formData.paymentDate || undefined,
  remarks: formData.remarks.trim(),
});

const buildUpdatePayload = (formData) => ({
  basicSalary: Number(formData.basicSalary),
  bonus: formData.bonus === "" ? 0 : Number(formData.bonus),
  deduction: formData.deduction === "" ? 0 : Number(formData.deduction),
  paidAmount: formData.paidAmount === "" ? 0 : Number(formData.paidAmount),
  paymentDate: formData.paymentDate || undefined,
  remarks: formData.remarks.trim(),
});

const getPayrollPreview = (formData) => {
  const basicSalary = toSafeNumber(formData.basicSalary);
  const bonus = toSafeNumber(formData.bonus);
  const deduction = toSafeNumber(formData.deduction);
  const paidAmount = toSafeNumber(formData.paidAmount);
  const totalPayable = basicSalary + bonus - deduction;
  const dueAmount = totalPayable - paidAmount;
  let paymentStatus = "unpaid";

  if (paidAmount > 0 && paidAmount < totalPayable) {
    paymentStatus = "partially_paid";
  }

  if (totalPayable > 0 && paidAmount === totalPayable) {
    paymentStatus = "paid";
  }

  return {
    totalPayable,
    dueAmount,
    paymentStatus,
  };
};

const PayrollForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [payroll, setPayroll] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = Boolean(id);
  const isSuperAdmin = ["super_admin", "admin"].includes(user?.role);
  const employeeOptions = useMemo(
    () => [
      ["", "Select employee"],
      ...employees.map((employee) => [
        employee._id,
        `${employee.name} - ${employee.department || "No department"}`,
      ]),
    ],
    [employees]
  );
  const preview = useMemo(() => getPayrollPreview(formData), [formData]);

  useEffect(() => {
    if (user && !isSuperAdmin) {
      navigate(ROUTES.UNAUTHORIZED, { replace: true });
    }
  }, [isSuperAdmin, navigate, user]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        if (isEditMode) {
          const result = await getPayrollById(id);
          const nextPayroll = result.data.payroll;

          setPayroll(nextPayroll);
          setFormData(getPayrollFormData(nextPayroll));
        } else {
          const result = await getEmployees({ limit: 100, status: "active" });
          setEmployees(result.data.employees || []);
        }
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
        setIsLoading(false);
      }
    };

    void fetchInitialData();
  }, [id, isEditMode, navigate]);

  const handleChange = (event) => {
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
    const year = Number(formData.year);
    const amountFields = ["basicSalary", "bonus", "deduction", "paidAmount"];

    if (!isEditMode && !formData.employeeId) {
      errors.employeeId = "Employee is required";
    }

    if (
      !formData.month ||
      !Number.isFinite(Number(formData.month)) ||
      Number(formData.month) < 1 ||
      Number(formData.month) > 12
    ) {
      errors.month = "Month must be between 1 and 12";
    }

    if (!Number.isInteger(year) || year < 1970 || year > currentYear + 25) {
      errors.year = "Enter a valid year";
    }

    if (formData.basicSalary === "") {
      errors.basicSalary = "Basic salary is required";
    }

    amountFields.forEach((field) => {
      const amount = Number(formData[field]);

      if (formData[field] !== "" && !Number.isFinite(amount)) {
        errors[field] = "Enter a valid amount";
        return;
      }

      if (formData[field] !== "" && amount < 0) {
        errors[field] = "Amount cannot be negative";
      }
    });

    if (
      toSafeNumber(formData.deduction) >
      toSafeNumber(formData.basicSalary) + toSafeNumber(formData.bonus)
    ) {
      errors.deduction = "Deduction cannot exceed salary plus bonus";
    }

    if (toSafeNumber(formData.paidAmount) > preview.totalPayable) {
      errors.paidAmount = "Paid amount cannot exceed total payable";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      if (isEditMode) {
        await updatePayroll(id, buildUpdatePayload(formData));
      } else {
        await createPayroll(buildCreatePayload(formData));
      }

      navigate(ROUTES.SUPER_ADMIN_PAYROLL, { replace: true });
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
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-96 items-center justify-center rounded-lg border border-slate-200 bg-white">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <section className="h-full space-y-6 overflow-y-auto pb-8">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate(ROUTES.SUPER_ADMIN_PAYROLL)}
            className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-slate-950"
          >
            <ArrowLeft size={16} />
            Back to Payroll
          </button>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Salary Management
          </p>
          <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
            {isEditMode ? "Update Payroll" : "Add Payroll"}
          </h1>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-slate-200 bg-white shadow-sm"
      >
        <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-bold text-slate-700">
                Employee <span className="text-red-500">*</span>
              </span>
              {isEditMode ? (
                <input
                  type="text"
                  value={getEmployeeLabel(payroll?.employeeId)}
                  readOnly
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 text-sm font-bold text-slate-600 outline-none"
                />
              ) : (
                <SelectDropdown
                  name="employeeId"
                  value={formData.employeeId}
                  options={employeeOptions}
                  onChange={handleChange}
                  className={`mt-2 h-11 w-full rounded-lg border bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:ring-2 ${
                    formErrors.employeeId
                      ? "border-red-300 focus:border-red-300 focus:ring-red-100"
                      : "border-slate-200 focus:border-blue-300 focus:ring-blue-100"
                  }`}
                />
              )}
              {formErrors.employeeId && (
                <p className="mt-1 text-xs font-semibold text-red-600">
                  {formErrors.employeeId}
                </p>
              )}
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-700">
                Month <span className="text-red-500">*</span>
              </span>
              <MonthDropdown
                name="month"
                value={formData.month}
                onChange={handleChange}
                disabled={isEditMode}
                options={monthOptions}
                className={`mt-2 h-11 w-full rounded-lg border bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:ring-2 disabled:bg-slate-100 disabled:text-slate-500 ${
                  formErrors.month
                    ? "border-red-300 focus:border-red-300 focus:ring-red-100"
                    : "border-slate-200 focus:border-blue-300 focus:ring-blue-100"
                }`}
              />
              {formErrors.month && (
                <p className="mt-1 text-xs font-semibold text-red-600">
                  {formErrors.month}
                </p>
              )}
            </label>

            {[
              ["year", "Year", "number"],
              ["basicSalary", "Basic Salary", "number"],
              ["bonus", "Bonus", "number"],
              ["deduction", "Deduction", "number"],
              ["paidAmount", "Paid Amount", "number"],
              ["paymentDate", "Payment Date", "date"],
            ].map(([name, label, type]) => (
              <label key={name} className="block">
                <span className="text-sm font-bold text-slate-700">{label}</span>
                <input
                  type={type}
                  min={type === "number" ? (name === "year" ? "2000" : "0") : undefined}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  readOnly={isEditMode && name === "year"}
                  className={`mt-2 h-11 w-full rounded-lg border bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:ring-2 read-only:bg-slate-100 read-only:text-slate-500 ${
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
                onChange={handleChange}
                rows={4}
                className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              />
            </label>
          </div>

          <aside className="h-fit rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-black text-slate-950">
              <Calculator size={18} />
              Payroll Preview
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between gap-3 text-sm">
                <span className="font-semibold text-slate-500">Total Payable</span>
                <span className="font-black text-slate-950">
                  {formatCurrency(preview.totalPayable)}
                </span>
              </div>
              <div className="flex justify-between gap-3 text-sm">
                <span className="font-semibold text-slate-500">Due Amount</span>
                <span className="font-black text-red-700">
                  {formatCurrency(preview.dueAmount)}
                </span>
              </div>
              <div className="flex justify-between gap-3 text-sm">
                <span className="font-semibold text-slate-500">Estimated Status</span>
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold capitalize text-blue-700 ring-1 ring-blue-100">
                  {preview.paymentStatus.replaceAll("_", " ")}
                </span>
              </div>
            </div>
            <p className="mt-4 text-xs font-semibold leading-5 text-slate-500">
              Final due amount and status are calculated again by the backend.
            </p>
          </aside>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate(ROUTES.SUPER_ADMIN_PAYROLL)}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Save size={17} />
            {isSubmitting
              ? "Saving..."
              : isEditMode
                ? "Update Payroll"
                : "Create Payroll"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default PayrollForm;
