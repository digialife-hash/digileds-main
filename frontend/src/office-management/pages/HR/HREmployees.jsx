import { useCallback, useEffect, useState } from "react";
import { Search, Users } from "lucide-react";
import API from "../../api/axiosInstance";
import { Cell, EmptyState, ErrorState, formatDate, LoadingState, PageHeader, Panel, StatusBadge, Table } from "./HRUi";

const HREmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({ search: "", status: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await API.get("/hr/employees", { params: { ...filters, limit: 50 } });
      setEmployees(response.data.data || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Employee data could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 250);
    return () => clearTimeout(timer);
  }, [load]);

  return (
    <section className="space-y-6">
      <PageHeader title="Employee Directory" description="Search, review and maintain the complete employee record." />
      <Panel>
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
          <label className="relative block"><Search size={17} className="pointer-events-none absolute left-3 top-3 text-slate-400" /><input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Search name, email or phone..." className="field-input pl-10" /></label>
          <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })} className="field-input"><option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="terminated">Terminated</option><option value="resigned">Resigned</option></select>
        </div>
      </Panel>
      {loading && <LoadingState label="Loading employee directory..." />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && <Panel title={`${employees.length} employees`} action={<Users size={19} className="text-blue-600" />}>{!employees.length ? <EmptyState label="No employees match your filters." /> : <Table headers={["Employee", "Department", "Designation", "Joining date", "Status"]}>{employees.map((employee) => <tr key={employee._id} className="hover:bg-slate-50"><Cell><div className="font-bold text-slate-950">{employee.name}</div><div className="text-xs text-slate-400">{employee.email}</div></Cell><Cell>{employee.department || "—"}</Cell><Cell>{employee.designation || "—"}</Cell><Cell>{formatDate(employee.joiningDate)}</Cell><Cell><StatusBadge value={employee.status} /></Cell></tr>)}</Table>}</Panel>}
    </section>
  );
};

export default HREmployees;
