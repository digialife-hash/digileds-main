import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  FolderKanban,
} from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import PageBackButton from "../../components/common/PageBackButton";
import SelectDropdown from "../../components/common/SelectDropdown";
import { getClientProjects } from "../../services/projectService";
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

const paymentBadgeClass = {
  not_generated: "bg-slate-100 text-slate-700 ring-slate-200",
  pending: "bg-amber-50 text-amber-700 ring-amber-100",
  partially_paid: "bg-blue-50 text-blue-700 ring-blue-100",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  overdue: "bg-red-50 text-red-700 ring-red-100",
};

const projectStatusOptions = [
  ["", "All statuses"],
  ["not_started", "Not Started"],
  ["in_progress", "In Progress"],
  ["on_hold", "On Hold"],
  ["completed", "Completed"],
  ["cancelled", "Cancelled"],
];

const priorityOptions = [
  ["", "All priorities"],
  ["low", "Low"],
  ["medium", "Medium"],
  ["high", "High"],
  ["urgent", "Urgent"],
];

const formatLabel = (value = "") => value.replaceAll("_", " ");

const formatDate = (value) => {
  if (!value) return "Not set";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const ClientProjects = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
  });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const requestParams = useMemo(
    () => ({
      page,
      limit: pagination.limit,
      status: filters.status || undefined,
      priority: filters.priority || undefined,
    }),
    [filters, page, pagination.limit]
  );

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const result = await getClientProjects(requestParams);

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

  useEffect(() => {
    void fetchProjects();
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

  return (
    <section className="h-full space-y-6 overflow-y-auto pb-8">
      <PageBackButton fallbackPath={ROUTES.CLIENT_DASHBOARD} />
      <div className="border-b border-slate-200 pb-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          My Work
        </p>
        <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
          My Projects
        </h1>
      </div>

      <div className="filter-bar gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <SelectDropdown
          name="status"
          value={filters.status}
          options={projectStatusOptions}
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
            Projects linked to your account will appear here once work begins.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {projects.map((project) => {
              const progress = Math.min(
                Math.max(project.progressPercentage || 0, 0),
                100
              );

              return (
                <article
                  key={project._id}
                  className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-black text-slate-950">
                        {project.projectName}
                      </h2>
                      <p className="mt-1 truncate text-sm font-semibold text-slate-600">
                        {project.category || "No category"}
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

                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-500">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${
                        priorityBadgeClass[project.priority] ||
                        priorityBadgeClass.medium
                      }`}
                    >
                      {project.priority}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                      <CalendarDays size={13} />
                      {formatDate(project.deadline)}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${
                        paymentBadgeClass[project.paymentStatus] ||
                        paymentBadgeClass.pending
                      }`}
                    >
                      Payment: {formatLabel(project.paymentStatus || "pending")}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${
                        paymentBadgeClass[project.invoiceStatus] ||
                        paymentBadgeClass.not_generated
                      }`}
                    >
                      Invoice: {formatLabel(project.invoiceStatus || "not_generated")}
                    </span>
                  </div>

                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
                    {project.description || "No project description available."}
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate(`${ROUTES.CLIENT_PROJECTS}/${project._id}`)}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Eye size={16} />
                    View Details
                  </button>
                </article>
              );
            })}
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
    </section>
  );
};

export default ClientProjects;
