import { useCallback, useEffect, useState } from "react";
import API from "../../api/axiosInstance";
import { Cell, EmptyState, ErrorState, formatDate, LoadingState, PageHeader, Panel, StatusBadge, Table } from "./HRUi";

const HRAttendance = () => {
  const [records, setRecords] = useState([]);
  const [filters, setFilters] = useState({ startDate: "", endDate: "", status: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await API.get("/hr/attendance", { params: { ...filters, limit: 100 } });
      setRecords(response.data.data || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Attendance data could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { void load(); }, [load]);

  return (
    <section className="space-y-6">
      <PageHeader title="Attendance" description="Monitor daily presence, working hours, overtime and attendance exceptions." />
      <Panel>
        <div className="grid gap-3 sm:grid-cols-3">
          <input type="date" value={filters.startDate} onChange={(event) => setFilters({ ...filters, startDate: event.target.value })} className="field-input" />
          <input type="date" value={filters.endDate} onChange={(event) => setFilters({ ...filters, endDate: event.target.value })} className="field-input" />
          <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })} className="field-input"><option value="">All statuses</option><option value="present">Present</option><option value="absent">Absent</option><option value="half_day">Half day</option></select>
        </div>
      </Panel>
      {loading && <LoadingState label="Loading attendance records..." />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && <Panel title={`${records.length} attendance records`}>{!records.length ? <EmptyState label="No attendance records for this period." /> : <Table headers={["Date", "Employee", "Check in", "Check out", "Hours", "Status"]}>{records.map((record) => <tr key={record._id} className="hover:bg-slate-50"><Cell>{formatDate(record.date)}</Cell><Cell><div className="font-bold text-slate-950">{record.employeeName || record.employeeId?.name || "Unknown"}</div><div className="text-xs text-slate-400">{record.employeeEmail || record.employeeId?.email || ""}</div></Cell><Cell>{record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}</Cell><Cell>{record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}</Cell><Cell>{record.totalWorkingHours || 0}h</Cell><Cell><StatusBadge value={record.attendanceStatus} /></Cell></tr>)}</Table>}</Panel>}
    </section>
  );
};

export default HRAttendance;
