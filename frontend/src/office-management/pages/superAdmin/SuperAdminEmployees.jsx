import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  IdCard,
  Mail,
  Phone,
  Plus,
  Save,
  Search,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";
import GenerateIDCardModal from "../../components/idCards/GenerateIDCardModal";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import PageBackButton from "../../components/common/PageBackButton";
import PhoneInput from "../../components/common/PhoneInput";
import SelectDropdown from "../../components/common/SelectDropdown";
import { useAuth } from "../../context/authStore";
import { ROUTES } from "../../routes/routeConstants";
import {
  createEmployee,
  deleteEmployee,
  getEmployees,
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
  password: "",
  confirmPassword: "",
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
  password: formData.password,
  address: formData.address.trim(),
  emergencyContact: {
    name: formData.emergencyContactName.trim(),
    phone: formData.emergencyContactPhone.trim(),
    relation: formData.emergencyContactRelation.trim(),
  },
});

const SuperAdminEmployees = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    department: "",
    status: "",
    designation: "",
    employmentType: "",
  });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [actionId, setActionId] = useState("");
  const [formModal, setFormModal] = useState({
    isOpen: false,
    mode: "create",
    employee: null,
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    employee: null,
  });
  const [formData, setFormData] = useState(defaultFormData);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalErrorMessage, setModalErrorMessage] = useState("");
  const [selectedEmpForIdCard, setSelectedEmpForIdCard] = useState(null);

  const isSuperAdmin = ["super_admin", "admin"].includes(user?.role);
  const canManageEmployees = ["super_admin", "admin"].includes(user?.role);
  const employeesBasePath = ROUTES.SUPER_ADMIN_EMPLOYEES;

  const requestParams = useMemo(
    () => ({
      page,
      limit: pagination.limit,
      search: filters.search || undefined,
      department: filters.department || undefined,
      status: filters.status || undefined,
      designation: filters.designation || undefined,
      employmentType: filters.employmentType || undefined,
    }),
    [filters, page, pagination.limit]
  );

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const result = await getEmployees(requestParams);

      setEmployees(result.data.employees || []);
      setPagination(result.data.pagination || pagination);
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

  useEffect(() => {
    if (user && !canManageEmployees) {
      navigate(ROUTES.UNAUTHORIZED, { replace: true });
    }
  }, [canManageEmployees, navigate, user]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchEmployees();
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [requestParams]);

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

  const openCreateModal = () => {
    setFormData(defaultFormData);
    setFormErrors({});
    setModalErrorMessage("");
    setFormModal({
      isOpen: true,
      mode: "create",
      employee: null,
    });
  };

  const openEditModal = (employee) => {
    setFormData(getEmployeeFormData(employee));
    setFormErrors({});
    setModalErrorMessage("");
    setFormModal({
      isOpen: true,
      mode: "edit",
      employee,
    });
  };

  const closeFormModal = () => {
    setFormModal({
      isOpen: false,
      mode: "create",
      employee: null,
    });
    setFormErrors({});
    setModalErrorMessage("");
  };

  const openDeleteModal = (employee) => {
    setDeleteModal({
      isOpen: true,
      employee,
    });
  };

  const closeDeleteModal = () => {
    if (actionId) return;

    setDeleteModal({
      isOpen: false,
      employee: null,
    });
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
    if (!formData.employmentType) {
      errors.employmentType = "Employment type is required";
    }
  if (formData.salary !== "" && Number(formData.salary) < 0) {
      errors.salary = "Salary cannot be negative";
    }
    if (formModal.mode === "create") {
      if (!formData.password) {
        errors.password = "Login password is required";
      }
      if (!formData.confirmPassword) {
        errors.confirmPassword = "Confirm password is required";
      }
      if (
        formData.password &&
        formData.confirmPassword &&
        formData.password !== formData.confirmPassword
      ) {
        errors.confirmPassword = "Passwords do not match";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      setModalErrorMessage("");

      const payload = buildEmployeePayload(formData);

      if (formModal.mode === "create") {
        await createEmployee(payload);
      } else {
        await updateEmployee(formModal.employee._id, payload);
      }

      closeFormModal();
      await fetchEmployees();
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
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const employee = deleteModal.employee;
    if (!employee) return;

    try {
      setActionId(employee._id);
      setErrorMessage("");
      await deleteEmployee(employee._id);
      setDeleteModal({
        isOpen: false,
        employee: null,
      });
      await fetchEmployees();
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
      setActionId("");
    }
  };

  return (
    <section className="h-full space-y-6 overflow-y-auto pb-8">
      <PageBackButton fallbackPath={ROUTES.SUPER_ADMIN_DASHBOARD} />
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
           Employee Management
          </p>
          <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
          Employees
          </h1>
        </div>

        {isSuperAdmin && (
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <Plus size={17} />
            Add Employee
          </button>
        )}
      </div>

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
            placeholder="Search name, email, phone, department, designation"
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <input
          type="text"
          value={filters.department}
          onChange={(event) => updateFilter("department", event.target.value)}
          placeholder="Department"
          className="filter-control h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />

        <SelectDropdown
          value={filters.status}
          options={[["", "All statuses"], ...statusOptions]}
          onChange={(event) => updateFilter("status", event.target.value)}
          wrapperClassName="filter-control"
          className="filter-control h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />

        <input
          type="text"
          value={filters.designation}
          onChange={(event) => updateFilter("designation", event.target.value)}
          placeholder="Designation"
          className="filter-control h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />

        <SelectDropdown
          value={filters.employmentType}
          options={[["", "All types"], ...employmentTypeOptions]}
          onChange={(event) => updateFilter("employmentType", event.target.value)}
          wrapperClassName="filter-control"
          className="filter-control h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <div className="flex min-h-96 items-center justify-center rounded-lg border border-slate-200 bg-white">
          <LoadingSpinner />
        </div>
      ) : employees.length === 0 ? (
        <div className="flex min-h-96 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <Users size={25} />
          </div>
          <h2 className="mt-4 text-lg font-black text-slate-950">
            employees found
          </h2>
          <p className="mt-1 max-w-md text-sm text-slate-500">
            Adjust your filters or add the first employee profile.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm xl:block">
            <table className="w-full table-fixed">
              <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">User / Employee</th>
                  <th className="px-5 py-4">Contact</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4">Type</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Joined</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((employee) => (
                  <tr key={employee._id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <p className="truncate font-bold text-slate-950">
                        {employee.name}
                      </p>
                      <p className="truncate text-sm text-slate-500">
                        {employee.department || "No department"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="truncate text-sm font-semibold text-slate-700">
                        {employee.email}
                      </p>
                      <p className="text-sm text-slate-500">{employee.phone}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {employee.designation || "Not assigned"}
                      </p>
                      <p className="text-sm text-slate-500">
                        {formatCurrency(employee.salary)}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${
                          employmentTypeBadgeClass[employee.employmentType] ||
                          employmentTypeBadgeClass.full_time
                        }`}
                      >
                        {formatLabel(employee.employmentType)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${
                          statusBadgeClass[employee.status] ||
                          statusBadgeClass.inactive
                        }`}
                      >
                        {employee.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                      {formatDate(employee.joiningDate)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`${employeesBasePath}/${employee._id}`)}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                          aria-label="View employee profile"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(employee)}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
                          aria-label="Edit employee"
                        >
                          <Edit3 size={16} />
                        </button>
                        {isSuperAdmin && (
                          <button
                            type="button"
                            onClick={() => openDeleteModal(employee)}
                            disabled={actionId === employee._id}
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            aria-label="Delete employee"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 xl:hidden">
            {employees.map((employee) => (
              <article
                key={employee._id}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <UserRound size={17} className="shrink-0 text-slate-400" />
                      <h2 className="truncate font-black text-slate-950">
                        {employee.name}
                      </h2>
                    </div>
                    <p className="mt-1 truncate text-sm font-semibold text-slate-600">
                      {employee.designation || "Not assigned"}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${
                      statusBadgeClass[employee.status] ||
                      statusBadgeClass.inactive
                    }`}
                  >
                    {employee.status}
                  </span>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-slate-600">
                  <p className="inline-flex min-w-0 items-center gap-2">
                    <Mail size={15} className="shrink-0" />
                    <span className="truncate">{employee.email}</span>
                  </p>
                  <p className="inline-flex items-center gap-2">
                    <Phone size={15} />
                    {employee.phone}
                  </p>
                  <p className="inline-flex items-center gap-2 font-semibold text-slate-800">
                    <BriefcaseBusiness size={15} />
                    {employee.department || "No department"}
                  </p>
                  <p className="inline-flex items-center gap-2">
                    <CalendarDays size={15} />
                    {formatDate(employee.joiningDate)}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${
                      employmentTypeBadgeClass[employee.employmentType] ||
                      employmentTypeBadgeClass.full_time
                    }`}
                  >
                    {formatLabel(employee.employmentType)}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                    {formatCurrency(employee.salary)}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`${employeesBasePath}/${employee._id}`)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditModal(employee)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
                  >
                    <Edit3 size={16} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedEmpForIdCard(employee)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
                    title="Generate / View ID Card"
                  >
                    <IdCard size={16} />
                    <span>ID Card</span>
                  </button>
                  {isSuperAdmin && (
                    <button
                      type="button"
                      onClick={() => openDeleteModal(employee)}
                      disabled={actionId === employee._id}
                      className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label="Delete employee"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-slate-600">
              Showing page {pagination.page} of {pagination.totalPages || 1} -{" "}
              {pagination.total} users/employees
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              <button
                type="button"
                onClick={() => goToPage(page + 1)}
                disabled={page >= pagination.totalPages}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}

      {deleteModal.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
                  Delete Employee
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-950">
                  {deleteModal.employee?.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={Boolean(actionId)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Close delete confirmation"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-5 py-5">
              <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3">
                <p className="text-sm font-semibold text-red-800">
                  This will permanently remove the employee profile.
                </p>
                <p className="mt-1 text-sm text-red-700">
                  Payroll, attendance, and project history may need a soft-delete flow later.
                </p>
              </div>

              <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3">
                <p className="text-sm font-bold text-slate-950">
                  {deleteModal.employee?.name}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {deleteModal.employee?.email}
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={Boolean(actionId)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={Boolean(actionId)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Trash2 size={17} />
                {actionId ? "Deleting..." : "Delete Employee"}
              </button>
            </div>
          </div>
        </div>
      )}

      {formModal.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  {formModal.mode === "create" ? "Add Employee" : "Edit Employee"}
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-950">
                  {formModal.mode === "create"
                    ? "New User / Employee"
                    : formModal.employee?.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeFormModal}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close employee form"
              >
                <X size={20} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
              {formModal.mode === "create" && (
                <div className="mb-5 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
                  <p className="text-sm font-black text-blue-950">
                    Login account
                  </p>
                  <p className="mt-1 text-sm font-semibold text-blue-800">
                    This user/employee will be able to login with the email and password below.
                  </p>
                </div>
              )}

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

                {formModal.mode === "create" &&
                  [
                    ["password", "Login Password", "password", true],
                    ["confirmPassword", "Confirm Password", "password", true],
                  ].map(([name, label, type, required]) => (
                    <label key={name} className="block">
                      <span className="text-sm font-bold text-slate-700">
                        {label} {required && <span className="text-red-500">*</span>}
                      </span>
                      <input
                        type={type}
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

                <label className="block">
                  <span className="text-sm font-bold text-slate-700">
                    Employment Type <span className="text-red-500">*</span>
                  </span>
                  <SelectDropdown
                    name="employmentType"
                    value={formData.employmentType}
                    options={employmentTypeOptions}
                    onChange={handleFormChange}
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
                onClick={closeFormModal}
                disabled={isSubmitting}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Save size={17} />
                {isSubmitting
                  ? "Saving..."
                  : formModal.mode === "create"
                    ? "Add Employee"
                    : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedEmpForIdCard && (
        <GenerateIDCardModal
          isOpen={!!selectedEmpForIdCard}
          onClose={() => setSelectedEmpForIdCard(null)}
          initialEntityType="employee"
          initialEntityId={selectedEmpForIdCard._id}
        />
      )}
    </section>
  );
};

export default SuperAdminEmployees;
