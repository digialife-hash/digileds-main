import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Edit3,
  Eye,
  Plus,
  Save,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import PageBackButton from "../../components/common/PageBackButton";
import SelectDropdown from "../../components/common/SelectDropdown";
import { useAuth } from "../../context/authStore";
import { ROUTES } from "../../routes/routeConstants";
import { getEmployees } from "../../services/employeeService";
import { getProjects } from "../../services/projectService";
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from "../../services/taskService";

const priorityOptions = ["low", "medium", "high", "urgent"];
const statusOptions = ["pending", "in_progress", "submitted", "approved", "rejected", "completed"];

const defaultFormData = {
  taskTitle: "",
  description: "",
  assignedEmployee: "",
  relatedProject: "",
  priority: "medium",
  deadline: "",
  status: "pending",
};

const statusBadgeClass = {
  pending: "bg-slate-100 text-slate-700 ring-slate-200",
  in_progress: "bg-blue-50 text-blue-700 ring-blue-100",
  submitted: "bg-violet-50 text-violet-700 ring-violet-100",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  rejected: "bg-red-50 text-red-700 ring-red-100",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-100",
};

const priorityBadgeClass = {
  low: "bg-slate-100 text-slate-700 ring-slate-200",
  medium: "bg-cyan-50 text-cyan-700 ring-cyan-100",
  high: "bg-amber-50 text-amber-700 ring-amber-100",
  urgent: "bg-red-50 text-red-700 ring-red-100",
};

const formatLabel = (value = "") =>
  (value === "review" ? "submitted" : value).replaceAll("_", " ");

const formatDate = (value) => {
  if (!value) return "No deadline";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const toDateInputValue = (value) => {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
};

const getEmployeeName = (employee) => {
  if (!employee) return "Unassigned";
  if (typeof employee === "string") return employee;
  return employee.name || "Employee";
};

const getProjectName = (project) => {
  if (!project) return "No project";
  if (typeof project === "string") return project;
  return project.projectName || "Project";
};

const getDeadlineState = (deadline, status) => {
  if (!deadline || ["completed"].includes(status)) {
    return "text-slate-500";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);

  if (deadlineDate < today) return "text-red-700";

  const daysLeft = Math.ceil((deadlineDate - today) / 86400000);
  if (daysLeft <= 3) return "text-amber-700";

  return "text-slate-700";
};

const getTaskFormData = (task) => ({
  taskTitle: task?.taskTitle || "",
  description: task?.description || "",
  assignedEmployee:
    typeof task?.assignedEmployee === "object"
      ? task.assignedEmployee?._id || ""
      : task?.assignedEmployee || "",
  relatedProject:
    typeof task?.relatedProject === "object"
      ? task.relatedProject?._id || ""
      : task?.relatedProject || "",
  priority: task?.priority || "medium",
  deadline: toDateInputValue(task?.deadline),
  status: task?.status || "pending",
});

const buildTaskPayload = (formData, mode) => {
  const payload = {
    taskTitle: formData.taskTitle.trim(),
    description: formData.description.trim(),
    assignedEmployee: formData.assignedEmployee,
    relatedProject: formData.relatedProject || undefined,
    priority: formData.priority,
    deadline: formData.deadline || undefined,
  };

  if (mode === "edit") {
    payload.status = formData.status;
  }

  return payload;
};

const SuperAdminTasks = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const selectedProjectId =
    searchParams.get("relatedProject") || searchParams.get("projectId") || "";
  const selectedStatus = searchParams.get("status") || "";

  const [tasks, setTasks] = useState([]);
  const [submittedTasks, setSubmittedTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    assignedEmployee: "",
    relatedProject: selectedProjectId,
    priority: "",
    status: selectedStatus,
    deadlineFrom: "",
    deadlineTo: "",
  });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [actionId, setActionId] = useState("");
  const [viewTask, setViewTask] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    task: null,
  });
  const [formModal, setFormModal] = useState({
    isOpen: false,
    mode: "create",
    task: null,
  });
  const [formData, setFormData] = useState(defaultFormData);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSuperAdmin = ["super_admin", "admin"].includes(user?.role);
  const employeeOptions = useMemo(
    () => [
      ["", "All employees"],
      ...employees.map((employee) => [employee._id, employee.name]),
    ],
    [employees]
  );
  const taskFormEmployeeOptions = useMemo(
    () => [
      ["", "Select employee"],
      ...employees.map((employee) => [
        employee._id,
        `${employee.name} - ${employee.department || "No department"}`,
      ]),
    ],
    [employees]
  );
  const projectOptions = useMemo(
    () => [
      ["", "All projects"],
      ...projects.map((project) => [project._id, project.projectName]),
    ],
    [projects]
  );
  const taskFormProjectOptions = useMemo(
    () => [["", "No project"], ...projectOptions.filter(([value]) => value)],
    [projectOptions]
  );
  const priorityDropdownOptions = useMemo(
    () => [["", "All priorities"], ...priorityOptions.map((priority) => [priority, formatLabel(priority)])],
    []
  );
  const statusDropdownOptions = useMemo(
    () => [["", "All statuses"], ...statusOptions.map((status) => [status, formatLabel(status)])],
    []
  );
  const taskFormPriorityOptions = useMemo(
    () => priorityOptions.map((priority) => [priority, formatLabel(priority)]),
    []
  );
  const taskFormStatusOptions = useMemo(
    () => statusOptions.map((status) => [status, formatLabel(status)]),
    []
  );

  const requestParams = useMemo(
    () => ({
      page,
      limit: pagination.limit,
      search: filters.search || undefined,
      assignedEmployee: filters.assignedEmployee || undefined,
      relatedProject: filters.relatedProject || undefined,
      priority: filters.priority || undefined,
      status: filters.status || undefined,
      deadlineFrom: filters.deadlineFrom || undefined,
      deadlineTo: filters.deadlineTo || undefined,
    }),
    [filters, page, pagination.limit]
  );

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const result = await getTasks(requestParams);

      setTasks(result.data.tasks || []);
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

  const fetchSubmittedTasks = async () => {
    try {
      const result = await getTasks({
        status: "submitted",
        limit: 6,
        sort: "newest",
      });

      setSubmittedTasks(result.data.tasks || []);
    } catch {
      setSubmittedTasks([]);
    }
  };

  const fetchFilterOptions = async () => {
    const [employeeResult, projectResult] = await Promise.allSettled([
      getEmployees({ limit: 100, status: "active" }),
      getProjects({ limit: 100 }),
    ]);

    if (employeeResult.status === "fulfilled") {
      setEmployees(employeeResult.value.data.employees || []);
    }

    if (projectResult.status === "fulfilled") {
      setProjects(projectResult.value.data.projects || []);
    }
  };

  useEffect(() => {
    if (user && !isSuperAdmin) {
      navigate(ROUTES.UNAUTHORIZED, { replace: true });
    }
  }, [isSuperAdmin, navigate, user]);

  useEffect(() => {
    void fetchFilterOptions();
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchTasks();
      void fetchSubmittedTasks();
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
    const path = filters.relatedProject
      ? `${ROUTES.SUPER_ADMIN_TASK_CREATE}?projectId=${encodeURIComponent(
          filters.relatedProject
        )}`
      : ROUTES.SUPER_ADMIN_TASK_CREATE;

    navigate(path);
  };

  const openEditModal = (task) => {
    setFormData(getTaskFormData(task));
    setFormErrors({});
    setFormModal({
      isOpen: true,
      mode: "edit",
      task,
    });
  };

  const closeFormModal = () => {
    if (isSubmitting) return;
    setFormModal({
      isOpen: false,
      mode: "create",
      task: null,
    });
    setFormErrors({});
  };

  const openDeleteModal = (task) => {
    setDeleteModal({
      isOpen: true,
      task,
    });
  };

  const closeDeleteModal = () => {
    if (actionId) return;
    setDeleteModal({
      isOpen: false,
      task: null,
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

    if (!formData.taskTitle.trim()) errors.taskTitle = "Task title is required";
    if (!formData.assignedEmployee) {
      errors.assignedEmployee = "Assigned employee is required";
    }
    if (!priorityOptions.includes(formData.priority)) {
      errors.priority = "Invalid priority";
    }
    if (formModal.mode === "edit" && !statusOptions.includes(formData.status)) {
      errors.status = "Invalid status";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitTask = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      const payload = buildTaskPayload(formData, formModal.mode);

      if (formModal.mode === "create") {
        await createTask(payload);
      } else {
        await updateTask(formModal.task._id, payload);
      }

      closeFormModal();
      await Promise.all([fetchTasks(), fetchSubmittedTasks()]);
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

  const handleDeleteTask = async () => {
    const task = deleteModal.task;
    if (!task) return;

    try {
      setActionId(task._id);
      setErrorMessage("");

      await deleteTask(task._id);
      closeDeleteModal();
      await Promise.all([fetchTasks(), fetchSubmittedTasks()]);
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

  const handleReviewTask = async (task, status) => {
    try {
      setActionId(task._id);
      setErrorMessage("");

      await updateTask(task._id, { status });
      await Promise.all([fetchTasks(), fetchSubmittedTasks()]);
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

  const renderBadges = (task) => (
    <div className="flex flex-wrap gap-2">
      <span
        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${
          statusBadgeClass[task.status] || statusBadgeClass.pending
        }`}
      >
        {formatLabel(task.status)}
      </span>
      <span
        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${
          priorityBadgeClass[task.priority] || priorityBadgeClass.medium
        }`}
      >
        {task.priority}
      </span>
    </div>
  );

  return (
    <section className="h-full space-y-6 overflow-y-auto pb-8">
      <PageBackButton fallbackPath={ROUTES.SUPER_ADMIN_DASHBOARD} />
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Task Allocation
          </p>
          <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
            Tasks
          </h1>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <Plus size={17} />
          Create/Assign Task
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
            placeholder="Search task title or description"
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <SelectDropdown
          name="assignedEmployee"
          value={filters.assignedEmployee}
          options={employeeOptions}
          onChange={(event) => updateFilter("assignedEmployee", event.target.value)}
          wrapperClassName="filter-control"
          className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />

        <SelectDropdown
          name="relatedProject"
          value={filters.relatedProject}
          options={projectOptions}
          onChange={(event) => updateFilter("relatedProject", event.target.value)}
          wrapperClassName="filter-control"
          className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />

        <SelectDropdown
          name="priority"
          value={filters.priority}
          options={priorityDropdownOptions}
          onChange={(event) => updateFilter("priority", event.target.value)}
          wrapperClassName="filter-control"
          className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />

        <SelectDropdown
          name="status"
          value={filters.status}
          options={statusDropdownOptions}
          onChange={(event) => updateFilter("status", event.target.value)}
          wrapperClassName="filter-control"
          className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />

        <input
          type="date"
          value={filters.deadlineFrom}
          onChange={(event) => updateFilter("deadlineFrom", event.target.value)}
          className="filter-control h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />

        <input
          type="date"
          value={filters.deadlineTo}
          onChange={(event) => updateFilter("deadlineTo", event.target.value)}
          className="filter-control h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      )}

      <section className="rounded-lg border border-violet-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-violet-100 bg-violet-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-black text-violet-950">
              Submitted Tasks
            </h2>
            <p className="mt-1 text-sm font-semibold text-violet-700">
              Employee work waiting for Admin review.
            </p>
          </div>
          <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-bold text-violet-700 ring-1 ring-violet-100">
            {submittedTasks.length} waiting
          </span>
        </div>

        {submittedTasks.length === 0 ? (
          <p className="px-5 py-4 text-sm font-semibold text-slate-500">
            No submitted tasks are waiting for review.
          </p>
        ) : (
          <div className="grid gap-3 p-5 xl:grid-cols-2">
            {submittedTasks.map((task) => (
              <article
                key={task._id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="line-clamp-1 font-black text-slate-950">
                      {task.taskTitle}
                    </h3>
                    <p className="mt-1 line-clamp-1 text-sm font-semibold text-slate-500">
                      {getEmployeeName(task.assignedEmployee)} -{" "}
                      {getProjectName(task.relatedProject)}
                    </p>
                  </div>
                  {renderBadges(task)}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`${ROUTES.SUPER_ADMIN_TASKS}/${task._id}`)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Eye size={16} />
                    Review
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReviewTask(task, "approved")}
                    disabled={actionId === task._id}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <CheckCircle2 size={16} />
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReviewTask(task, "rejected")}
                    disabled={actionId === task._id}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <X size={16} />
                    Reject
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {isLoading ? (
        <div className="flex min-h-96 items-center justify-center rounded-lg border border-slate-200 bg-white">
          <LoadingSpinner />
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex min-h-96 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <ClipboardList size={25} />
          </div>
          <h2 className="mt-4 text-lg font-black text-slate-950">
            No tasks found
          </h2>
          <p className="mt-1 max-w-md text-sm text-slate-500">
            Adjust the filters or assign a new task to an employee.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm 2xl:block">
            <table className="w-full table-fixed">
              <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">Task</th>
                  <th className="px-5 py-4">Assigned To</th>
                  <th className="px-5 py-4">Project</th>
                  <th className="px-5 py-4">Deadline</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.map((task) => (
                  <tr key={task._id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <p className="truncate font-bold text-slate-950">
                        {task.taskTitle}
                      </p>
                      <p className="line-clamp-1 text-sm text-slate-500">
                        {task.description || "No description"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="truncate text-sm font-bold text-slate-800">
                        {getEmployeeName(task.assignedEmployee)}
                      </p>
                      <p className="truncate text-sm text-slate-500">
                        {task.assignedEmployee?.designation || "No designation"}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                      <span className="line-clamp-2">
                        {getProjectName(task.relatedProject)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p
                        className={`inline-flex items-center gap-2 text-sm font-bold ${getDeadlineState(
                          task.deadline,
                          task.status
                        )}`}
                      >
                        <CalendarDays size={15} />
                        {formatDate(task.deadline)}
                      </p>
                    </td>
                    <td className="px-5 py-4">{renderBadges(task)}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`${ROUTES.SUPER_ADMIN_TASKS}/${task._id}`)}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                          aria-label="View task details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(task)}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
                          aria-label="Edit task"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteModal(task)}
                          disabled={actionId === task._id}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                          aria-label="Delete task"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 2xl:hidden">
            {tasks.map((task) => (
              <article
                key={task._id}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="line-clamp-2 font-black text-slate-950">
                      {task.taskTitle}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                      {task.description || "No description"}
                    </p>
                  </div>
                  <div className="shrink-0">{renderBadges(task)}</div>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-slate-600">
                  <p className="inline-flex items-center gap-2 font-semibold text-slate-800">
                    <UserRound size={15} />
                    {getEmployeeName(task.assignedEmployee)}
                  </p>
                  <p className="inline-flex items-center gap-2">
                    <ClipboardList size={15} />
                    {getProjectName(task.relatedProject)}
                  </p>
                  <p
                    className={`inline-flex items-center gap-2 font-bold ${getDeadlineState(
                      task.deadline,
                      task.status
                    )}`}
                  >
                    <CalendarDays size={15} />
                    {formatDate(task.deadline)}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`${ROUTES.SUPER_ADMIN_TASKS}/${task._id}`)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditModal(task)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
                  >
                    <Edit3 size={16} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => openDeleteModal(task)}
                    disabled={actionId === task._id}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label="Delete task"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-slate-600">
              Showing page {pagination.page} of {pagination.totalPages || 1} -{" "}
              {pagination.total} tasks
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

      {viewTask && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Task Details
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-950">
                  {viewTask.taskTitle}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setViewTask(null)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close task details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 px-5 py-5">
              {renderBadges(viewTask)}
              <p className="text-sm leading-6 text-slate-600">
                {viewTask.description || "No description added."}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Assigned Employee", getEmployeeName(viewTask.assignedEmployee)],
                  ["Project", getProjectName(viewTask.relatedProject)],
                  ["Deadline", formatDate(viewTask.deadline)],
                  ["Created", formatDate(viewTask.createdAt)],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-slate-50 px-3 py-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      {label}
                    </p>
                    <p className="mt-1 text-sm font-black text-slate-950">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
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
                  {formModal.mode === "create" ? "Create Task" : "Edit Task"}
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-950">
                  {formModal.mode === "create" ? "Assign New Task" : formModal.task?.taskTitle}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeFormModal}
                disabled={isSubmitting}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Close task form"
              >
                <X size={20} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block md:col-span-2">
                  <span className="text-sm font-bold text-slate-700">
                    Task Title <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="text"
                    name="taskTitle"
                    value={formData.taskTitle}
                    onChange={handleFormChange}
                    className={`mt-2 h-11 w-full rounded-lg border bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:ring-2 ${
                      formErrors.taskTitle
                        ? "border-red-300 focus:border-red-300 focus:ring-red-100"
                        : "border-slate-200 focus:border-blue-300 focus:ring-blue-100"
                    }`}
                  />
                  {formErrors.taskTitle && (
                    <p className="mt-1 text-xs font-semibold text-red-600">
                      {formErrors.taskTitle}
                    </p>
                  )}
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-slate-700">
                    Assigned Employee <span className="text-red-500">*</span>
                  </span>
                  <SelectDropdown
                    name="assignedEmployee"
                    value={formData.assignedEmployee}
                    onChange={handleFormChange}
                    options={taskFormEmployeeOptions}
                    className={`mt-2 h-11 w-full rounded-lg border bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:ring-2 ${
                      formErrors.assignedEmployee
                        ? "border-red-300 focus:border-red-300 focus:ring-red-100"
                        : "border-slate-200 focus:border-blue-300 focus:ring-blue-100"
                    }`}
                  />
                  {formErrors.assignedEmployee && (
                    <p className="mt-1 text-xs font-semibold text-red-600">
                      {formErrors.assignedEmployee}
                    </p>
                  )}
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Project</span>
                  <SelectDropdown
                    name="relatedProject"
                    value={formData.relatedProject}
                    onChange={handleFormChange}
                    options={taskFormProjectOptions}
                    className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Priority</span>
                  <SelectDropdown
                    name="priority"
                    value={formData.priority}
                    onChange={handleFormChange}
                    options={taskFormPriorityOptions}
                    className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Deadline</span>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleFormChange}
                    className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                {formModal.mode === "edit" && (
                  <label className="block">
                    <span className="text-sm font-bold text-slate-700">Status</span>
                    <SelectDropdown
                      name="status"
                      value={formData.status}
                      onChange={handleFormChange}
                      options={taskFormStatusOptions}
                      className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                )}

                <label className="block md:col-span-2">
                  <span className="text-sm font-bold text-slate-700">Description</span>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    rows={4}
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
                onClick={handleSubmitTask}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Save size={17} />
                {isSubmitting
                  ? "Saving..."
                  : formModal.mode === "create"
                    ? "Create Task"
                    : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
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
                  Delete Task
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-950">
                  {deleteModal.task?.taskTitle}
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
                  This task will be permanently deleted.
                </p>
              </div>
              <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3">
                <p className="text-sm font-bold text-slate-950">
                  {getEmployeeName(deleteModal.task?.assignedEmployee)}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatDate(deleteModal.task?.deadline)}
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
                onClick={handleDeleteTask}
                disabled={Boolean(actionId)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Trash2 size={17} />
                {actionId ? "Deleting..." : "Delete Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SuperAdminTasks;
