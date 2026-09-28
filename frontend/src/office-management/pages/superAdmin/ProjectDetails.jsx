import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  CheckSquare,
  Clock3,
  Edit3,
  FileText,
  FolderKanban,
  GitBranch,
  GitCommitHorizontal,
  Computer,
  Link2,
  Save,
  Star,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import SelectDropdown from "../../components/common/SelectDropdown";
import { useAuth } from "../../context/authStore";
import {
  deleteProject,
  getProjectById,
  updateProject,
} from "../../services/projectService";
import { ROUTES } from "../../routes/routeConstants";

const statusSteps = [
  { key: "not_started", label: "Not Started" },
  { key: "in_progress", label: "In Progress" },
  { key: "on_hold", label: "On Hold" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];
const statusOptions = statusSteps.map((step) => [step.key, step.label]);

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

const formatLabel = (value = "") =>
  (value === "review" ? "submitted" : value).replaceAll("_", " ");

const taskStatusBadgeClass = {
  pending: "bg-slate-100 text-slate-700 ring-slate-200",
  in_progress: "bg-blue-50 text-blue-700 ring-blue-100",
  review: "bg-violet-50 text-violet-700 ring-violet-100",
  submitted: "bg-violet-50 text-violet-700 ring-violet-100",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  rejected: "bg-red-50 text-red-700 ring-red-100",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-100",
};

const formatDate = (value) => {
  if (!value) return "Not set";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const formatDateTime = (value) => {
  if (!value) return "Not set";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
};

const getServiceRequestLabel = (serviceRequest) => {
  if (!serviceRequest) return "No linked service request";
  if (typeof serviceRequest === "string") return serviceRequest;

  return serviceRequest.projectTitle || serviceRequest._id || "Linked service request";
};

const getServiceRequestId = (serviceRequest) => {
  if (!serviceRequest) return "";
  if (typeof serviceRequest === "string") return serviceRequest;

  return serviceRequest._id || "";
};

const getPersonName = (person, fallback = "Unassigned") => {
  if (!person) return fallback;
  if (typeof person === "string") return person;
  return person.name || person.email || fallback;
};

const getTaskStats = (tasks = []) => {
  return tasks.reduce(
    (stats, task) => {
      const status = task.status === "review" ? "submitted" : task.status;
      stats.total += 1;
      stats[status] = (stats[status] || 0) + 1;
      return stats;
    },
    {
      total: 0,
      pending: 0,
      in_progress: 0,
      submitted: 0,
      approved: 0,
      rejected: 0,
      completed: 0,
    }
  );
};

const DetailItem = ({ label, value, icon: Icon }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
      {Icon && <Icon size={14} />}
      {label}
    </div>
    <p className="mt-2 break-words text-sm font-bold text-slate-900">
      {value || "Not provided"}
    </p>
  </div>
);

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [statusValue, setStatusValue] = useState("not_started");
  const [progressValue, setProgressValue] = useState(0);
  const [notesValue, setNotesValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isSuperAdmin = user?.role === "super_admin";

  const progress = Math.min(
    Math.max(Number(project?.progressPercentage || 0), 0),
    100
  );

  const currentStepIndex = useMemo(() => {
    return statusSteps.findIndex((step) => step.key === project?.status);
  }, [project?.status]);

  const client = project?.clientId || {};
  const serviceRequest = project?.serviceRequestId;
  const assignedTeam = Array.isArray(project?.assignedTeam)
    ? project.assignedTeam
    : [];
  const assignedTeams = Array.isArray(project?.assignedTeams)
    ? project.assignedTeams
    : [];
  const projectTasks = Array.isArray(project?.projectTasks)
    ? project.projectTasks
    : [];
  const taskStats = getTaskStats(projectTasks);
  const teamsPagePath = `${ROUTES.SUPER_ADMIN_TEAMS}?assignedProject=${encodeURIComponent(
    id
  )}`;
  const tasksPagePath = `${ROUTES.SUPER_ADMIN_TASKS}?relatedProject=${encodeURIComponent(
    id
  )}`;
  const createTaskPath = `${ROUTES.SUPER_ADMIN_TASK_CREATE}?projectId=${encodeURIComponent(
    id
  )}`;

  const syncFormState = (nextProject) => {
    setStatusValue(nextProject?.status || "not_started");
    setProgressValue(nextProject?.progressPercentage || 0);
    setNotesValue(nextProject?.notes || "");
  };

  const fetchProject = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const result = await getProjectById(id);
      const nextProject = result.data.project;

      setProject(nextProject);
      syncFormState(nextProject);
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
    void fetchProject();
  }, [id]);

  const handleUpdate = async (payload, message) => {
    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      const result = await updateProject(id, payload);
      const nextProject = result.data.project;

      setProject(nextProject);
      syncFormState(nextProject);
      setSuccessMessage(message);
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
      setIsSaving(false);
    }
  };

  const handleStatusSubmit = (event) => {
    event.preventDefault();
    void handleUpdate({ status: statusValue }, "Project status updated");
  };

  const handleProgressSubmit = (event) => {
    event.preventDefault();

    const progressNumber = Number(progressValue);
    if (!Number.isFinite(progressNumber) || progressNumber < 0 || progressNumber > 100) {
      setErrorMessage("Progress must be between 0 and 100");
      return;
    }

    void handleUpdate(
      { progressPercentage: progressNumber },
      "Project progress updated"
    );
  };

  const handleNotesSubmit = (event) => {
    event.preventDefault();
    void handleUpdate({ notes: notesValue.trim() }, "Project notes updated");
  };

  const handleDelete = async () => {
    const shouldDelete = window.confirm(
      `Delete "${project.projectName}"? This action cannot be undone.`
    );

    if (!shouldDelete) return;

    try {
      setIsDeleting(true);
      setErrorMessage("");
      await deleteProject(id);
      navigate(ROUTES.SUPER_ADMIN_PROJECTS, { replace: true });
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
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <section className="flex h-full items-center justify-center">
        <LoadingSpinner />
      </section>
    );
  }

  if (!project) {
    return (
      <section className="flex h-full items-center justify-center px-4">
        <div className="max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
          <FileText className="mx-auto text-slate-400" size={32} />
          <h1 className="mt-4 text-xl font-black text-slate-950">
            Project not found
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {errorMessage || "The project may have been deleted or moved."}
          </p>
          <button
            type="button"
            onClick={() => navigate(ROUTES.SUPER_ADMIN_PROJECTS)}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            <ArrowLeft size={16} />
            Back to Projects
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="h-full space-y-6 overflow-y-auto pb-8">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => navigate(ROUTES.SUPER_ADMIN_PROJECTS)}
            className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-slate-950"
          >
            <ArrowLeft size={16} />
            Back to Projects
          </button>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Project Details
          </p>
          <h1 className="mt-1 break-words text-2xl font-black text-slate-950 sm:text-3xl">
            {project.projectName}
          </h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold capitalize ring-1 ${
                statusBadgeClass[project.status] || statusBadgeClass.not_started
              }`}
            >
              {formatLabel(project.status)}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold capitalize ring-1 ${
                priorityBadgeClass[project.priority] || priorityBadgeClass.medium
              }`}
            >
              {project.priority}
            </span>
            {project.serviceRequestStatus && (
              <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold capitalize text-violet-700 ring-1 ring-violet-100">
                Request: {formatLabel(project.serviceRequestStatus)}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
          <button
            type="button"
            onClick={() => navigate(teamsPagePath)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-blue-50 hover:text-blue-700"
          >
            <FolderKanban size={16} />
            Add Teams
          </button>
          <button
            type="button"
            onClick={() => navigate(createTaskPath)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
          >
            <CheckSquare size={16} />
            Add Project Task
          </button>
          <button
            type="button"
            onClick={() => navigate(`${ROUTES.SUPER_ADMIN_PROJECTS}/${id}/edit`)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-blue-50 hover:text-blue-700"
          >
            <Edit3 size={16} />
            Edit Project
          </button>
          {isSuperAdmin && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-700 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 size={16} />
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {successMessage}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-950">
                  Progress
                </h2>
                <p className="text-sm text-slate-500">
                  Current completion and delivery state.
                </p>
              </div>
              <span className="text-2xl font-black text-slate-950">
                {progress}%
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </section>

          {serviceRequest && typeof serviceRequest === "object" && (
            <section className="rounded-lg border border-violet-200 bg-violet-50 p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-violet-700">
                    Same Work Item
                  </p>
                  <h2 className="mt-1 text-lg font-black text-violet-950">
                    Created from service request: {serviceRequest.projectTitle}
                  </h2>
                  <p className="mt-2 text-sm font-semibold text-violet-800">
                    This project is the execution view for the original client request.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `${ROUTES.SUPER_ADMIN_SERVICE_REQUESTS}/${getServiceRequestId(
                        serviceRequest
                      )}`
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-violet-800"
                >
                  <Link2 size={17} />
                  View Source Request
                </button>
              </div>
            </section>
          )}

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-slate-950">
              Status Timeline
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-5">
              {statusSteps.map((step, index) => {
                const isActive = step.key === project.status;
                const isDone =
                  currentStepIndex >= 0 &&
                  index <= currentStepIndex &&
                  project.status !== "cancelled";
                const isCancelled = step.key === "cancelled" && project.status === "cancelled";

                return (
                  <div
                    key={step.key}
                    className={`rounded-lg border p-4 ${
                      isActive || isCancelled
                        ? "border-blue-200 bg-blue-50"
                        : isDone
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div
                      className={`mb-3 flex h-8 w-8 items-center justify-center rounded-full ${
                        isActive || isCancelled
                          ? "bg-blue-600 text-white"
                          : isDone
                            ? "bg-emerald-600 text-white"
                            : "bg-white text-slate-400"
                      }`}
                    >
                      {isDone || isActive || isCancelled ? (
                        <CheckCircle2 size={16} />
                      ) : (
                        <Clock3 size={16} />
                      )}
                    </div>
                    <p className="text-sm font-black text-slate-900">
                      {step.label}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {step.key === "completed"
                        ? formatDateTime(project.completedAt)
                        : step.key === "cancelled"
                          ? formatDateTime(project.cancelledAt)
                          : isActive
                            ? formatDateTime(project.updatedAt)
                            : "Pending"}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <DetailItem label="Client" value={client.companyName || client.clientName} icon={Building2} />
            <DetailItem label="Client Email" value={client.email} />
            <DetailItem label="Client Phone" value={client.phone} />
            <DetailItem label="Category" value={project.category} />
            <DetailItem label="Start Date" value={formatDate(project.startDate)} icon={CalendarDays} />
            <DetailItem label="Deadline" value={formatDate(project.deadline)} icon={CalendarDays} />
            <DetailItem label="Budget" value={formatCurrency(project.budget)} />
            <DetailItem label="Created At" value={formatDateTime(project.createdAt)} />
            <DetailItem label="Updated At" value={formatDateTime(project.updatedAt)} />
            <DetailItem
              label="Service Request"
              value={getServiceRequestLabel(serviceRequest)}
              icon={Link2}
            />
            <DetailItem
              label="Service Request Status"
              value={
                project.serviceRequestStatus
                  ? formatLabel(project.serviceRequestStatus)
                  : "Not linked"
              }
            />
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-slate-950">Description</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
              {project.description || "No description provided."}
            </p>
          </section>

          {project.github?.repoUrl && (
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                  <Computer  size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-950">
                    GitHub Repository
                  </h2>
                  <p className="text-sm text-slate-500">
                    Repository information fetched from GitHub.
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <a
                  href={project.github.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
                >
                  <Link2 size={15} />
                  {project.github.repoUrl}
                </a>
              </div>

              {project.github.available === false && (
                <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                  {project.github.error || "Unable to fetch GitHub data."}
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <DetailItem
                  label="Owner"
                  value={project.github.owner}
                  icon={Building2}
                />
                <DetailItem
                  label="Repository"
                  value={project.github.repo}
                  icon={FolderKanban}
                />
                {project.github.defaultBranch && (
                  <DetailItem
                    label="Default Branch"
                    value={project.github.defaultBranch}
                    icon={GitBranch}
                  />
                )}
                {project.github.visibility && (
                  <DetailItem
                    label="Visibility"
                    value={project.github.visibility}
                  />
                )}
                {project.github.branchCount !== undefined && (
                  <DetailItem
                    label="Branches"
                    value={`${project.github.branchCount} branch${project.github.branchCount === 1 ? "" : "es"}`}
                    icon={GitBranch}
                  />
                )}
                {project.github.commitCount !== undefined && (
                  <DetailItem
                    label="Total Commits"
                    value={project.github.commitCount.toLocaleString()}
                    icon={GitCommitHorizontal}
                  />
                )}
                {project.github.stars !== undefined && (
                  <DetailItem
                    label="Stars"
                    value={project.github.stars.toLocaleString()}
                    icon={Star}
                  />
                )}
                {project.github.forks !== undefined && (
                  <DetailItem
                    label="Forks"
                    value={project.github.forks.toLocaleString()}
                    icon={FolderKanban}
                  />
                )}
              </div>

              {project.github.branches?.length > 0 && (
                <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <GitBranch size={14} />
                    Branch List
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {project.github.branches.map((branch) => (
                      <span
                        key={branch}
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${
                          branch === project.github.defaultBranch
                            ? "bg-blue-50 text-blue-700 ring-blue-200"
                            : "bg-white text-slate-700 ring-slate-200"
                        }`}
                      >
                        {branch}
                        {branch === project.github.defaultBranch && (
                          <span className="ml-1 text-blue-500">(default)</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {project.github.latestCommit && (
                <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <GitCommitHorizontal size={14} />
                    Latest Commit
                  </div>
                  <p className="mt-2 text-sm font-bold text-slate-900">
                    {project.github.latestCommit.message}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
                    {project.github.latestCommit.author && (
                      <span>By {project.github.latestCommit.author}</span>
                    )}
                    {project.github.latestCommit.date && (
                      <span>{formatDateTime(project.github.latestCommit.date)}</span>
                    )}
                    {project.github.latestCommit.sha && (
                      <span className="font-mono">
                        {project.github.latestCommit.sha.slice(0, 7)}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </section>
          )}

          {serviceRequest && typeof serviceRequest === "object" && (
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Source Service Request
                  </p>
                  <h2 className="mt-1 text-lg font-black text-slate-950">
                    {serviceRequest.projectTitle || project.projectName}
                  </h2>
                </div>
                <span className="w-fit rounded-full bg-violet-50 px-3 py-1 text-xs font-bold capitalize text-violet-700 ring-1 ring-violet-100">
                  {formatLabel(serviceRequest.status)}
                </span>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <DetailItem
                  label="Request ID"
                  value={getServiceRequestId(serviceRequest)}
                  icon={Link2}
                />
                <DetailItem
                  label="Service Required"
                  value={serviceRequest.serviceRequired}
                />
                <DetailItem
                  label="Request Client"
                  value={serviceRequest.clientName}
                />
                <DetailItem
                  label="Request Email"
                  value={serviceRequest.clientEmail}
                />
                <DetailItem
                  label="Request Phone"
                  value={serviceRequest.clientPhone}
                />
                <DetailItem
                  label="Company Name"
                  value={serviceRequest.companyName}
                />
                <DetailItem
                  label="Budget Range"
                  value={serviceRequest.budgetRange}
                />
                <DetailItem
                  label="Requested Deadline"
                  value={formatDate(serviceRequest.deadline)}
                  icon={CalendarDays}
                />
                <DetailItem
                  label="Request Priority"
                  value={serviceRequest.priority}
                />
                <DetailItem
                  label="Request Category"
                  value={serviceRequest.category}
                />
              </div>

              <div className="mt-5 grid gap-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Original Requirement
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {serviceRequest.projectDescription ||
                      "No original requirement provided."}
                  </p>
                </div>

                {serviceRequest.adminRemarks && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Service Request Remarks
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {serviceRequest.adminRemarks}
                    </p>
                  </div>
                )}

                {serviceRequest.referenceLinks?.length > 0 && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Reference Links
                    </p>
                    <div className="mt-3 grid gap-2">
                      {serviceRequest.referenceLinks.map((link) => (
                        <a
                          key={link}
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                        >
                          <Link2 size={15} className="shrink-0" />
                          <span className="truncate">{link}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-black text-slate-950">
              <Users size={19} />
              Assigned Users / Employees
            </h2>
            {assignedTeam.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">
                No individual users/employees assigned directly on this project.
              </p>
            ) : (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {assignedTeam.map((member) => (
                  <div
                    key={member._id || member}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                  >
                    <p className="font-bold text-slate-950">
                      {member.name || member}
                    </p>
                    {member.email && (
                      <p className="mt-1 text-sm text-slate-500">{member.email}</p>
                    )}
                    {member.role && (
                      <p className="mt-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                        {formatLabel(member.role)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-black text-slate-950">
                  <FolderKanban size={19} />
                  Teams Working on This Project
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Teams connected through the team project assignment workflow.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate(teamsPagePath)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-50"
                >
                  <FolderKanban size={15} />
                  Add / Manage Teams
                </button>
                <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-100">
                  {assignedTeams.length} teams
                </span>
              </div>
            </div>

            {assignedTeams.length === 0 ? (
              <p className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500">
                No team has been assigned to this project yet.
              </p>
            ) : (
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {assignedTeams.map((team) => (
                  <article
                    key={team._id}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate font-black text-slate-950">
                          {team.teamName}
                        </h3>
                        <p className="mt-1 text-sm font-semibold text-slate-500">
                          {team.department || "No department"}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-bold capitalize text-slate-600 ring-1 ring-slate-200">
                        {formatLabel(team.status)}
                      </span>
                    </div>

                    <div className="mt-4 rounded-lg bg-white p-3 ring-1 ring-slate-200">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                        <UserRound size={14} />
                        Team Lead
                      </div>
                      <p className="mt-2 text-sm font-black text-slate-950">
                        {getPersonName(team.teamLead, "No lead")}
                      </p>
                      {team.teamLead?.designation && (
                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          {team.teamLead.designation}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {(team.members || []).slice(0, 6).map((member) => (
                        <span
                          key={member._id || member}
                          className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200"
                        >
                          {getPersonName(member, "Member")}
                        </span>
                      ))}
                      {(team.members || []).length > 6 && (
                        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-500 ring-1 ring-slate-200">
                          +{team.members.length - 6} more
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-black text-slate-950">
                  <CheckSquare size={19} />
                  Project Tasks
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Task ownership and delivery status for this project.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => navigate(createTaskPath)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-700"
                >
                  <CheckSquare size={15} />
                  Add Task
                </button>
                <button
                  type="button"
                  onClick={() => navigate(tasksPagePath)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-50"
                >
                  View Tasks Page
                </button>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                  {taskStats.total} total
                </span>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-100">
                  {taskStats.in_progress} active
                </span>
                <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700 ring-1 ring-violet-100">
                  {taskStats.submitted} submitted
                </span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
                  {taskStats.completed} done
                </span>
              </div>
            </div>

            {projectTasks.length === 0 ? (
              <p className="p-5 text-sm font-semibold text-slate-500">
                No tasks are linked to this project yet.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {projectTasks.map((task) => (
                  <article
                    key={task._id}
                    className="grid gap-4 px-5 py-4 transition hover:bg-slate-50 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto]"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-black text-slate-950">
                          {task.taskTitle}
                        </h3>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${
                            taskStatusBadgeClass[task.status] ||
                            taskStatusBadgeClass.pending
                          }`}
                        >
                          {formatLabel(task.status)}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                        {task.description || "No task description."}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                        <UserRound size={14} />
                        Assigned Developer
                      </div>
                      <p className="mt-2 truncate text-sm font-black text-slate-950">
                        {getPersonName(task.assignedEmployee)}
                      </p>
                      {task.assignedEmployee?.designation && (
                        <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                          {task.assignedEmployee.designation}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 text-sm font-semibold text-slate-600 lg:text-right">
                      <span className="capitalize">
                        Priority: {task.priority || "medium"}
                      </span>
                      <span>Due: {formatDate(task.deadline)}</span>
                      <button
                        type="button"
                        onClick={() => navigate(`${ROUTES.SUPER_ADMIN_TASKS}/${task._id}`)}
                        className="mt-1 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-50"
                      >
                        View Task
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-5">
          <form
            onSubmit={handleStatusSubmit}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-base font-black text-slate-950">
              Update Status
            </h2>
            <SelectDropdown
              value={statusValue}
              options={statusOptions}
              onChange={(event) => setStatusValue(event.target.value)}
              className="mt-4 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="submit"
              disabled={isSaving}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={16} />
              Save Status
            </button>
          </form>

          <form
            onSubmit={handleProgressSubmit}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-base font-black text-slate-950">
              Update Progress
            </h2>
            <input
              type="range"
              min="0"
              max="100"
              value={progressValue}
              onChange={(event) => setProgressValue(Number(event.target.value))}
              className="mt-5 w-full accent-blue-600"
            />
            <div className="mt-2 flex items-center justify-between text-sm font-bold text-slate-600">
              <span>0%</span>
              <span>{progressValue}%</span>
              <span>100%</span>
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={16} />
              Save Progress
            </button>
          </form>

          <form
            onSubmit={handleNotesSubmit}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-base font-black text-slate-950">
              Project Notes
            </h2>
            <textarea
              value={notesValue}
              onChange={(event) => setNotesValue(event.target.value)}
              rows={6}
              className="mt-4 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="submit"
              disabled={isSaving}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={16} />
              Save Notes
            </button>
          </form>
        </aside>
      </div>
    </section>
  );
};

export default ProjectDetails;
