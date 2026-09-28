import { useCallback, useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import API from "../../api/axiosInstance";
import { Cell, EmptyState, ErrorState, formatCurrency, LoadingState, PageHeader, Panel, StatCard, StatusBadge, Table } from "./HRUi";

const HRPayroll = () => {
  const now = new Date();
  const [period, setPeriod] = useState({ month: now.getMonth() + 1, year: now.getFullYear() });
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [payrollResponse, statsResponse] = await Promise.all([
        API.get("/hr/payroll", { params: { ...period, limit: 100 } }),
        API.get("/hr/payroll/stats", { params: period }),
      ]);
      setRecords(payrollResponse.data.data || []);
      setStats(statsResponse.data.data || null);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Payroll data could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { void load(); }, [load]);

  return (
    <section className="space-y-6">
      <PageHeader title="Payroll & Salary" description="Review monthly salary records, deductions, payments and employee salary slips." />
      <Panel>
        <div className="flex flex-wrap gap-3">
          <select value={period.month} onChange={(event) => setPeriod({ ...period, month: Number(event.target.value) })} className="field-input w-full sm:w-44">{Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>{new Date(2020, index, 1).toLocaleString("en-IN", { month: "long" })}</option>)}</select>
          <select value={period.year} onChange={(event) => setPeriod({ ...period, year: Number(event.target.value) })} className="field-input w-full sm:w-32">{[period.year - 1, period.year, period.year + 1].map((year) => <option key={year} value={year}>{year}</option>)}</select>
        </div>
      </Panel>
      {loading && <LoadingState label="Loading payroll records..." />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && <>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Net payroll" value={formatCurrency(stats?.totalPayroll)} icon={Wallet} />
          <StatCard label="Total earnings" value={formatCurrency(stats?.totalEarnings)} icon={Wallet} tone="emerald" />
          <StatCard label="Deductions" value={formatCurrency(stats?.totalDeductions)} icon={Wallet} tone="rose" />
          <StatCard label="Payroll records" value={stats?.recordCount || records.length} icon={Wallet} tone="violet" />
        </div>
        <Panel title={`${records.length} payroll records`}>{!records.length ? <EmptyState label="No payroll records for this period." /> : <Table headers={["Employee", "Basic salary", "Bonus", "Deduction", "Net salary", "Payment"]}>{records.map((record) => <tr key={record._id} className="hover:bg-slate-50"><Cell><div className="font-bold text-slate-950">{record.employeeId?.name || "Unknown employee"}</div><div className="text-xs text-slate-400">{record.employeeId?.department || ""}</div></Cell><Cell>{formatCurrency(record.basicSalary)}</Cell><Cell>{formatCurrency(record.bonus)}</Cell><Cell>{formatCurrency(record.deduction)}</Cell><Cell className="font-black text-slate-950">{formatCurrency(record.netSalary)}</Cell><Cell><StatusBadge value={record.paymentStatus} /></Cell></tr>)}</Table>}</Panel>
      </>}
    </section>
  );
};

export default HRPayroll;
