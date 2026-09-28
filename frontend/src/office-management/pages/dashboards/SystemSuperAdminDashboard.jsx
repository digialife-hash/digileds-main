import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, RefreshCcw, ShieldCheck, Users, UserCog, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { getSuperAdminDashboardSummary } from "../../services/superAdminDashboardService";
import { ROUTES } from "../../routes/routeConstants";

const SystemSuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getSuperAdminDashboardSummary();
      setSummary(response.data);
    } catch (requestError) {
      if (requestError.status === 401) {
        navigate(ROUTES.LOGIN, { replace: true });
        return;
      }
      if (requestError.status === 403) {
        navigate(ROUTES.UNAUTHORIZED, { replace: true });
        return;
      }
      setError(requestError.message || "Unable to load system overview");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  const cards = useMemo(() => {
    const values = summary?.cards || {};
    return [
      ["Total clients", values.totalClients, Users],
      ["Total employees", values.totalEmployees, UserCog],
      ["Total projects", values.totalProjects, Activity],
      ["Open service requests", values.openServiceRequests, ShieldCheck],
    ];
  }, [summary]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            System administration
          </p>
          <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
            Super Admin Dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Highest-level system overview using live application data.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadSummary()}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <RefreshCcw size={16} />
          Refresh
        </button>
      </div>

      {loading && (
        <div className="flex min-h-64 items-center justify-center rounded-lg border border-slate-200 bg-white">
          <LoadingSpinner />
        </div>
      )}

      {!loading && error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm font-medium text-red-700">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(([label, value, Icon]) => (
            <div key={label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-500">{label}</p>
                <Icon className="text-blue-600" size={20} />
              </div>
              <p className="mt-4 text-3xl font-black text-slate-950">{value ?? 0}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default SystemSuperAdminDashboard;
