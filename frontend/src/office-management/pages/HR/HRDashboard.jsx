import { useCallback, useEffect, useState } from "react";
import { CalendarCheck, CalendarDays, ClipboardList, RefreshCcw, Users, Wallet } from "lucide-react";
import API from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes/routeConstants";
import { EmptyState, ErrorState, formatDate, LoadingState, PageHeader, Panel, StatCard, StatusBadge, Table, Cell } from "./HRUi";

const HRDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await API.get("/hr/dashboard");
      setData(response.data.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Dashboard data could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (loading) return <LoadingState label="Loading HR dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const actions = [
    ["Employees", ROUTES.HR_EMPLOYEES, Users],
    ["Attendance", ROUTES.HR_ATTENDANCE, CalendarCheck],
    ["Leave requests", ROUTES.HR_LEAVES, CalendarDays],
    ["Payroll", ROUTES.HR_PAYROLL, Wallet],
  ];

  return (
    <section className="space-y-6">
      <PageHeader
        title="HR Dashboard"
        description="A live overview of people operations, attendance, leave and payroll."
        action={<button type="button" onClick={() => load()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"><RefreshCcw size={16} /> Refresh</button>}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total employees" value={data?.totalEmployees || 0} icon={Users} />
        <StatCard label="Active employees" value={data?.activeEmployees || 0} icon={Users} tone="emerald" />
        <StatCard label="On approved leave" value={data?.onLeave || 0} icon={CalendarDays} tone="amber" />
        <StatCard label="Pending requests" value={data?.pendingLeaves || 0} icon={ClipboardList} tone="violet" />
        <StatCard label="Attendance rate" value={`${data?.attendanceRate || 0}%`} icon={CalendarCheck} tone="rose" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map(([label, path, Icon]) => <button key={label} type="button" onClick={() => navigate(path)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"><Icon size={17} />{label}</button>)}
      </div>
      <Panel title="Recent leave activity" description="Latest requests that need HR visibility.">
        {!data?.recentLeaves?.length ? <EmptyState label="No recent leave requests." /> : (
          <Table headers={["Employee", "Leave type", "Dates", "Status"]}>
            {data.recentLeaves.map((leave) => <tr key={leave._id} className="hover:bg-slate-50"><Cell>{leave.employeeId?.name || leave.employeeName || "Unknown employee"}</Cell><Cell>{leave.leaveType || "—"}</Cell><Cell>{formatDate(leave.fromDate)} – {formatDate(leave.toDate)}</Cell><Cell><StatusBadge value={leave.status} /></Cell></tr>)}
          </Table>
        )}
      </Panel>
    </section>
  );
};

export default HRDashboard;
