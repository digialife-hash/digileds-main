import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  FolderKanban,
  GitBranch,
  GitCommitHorizontal,
  Globe,
  Lock,
  Star,
  GitFork,
  AlertCircle,
} from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { ROUTES } from "../../routes/routeConstants";
import { getEmployeeProjectById } from "../../services/projectService";

const statusBadgeClass = {
  not_started: "bg-slate-100 text-slate-700 ring-slate-200",
  in_progress: "bg-blue-50 text-blue-700 ring-blue-100",
  on_hold: "bg-amber-50 text-amber-700 ring-amber-100",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  cancelled: "bg-red-50 text-red-700 ring-red-100",
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

const DetailItem = ({ label, value, icon: Icon }) => (
  <div className="rounded-lg bg-slate-50 px-4 py-3">
    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
      {Icon && <Icon size={13} />}
      {label}
    </div>
    <p className="mt-1 text-sm font-black capitalize text-slate-950">{value}</p>
  </div>
);

const EmployeeProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchProject = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const result = await getEmployeeProjectById(id);
      setProject(result.data.project);
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

  if (isLoading) {
    return (
      <div className="flex min-h-96 items-center justify-center rounded-lg border border-slate-200 bg-white">
        <LoadingSpinner />
      </div>
    );
  }

  if (errorMessage || !project) {
    return (
      <section className="flex min-h-96 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-center shadow-sm">
        <FolderKanban size={28} className="text-slate-400" />
        <h1 className="mt-4 text-xl font-black text-slate-950">
          Project not found
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {errorMessage || "This project is not available for your account."}
        </p>
        <button
          type="button"
          onClick={() => navigate(ROUTES.EMPLOYEE_PROJECTS)}
          className="mt-5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
        >
          Back to Projects
        </button>
      </section>
    );
  }

  const github = project.github || {};
  const hasGithub = Boolean(github.repoUrl);
  const githubAvailable = github.available !== false;
  const latestCommit = github.latestCommit;

  return (
    <section className="h-full space-y-6 overflow-y-auto pb-8">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate(ROUTES.EMPLOYEE_PROJECTS)}
            className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-slate-950"
          >
            <ArrowLeft size={16} />
            Back to Projects
          </button>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            My Project
          </p>
          <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
            {project.projectName}
          </h1>
        </div>
        <span
          className={`w-fit rounded-full px-3 py-1 text-xs font-bold capitalize ring-1 ${
            statusBadgeClass[project.status] || statusBadgeClass.not_started
          }`}
        >
          {formatLabel(project.status)}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DetailItem label="Status" value={formatLabel(project.status)} />
        <DetailItem label="Priority" value={formatLabel(project.priority || "medium")} />
        <DetailItem label="Deadline" value={formatDate(project.deadline)} />
        <DetailItem
          label="Progress"
          value={`${project.progressPercentage ?? 0}%`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-slate-950">
              Project Details
            </h2>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">
              {project.description || "No project description available."}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold capitalize text-slate-600">
                <CalendarDays size={13} />
                {formatDate(project.startDate)} - {formatDate(project.deadline)}
              </span>
              {project.category && (
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                  {project.category}
                </span>
              )}
            </div>
          </section>

          {hasGithub && (
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-950">
                    GitHub Repository
                  </h2>
                  <p className="text-sm text-slate-500">
                    Live repository data from GitHub
                  </p>
                </div>
              </div>

              {!githubAvailable && (
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                  {github.error || "Unable to fetch GitHub data."}
                </div>
              )}

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <DetailItem label="Repository URL" value={github.repoUrl} />
                <DetailItem label="Owner" value={github.owner} />
                <DetailItem label="Repository Name" value={github.repo} />
                {github.defaultBranch && (
                  <DetailItem
                    label="Default Branch"
                    value={github.defaultBranch}
                    icon={GitBranch}
                  />
                )}
                {github.visibility && (
                  <DetailItem
                    label="Visibility"
                    value={github.visibility}
                    icon={github.visibility === "private" ? Lock : Globe}
                  />
                )}
                {github.branchCount !== undefined && (
                  <DetailItem
                    label="Branch Count"
                    value={github.branchCount}
                    icon={GitBranch}
                  />
                )}
                {github.commitCount !== undefined && (
                  <DetailItem
                    label="Total Commits"
                    value={github.commitCount}
                    icon={GitCommitHorizontal}
                  />
                )}
                {github.stars !== undefined && (
                  <DetailItem label="Stars" value={github.stars} icon={Star} />
                )}
                {github.forks !== undefined && (
                  <DetailItem
                    label="Forks"
                    value={github.forks}
                    icon={GitFork}
                  />
                )}
                {github.openIssues !== undefined && (
                  <DetailItem
                    label="Open Issues"
                    value={github.openIssues}
                    icon={AlertCircle}
                  />
                )}
              </div>

              {github.branches?.length > 0 && (
                <div className="mt-4 rounded-lg bg-slate-50 p-4 ring-1 ring-slate-200">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Branch List
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {github.branches.map((branch) => (
                      <span
                        key={branch}
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${
                          branch === github.defaultBranch
                            ? "bg-blue-50 text-blue-700 ring-blue-200"
                            : "bg-white text-slate-700 ring-slate-200"
                        }`}
                      >
                        {branch}
                        {branch === github.defaultBranch && (
                          <span className="ml-1 text-blue-500">(default)</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {latestCommit && (
                <div className="mt-5 rounded-lg bg-slate-50 p-4 ring-1 ring-slate-200">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Latest Commit
                  </p>
                  <div className="mt-3 space-y-2">
                    <div>
                      <p className="text-sm font-black text-slate-950">
                        {latestCommit.message}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        SHA: {latestCommit.sha?.substring(0, 7)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-600">
                      <span>Author: {latestCommit.author}</span>
                      <span>Date: {formatDateTime(latestCommit.date)}</span>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {project.notes && (
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-black text-slate-950">
                Project Notes
              </h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {project.notes}
              </p>
            </section>
          )}
        </div>

        <aside className="space-y-5">
          {project.assignedTeams?.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-black text-slate-950">
                Assigned Teams
              </h3>
              <div className="mt-3 space-y-2">
                {project.assignedTeams.map((team) => (
                  <div
                    key={team._id}
                    className="rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-200"
                  >
                    <p className="text-sm font-bold text-slate-950">
                      {team.teamName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {team.members?.length || 0} members
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {project.assignedTeam?.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-black text-slate-950">
                Assigned Users
              </h3>
              <div className="mt-3 space-y-2">
                {project.assignedTeam.map((member) => (
                  <div
                    key={member._id}
                    className="rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-200"
                  >
                    <p className="text-sm font-bold text-slate-950">
                      {member.name}
                    </p>
                    {member.email && (
                      <p className="text-xs text-slate-500">{member.email}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-black text-slate-950">
              Project Timeline
            </h3>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-600">Start Date</span>
                <span className="font-black text-slate-950">
                  {formatDate(project.startDate)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-600">Deadline</span>
                <span className="font-black text-slate-950">
                  {formatDate(project.deadline)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-600">Created</span>
                <span className="font-black text-slate-950">
                  {formatDate(project.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default EmployeeProjectDetails;
