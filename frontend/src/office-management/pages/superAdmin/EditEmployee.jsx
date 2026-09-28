import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, UserRound } from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import PhoneInput from "../../components/common/PhoneInput";
import SelectDropdown from "../../components/common/SelectDropdown";
import { ROUTES } from "../../routes/routeConstants";
import {
  getEmployeeById,
  updateEmployee,
} from "../../services/employeeService";

const defaultFormData = {
  name: "",
  email: "",
  phone: "",
  department: "",
  designation: "",
  joiningDate: "",
  salary: "",
  employmentType: "full_time",
  status: "active",
  address: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  emergencyContactRelation: "",
};

const employmentTypeOptions = [
  ["full_time", "Full Time"],
  ["part_time", "Part Time"],
  ["intern", "Intern"],
  ["contract", "Contract"],
  ["freelancer", "Freelancer"],
];

const employeeStatusOptions = [
  ["active", "Active"],
  ["inactive", "Inactive"],
  ["terminated", "Terminated"],
  ["resigned", "Resigned"],
];

const toDateInputValue = (value) => {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
};

const getEmployeeFormData = (employee) => ({
  name: employee?.name || "",
  email: employee?.email || "",
  phone: employee?.phone || "",
  department: employee?.department || "",
  designation: employee?.designation || "",
  joiningDate: toDateInputValue(employee?.joiningDate),
  salary: employee?.salary ?? "",
  employmentType: employee?.employmentType || "full_time",
  status: employee?.status || "active",
  address: employee?.address || "",
  emergencyContactName: employee?.emergencyContact?.name || "",
  emergencyContactPhone: employee?.emergencyContact?.phone || "",
  emergencyContactRelation: employee?.emergencyContact?.relation || "",
});

const buildEmployeePayload = (formData) => ({
  name: formData.name.trim(),
  email: formData.email.trim().toLowerCase(),
  phone: formData.phone.trim(),
  department: formData.department.trim(),
  designation: formData.designation.trim(),
  joiningDate: formData.joiningDate,
  salary: formData.salary === "" ? 0 : Number(formData.salary),
  employmentType: formData.employmentType,
  status: formData.status,
  address: formData.address.trim(),
  emergencyContact: {
    name: formData.emergencyContactName.trim(),
    phone: formData.emergencyContactPhone.trim(),
    relation: formData.emergencyContactRelation.trim(),
  },
});

const EditEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(defaultFormData);
  const [formErrors, setFormErrors] = useState({});
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isNotFound, setIsNotFound] = useState(false);

  const employeesRoute = ROUTES.SUPER_ADMIN_EMPLOYEES;
  const detailsRoute = `${employeesRoute}/${id}`;

  const fetchEmployee = async () => {
    try {
      setIsFetching(true);
      setErrorMessage("");
      setIsNotFound(false);

      const result = await getEmployeeById(id);
      setFormData(getEmployeeFormData(result.data.employee));
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
      setIsFetching(false);
    }
  };

  useEffect(() => {
    void fetchEmployee();
  }, [id]);

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
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneDigits = formData.phone.replace(/\D/g, "");
    const emergencyPhoneDigits = formData.emergencyContactPhone.replace(/\D/g, "");

    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!emailPattern.test(formData.email.trim())) {
      errors.email = "Enter a valid email address";
    }
    if (!formData.phone.trim()) {
      errors.phone = "Phone is required";
    } else if (phoneDigits.length !== 10) {
      errors.phone = "Enter a valid 10-digit phone number";
    }
    if (!formData.joiningDate) errors.joiningDate = "Joining date is required";
    if (!formData.employmentType) {
      errors.employmentType = "Employment type is required";
    }
    if (formData.salary !== "" && Number(formData.salary) < 0) {
      errors.salary = "Salary cannot be negative";
    }
    if (
      formData.emergencyContactPhone.trim() &&
      emergencyPhoneDigits.length !== 10
    ) {
      errors.emergencyContactPhone = "Enter a valid 10-digit phone number";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSaving(true);
      setErrorMessage("");

      await updateEmployee(id, buildEmployeePayload(formData));
      navigate(detailsRoute, { replace: true });
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

  if (isFetching) {
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
          Employee not found
        </h1>
        <p className="mt-1 max-w-md text-sm text-slate-500">
          The employee may have been deleted or the link may be incorrect.
        </p>
        <button
          type="button"
          onClick={() => navigate(employeesRoute)}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
        >
          <ArrowLeft size={17} />
          Back to Employees
        </button>
      </section>
    );
  }

  return (
    <section className="h-full space-y-6 overflow-y-auto pb-8">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate(detailsRoute)}
            className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-slate-950"
          >
            <ArrowLeft size={16} />
            Back to Profile
          </button>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Employee Management
          </p>
          <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
            Edit Employee
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
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-lg font-black text-slate-950">
            Profile Information
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Update employee profile, employment, and emergency contact details.
          </p>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-2">
          {[
            ["name", "Name", "text", true],
            ["email", "Email", "email", true],
            ["phone", "Phone", "tel", true],
            ["department", "Department", "text", false],
            ["designation", "Designation", "text", false],
            ["joiningDate", "Joining Date", "date", true],
            ["salary", "Salary", "number", false],
            ["address", "Address", "text", false],
            ["emergencyContactName", "Emergency Contact Name", "text", false],
            ["emergencyContactPhone", "Emergency Contact Phone", "tel", false],
            ["emergencyContactRelation", "Emergency Contact Relation", "text", false],
          ].map(([name, label, type, required]) => (
            <label key={name} className="block">
              <span className="text-sm font-bold text-slate-700">
                {label} {required && <span className="text-red-500">*</span>}
              </span>
              {type === "tel" ? (
                <PhoneInput
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  error={formErrors[name]}
                  required={required}
                  placeholder={label}
                />
              ) : (
                <input
                  type={type}
                  min={name === "salary" ? "0" : undefined}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  className={`mt-2 h-11 w-full rounded-lg border bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:ring-2 ${
                    formErrors[name]
                      ? "border-red-300 focus:border-red-300 focus:ring-red-100"
                      : "border-slate-200 focus:border-blue-300 focus:ring-blue-100"
                  }`}
                />
              )}
              {formErrors[name] && (
                <p className="mt-1 text-xs font-semibold text-red-600">
                  {formErrors[name]}
                </p>
              )}
            </label>
          ))}

          <label className="block">
            <span className="text-sm font-bold text-slate-700">
              Employment Type <span className="text-red-500">*</span>
            </span>
            <SelectDropdown
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange}
              options={employmentTypeOptions}
              className={`mt-2 h-11 w-full rounded-lg border bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:ring-2 ${
                formErrors.employmentType
                  ? "border-red-300 focus:border-red-300 focus:ring-red-100"
                  : "border-slate-200 focus:border-blue-300 focus:ring-blue-100"
              }`}
            />
            {formErrors.employmentType && (
              <p className="mt-1 text-xs font-semibold text-red-600">
                {formErrors.employmentType}
              </p>
            )}
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">Status</span>
            <SelectDropdown
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={employeeStatusOptions}
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            />
          </label>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate(detailsRoute)}
            disabled={isSaving}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Save size={17} />
            {isSaving ? "Updating..." : "Update Employee"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default EditEmployee;
