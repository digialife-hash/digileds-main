import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  FileUp,
  FolderKanban,
  Mail,
  RefreshCcw,
  Send,
} from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { ROUTES } from "../../routes/routeConstants";
import { getClientDashboardSummary } from "../../services/clientDashboardService";

const statusClass = {
  submitted: "bg-slate-100 text-slate-700 ring-slate-200",
  reviewed: "bg-blue-50 text-blue-700 ring-blue-100",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  in_progress: "bg-blue-50 text-blue-700 ring-blue-100",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  closed: "bg-slate-100 text-slate-700 ring-slate-200",
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

const EmptyState = ({ icon: Icon, title }) => (
  <div className="flex min-h-36 flex-col items-center justify-center rounded-lg bg-slate-50 px-5 py-8 text-center">
    <Icon size={24} className="text-slate-400" />
    <p className="mt-3 text-sm font-bold text-slate-700">{title}</p>
  </div>
);

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchDashboard = async ({ silent = false } = {}) => {
    try {
      if (!silent) setIsLoading(true);
      setErrorMessage("");
      const result = await getClientDashboardSummary();
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
      ["Total Requests", cards.totalRequests || 0, Send, "text-cyan-700 bg-cyan-50 ring-cyan-100"],
      ["Open Requests", cards.openRequests || 0, Clock3, "text-amber-700 bg-amber-50 ring-amber-100"],
      ["Total Projects", cards.totalProjects || 0, FolderKanban, "text-blue-700 bg-blue-50 ring-blue-100"],
      ["Completed Projects", cards.completedProjects || 0, CheckCircle2, "text-emerald-700 bg-emerald-50 ring-emerald-100"],
      ["Uploaded Files", cards.uploadedDocuments || 0, FileUp, "text-violet-700 bg-violet-50 ring-violet-100"],
    ];
  }, [summary]);

  const quickActions = [
    { label: "Submit Service Request", path: ROUTES.CLIENT_SUBMIT_SERVICE, icon: Send },
    { label: "View My Projects", path: ROUTES.CLIENT_PROJECTS, icon: FolderKanban },
    { label: "Upload File", icon: FileUp, comingSoon: true },
    { label: "Contact Support", icon: Mail, comingSoon: true },
  ];

  return (
    <section className="h-full space-y-6 overflow-y-auto pb-8">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Client Workspace</p>
          <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">Client Dashboard</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">Submit service details and track your project history.</p>
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
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
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
            {quickActions.map(({ label, path, icon: Icon, comingSoon }) => (
              <button
                key={label}
                type="button"
                onClick={() => !comingSoon && navigate(path)}
                disabled={comingSoon}
                className={`inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-bold shadow-sm transition ${
                  comingSoon
                    ? "cursor-not-allowed border-amber-200 bg-amber-50 text-amber-700"
                    : "border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                <Icon size={17} />
                {label}
                {comingSoon && (
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-amber-700 ring-1 ring-amber-100">
                    Soon
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-black text-slate-950">My Active Projects</h2>
              <div className="mt-4 grid gap-4">
                {(summary?.myProjects || []).length ? summary.myProjects.map((project) => (
                  <article key={project._id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0"><h3 className="truncate font-black text-slate-950">{project.projectName}</h3><p className="mt-1 text-sm text-slate-500">Due {formatDate(project.deadline)}</p></div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${statusClass[project.status] || statusClass.submitted}`}>{formatLabel(project.status)}</span>
                    </div>
                    <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white">
                      <div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.min(Math.max(project.progressPercentage || 0, 0), 100)}%` }} />
                    </div>
                    <p className="mt-2 text-xs font-bold text-slate-500">{project.progressPercentage || 0}% complete</p>
                  </article>
                )) : <EmptyState icon={BriefcaseBusiness} title="No active projects yet" />}
              </div>
            </section>

            <div className="space-y-6">
              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-black text-slate-950">Recent Updates</h2>
                <div className="mt-4 space-y-3">
                  {(summary?.recentUpdates || []).length ? summary.recentUpdates.map((update, index) => (
                    <div key={`${update.title}-${index}`} className="rounded-lg bg-slate-50 p-3">
                      <p className="truncate text-sm font-bold text-slate-950">{update.title}</p>
                      <p className="mt-1 text-xs font-semibold capitalize text-slate-500">
                        {update.type} / {formatLabel(update.status)} / {formatDate(update.updatedAt)}
                      </p>
                    </div>
                  )) : <EmptyState icon={Clock3} title="No recent updates" />}
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-black text-slate-950">My Recent Requests</h2>
                <div className="mt-4 space-y-3">
                  {(summary?.myRequests || []).length ? summary.myRequests.map((request) => (
                    <div key={request._id} className="rounded-lg bg-slate-50 p-3">
                      <p className="truncate text-sm font-bold text-slate-950">{request.projectTitle || request.serviceRequired}</p>
                      <p className="mt-1 text-xs font-semibold capitalize text-slate-500">
                        {formatLabel(request.status)} / {formatDate(request.createdAt)}
                      </p>
                    </div>
                  )) : <EmptyState icon={Send} title="No service requests yet" />}
                </div>
              </section>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default ClientDashboard;
