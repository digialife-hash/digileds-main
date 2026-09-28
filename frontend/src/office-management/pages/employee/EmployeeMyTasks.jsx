import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Eye,
  MessageSquarePlus,
  RefreshCw,
  Send,
  X,
} from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import PageBackButton from "../../components/common/PageBackButton";
import SelectDropdown from "../../components/common/SelectDropdown";
import { useAuth } from "../../context/authStore";
import { ROUTES } from "../../routes/routeConstants";
import {
  addMyTaskProgressUpdate,
  getMyTasks,
  updateMyTaskStatus,
} from "../../services/taskService";

const statusOptions = ["pending", "in_progress", "submitted", "approved", "rejected", "completed"];
const priorityOptions = ["low", "medium", "high", "urgent"];
const sortOptions = [
  ["deadlineAsc", "Deadline first"],
  ["deadlineDesc", "Latest deadline"],
  ["newest", "Newest first"],
];

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

const nextStatusByStatus = {
  pending: "in_progress",
  in_progress: "submitted",
  rejected: "in_progress",
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

const getProjectId = (project) => {
  if (!project) return "";
  if (typeof project === "string") return project;
  return project._id || "";
};

const getProjectName = (project) => {
  if (!project) return "No project";
  if (typeof project === "string") return project;
  return project.projectName || "Project";
};

const getDeadlineState = (deadline, status) => {
  if (!deadline || ["submitted", "approved", "completed"].includes(status)) {
    return {
      className: "border-slate-200 bg-slate-50 text-slate-600",
      label: "No active deadline",
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);

  if (deadlineDate < today) {
    return {
      className: "border-red-200 bg-red-50 text-red-700",
      label: "Overdue",
    };
  }

  const daysLeft = Math.ceil((deadlineDate - today) / 86400000);

  if (daysLeft <= 3) {
    return {
      className: "border-amber-200 bg-amber-50 text-amber-700",
      label: `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`,
    };
  }

  return {
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    label: `${daysLeft} days left`,
  };
};

const EmployeeMyTasks = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    relatedProject: "",
    sort: "deadlineAsc",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [actionId, setActionId] = useState("");
  const [viewTask, setViewTask] = useState(null);
  const [progressModal, setProgressModal] = useState({
    isOpen: false,
    task: null,
  });
  const [progressText, setProgressText] = useState("");

  const isEmployee = user?.role === "employee";

  const projectOptions = useMemo(() => {
    const projects = new Map();

    tasks.forEach((task) => {
      const projectId = getProjectId(task.relatedProject);
      if (projectId) {
        projects.set(projectId, getProjectName(task.relatedProject));
      }
    });

    return [["", "All projects"], ...Array.from(projects.entries())];
  }, [tasks]);

  const requestParams = useMemo(
    () => ({
      status: filters.status || undefined,
      priority: filters.priority || undefined,
      relatedProject: filters.relatedProject || undefined,
      sort: filters.sort || "deadlineAsc",
      limit: pagination.limit,
    }),
    [filters, pagination.limit]
  );

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const result = await getMyTasks(requestParams);

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

  useEffect(() => {
    if (user && !isEmployee) {
      navigate(ROUTES.UNAUTHORIZED, { replace: true });
    }
  }, [isEmployee, navigate, user]);

  useEffect(() => {
    void fetchTasks();
  }, [requestParams]);

  const updateFilter = (name, value) => {
    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleQuickStatusUpdate = async (task) => {
    const nextStatus = nextStatusByStatus[task.status];
    if (!nextStatus) return;

    try {
      setActionId(task._id);
      setErrorMessage("");

      await updateMyTaskStatus(task._id, { status: nextStatus });
      await fetchTasks();
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

  const openProgressModal = (task) => {
    setProgressText("");
    setProgressModal({
      isOpen: true,
      task,
    });
  };

  const closeProgressModal = () => {
    if (actionId) return;
    setProgressModal({
      isOpen: false,
      task: null,
    });
    setProgressText("");
  };

  const handleAddProgressUpdate = async () => {
    const task = progressModal.task;
    if (!task || !progressText.trim()) return;

    try {
      setActionId(task._id);
      setErrorMessage("");

      await addMyTaskProgressUpdate(task._id, {
        updateText: progressText.trim(),
      });

      closeProgressModal();
      await fetchTasks();
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
      <PageBackButton fallbackPath={ROUTES.EMPLOYEE_DASHBOARD} />
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            My Work
          </p>
          <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
            My Tasks
          </h1>
        </div>

        <button
          type="button"
          onClick={() => void fetchTasks()}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <div className="filter-bar gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <SelectDropdown
          name="status"
          value={filters.status}
          options={[["", "All statuses"], ...statusOptions.map((status) => [status, formatLabel(status)])]}
          onChange={(event) => updateFilter("status", event.target.value)}
          wrapperClassName="filter-control"
          className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />

        <SelectDropdown
          name="priority"
          value={filters.priority}
          options={[["", "All priorities"], ...priorityOptions.map((priority) => [priority, formatLabel(priority)])]}
          onChange={(event) => updateFilter("priority", event.target.value)}
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
          name="sort"
          value={filters.sort}
          options={sortOptions}
          onChange={(event) => updateFilter("sort", event.target.value)}
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
      ) : tasks.length === 0 ? (
        <div className="flex min-h-96 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <ClipboardList size={25} />
          </div>
          <h2 className="mt-4 text-lg font-black text-slate-950">
            No assigned tasks found
          </h2>
          <p className="mt-1 max-w-md text-sm text-slate-500">
            Tasks assigned to your employee profile will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {tasks.map((task) => {
            const deadlineState = getDeadlineState(task.deadline, task.status);
            const nextStatus = nextStatusByStatus[task.status];
            const isTerminal = ["submitted", "approved", "completed"].includes(task.status);

            return (
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
                  <p className="inline-flex items-center gap-2">
                    <ClipboardList size={15} />
                    {getProjectName(task.relatedProject)}
                  </p>
                  <p
                    className={`inline-flex w-fit items-center gap-2 rounded-lg border px-2.5 py-1 text-xs font-black ${deadlineState.className}`}
                  >
                    <CalendarDays size={14} />
                    {formatDate(task.deadline)} - {deadlineState.label}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`${ROUTES.EMPLOYEE_TASKS}/${task._id}`)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Eye size={16} />
                    View
                  </button>

                  {nextStatus && (
                    <button
                      type="button"
                      onClick={() => handleQuickStatusUpdate(task)}
                      disabled={actionId === task._id}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <CheckCircle2 size={16} />
                      {formatLabel(nextStatus)}
                    </button>
                  )}

                  {!isTerminal && (
                    <button
                      type="button"
                      onClick={() => openProgressModal(task)}
                      disabled={actionId === task._id}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <MessageSquarePlus size={16} />
                      Progress
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
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
                  ["Project", getProjectName(viewTask.relatedProject)],
                  ["Deadline", formatDate(viewTask.deadline)],
                  ["Created", formatDate(viewTask.createdAt)],
                  ["Updated", formatDate(viewTask.updatedAt)],
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

      {progressModal.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Add Progress Update
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-950">
                  {progressModal.task?.taskTitle}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeProgressModal}
                disabled={Boolean(actionId)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Close progress modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-5 py-5">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">
                  Progress update
                </span>
                <textarea
                  value={progressText}
                  onChange={(event) => setProgressText(event.target.value)}
                  rows={4}
                  className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  placeholder="What changed on this task?"
                />
              </label>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeProgressModal}
                disabled={Boolean(actionId)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddProgressUpdate}
                disabled={Boolean(actionId) || !progressText.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Send size={17} />
                {actionId ? "Saving..." : "Add Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default EmployeeMyTasks;
