import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  FolderKanban,
  GitBranch,
  GitCommitHorizontal,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import MonthDropdown from "../../components/common/MonthDropdown";
import PageBackButton from "../../components/common/PageBackButton";
import { useAuth } from "../../context/authStore";
import { getClients } from "../../services/clientService";
import {
  createProject,
  deleteProject,
  getProjects,
  updateProject,
} from "../../services/projectService";
import { ROUTES } from "../../routes/routeConstants";

const statusBadgeClass = {
  not_started: "bg-slate-100 text-slate-700 ring-slate-200",
  in_progress: "bg-blue-50 text-blue-700 ring-blue-100",
  on_hold: "bg-amber-50 text-amber-700 ring-amber-100",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  cancelled: "bg-red-50 text-red-700 ring-red-100",
};

const priorityBadgeClass = {
  low: "bg-slate-100 text-slate-600 ring-slate-200",
  medium: "bg-sky-50 text-sky-700 ring-sky-100",
  high: "bg-orange-50 text-orange-700 ring-orange-100",
  urgent: "bg-red-50 text-red-700 ring-red-100",
};

const projectStatusOptions = [
  ["", "All statuses"],
  ["active", "Active Projects"],
  ["not_started", "Not Started"],
  ["in_progress", "In Progress"],
  ["on_hold", "On Hold"],
  ["completed", "Completed"],
  ["cancelled", "Cancelled"],
];

const projectPriorityOptions = [
  ["", "All priorities"],
  ["low", "Low"],
  ["medium", "Medium"],
  ["high", "High"],
  ["urgent", "Urgent"],
];

const projectFormPriorityOptions = projectPriorityOptions.filter(([value]) => value);

const defaultProjectForm = {
  projectName: "",
  clientId: "",
  category: "",
  assignedTeam: "",
  startDate: "",
  deadline: "",
  budget: "",
  priority: "medium",
  description: "",
  notes: "",
  serviceRequestId: "",
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

const getClientName = (client) => {
  if (!client) return "Unassigned client";
  if (typeof client === "string") return client;

  return client.companyName || client.clientName || "Client";
};

const getClientId = (client) => {
  if (!client) return "";
  if (typeof client === "string") return client;

  return client._id || "";
};

const getServiceRequestId = (serviceRequest) => {
  if (!serviceRequest) return "";
  if (typeof serviceRequest === "string") return serviceRequest;

  return serviceRequest._id || "";
};

const parseTeamIds = (value = "") => {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const SuperAdminProjects = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const initialStatus = searchParams.get("status") || (searchParams.get("active") === "true" ? "active" : "");

  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    clientId: "",
    category: "",
    status: initialStatus,
    priority: "",
    deadline: "",
    employeeId: "",
  });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [actionId, setActionId] = useState("");
  const [formModal, setFormModal] = useState({
    isOpen: false,
    mode: "create",
    project: null,
  });
  const [formData, setFormData] = useState(defaultProjectForm);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSuperAdmin = ["super_admin", "admin"].includes(user?.role);
  const clientOptions = useMemo(
    () => [
      ["", "All clients"],
      ...clients.map((client) => [
        client._id,
        client.companyName || client.clientName || "Client",
      ]),
    ],
    [clients]
  );
  const projectFormClientOptions = useMemo(
    () => [["", "Select client"], ...clientOptions.filter(([value]) => value)],
    [clientOptions]
  );

  const requestParams = useMemo(
    () => ({
      page,
      limit: pagination.limit,
      search: filters.search || undefined,
      clientId: filters.clientId || undefined,
      category: filters.category || undefined,
      status: filters.status || undefined,
      priority: filters.priority || undefined,
      deadline: filters.deadline || undefined,
      employeeId: filters.employeeId || undefined,
    }),
    [filters, page, pagination.limit]
  );

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const result = await getProjects(requestParams);

      setProjects(result.data.projects || []);
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

  const fetchClientOptions = async () => {
    try {
      const result = await getClients({ limit: 100 });
      setClients(result.data.clients || []);
    } catch {
      setClients([]);
    }
  };

  useEffect(() => {
    if (user && !isSuperAdmin) {
      navigate(ROUTES.UNAUTHORIZED, { replace: true });
    }
  }, [isSuperAdmin, navigate, user]);

  useEffect(() => {
    void fetchClientOptions();
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchProjects();
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
    navigate(ROUTES.SUPER_ADMIN_PROJECT_CREATE);
  };

  const openEditModal = (project) => {
    setFormData({
      projectName: project.projectName || "",
      clientId: getClientId(project.clientId),
      category: project.category || "",
      assignedTeam: (project.assignedTeam || [])
        .map((member) => member?._id || member)
        .filter(Boolean)
        .join(", "),
      startDate: project.startDate ? project.startDate.slice(0, 10) : "",
      deadline: project.deadline ? project.deadline.slice(0, 10) : "",
      budget: project.budget ?? "",
      priority: project.priority || "medium",
      description: project.description || "",
      notes: project.notes || "",
      serviceRequestId: getServiceRequestId(project.serviceRequestId),
    });
    setFormErrors({});
    setFormModal({
      isOpen: true,
      mode: "edit",
      project,
    });
  };

  const closeFormModal = () => {
    setFormModal({
      isOpen: false,
      mode: "create",
      project: null,
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

  const validateProjectForm = () => {
    const errors = {};

    if (!formData.projectName.trim()) {
      errors.projectName = "Project name is required";
    }

    if (!formData.clientId) {
      errors.clientId = "Client is required";
    }

    if (formData.budget && Number(formData.budget) < 0) {
      errors.budget = "Budget cannot be negative";
    }

    if (formData.startDate && formData.deadline) {
      const startDate = new Date(formData.startDate);
      const deadline = new Date(formData.deadline);

      if (deadline < startDate) {
        errors.deadline = "Deadline cannot be before start date";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const buildProjectPayload = () => ({
    projectName: formData.projectName.trim(),
    clientId: formData.clientId,
    category: formData.category.trim(),
    assignedTeam: parseTeamIds(formData.assignedTeam),
    startDate: formData.startDate || undefined,
    deadline: formData.deadline || undefined,
    budget: formData.budget === "" ? undefined : Number(formData.budget),
    priority: formData.priority,
    description: formData.description.trim(),
    notes: formData.notes.trim(),
    serviceRequestId: formData.serviceRequestId.trim() || undefined,
  });

  const handleSubmitProject = async () => {
    if (!validateProjectForm()) return;

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      if (formModal.mode === "create") {
        await createProject(buildProjectPayload());
      } else {
        await updateProject(formModal.project._id, buildProjectPayload());
      }

      closeFormModal();
      await fetchProjects();
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

  const handleDeleteProject = async (project) => {
    const shouldDelete = window.confirm(
      `Delete "${project.projectName}"? This action cannot be undone.`
    );

    if (!shouldDelete) return;

    try {
      setActionId(project._id);
      setErrorMessage("");
      await deleteProject(project._id);
      await fetchProjects();
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
            Project Management
          </p>
          <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
            Projects
          </h1>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md"
        >
          <Plus size={17} />
          Create Project
        </button>
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
            placeholder="Search project, category, description"
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <MonthDropdown
          name="clientId"
          value={filters.clientId}
          options={clientOptions}
          onChange={(event) => updateFilter("clientId", event.target.value)}
          wrapperClassName="filter-control min-w-0"
          className="h-9 w-full min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />

        <input
          type="text"
          value={filters.category}
          onChange={(event) => updateFilter("category", event.target.value)}
          placeholder="Category"
          className="filter-control h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />

        <MonthDropdown
          name="status"
          value={filters.status}
          options={projectStatusOptions}
          onChange={(event) => updateFilter("status", event.target.value)}
          wrapperClassName="filter-control min-w-0"
          className="h-9 w-full min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />

        <MonthDropdown
          name="priority"
          value={filters.priority}
          options={projectPriorityOptions}
          onChange={(event) => updateFilter("priority", event.target.value)}
          wrapperClassName="filter-control min-w-0"
          className="h-9 w-full min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />

        <label className="filter-control block">
          <input
            type="date"
            aria-label="Deadline before"
            value={filters.deadline}
            onChange={(event) => updateFilter("deadline", event.target.value)}
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <label className="filter-control block">
          <input
            type="text"
            value={filters.employeeId}
            onChange={(event) => updateFilter("employeeId", event.target.value)}
            placeholder="Team member ID"
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </label>
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
      ) : projects.length === 0 ? (
        <div className="flex min-h-96 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <FolderKanban size={25} />
          </div>
          <h2 className="mt-4 text-lg font-black text-slate-950">
            No projects found
          </h2>
          <p className="mt-1 max-w-md text-sm text-slate-500">
            Adjust the filters or create a new project to start tracking work.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm xl:block">
            <table className="w-full table-fixed">
              <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">Project</th>
                  <th className="px-5 py-4">Client</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Priority</th>
                  <th className="px-5 py-4">GitHub</th>
                  <th className="px-5 py-4">Progress</th>
                  <th className="px-5 py-4">Deadline</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projects.map((project) => (
                  <tr key={project._id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <p className="truncate font-bold text-slate-950">
                        {project.projectName}
                      </p>
                      <p className="truncate text-sm text-slate-500">
                        {project.category || "No category"} - {formatCurrency(project.budget)}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {getClientName(project.clientId)}
                      </p>
                      <p className="truncate text-sm text-slate-500">
                        {project.clientId?.email || "No email"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${
                          statusBadgeClass[project.status] ||
                          statusBadgeClass.not_started
                        }`}
                      >
                        {formatLabel(project.status)}
                      </span>
                      {project.serviceRequestStatus && (
                        <p className="mt-1 text-xs font-semibold capitalize text-slate-500">
                          Request: {formatLabel(project.serviceRequestStatus)}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${
                          priorityBadgeClass[project.priority] ||
                          priorityBadgeClass.medium
                        }`}
                      >
                        {project.priority}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {project.github?.repoUrl ? (
                        <div className="space-y-1">
                          <a
                            href={project.github.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block truncate text-xs font-semibold text-blue-600 hover:underline"
                          >
                            {project.github.repo}
                          </a>
                          {project.github.available === false ? (
                            <p className="text-xs font-semibold text-amber-600">
                              Data unavailable
                            </p>
                          ) : (
                            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                              {project.github.branchCount !== undefined && (
                                <span className="inline-flex items-center gap-1">
                                  <GitBranch size={11} />
                                  {project.github.branchCount}
                                </span>
                              )}
                              {project.github.commitCount !== undefined && (
                                <span className="inline-flex items-center gap-1">
                                  <GitCommitHorizontal size={11} />
                                  {project.github.commitCount}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-blue-600 transition-all"
                            style={{
                              width: `${Math.min(
                                Math.max(project.progressPercentage || 0, 0),
                                100
                              )}%`,
                            }}
                          />
                        </div>
                        <span className="w-10 text-right text-xs font-black text-slate-700">
                          {project.progressPercentage || 0}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                      {formatDate(project.deadline)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`${ROUTES.SUPER_ADMIN_PROJECTS}/${project._id}`)
                          }
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                          aria-label="View project"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(project)}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
                          aria-label="Edit project"
                        >
                          <Edit3 size={16} />
                        </button>
                        {isSuperAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDeleteProject(project)}
                            disabled={actionId === project._id}
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            aria-label="Delete project"
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
            {projects.map((project) => (
              <article
                key={project._id}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-black text-slate-950">
                      {project.projectName}
                    </h2>
                    <p className="mt-1 truncate text-sm font-semibold text-slate-600">
                      {getClientName(project.clientId)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${
                      statusBadgeClass[project.status] ||
                      statusBadgeClass.not_started
                    }`}
                  >
                    {formatLabel(project.status)}
                  </span>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-slate-600">
                  <p>{project.category || "No category"}</p>
                  <p className="font-semibold text-slate-900">
                    {formatCurrency(project.budget)}
                  </p>
                  <p className="inline-flex items-center gap-2">
                    <CalendarDays size={15} />
                    {formatDate(project.deadline)}
                  </p>
                </div>

                <div className="mt-4">
                  <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>Progress</span>
                    <span>{project.progressPercentage || 0}%</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{
                        width: `${Math.min(
                          Math.max(project.progressPercentage || 0, 0),
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${
                      priorityBadgeClass[project.priority] ||
                      priorityBadgeClass.medium
                    }`}
                  >
                    {project.priority}
                  </span>
                  {project.serviceRequestStatus && (
                    <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-bold capitalize text-violet-700 ring-1 ring-violet-100">
                      Request: {formatLabel(project.serviceRequestStatus)}
                    </span>
                  )}
                  {project.github?.repoUrl && project.github.available !== false && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                      <GitBranch size={12} />
                      {project.github.branchCount ?? 0} branches
                    </span>
                  )}
                  {project.github?.repoUrl && project.github.available !== false && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                      <GitCommitHorizontal size={12} />
                      {project.github.commitCount ?? 0} commits
                    </span>
                  )}
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                    {(project.assignedTeam || []).length} assigned
                  </span>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`${ROUTES.SUPER_ADMIN_PROJECTS}/${project._id}`)
                    }
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditModal(project)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
                  >
                    <Edit3 size={16} />
                    Edit
                  </button>
                  {isSuperAdmin && (
                    <button
                      type="button"
                      onClick={() => handleDeleteProject(project)}
                      disabled={actionId === project._id}
                      className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label="Delete project"
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
              {pagination.total} projects
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
                  {formModal.mode === "create" ? "Create Project" : "Edit Project"}
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-950">
                  {formModal.mode === "create"
                    ? "New Project"
                    : formModal.project?.projectName}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeFormModal}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close project form"
              >
                <X size={20} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">
                    Project Name <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="text"
                    name="projectName"
                    value={formData.projectName}
                    onChange={handleFormChange}
                    className={`mt-2 h-11 w-full rounded-lg border bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:ring-2 ${
                      formErrors.projectName
                        ? "border-red-300 focus:border-red-300 focus:ring-red-100"
                        : "border-slate-200 focus:border-blue-300 focus:ring-blue-100"
                    }`}
                  />
                  {formErrors.projectName && (
                    <p className="mt-1 text-xs font-semibold text-red-600">
                      {formErrors.projectName}
                    </p>
                  )}
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-slate-700">
                    Client <span className="text-red-500">*</span>
                  </span>
                  <MonthDropdown
                    name="clientId"
                    value={formData.clientId}
                    onChange={handleFormChange}
                    options={projectFormClientOptions}
                    className={`mt-2 h-11 w-full rounded-lg border bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:ring-2 ${
                      formErrors.clientId
                        ? "border-red-300 focus:border-red-300 focus:ring-red-100"
                        : "border-slate-200 focus:border-blue-300 focus:ring-blue-100"
                    }`}
                  />
                  {formErrors.clientId && (
                    <p className="mt-1 text-xs font-semibold text-red-600">
                      {formErrors.clientId}
                    </p>
                  )}
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Category</span>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Priority</span>
                  <MonthDropdown
                    name="priority"
                    value={formData.priority}
                    onChange={handleFormChange}
                    options={projectFormPriorityOptions}
                    className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Start Date</span>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleFormChange}
                    className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Deadline</span>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleFormChange}
                    className={`mt-2 h-11 w-full rounded-lg border bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:ring-2 ${
                      formErrors.deadline
                        ? "border-red-300 focus:border-red-300 focus:ring-red-100"
                        : "border-slate-200 focus:border-blue-300 focus:ring-blue-100"
                    }`}
                  />
                  {formErrors.deadline && (
                    <p className="mt-1 text-xs font-semibold text-red-600">
                      {formErrors.deadline}
                    </p>
                  )}
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Budget</span>
                  <input
                    type="number"
                    min="0"
                    name="budget"
                    value={formData.budget}
                    onChange={handleFormChange}
                    className={`mt-2 h-11 w-full rounded-lg border bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:ring-2 ${
                      formErrors.budget
                        ? "border-red-300 focus:border-red-300 focus:ring-red-100"
                        : "border-slate-200 focus:border-blue-300 focus:ring-blue-100"
                    }`}
                  />
                  {formErrors.budget && (
                    <p className="mt-1 text-xs font-semibold text-red-600">
                      {formErrors.budget}
                    </p>
                  )}
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-slate-700">
                    Assigned Team IDs
                  </span>
                  <input
                    type="text"
                    name="assignedTeam"
                    value={formData.assignedTeam}
                    onChange={handleFormChange}
                    placeholder="id1, id2, id3"
                    className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="text-sm font-bold text-slate-700">
                    Service Request ID
                  </span>
                  <input
                    type="text"
                    name="serviceRequestId"
                    value={formData.serviceRequestId}
                    onChange={handleFormChange}
                    placeholder="Optional linked service request"
                    className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="text-sm font-bold text-slate-700">
                    Description
                  </span>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    rows={4}
                    className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="text-sm font-bold text-slate-700">Notes</span>
                  <textarea
                    name="notes"
                    value={formData.notes}
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
                onClick={closeFormModal}
                disabled={isSubmitting}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitProject}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Save size={17} />
                {isSubmitting
                  ? "Saving..."
                  : formModal.mode === "create"
                    ? "Create Project"
                    : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SuperAdminProjects;
