import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  CheckSquare,
  Clock3,
  Flame,
  RefreshCcw,
  Send,
} from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { ROUTES } from "../../routes/routeConstants";
import { getEmployeeDashboardSummary } from "../../services/employeeDashboardService";

const statusClass = {
  pending: "bg-slate-100 text-slate-700 ring-slate-200",
  in_progress: "bg-blue-50 text-blue-700 ring-blue-100",
  review: "bg-violet-50 text-violet-700 ring-violet-100",
  submitted: "bg-violet-50 text-violet-700 ring-violet-100",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  rejected: "bg-red-50 text-red-700 ring-red-100",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-100",
};

const priorityClass = {
  low: "bg-slate-100 text-slate-600 ring-slate-200",
  medium: "bg-blue-50 text-blue-700 ring-blue-100",
  high: "bg-orange-50 text-orange-700 ring-orange-100",
  urgent: "bg-red-50 text-red-700 ring-red-100",
};

const formatLabel = (value = "") =>
  (value === "review" ? "submitted" : value).replaceAll("_", " ");
const formatDate = (value) => {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const EmptyState = ({ icon: Icon, title }) => (
  <div className="flex min-h-36 flex-col items-center justify-center rounded-lg bg-slate-50 px-5 py-8 text-center">
    <Icon size={24} className="text-slate-400" />
    <p className="mt-3 text-sm font-bold text-slate-700">{title}</p>
  </div>
);

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchDashboard = async ({ silent = false } = {}) => {
    try {
      if (!silent) setIsLoading(true);
      setErrorMessage("");
      const result = await getEmployeeDashboardSummary();
      setSummary(result.data);
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
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchDashboard();
  }, []);

  const stats = useMemo(() => {
    const cards = summary?.cards || {};
    return [
      ["Total Assigned Tasks", cards.totalAssignedTasks || 0, CheckSquare, "text-cyan-700 bg-cyan-50 ring-cyan-100"],
      ["Pending Tasks", cards.pendingTasks || 0, Clock3, "text-amber-700 bg-amber-50 ring-amber-100"],
      ["In Progress Tasks", cards.inProgressTasks || 0, Flame, "text-blue-700 bg-blue-50 ring-blue-100"],
      ["Submitted Tasks", cards.submittedTasks || 0, Send, "text-violet-700 bg-violet-50 ring-violet-100"],
      ["Approved Tasks", cards.approvedTasks || 0, CheckCircle2, "text-emerald-700 bg-emerald-50 ring-emerald-100"],
      ["Completed Tasks", cards.completedTasks || 0, CheckCircle2, "text-emerald-700 bg-emerald-50 ring-emerald-100"],
      ["Due Today", cards.dueToday || 0, CalendarDays, "text-red-700 bg-red-50 ring-red-100"],
    ];
  }, [summary]);

  const quickActions = [
    ["View My Tasks", ROUTES.EMPLOYEE_TASKS, CheckSquare],
    ["Update Task Status", ROUTES.EMPLOYEE_TASKS, Flame],
    ["Submit Work Update", ROUTES.EMPLOYEE_TASKS, Send],
    ["View Project Tasks", ROUTES.EMPLOYEE_TASKS, BriefcaseBusiness],
  ];

  const renderTask = (task, warning = false) => (
    <article key={task._id} className={`rounded-lg p-4 ring-1 ${warning ? "bg-red-50 ring-red-100" : "bg-slate-50 ring-slate-100"}`}>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="truncate font-black text-slate-950">{task.taskTitle}</h3>
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${statusClass[task.status] || statusClass.pending}`}>{formatLabel(task.status)}</span>
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${priorityClass[task.priority] || priorityClass.medium}`}>{task.priority}</span>
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-slate-500">{task.description || "No description provided."}</p>
      <p className={`mt-3 text-xs font-bold ${warning ? "text-red-700" : "text-slate-500"}`}>
        Due {formatDate(task.deadline)}{task.relatedProject?.projectName ? ` • ${task.relatedProject.projectName}` : ""}
      </p>
    </article>
  );

  return (
    <section className="h-full space-y-6 overflow-y-auto pb-8">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">My Workspace</p>
          <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">Employee Dashboard</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">Track your assigned tasks, projects and work updates.</p>
        </div>
        <button type="button" onClick={() => fetchDashboard({ silent: true })} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <RefreshCcw size={16} />
          Refresh
        </button>
      </div>

      {isLoading && <div className="flex min-h-96 items-center justify-center rounded-lg border border-slate-200 bg-white"><LoadingSpinner /></div>}
      {!isLoading && errorMessage && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm font-medium text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div><p className="font-bold">Unable to load dashboard</p><p className="mt-1">{errorMessage}</p></div>
        </div>
      )}

      {!isLoading && !errorMessage && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
            {stats.map(([title, value, Icon, tone]) => (
              <article key={title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-500">{title}</p><h2 className="mt-3 text-2xl font-black text-slate-950">{value}</h2></div>
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ring-1 ${tone}`}><Icon size={21} /></div>
                </div>
              </article>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {quickActions.map(([label, path, Icon]) => (
              <button key={label} type="button" onClick={() => navigate(path)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50 hover:text-blue-700">
                <Icon size={17} />
                {label}
              </button>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-black text-slate-950">Today&apos;s Tasks</h2>
              <div className="mt-4 grid gap-3">
                {(summary?.todayTasks || []).length ? summary.todayTasks.map((task) => renderTask(task, true)) : <EmptyState icon={CalendarDays} title="No tasks due today" />}
              </div>
            </section>

            <div className="space-y-6">
              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-black text-slate-950">Priority Tasks</h2>
                <div className="mt-4 space-y-3">
                  {(summary?.priorityTasks || []).length ? summary.priorityTasks.map((task) => renderTask(task)) : <EmptyState icon={Flame} title="No high priority tasks" />}
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-black text-slate-950">Assigned Projects</h2>
                <div className="mt-4 space-y-3">
                  {(summary?.assignedProjects || []).length ? summary.assignedProjects.map((project) => (
                    <div key={project._id} className="rounded-lg bg-slate-50 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-bold text-slate-950">{project.projectName}</p>
                        <span className="shrink-0 rounded-full bg-white px-2 py-1 text-xs font-bold capitalize text-slate-600 ring-1 ring-slate-200">{formatLabel(project.status)}</span>
                      </div>
                      <p className="mt-1 text-xs font-semibold text-slate-500">Due {formatDate(project.deadline)}</p>
                    </div>
                  )) : <EmptyState icon={BriefcaseBusiness} title="No assigned projects" />}
                </div>
              </section>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default EmployeeDashboard;
