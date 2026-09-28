import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  CheckSquare,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import PageBackButton from "../../components/common/PageBackButton";
import { useAuth } from "../../context/authStore";
import { ROUTES } from "../../routes/routeConstants";
import { getEmployeeDashboardSummary } from "../../services/employeeDashboardService";

const formatLabel = (value = "") => value.replaceAll("_", " ");

const DetailItem = ({ label, value, icon: Icon }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
      {Icon && <Icon size={14} />}
      {label}
    </div>
    <p className="mt-2 break-words text-sm font-black text-slate-950">
      {value || "Not provided"}
    </p>
  </div>
);

const EmployeeProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchProfileSummary = async () => {
    try {
      setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchProfileSummary();
  }, []);

  const cards = summary?.cards || {};

  return (
    <section className="h-full space-y-6 overflow-y-auto pb-8">
      <PageBackButton fallbackPath={ROUTES.EMPLOYEE_DASHBOARD} />
      <div className="border-b border-slate-200 pb-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          My Account
        </p>
        <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
          Profile
        </h1>
      </div>

      {isLoading ? (
        <div className="flex min-h-96 items-center justify-center rounded-lg border border-slate-200 bg-white">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {errorMessage && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {errorMessage}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DetailItem label="Name" value={user?.name} icon={UserRound} />
            <DetailItem label="Email" value={user?.email} icon={Mail} />
            <DetailItem label="Phone" value={user?.phone} icon={Phone} />
            <DetailItem
              label="Role"
              value={formatLabel(user?.role || "employee")}
              icon={ShieldCheck}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-black text-slate-950">
                <BriefcaseBusiness size={18} />
                Assigned Projects
              </div>
              <p className="mt-4 text-3xl font-black text-slate-950">
                {cards.assignedProjectsCount || 0}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-black text-slate-950">
                <CheckSquare size={18} />
                Assigned Tasks
              </div>
              <p className="mt-4 text-3xl font-black text-slate-950">
                {cards.totalAssignedTasks || 0}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-slate-950">
              Personal Details
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <DetailItem label="Account Status" value={formatLabel(user?.status)} />
              <DetailItem
                label="Last Login"
                value={
                  user?.lastLogin
                    ? new Intl.DateTimeFormat("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(new Date(user.lastLogin))
                    : "Not available"
                }
              />
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default EmployeeProfile;
