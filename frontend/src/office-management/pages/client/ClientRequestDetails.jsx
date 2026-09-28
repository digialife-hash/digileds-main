import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Edit3,
  ExternalLink,
  FileText,
  FolderKanban,
  Link2,
  MessageSquare,
} from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { getMyServiceRequestById } from "../../services/serviceRequestService";
import { ROUTES } from "../../routes/routeConstants";

const editableStatuses = ["submitted", "reviewed"];

const statusSteps = [
  { key: "submitted", label: "Submitted" },
  { key: "reviewed", label: "Reviewed" },
  { key: "approved", label: "Approved" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "closed", label: "Closed" },
];

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

const timelineToneClass = {
  submitted: {
    active: "border-sky-200 bg-sky-50 text-sky-800",
    icon: "text-sky-600",
  },
  reviewed: {
    active: "border-indigo-200 bg-indigo-50 text-indigo-800",
    icon: "text-indigo-600",
  },
  approved: {
    active: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: "text-emerald-600",
  },
  in_progress: {
    active: "border-amber-200 bg-amber-50 text-amber-800",
    icon: "text-amber-600",
  },
  completed: {
    active: "border-green-200 bg-green-50 text-green-800",
    icon: "text-green-600",
  },
  closed: {
    active: "border-slate-300 bg-slate-100 text-slate-700",
    icon: "text-slate-600",
  },
};

const formatDate = (value) => {
  if (!value) return "Not provided";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const formatDateTime = (value) => {
  if (!value) return "";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

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

const ClientRequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isNotFound, setIsNotFound] = useState(false);

  const currentStatusIndex = useMemo(() => {
    return statusSteps.findIndex((step) => step.key === request?.status);
  }, [request?.status]);

  const statusHistoryByStatus = useMemo(() => {
    return (request?.statusHistory || []).reduce((history, event) => {
      history[event.status] = event;
      return history;
    }, {});
  }, [request?.statusHistory]);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");
        setIsNotFound(false);

        const result = await getMyServiceRequestById(id);
        setRequest(result.data.serviceRequest);
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
        setIsLoading(false);
      }
    };

    void fetchRequest();
  }, [id, navigate]);

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
          <FileText size={25} />
        </div>
        <h1 className="mt-4 text-xl font-black text-slate-950">
          Request not found
        </h1>
        <p className="mt-1 max-w-md text-sm text-slate-500">
          The request may have been removed or you may not have access to it.
        </p>
        <button
          type="button"
          onClick={() => navigate(ROUTES.CLIENT_REQUESTS)}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
        >
          <ArrowLeft size={17} />
          Back to My Requests
        </button>
      </section>
    );
  }

  return (
    <section className="h-full space-y-6 overflow-y-auto pb-8">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Request Details
          </p>
          <h1 className="mt-1 break-words text-2xl font-black text-slate-950 sm:text-3xl">
            {request.projectTitle}
          </h1>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate(ROUTES.CLIENT_REQUESTS)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md"
          >
            <ArrowLeft size={17} />
            Back to My Requests
          </button>

          {editableStatuses.includes(request.status) && (
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md"
            >
              <Edit3 size={17} />
              Edit
            </button>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-950">
              {request.serviceRequired}
            </h2>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
              {request.projectDescription}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${
                statusBadgeClass[request.status] || statusBadgeClass.closed
              }`}
            >
              {request.status?.replace("_", " ")}
            </span>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${
                priorityBadgeClass[request.priority] || priorityBadgeClass.medium
              }`}
            >
              {request.priority}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black text-slate-950">Status Timeline</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-6">
          {statusSteps.map((step, index) => {
            const isCompleted = index <= currentStatusIndex;
            const tone = timelineToneClass[step.key];
            const event = statusHistoryByStatus[step.key];
            const fallbackDate =
              step.key === "submitted" && isCompleted ? request.createdAt : "";
            const eventDate = event?.changedAt || fallbackDate;

            return (
              <div
                key={step.key}
                className={`rounded-lg border p-4 ${
                  isCompleted
                    ? tone.active
                    : "border-slate-200 bg-slate-50 text-slate-500"
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    size={18}
                    className={isCompleted ? tone.icon : "text-slate-300"}
                  />
                  <span className="text-sm font-bold">{step.label}</span>
                </div>
                <p className="mt-2 text-xs font-semibold opacity-80">
                  {isCompleted ? formatDateTime(eventDate) || "Time unavailable" : "Pending"}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <DetailItem label="Category" value={request.category} icon={FolderKanban} />
        <DetailItem label="Budget Range" value={request.budgetRange} />
        <DetailItem label="Deadline" value={formatDate(request.deadline)} icon={CalendarDays} />
        <DetailItem label="Created At" value={formatDate(request.createdAt)} />
        <DetailItem label="Updated At" value={formatDate(request.updatedAt)} />
        <DetailItem
          label="Converted To Project"
          value={request.convertedToProject ? "Yes" : "No"}
        />
      </div>

      {request.adminRemarks && (
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <MessageSquare size={17} />
            User Remarks
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {request.adminRemarks}
          </p>
        </div>
      )}

      {request.referenceLinks?.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-950">Reference Links</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {request.referenceLinks.map((link) => (
              <a
                key={link}
                href={link}
                target="_blank"
                rel="noreferrer"
                className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                <Link2 size={16} className="shrink-0" />
                <span className="truncate">{link}</span>
                <ExternalLink size={15} className="ml-auto shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}

      {request.convertedToProject && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">
                Same Work Item
              </p>
              <h2 className="mt-1 text-lg font-black text-emerald-950">
                This request is now tracked as a project
              </h2>
              <p className="mt-2 text-sm font-semibold text-emerald-800">
                Open My Projects to follow progress, deadline, and project status.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate(ROUTES.CLIENT_PROJECTS)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800"
            >
              <FolderKanban size={17} />
              My Projects
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default ClientRequestDetails;
