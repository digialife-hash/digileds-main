import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  FolderKanban,
  Link2,
  Plus,
  Save,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import PageBackButton from "../../components/common/PageBackButton";
import PhoneInput from "../../components/common/PhoneInput";
import SelectDropdown from "../../components/common/SelectDropdown";
import { useAuth } from "../../context/authStore";
import {
  convertServiceRequestToProject,
  createServiceRequestBySuperAdmin,
  deleteServiceRequest,
  getAllServiceRequests,
} from "../../services/serviceRequestService";
import { ROUTES } from "../../routes/routeConstants";

const convertibleStatuses = ["approved", "in_progress"];

const statusBadgeClass = {
  submitted: "bg-sky-50 text-sky-700 ring-sky-100",
  reviewed: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  in_progress: "bg-amber-50 text-amber-700 ring-amber-100",
  completed: "bg-green-50 text-green-700 ring-green-100",
  closed: "bg-slate-100 text-slate-600 ring-slate-200",
};

const priorityBadgeClass = {
  low: "bg-slate-100 text-slate-600 ring-slate-200",
  medium: "bg-blue-50 text-blue-700 ring-blue-100",
  high: "bg-orange-50 text-orange-700 ring-orange-100",
  urgent: "bg-red-50 text-red-700 ring-red-100",
};

const requestStatusOptions = [
  ["", "All statuses"],
  ["submitted", "Submitted"],
  ["reviewed", "Reviewed"],
  ["approved", "Approved"],
  ["in_progress", "In Progress"],
  ["completed", "Completed"],
  ["closed", "Closed"],
];

const priorityOptions = [
  ["", "All priorities"],
  ["low", "Low"],
  ["medium", "Medium"],
  ["high", "High"],
  ["urgent", "Urgent"],
];

const createPriorityOptions = priorityOptions.filter(([value]) => value);

const conversionOptions = [
  ["", "All conversions"],
  ["true", "Converted"],
  ["false", "Not converted"],
];

const formatDate = (value) => {
  if (!value) return "No deadline";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const getProjectId = (projectId) => {
  if (!projectId) return "";
  if (typeof projectId === "string") return projectId;

  return projectId._id || "";
};

const SuperAdminServiceRequests = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    priority: "",
    category: "",
    convertedToProject: "",
  });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createData, setCreateData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    companyName: "",
    address: "",
    gstNumber: "",
    serviceRequired: "",
    projectTitle: "",
    projectDescription: "",
    budgetRange: "",
    deadline: "",
    priority: "medium",
    category: "",
  });
  const [createReferenceLinks, setCreateReferenceLinks] = useState([""]);
  const [createErrors, setCreateErrors] = useState({});
  const [createModalError, setCreateModalError] = useState("");

  const isSuperAdmin = ["super_admin", "admin"].includes(user?.role);

  const requestParams = useMemo(
    () => ({
      page,
      limit: pagination.limit,
      search: filters.search || undefined,
      status: filters.status || undefined,
      priority: filters.priority || undefined,
      category: filters.category || undefined,
      convertedToProject: filters.convertedToProject || undefined,
    }),
    [filters, page, pagination.limit]
  );

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const result = await getAllServiceRequests(requestParams);

      setRequests(result.data.serviceRequests || []);
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
    const timeoutId = window.setTimeout(() => {
      void fetchRequests();
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

  const handleConvertToProject = async (request) => {
    const shouldConvert = window.confirm(
      `Convert "${request.projectTitle}" into a project?`
    );

    if (!shouldConvert) return;

    try {
      setActionId(request._id);
      setErrorMessage("");
      await convertServiceRequestToProject(request._id);
      await fetchRequests();
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

  const handleDeleteRequest = async (request) => {
    const shouldDelete = window.confirm(
      `Delete "${request.projectTitle}"? This action cannot be undone.`
    );

    if (!shouldDelete) return;

    try {
      setActionId(request._id);
      setErrorMessage("");
      await deleteServiceRequest(request._id);
      await fetchRequests();
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

  const canConvert = (request) =>
    isSuperAdmin &&
    !request.convertedToProject &&
    convertibleStatuses.includes(request.status);

  const handleCreateChange = (event) => {
    const { name, value } = event.target;

    setCreateData((current) => ({
      ...current,
      [name]: value,
    }));

    if (createErrors[name]) {
      setCreateErrors((current) => ({
        ...current,
        [name]: "",
      }));
    }
  };

  const updateCreateReferenceLink = (index, value) => {
    setCreateReferenceLinks((current) =>
      current.map((link, currentIndex) =>
        currentIndex === index ? value : link
      )
    );

    const errorKey = `referenceLinks.${index}`;
    if (createErrors[errorKey]) {
      setCreateErrors((current) => ({
        ...current,
        [errorKey]: "",
      }));
    }
  };

  const addCreateReferenceLink = () => {
    setCreateReferenceLinks((current) => [...current, ""]);
  };

  const removeCreateReferenceLink = (index) => {
    setCreateReferenceLinks((current) =>
      current.length === 1
        ? [""]
        : current.filter((_, currentIndex) => currentIndex !== index)
    );
  };

  const validateCreateRequest = () => {
    const errors = {};
    const requiredFields = [
      "clientEmail",
      "clientPhone",
      "companyName",
      "serviceRequired",
      "projectTitle",
      "projectDescription",
      "category",
    ];

    requiredFields.forEach((field) => {
      if (!createData[field].trim()) {
        errors[field] = "This field is required";
      }
    });

    if (createData.clientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createData.clientEmail)) {
      errors.clientEmail = "Enter a valid email address";
    }

    const phone = createData.clientPhone.trim();
    if (phone && !/^\d{10}$/.test(phone)) {
      errors.clientPhone = "Enter a valid 10-digit phone number";
    }

    const gstNumber = createData.gstNumber.trim().toUpperCase();
    if (gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(gstNumber)) {
      errors.gstNumber = "Enter a valid GST number";
    }

    if (createData.deadline) {
      const selectedDate = new Date(createData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        errors.deadline = "Deadline cannot be in the past";
      }
    }

    createReferenceLinks.forEach((link, index) => {
      if (!link.trim()) return;

      try {
        new URL(link);
      } catch {
        errors[`referenceLinks.${index}`] = "Enter a valid URL";
      }
    });

    setCreateErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateRequest = async () => {
    if (!validateCreateRequest()) return;

    try {
      setIsCreating(true);
      setErrorMessage("");
      setCreateModalError("");

      await createServiceRequestBySuperAdmin({
        ...createData,
        referenceLinks: createReferenceLinks
          .map((link) => link.trim())
          .filter(Boolean),
      });

      setIsCreateModalOpen(false);
      setCreateData({
        clientEmail: "",
        clientName: "",
        clientPhone: "",
        companyName: "",
        address: "",
        gstNumber: "",
        serviceRequired: "",
        projectTitle: "",
        projectDescription: "",
        budgetRange: "",
        deadline: "",
        priority: "medium",
        category: "",
      });
      setCreateReferenceLinks([""]);
      setCreateErrors({});
      await fetchRequests();
    } catch (error) {
      if (error.status === 401) {
        navigate(ROUTES.LOGIN, { replace: true });
        return;
      }

      if (error.status === 403) {
        navigate(ROUTES.UNAUTHORIZED, { replace: true });
        return;
      }

      setCreateModalError(error.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <section className="h-full space-y-6 overflow-y-auto pb-8">
      <PageBackButton fallbackPath={ROUTES.SUPER_ADMIN_DASHBOARD} />
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Service Requests
          </p>
          <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
            Client Service Requests
          </h1>
        </div>

        {isSuperAdmin && (
          <button
            type="button"
            onClick={() => {
              setCreateModalError("");
              setIsCreateModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md"
          >
            <Plus size={17} />
            New Request
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
            placeholder="Search client, email, project, service"
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <SelectDropdown
          name="status"
          value={filters.status}
          options={requestStatusOptions}
          onChange={(event) => updateFilter("status", event.target.value)}
          wrapperClassName="filter-control"
          className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />

        <SelectDropdown
          name="priority"
          value={filters.priority}
          options={priorityOptions}
          onChange={(event) => updateFilter("priority", event.target.value)}
          wrapperClassName="filter-control"
          className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />

        <input
          type="text"
          value={filters.category}
          onChange={(event) => updateFilter("category", event.target.value)}
          placeholder="Category"
          className="filter-control h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />

        <SelectDropdown
          name="convertedToProject"
          value={filters.convertedToProject}
          onChange={(event) =>
            updateFilter("convertedToProject", event.target.value)
          }
          options={conversionOptions}
          wrapperClassName="filter-control"
          className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
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
      ) : requests.length === 0 ? (
        <div className="flex min-h-96 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <FileText size={25} />
          </div>
          <h2 className="mt-4 text-lg font-black text-slate-950">
            No service requests found
          </h2>
          <p className="mt-1 max-w-md text-sm text-slate-500">
            Client requests will appear here as soon as they are submitted.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm xl:block">
            <table className="w-full table-fixed">
              <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">Request</th>
                  <th className="px-5 py-4">Client</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Priority</th>
                  <th className="px-5 py-4">Deadline</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((request) => (
                  <tr key={request._id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <p className="truncate font-bold text-slate-950">
                        {request.projectTitle}
                      </p>
                      <p className="truncate text-sm text-slate-500">
                        {request.serviceRequired}
                      </p>
                      {request.convertedToProject && (
                        <p className="mt-1 text-xs font-bold text-emerald-700">
                          Same item is now in Projects
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {request.clientName}
                      </p>
                      <p className="truncate text-sm text-slate-500">
                        {request.clientEmail}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${
                          statusBadgeClass[request.status] || statusBadgeClass.closed
                        }`}
                      >
                        {request.status?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${
                          priorityBadgeClass[request.priority] ||
                          priorityBadgeClass.medium
                        }`}
                      >
                        {request.priority}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                      {formatDate(request.deadline)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `${ROUTES.SUPER_ADMIN_SERVICE_REQUESTS}/${request._id}`
                            )
                          }
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                          aria-label="View request"
                        >
                          <Eye size={16} />
                        </button>
                        {canConvert(request) && (
                          <button
                            type="button"
                            onClick={() => handleConvertToProject(request)}
                            disabled={actionId === request._id}
                            className="rounded-lg border border-emerald-200 p-2 text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                            aria-label="Convert to project"
                          >
                            <FolderKanban size={16} />
                          </button>
                        )}
                        {request.convertedToProject && getProjectId(request.projectId) && (
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `${ROUTES.SUPER_ADMIN_PROJECTS}/${getProjectId(
                                  request.projectId
                                )}`
                              )
                            }
                            className="rounded-lg border border-emerald-200 p-2 text-emerald-700 transition hover:bg-emerald-50"
                            aria-label="View linked project"
                          >
                            <FolderKanban size={16} />
                          </button>
                        )}
                        {isSuperAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDeleteRequest(request)}
                            disabled={actionId === request._id}
                            className="rounded-lg border border-red-200 p-2 text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                            aria-label="Delete request"
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
            {requests.map((request) => (
              <article
                key={request._id}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-black text-slate-950">
                      {request.projectTitle}
                    </h2>
                    <p className="mt-1 text-sm font-semibold text-slate-600">
                      {request.serviceRequired}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${
                      statusBadgeClass[request.status] || statusBadgeClass.closed
                    }`}
                  >
                    {request.status?.replace("_", " ")}
                  </span>
                </div>

                <div className="mt-4 space-y-1 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">
                    {request.clientName}
                  </p>
                  <p className="truncate">{request.clientEmail}</p>
                  <p>Deadline: {formatDate(request.deadline)}</p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${
                      priorityBadgeClass[request.priority] ||
                      priorityBadgeClass.medium
                    }`}
                  >
                    {request.priority}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                    {request.convertedToProject
                      ? "Same item in Projects"
                      : "Not converted"}
                  </span>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`${ROUTES.SUPER_ADMIN_SERVICE_REQUESTS}/${request._id}`)
                    }
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  {canConvert(request) && (
                    <button
                      type="button"
                      onClick={() => handleConvertToProject(request)}
                      disabled={actionId === request._id}
                      className="inline-flex items-center justify-center rounded-lg border border-emerald-200 px-3 py-2 text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label="Convert to project"
                    >
                      <FolderKanban size={16} />
                    </button>
                  )}
                  {request.convertedToProject && getProjectId(request.projectId) && (
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `${ROUTES.SUPER_ADMIN_PROJECTS}/${getProjectId(
                            request.projectId
                          )}`
                        )
                      }
                      className="inline-flex items-center justify-center rounded-lg border border-emerald-200 px-3 py-2 text-emerald-700 transition hover:bg-emerald-50"
                      aria-label="View linked project"
                    >
                      <FolderKanban size={16} />
                    </button>
                  )}
                  {isSuperAdmin && (
                    <button
                      type="button"
                      onClick={() => handleDeleteRequest(request)}
                      disabled={actionId === request._id}
                      className="inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label="Delete request"
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
              Showing page {pagination.page} of {pagination.totalPages || 1} ·{" "}
              {pagination.total} requests
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

      {isCreateModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Create Request
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-950">
                  New Service Request
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Create a request on behalf of a registered client.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCreateModalError("");
                  setIsCreateModalOpen(false);
                }}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close create request modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
              {createModalError && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {createModalError}
                </div>
              )}

              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    ["clientName", "Client Name", false],
                    ["clientEmail", "Client Email", true],
                    ["clientPhone", "Client Phone", true],
                    ["companyName", "Company Name", true],
                    ["gstNumber", "GST Number", false],
                    ["serviceRequired", "Service Required", true],
                    ["projectTitle", "Project Title", true],
                    ["budgetRange", "Budget Range", false],
                    ["deadline", "Deadline", false],
                    ["category", "Category", true],
                  ].map(([name, label, required]) => (
                    <label key={name} className="block">
                      <span className="text-sm font-bold text-slate-700">
                        {label}
                        {required && <span className="text-red-500"> *</span>}
                      </span>
                      {name === "clientPhone" ? (
                        <PhoneInput
                          name={name}
                          value={createData[name]}
                          onChange={handleCreateChange}
                          error={createErrors[name]}
                          required={required}
                          placeholder={label}
                        />
                      ) : (
                        <input
                          type={
                            name === "deadline"
                              ? "date"
                              : name === "clientEmail"
                                ? "email"
                                : "text"
                          }
                          name={name}
                          value={createData[name]}
                          onChange={handleCreateChange}
                          className={`mt-2 h-11 w-full rounded-lg border bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:ring-2 ${
                            createErrors[name]
                              ? "border-red-300 focus:border-red-300 focus:ring-red-100"
                              : "border-slate-200 focus:border-blue-300 focus:ring-blue-100"
                          }`}
                        />
                      )}
                      {createErrors[name] && (
                        <p className="mt-1 text-xs font-semibold text-red-600">
                          {createErrors[name]}
                        </p>
                      )}
                    </label>
                  ))}

                  <label className="block">
                    <span className="text-sm font-bold text-slate-700">Priority</span>
                    <SelectDropdown
                      name="priority"
                      value={createData.priority}
                      onChange={handleCreateChange}
                      options={createPriorityOptions}
                      className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Address</span>
                  <textarea
                    name="address"
                    value={createData.address}
                    onChange={handleCreateChange}
                    rows={3}
                    placeholder="Company address"
                    className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-slate-700">
                    Project Description <span className="text-red-500">*</span>
                  </span>
                  <textarea
                    name="projectDescription"
                    value={createData.projectDescription}
                    onChange={handleCreateChange}
                    rows={5}
                    className={`mt-2 w-full resize-none rounded-lg border bg-white px-3 py-3 text-sm font-medium text-slate-800 outline-none transition focus:ring-2 ${
                      createErrors.projectDescription
                        ? "border-red-300 focus:border-red-300 focus:ring-red-100"
                        : "border-slate-200 focus:border-blue-300 focus:ring-blue-100"
                    }`}
                  />
                  {createErrors.projectDescription && (
                    <p className="mt-1 text-xs font-semibold text-red-600">
                      {createErrors.projectDescription}
                    </p>
                  )}
                </label>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-sm font-black text-slate-900">
                        Reference Links
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Add useful links shared by the client or found during review.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addCreateReferenceLink}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                    >
                      <Plus size={16} />
                      Add Link
                    </button>
                  </div>

                  <div className="mt-4 space-y-3">
                    {createReferenceLinks.map((link, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Link2
                              size={17}
                              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                              type="url"
                              value={link}
                              onChange={(event) =>
                                updateCreateReferenceLink(index, event.target.value)
                              }
                              placeholder="https://example.com"
                              className={`h-11 w-full rounded-lg border bg-white pl-10 pr-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
                                createErrors[`referenceLinks.${index}`]
                                  ? "border-red-300 focus:border-red-300 focus:ring-red-100"
                                  : "border-slate-200 focus:border-blue-300 focus:ring-blue-100"
                              }`}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeCreateReferenceLink(index)}
                            className="rounded-lg border border-slate-200 bg-white p-3 text-slate-500 transition hover:bg-red-50 hover:text-red-700"
                            aria-label="Remove reference link"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                        {createErrors[`referenceLinks.${index}`] && (
                          <p className="text-xs font-semibold text-red-600">
                            {createErrors[`referenceLinks.${index}`]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
                    <UploadCloud size={23} />
                  </div>
                  <h3 className="mt-3 text-sm font-black text-slate-900">
                    Attachments coming soon
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    File upload support will be added here later. Use reference links for now.
                  </p>
                </div>

              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setCreateModalError("");
                  setIsCreateModalOpen(false);
                }}
                disabled={isCreating}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateRequest}
                disabled={isCreating}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Save size={17} />
                {isCreating ? "Creating..." : "Create Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SuperAdminServiceRequests;
