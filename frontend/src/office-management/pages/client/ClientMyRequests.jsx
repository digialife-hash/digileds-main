import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  FileText,
  Plus,
  Search,
} from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import PageBackButton from "../../components/common/PageBackButton";
import SelectDropdown from "../../components/common/SelectDropdown";
import { getMyServiceRequests } from "../../services/serviceRequestService";
import { ROUTES } from "../../routes/routeConstants";

const editableStatuses = ["submitted", "reviewed"];

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

const formatDate = (value) => {
  if (!value) return "No deadline";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const ClientMyRequests = () => {
  const navigate = useNavigate();
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
  });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const requestParams = useMemo(
    () => ({
      page,
      limit: pagination.limit,
      search: filters.search || undefined,
      status: filters.status || undefined,
      priority: filters.priority || undefined,
    }),
    [filters, page, pagination.limit]
  );

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const result = await getMyServiceRequests(requestParams);

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

  return (
    <section className="h-full space-y-6 overflow-y-auto pb-8">
      <PageBackButton fallbackPath={ROUTES.CLIENT_DASHBOARD} />
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Service Requests
          </p>
          <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
            My Requests
          </h1>
        </div>

        <button
          type="button"
          onClick={() => navigate(ROUTES.CLIENT_SUBMIT_SERVICE)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md"
        >
          <Plus size={17} />
          New Request
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
            placeholder="Search project title or service"
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
            Submit your first project requirement and track review progress here.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:block">
            <table className="w-full table-fixed">
              <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">Request</th>
                  <th className="px-5 py-4">Deadline</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Priority</th>
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
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                      {formatDate(request.deadline)}
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
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`${ROUTES.CLIENT_REQUEST_DETAILS}/${request._id}`)
                          }
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                          aria-label="View request"
                        >
                          <Eye size={16} />
                        </button>
                        {editableStatuses.includes(request.status) && (
                          <button
                            type="button"
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
                            aria-label="Edit request"
                          >
                            <Edit3 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 lg:hidden">
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
                    {formatDate(request.deadline)}
                  </span>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`${ROUTES.CLIENT_REQUEST_DETAILS}/${request._id}`)
                    }
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  {editableStatuses.includes(request.status) && (
                    <button
                      type="button"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
                    >
                      <Edit3 size={16} />
                      Edit
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
    </section>
  );
};

export default ClientMyRequests;
