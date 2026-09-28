import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  ClipboardList,
  Edit3,
  FileText,
  IdCard,
  Mail,
  MapPin,
  Phone,
  Save,
  Trash2,
  UserRound,
  Wallet,
  X,
} from "lucide-react";
import GenerateIDCardModal from "../../components/idCards/GenerateIDCardModal";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import PhoneInput from "../../components/common/PhoneInput";
import SelectDropdown from "../../components/common/SelectDropdown";
import { useAuth } from "../../context/authStore";
import { ROUTES } from "../../routes/routeConstants";
import {
  deleteEmployee,
  getEmployeeById,
  updateEmployee,
} from "../../services/employeeService";

const statusBadgeClass = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  inactive: "bg-slate-100 text-slate-600 ring-slate-200",
  terminated: "bg-red-50 text-red-700 ring-red-100",
  resigned: "bg-amber-50 text-amber-700 ring-amber-100",
};

const employmentTypeBadgeClass = {
  full_time: "bg-blue-50 text-blue-700 ring-blue-100",
  part_time: "bg-cyan-50 text-cyan-700 ring-cyan-100",
  intern: "bg-violet-50 text-violet-700 ring-violet-100",
  contract: "bg-orange-50 text-orange-700 ring-orange-100",
  freelancer: "bg-pink-50 text-pink-700 ring-pink-100",
};

const statusOptions = [
  ["active", "Active"],
  ["inactive", "Inactive"],
  ["terminated", "Terminated"],
  ["resigned", "Resigned"],
];

const employmentTypeOptions = [
  ["full_time", "Full Time"],
  ["part_time", "Part Time"],
  ["intern", "Intern"],
  ["contract", "Contract"],
  ["freelancer", "Freelancer"],
];

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

const formatLabel = (value = "") => value.replaceAll("_", " ");

const formatDate = (value) => {
  if (!value) return "Not set";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const formatDateTime = (value) => {
  if (!value) return "Not set";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
};

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

const DetailItem = ({ label, value, icon: Icon }) => (
  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
      {Icon && <Icon size={15} />}
      {label}
    </div>
    <p className="mt-2 break-words text-sm font-semibold text-slate-900">
      {value || "Not provided"}
    </p>
  </div>
);

const PlaceholderSection = ({ title, icon: Icon, text }) => (
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

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [employee, setEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isNotFound, setIsNotFound] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);
  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [modalErrorMessage, setModalErrorMessage] = useState("");
  const [isIdCardModalOpen, setIsIdCardModalOpen] = useState(false);

  const isSuperAdmin = user?.role === "super_admin";
  const employeesRoute = ROUTES.SUPER_ADMIN_EMPLOYEES;

  const fetchEmployee = async ({ silent = false } = {}) => {
    try {
      if (!silent) setIsLoading(true);
      setErrorMessage("");
      setIsNotFound(false);

      const result = await getEmployeeById(id);
      const nextEmployee = result.data.employee;

      setEmployee(nextEmployee);
      setFormData(getEmployeeFormData(nextEmployee));
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
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchEmployee();
  }, [id]);

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

    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    if (!formData.phone.trim()) {
      errors.phone = "Phone is required";
    } else if (formData.phone.replace(/\D/g, "").length !== 10) {
      errors.phone = "Enter a valid 10-digit phone number";
    }
    if (
      formData.emergencyContactPhone.trim() &&
      formData.emergencyContactPhone.replace(/\D/g, "").length !== 10
    ) {
      errors.emergencyContactPhone = "Enter a valid 10-digit phone number";
    }
    if (!formData.joiningDate) errors.joiningDate = "Joining date is required";
    if (formData.salary !== "" && Number(formData.salary) < 0) {
      errors.salary = "Salary cannot be negative";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openEditModal = () => {
    setFormData(getEmployeeFormData(employee));
    setFormErrors({});
    setModalErrorMessage("");
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    if (isSaving) return;

    setFormData(getEmployeeFormData(employee));
    setFormErrors({});
    setModalErrorMessage("");
    setIsEditModalOpen(false);
  };

  const handleEditSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSaving(true);
      setErrorMessage("");
      setModalErrorMessage("");

      const result = await updateEmployee(id, buildEmployeePayload(formData));

      setEmployee(result.data.employee);
      setIsEditModalOpen(false);
    } catch (error) {
      if (error.status === 401) {
        navigate(ROUTES.LOGIN, { replace: true });
        return;
      }

      if (error.status === 403) {
        navigate(ROUTES.UNAUTHORIZED, { replace: true });
        return;
      }

      setModalErrorMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const shouldDelete = window.confirm(
      `Delete ${employee.name}? This action cannot be undone.`
    );

    if (!shouldDelete) return;

    try {
      setIsDeleting(true);
      setErrorMessage("");
      await deleteEmployee(id);
      navigate(employeesRoute, { replace: true });
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
      setIsDeleting(false);
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
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => navigate(employeesRoute)}
            className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-slate-950"
          >
            <ArrowLeft size={16} />
            Back to Employees
          </button>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Employee Profile
          </p>
          <h1 className="mt-1 break-words text-2xl font-black text-slate-950 sm:text-3xl">
            {employee.name}
          </h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold capitalize ring-1 ${
                statusBadgeClass[employee.status] || statusBadgeClass.inactive
              }`}
            >
              {employee.status}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold capitalize ring-1 ${
                employmentTypeBadgeClass[employee.employmentType] ||
                employmentTypeBadgeClass.full_time
              }`}
            >
              {formatLabel(employee.employmentType)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => setIsIdCardModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
          >
            <IdCard size={17} />
            Generate / Manage ID Card
          </button>
          <button
            type="button"
            onClick={openEditModal}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md"
          >
            <Edit3 size={17} />
            Edit
          </button>
          {isSuperAdmin && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:-translate-y-0.5 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Trash2 size={17} />
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-lg font-black text-slate-950">
                Profile Information
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Core employment and contact details.
              </p>
            </div>

            <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
              <DetailItem label="Name" value={employee.name} icon={UserRound} />
              <DetailItem label="Email" value={employee.email} icon={Mail} />
              <DetailItem label="Phone" value={employee.phone} icon={Phone} />
              <DetailItem
                label="Department"
                value={employee.department}
                icon={BriefcaseBusiness}
              />
              <DetailItem label="Designation" value={employee.designation} />
              <DetailItem
                label="Joining Date"
                value={formatDate(employee.joiningDate)}
                icon={CalendarDays}
              />
              <DetailItem label="Salary" value={formatCurrency(employee.salary)} />
              <DetailItem
                label="Employment Type"
                value={formatLabel(employee.employmentType)}
              />
              <DetailItem label="Status" value={employee.status} />
              <DetailItem
                label="Created At"
                value={formatDateTime(employee.createdAt)}
              />
              <DetailItem
                label="Updated At"
                value={formatDateTime(employee.updatedAt)}
              />
              <DetailItem
                label="Login Role"
                value={employee.userId?.role ? formatLabel(employee.userId.role) : "Employee"}
              />
              <DetailItem
                label="Login Status"
                value={employee.userId?.status || "Not linked"}
              />
              <DetailItem
                label="Login Email"
                value={employee.userId?.email || employee.email}
                icon={Mail}
              />
              <div className="md:col-span-2 xl:col-span-3">
                <DetailItem label="Address" value={employee.address} icon={MapPin} />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-slate-950">
              Emergency Contact
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <DetailItem
                label="Name"
                value={employee.emergencyContact?.name}
                icon={UserRound}
              />
              <DetailItem
                label="Phone"
                value={employee.emergencyContact?.phone}
                icon={Phone}
              />
              <DetailItem
                label="Relation"
                value={employee.emergencyContact?.relation}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <PlaceholderSection
              title="Assigned Projects"
              icon={BriefcaseBusiness}
              text="Coming soon: project assignment history will appear here."
            />
            <PlaceholderSection
              title="Attendance Summary"
              icon={ClipboardList}
              text="Coming soon: attendance totals and recent activity will appear here."
            />
            <PlaceholderSection
              title="Payroll History"
              icon={Wallet}
              text="Coming soon: monthly payroll records will appear here."
            />
            <PlaceholderSection
              title="Documents"
              icon={FileText}
              text="Coming soon: uploaded employee documents will appear here."
            />
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-black text-slate-950">
              Quick Summary
            </h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-slate-500">Department</span>
                <span className="font-bold text-slate-900">
                  {employee.department || "Not set"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-slate-500">Designation</span>
                <span className="font-bold text-slate-900">
                  {employee.designation || "Not set"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-slate-500">Documents</span>
                <span className="font-bold text-slate-900">
                  {employee.documents?.length || 0}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {isEditModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Edit Employee
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-950">
                  {employee.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                disabled={isSaving}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close employee form"
              >
                <X size={20} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
              {modalErrorMessage && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {modalErrorMessage}
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
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
                        onChange={handleFormChange}
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
                        onChange={handleFormChange}
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
                    Employment Type
                  </span>
                  <SelectDropdown
                    name="employmentType"
                    value={formData.employmentType}
                    options={employmentTypeOptions}
                    onChange={handleFormChange}
                    className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Status</span>
                  <SelectDropdown
                    name="status"
                    value={formData.status}
                    options={statusOptions}
                    onChange={handleFormChange}
                    className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
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
                onClick={handleEditSubmit}
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Save size={17} />
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isIdCardModalOpen && (
        <GenerateIDCardModal
          isOpen={isIdCardModalOpen}
          onClose={() => setIsIdCardModalOpen(false)}
          initialEntityType="employee"
          initialEntityId={employee?._id}
        />
      )}
    </section>
  );
};

export default EmployeeDetails;
