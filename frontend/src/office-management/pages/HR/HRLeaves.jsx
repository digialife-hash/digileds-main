import { useCallback, useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import API from "../../api/axiosInstance";
import { useAuth } from "../../context/authStore";
import { hasHRPermission } from "../../utils/canShowMenu";
import { Cell, EmptyState, ErrorState, formatDate, LoadingState, PageHeader, Panel, StatusBadge, Table } from "./HRUi";

const HRLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const canApprove = hasHRPermission(user, "leaves", "approve");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await API.get("/hr/leaves", { params: { status, limit: 50 } });
      setLeaves(response.data.data || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Leave requests could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { void load(); }, [load]);

  const update = async (id, action) => {
    try {
      await API.patch(`/hr/leaves/${id}/${action}`, { remarks: `${action === "approve" ? "Approved" : "Rejected"} by HR` });
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Leave request could not be updated.");
    }
  };

  return (
    <section className="space-y-6">
      <PageHeader title="Leave Management" description="Review employee leave requests and record decisions with a clear audit trail." />
      <Panel><select value={status} onChange={(event) => setStatus(event.target.value)} className="field-input max-w-xs"><option value="">All statuses</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="cancelled">Cancelled</option></select></Panel>
      {loading && <LoadingState label="Loading leave requests..." />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && <Panel title={`${leaves.length} requests`} >{!leaves.length ? <EmptyState label="No leave requests for this filter." /> : <Table headers={["Employee", "Type", "Dates", "Days", "Status", "Action"]}>{leaves.map((leave) => <tr key={leave._id} className="hover:bg-slate-50"><Cell><div className="font-bold text-slate-950">{leave.employeeName || leave.employeeId?.name || "Unknown"}</div><div className="text-xs text-slate-400">{leave.employeeEmail || leave.employeeId?.email || ""}</div></Cell><Cell className="capitalize">{leave.leaveType || "—"}</Cell><Cell>{formatDate(leave.fromDate)} – {formatDate(leave.toDate)}</Cell><Cell>{leave.numberOfDays || "—"}</Cell><Cell><StatusBadge value={leave.status} /></Cell><Cell>{leave.status === "pending" && canApprove ? <div className="flex gap-2"><button type="button" onClick={() => update(leave._id, "approve")} className="rounded-lg bg-emerald-50 p-2 text-emerald-700 hover:bg-emerald-100" title="Approve"><Check size={15} /></button><button type="button" onClick={() => update(leave._id, "reject")} className="rounded-lg bg-rose-50 p-2 text-rose-700 hover:bg-rose-100" title="Reject"><X size={15} /></button></div> : "—"}</Cell></tr>)}</Table>}</Panel>}
    </section>
  );
};

export default HRLeaves;
