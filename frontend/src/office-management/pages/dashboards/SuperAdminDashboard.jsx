import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  CheckSquare,
  Clock3,
  FileText,
  FolderKanban,
  IndianRupee,
  Mail,
  Phone,
  RefreshCcw,
  Search,
  Users,
} from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import SelectDropdown from "../../components/common/SelectDropdown";
import { getSuperAdminDashboardSummary } from "../../services/superAdminDashboardService";
import { getClients } from "../../services/clientService";
import { getEmployees } from "../../services/employeeService";
import { getProjects } from "../../services/projectService";
import { ROUTES } from "../../routes/routeConstants";

const taskStatusOptions = [
  "pending",
  "in_progress",
  "submitted",
  "approved",
  "rejected",
  "completed",
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatDate = (value) => {
  if (!value) return "Not available";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const formatLabel = (value = "") => value.replaceAll("_", " ");

const getClientName = (client) => {
  if (!client) return "No client";
  if (typeof client === "string") return client;
  return client.companyName || client.clientName || "No client";
};

const getTaskProjectName = (task) => {
  const project = task?.relatedProject;
  if (!project) return "No project";
  if (typeof project === "string") return project;
  return project.projectName || "No project";
};

const getTaskClientName = (task) => {
  const project = task?.relatedProject;
  return getClientName(project?.clientId);
};

const getEmployeeName = (employee) => {
  if (!employee) return "Unassigned";
  if (typeof employee === "string") return employee;
  return employee.name || "Unassigned";
};

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [taskFilters, setTaskFilters] = useState({
    employeeId: "",
    projectId: "",
    clientId: "",
    status: "",
    deadlineFrom: "",
    deadlineTo: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const employeeOptions = useMemo(
    () => [["", "All employees"], ...employees.map((employee) => [employee._id, employee.name])],
    [employees]
  );
  const projectOptions = useMemo(
    () => [["", "All projects"], ...projects.map((project) => [project._id, project.projectName])],
    [projects]
  );
  const clientOptions = useMemo(
    () => [["", "All clients"], ...clients.map((client) => [client._id, getClientName(client)])],
    [clients]
  );
  const statusOptions = useMemo(
    () => [["", "All statuses"], ...taskStatusOptions.map((status) => [status, formatLabel(status)])],
    []
  );

  const fetchDashboardSummary = async ({ silent = false } = {}) => {
    try {
      if (!silent) setIsLoading(true);
      setErrorMessage("");

      const response = await getSuperAdminDashboardSummary({
        employeeId: taskFilters.employeeId || undefined,
        projectId: taskFilters.projectId || undefined,
        clientId: taskFilters.clientId || undefined,
        status: taskFilters.status || undefined,
        deadlineFrom: taskFilters.deadlineFrom || undefined,
        deadlineTo: taskFilters.deadlineTo || undefined,
      });
      setSummary(response.data);
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
    void fetchDashboardSummary();
  }, [taskFilters]);

  useEffect(() => {
    const fetchOptions = async () => {
      const [employeeResult, projectResult, clientResult] = await Promise.allSettled([
        getEmployees({ limit: 100, status: "active" }),
        getProjects({ limit: 100 }),
        getClients({ limit: 100 }),
      ]);

      if (employeeResult.status === "fulfilled") {
        setEmployees(employeeResult.value.data.employees || []);
      }

      if (projectResult.status === "fulfilled") {
        setProjects(projectResult.value.data.projects || []);
      }

      if (clientResult.status === "fulfilled") {
        setClients(clientResult.value.data.clients || []);
      }
    };

    void fetchOptions();
  }, []);

  const updateTaskFilter = (name, value) => {
    setTaskFilters((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const clearTaskFilters = () => {
    setTaskFilters({
      employeeId: "",
      projectId: "",
      clientId: "",
      status: "",
      deadlineFrom: "",
      deadlineTo: "",
    });
  };

  const stats = useMemo(() => {
    const cards = summary?.cards || {};
    const todayData = cards.todayAttendance || {};
    const todayDateStr = todayData.date || new Date().toISOString().split("T")[0];

    return [
      {
        title: "Total Clients",
        value: cards.totalClients || 0,
        icon: Building2,
        tone: "text-cyan-700 bg-cyan-50 ring-cyan-100",
        path: ROUTES.SUPER_ADMIN_CLIENTS,
      },
      {
        title: "Total Employees",
        value: cards.totalEmployees || 0,
        icon: Users,
        tone: "text-indigo-700 bg-indigo-50 ring-indigo-100",
        path: ROUTES.SUPER_ADMIN_EMPLOYEES,
      },
      {
        title: "Today's Attendance",
        value: `${todayData.present ?? 0} Present`,
        subtext: `Absent: ${todayData.absent ?? 0} • Leave: ${todayData.leave ?? 0}${todayData.late ? ` • Late: ${todayData.late}` : ""}`,
        icon: CheckCircle2,
        tone: "text-emerald-700 bg-emerald-50 ring-emerald-100",
        path: `${ROUTES.SUPER_ADMIN_ATTENDANCE}?date=${todayDateStr}`,
      },
      {
        title: "Total Projects",
        value: cards.totalProjects || 0,
        icon: FolderKanban,
        tone: "text-violet-700 bg-violet-50 ring-violet-100",
        path: ROUTES.SUPER_ADMIN_PROJECTS,
      },
      {
        title: "Active Projects",
        value: cards.activeProjects || 0,
        icon: Clock3,
        tone: "text-emerald-700 bg-emerald-50 ring-emerald-100",
        path: `${ROUTES.SUPER_ADMIN_PROJECTS}?status=in_progress`,
      },
      {
        title: "Monthly Salary",
        value: formatCurrency(cards.monthlySalary ?? cards.monthlySalaryPayable),
        icon: IndianRupee,
        tone: "text-rose-700 bg-rose-50 ring-rose-100",
        path: ROUTES.SUPER_ADMIN_PAYROLL,
      },
      {
        title: "Monthly Revenue",
        value: formatCurrency(cards.monthlyRevenue),
        icon: IndianRupee,
        tone: "text-teal-700 bg-teal-50 ring-teal-100",
        path: ROUTES.SUPER_ADMIN_REPORTS_ANALYTICS,
      },
      {
        title: "Pending Tasks",
        value: cards.pendingTasks || 0,
        icon: CheckSquare,
        tone: "text-amber-700 bg-amber-50 ring-amber-100",
        path: `${ROUTES.SUPER_ADMIN_TASKS}?status=pending`,
      },
      {
        title: "Total Teams",
        value: cards.totalTeams || 0,
        icon: Users,
        tone: "text-teal-700 bg-teal-50 ring-teal-100",
        path: ROUTES.SUPER_ADMIN_TEAMS,
      },
      {
        title: "Completed Projects",
        value: cards.completedProjects || 0,
        icon: CheckCircle2,
        tone: "text-green-700 bg-green-50 ring-green-100",
        path: `${ROUTES.SUPER_ADMIN_PROJECTS}?status=completed`,
      },
      {
        title: "Open Service Requests",
        value: cards.openServiceRequests || 0,
        icon: FileText,
        tone: "text-violet-700 bg-violet-50 ring-violet-100",
        path: ROUTES.SUPER_ADMIN_SERVICE_REQUESTS,
      },
      {
        title: "Total Invoices",
        value: cards.totalInvoices || 0,
        icon: IndianRupee,
        tone: "text-blue-700 bg-blue-50 ring-blue-100",
        path: ROUTES.SUPER_ADMIN_INVOICES,
      },
      {
        title: "Pending Invoices",
        value: cards.pendingInvoices || 0,
        icon: AlertCircle,
        tone: "text-amber-700 bg-amber-50 ring-amber-100",
        path: `${ROUTES.SUPER_ADMIN_INVOICES}?status=pending`,
      },
      {
        title: "Paid Invoices",
        value: cards.paidInvoices || 0,
        icon: CheckCircle2,
        tone: "text-emerald-700 bg-emerald-50 ring-emerald-100",
        path: `${ROUTES.SUPER_ADMIN_INVOICES}?status=paid`,
      },
    ];
  }, [summary]);

  const taskStats = useMemo(() => {
    const cards = summary?.taskDashboard?.cards || {};

    return [
      {
        title: "Total Tasks",
        value: cards.totalTasks || 0,
        icon: CheckSquare,
        tone: "text-cyan-700 bg-cyan-50 ring-cyan-100",
        path: ROUTES.SUPER_ADMIN_TASKS,
      },
      {
        title: "Pending",
        value: cards.pendingTasks || 0,
        icon: Clock3,
        tone: "text-amber-700 bg-amber-50 ring-amber-100",
        path: `${ROUTES.SUPER_ADMIN_TASKS}?status=pending`,
      },
      {
        title: "In Progress",
        value: cards.inProgressTasks || 0,
        icon: RefreshCcw,
        tone: "text-blue-700 bg-blue-50 ring-blue-100",
        path: `${ROUTES.SUPER_ADMIN_TASKS}?status=in_progress`,
      },
      {
        title: "Submitted",
        value: cards.submittedTasks || 0,
        icon: Mail,
        tone: "text-violet-700 bg-violet-50 ring-violet-100",
        path: `${ROUTES.SUPER_ADMIN_TASKS}?status=submitted`,
      },
      {
        title: "Approved",
        value: cards.approvedTasks || 0,
        icon: CheckCircle2,
        tone: "text-emerald-700 bg-emerald-50 ring-emerald-100",
        path: `${ROUTES.SUPER_ADMIN_TASKS}?status=approved`,
      },
      {
        title: "Completed",
        value: cards.completedTasks || 0,
        icon: CheckCircle2,
        tone: "text-emerald-700 bg-emerald-50 ring-emerald-100",
        path: `${ROUTES.SUPER_ADMIN_TASKS}?status=completed`,
      },
      {
        title: "Overdue",
        value: cards.overdueTasks || 0,
        icon: AlertCircle,
        tone: "text-red-700 bg-red-50 ring-red-100",
        path: ROUTES.SUPER_ADMIN_TASKS,
      },
    ];
  }, [summary]);

  return (
    <section className="h-full space-y-6 overflow-y-auto pb-8">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Office Overview
          </p>
          <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
            Admin Dashboard
          </h1>
        </div>

        <button
          type="button"
          onClick={() => fetchDashboardSummary({ silent: true })}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-300"
        >
          <RefreshCcw size={16} />
          Refresh
        </button>
      </div>

      {isLoading && (
        <div className="flex min-h-96 items-center justify-center rounded-lg border border-slate-200 bg-white">
          <LoadingSpinner />
        </div>
      )}

      {!isLoading && errorMessage && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm font-medium text-red-700">
          <AlertCircle className="mt-0.5 shrink-0" size={18} />
          <div>
            <p className="font-bold">Unable to load dashboard</p>
            <p className="mt-1 text-red-600">{errorMessage}</p>
          </div>
        </div>
      )}

      {!isLoading && !errorMessage && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  type="button"
                  key={item.title}
                  onClick={() => navigate(item.path)}
                  className="rounded-lg border border-slate-200 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-500">
                        {item.title}
                      </p>
                      <h2 className="mt-3 break-words text-2xl font-black text-slate-950 sm:text-3xl">
                        {item.value}
                      </h2>
                      {item.subtext && (
                        <p className="mt-1.5 text-xs font-bold text-slate-500">
                          {item.subtext}
                        </p>
                      )}
                    </div>

                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ring-1 ${item.tone}`}
                    >
                      <Icon size={21} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Task Detail Dashboard
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Review workload, submissions, overdue work, and task ownership.
                </p>
              </div>
              <button
                type="button"
                onClick={clearTaskFilters}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Clear Filters
              </button>
            </div>

            <div className="filter-bar gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <SelectDropdown
                value={taskFilters.employeeId}
                options={employeeOptions}
                onChange={(event) => updateTaskFilter("employeeId", event.target.value)}
                wrapperClassName="filter-control"
                className="filter-control h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              />

              <SelectDropdown
                value={taskFilters.projectId}
                options={projectOptions}
                onChange={(event) => updateTaskFilter("projectId", event.target.value)}
                wrapperClassName="filter-control"
                className="filter-control h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              />

              <SelectDropdown
                value={taskFilters.clientId}
                options={clientOptions}
                onChange={(event) => updateTaskFilter("clientId", event.target.value)}
                wrapperClassName="filter-control"
                className="filter-control h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              />

              <SelectDropdown
                value={taskFilters.status}
                options={statusOptions}
                onChange={(event) => updateTaskFilter("status", event.target.value)}
                wrapperClassName="filter-control"
                className="filter-control h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              />

              <input
                type="date"
                value={taskFilters.deadlineFrom}
                onChange={(event) => updateTaskFilter("deadlineFrom", event.target.value)}
                className="filter-control h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              />

              <input
                type="date"
                value={taskFilters.deadlineTo}
                onChange={(event) => updateTaskFilter("deadlineTo", event.target.value)}
                className="filter-control h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
              {taskStats.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => navigate(item.path)}
                    className="rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold uppercase tracking-wide text-slate-500">
                          {item.title}
                        </p>
                        <h3 className="mt-2 text-2xl font-black text-slate-950">
                          {item.value}
                        </h3>
                      </div>
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ${item.tone}`}
                      >
                        <Icon size={18} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="rounded-lg border border-slate-200">
                <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
                  <div>
                    <h3 className="font-black text-slate-950">
                      Recent Submitted Tasks
                    </h3>
                    <p className="text-sm text-slate-500">
                      Latest work waiting for review.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`${ROUTES.SUPER_ADMIN_TASKS}?status=submitted`)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-50"
                  >
                    <Search size={14} />
                    View
                  </button>
                </div>

                {(summary?.taskDashboard?.recentSubmittedTasks || []).length ? (
                  <div className="divide-y divide-slate-100">
                    {summary.taskDashboard.recentSubmittedTasks.map((task) => (
                      <article
                        key={task._id}
                        className="grid gap-3 px-4 py-3 md:grid-cols-[minmax(0,1fr)_auto]"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-bold text-slate-950">
                            {task.taskTitle}
                          </p>
                          <p className="mt-1 truncate text-sm text-slate-500">
                            {getEmployeeName(task.assignedEmployee)} -{" "}
                            {getTaskProjectName(task)} - {getTaskClientName(task)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate(`${ROUTES.SUPER_ADMIN_TASKS}/${task._id}`)}
                          className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                        >
                          Review
                        </button>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="px-4 py-6 text-sm font-semibold text-slate-500">
                    No submitted tasks match the current filters.
                  </p>
                )}
              </div>

              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="font-black text-slate-950">Filtered Tasks</h3>
                <div className="mt-3 space-y-2">
                  {(summary?.taskDashboard?.filteredTasks || []).length ? (
                    summary.taskDashboard.filteredTasks.slice(0, 6).map((task) => (
                      <button
                        key={task._id}
                        type="button"
                        onClick={() => navigate(`${ROUTES.SUPER_ADMIN_TASKS}/${task._id}`)}
                        className="block w-full rounded-lg bg-slate-50 px-3 py-2 text-left transition hover:bg-blue-50"
                      >
                        <span className="block truncate text-sm font-bold text-slate-950">
                          {task.taskTitle}
                        </span>
                        <span className="mt-1 block truncate text-xs font-semibold capitalize text-slate-500">
                          {formatLabel(task.status)} - Due {formatDate(task.deadline)}
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="rounded-lg bg-slate-50 px-3 py-4 text-sm font-semibold text-slate-500">
                      No tasks match these filters.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              {[
                {
                  title: "Tasks by User / Employee",
                  rows: summary?.taskDashboard?.tasksByEmployee || [],
                  getPath: (row) =>
                    row.employeeId
                      ? `${ROUTES.SUPER_ADMIN_TASKS}?employeeId=${row.employeeId}`
                      : ROUTES.SUPER_ADMIN_TASKS,
                  render: (row) => (
                    <>
                      <p className="truncate text-sm font-black text-slate-950">
                        {row.employeeName}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        {row.total} total - {row.submitted} submitted
                      </p>
                    </>
                  ),
                },
                {
                  title: "Tasks Linked to Project",
                  rows: summary?.taskDashboard?.tasksByProject || [],
                  getPath: (row) =>
                    row.projectId
                      ? `${ROUTES.SUPER_ADMIN_TASKS}?projectId=${row.projectId}`
                      : ROUTES.SUPER_ADMIN_TASKS,
                  render: (row) => (
                    <>
                      <p className="truncate text-sm font-black text-slate-950">
                        {row.projectName}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        {row.total} tasks
                      </p>
                    </>
                  ),
                },
                {
                  title: "Tasks Linked to Client",
                  rows: summary?.taskDashboard?.tasksByClient || [],
                  getPath: (row) =>
                    row.clientId
                      ? `${ROUTES.SUPER_ADMIN_TASKS}?clientId=${row.clientId}`
                      : ROUTES.SUPER_ADMIN_TASKS,
                  render: (row) => (
                    <>
                      <p className="truncate text-sm font-black text-slate-950">
                        {row.clientName}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        {row.total} tasks
                      </p>
                    </>
                  ),
                },
              ].map((group) => (
                <div key={group.title} className="rounded-lg border border-slate-200 p-4">
                  <h3 className="font-black text-slate-950">{group.title}</h3>
                  <div className="mt-3 space-y-2">
                    {group.rows.length ? (
                      group.rows.map((row, index) => (
                        <button
                          type="button"
                          key={`${group.title}-${row.employeeId || row.projectId || row.clientId || index}`}
                          onClick={() => navigate(group.getPath(row))}
                          className="w-full rounded-lg bg-slate-50 px-3 py-2 text-left transition hover:bg-blue-50"
                        >
                          {group.render(row)}
                        </button>
                      ))
                    ) : (
                      <p className="rounded-lg bg-slate-50 px-3 py-4 text-sm font-semibold text-slate-500">
                        No data for the selected filters.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-1 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Recent Client Requests
                </h2>
                <p className="text-sm text-slate-500">
                  Latest service enquiries from clients.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate(ROUTES.SUPER_ADMIN_SERVICE_REQUESTS)}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-50"
              >
                <Search size={14} />
                View All
              </button>
            </div>

            {(summary?.recentClientRequests || []).length > 0 ? (
              <div className="divide-y divide-slate-100">
                {summary.recentClientRequests.map((request, index) => (
                  <button
                    type="button"
                    key={`${request.email}-${request.createdAt}-${index}`}
                    onClick={() =>
                      navigate(
                        request._id
                          ? `${ROUTES.SUPER_ADMIN_SERVICE_REQUESTS}/${request._id}`
                          : ROUTES.SUPER_ADMIN_SERVICE_REQUESTS
                      )
                    }
                    className="grid w-full gap-4 px-5 py-4 text-left transition hover:bg-slate-50 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto]"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-bold text-slate-950">
                          {request.clientName}
                        </h3>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold capitalize text-slate-600">
                          {request.status?.replace("_", " ") || "pending"}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                        {request.message || "No message provided."}
                      </p>
                    </div>

                    <div className="space-y-2 text-sm text-slate-600">
                      <p className="font-semibold text-slate-800">
                        {request.serviceRequired}
                      </p>
                      <div className="flex min-w-0 items-center gap-2">
                        <Mail size={15} className="shrink-0 text-slate-400" />
                        <span className="truncate">{request.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={15} className="shrink-0 text-slate-400" />
                        <span>{request.phone || "No phone"}</span>
                      </div>
                    </div>

                    <div className="text-sm font-semibold text-slate-500 md:text-right">
                      {formatDate(request.createdAt)}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex min-h-48 flex-col items-center justify-center px-5 py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <Mail size={22} />
                </div>
                <h3 className="mt-4 font-bold text-slate-950">
                  No recent requests
                </h3>
                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  New client service requests will appear here as soon as they are submitted.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
};

export default SuperAdminDashboard;
