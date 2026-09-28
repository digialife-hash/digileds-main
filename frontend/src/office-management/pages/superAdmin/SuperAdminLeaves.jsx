import { useEffect, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  UserCheck,
  X,
  XCircle,
} from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import PageBackButton from "../../components/common/PageBackButton";
import {
  getAllLeavesApi,
  updateLeaveStatusApi,
} from "../../services/leaveService";

const leaveTypeBadges = {
  casual: "bg-blue-50 text-blue-700 ring-blue-100",
  sick: "bg-purple-50 text-purple-700 ring-purple-100",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  unpaid: "bg-amber-50 text-amber-700 ring-amber-100",
  emergency: "bg-rose-50 text-rose-700 ring-rose-100",
};

const statusBadges = {
  pending: "bg-amber-50 text-amber-700 ring-amber-100",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  rejected: "bg-rose-50 text-rose-700 ring-rose-100",
  cancelled: "bg-slate-100 text-slate-600 ring-slate-200",
};

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
};

const SuperAdminLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState({ search: "", status: "", leaveType: "", startDate: "", endDate: "" });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [modal, setModal] = useState({ isOpen: false, leave: null, status: "approved", remarks: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLeaves = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const res = await getAllLeavesApi({
        page,
        limit: pagination.limit,
        search: filters.search || undefined,
        status: filters.status || undefined,
        leaveType: filters.leaveType || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      });

      setLeaves(res.data.leaves || []);
      setPagination(res.data.pagination || pagination);
    } catch (err) {
      setErrorMessage(err.message || "Failed to load leave requests");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [page, filters]);

  const handleOpenActionModal = (leave, actionStatus) => {
    setModal({
      isOpen: true,
      leave,
      status: actionStatus,
      remarks: "",
    });
  };

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!modal.leave) return;

    try {
      setIsSubmitting(true);
      await updateLeaveStatusApi(modal.leave._id, {
        status: modal.status,
        adminRemarks: modal.remarks,
      });

      setSuccessMessage(`Leave request ${modal.status} successfully`);
      setTimeout(() => setSuccessMessage(""), 4000);
      setModal({ isOpen: false, leave: null, status: "approved", remarks: "" });
      fetchLeaves();
    } catch (err) {
      setErrorMessage(err.message || "Failed to update leave status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingCount = leaves.filter((l) => l.status === "pending").length;
  const approvedCount = leaves.filter((l) => l.status === "approved").length;
  const rejectedCount = leaves.filter((l) => l.status === "rejected").length;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <PageBackButton />
            <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">
              Leave Management
            </h1>
          </div>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Review and manage employee leave applications and attendance sync.
          </p>
        </div>
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-700">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-700">
          {successMessage}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-xs">
          <div>
            <p className="text-xs font-extrabold text-amber-700 uppercase tracking-wider">
              Pending Requests
            </p>
            <h3 className="mt-2 text-3xl font-black text-amber-950">
              {pendingCount}
            </h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <Clock size={24} />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-xs">
          <div>
            <p className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider">
              Approved
            </p>
            <h3 className="mt-2 text-3xl font-black text-emerald-950">
              {approvedCount}
            </h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50/50 p-5 shadow-xs">
          <div>
            <p className="text-xs font-extrabold text-rose-700 uppercase tracking-wider">
              Rejected
            </p>
            <h3 className="mt-2 text-3xl font-black text-rose-950">
              {rejectedCount}
            </h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
            <XCircle size={24} />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search employee or reason..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden"
          />
        </div>

        <select
          value={filters.status}
          onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
          className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-slate-800 focus:border-blue-600 focus:outline-hidden"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={filters.leaveType}
          onChange={(e) => setFilters((prev) => ({ ...prev, leaveType: e.target.value }))}
          className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-slate-800 focus:border-blue-600 focus:outline-hidden"
        >
          <option value="">All Leave Types</option>
          <option value="casual">Casual Leave</option>
          <option value="sick">Sick Leave</option>
          <option value="paid">Paid Leave</option>
          <option value="unpaid">Unpaid Leave</option>
          <option value="emergency">Emergency Leave</option>
        </select>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : leaves.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Calendar className="h-12 w-12 text-slate-300" />
            <p className="mt-3 text-base font-extrabold text-slate-700">
              No leave requests found
            </p>
            <p className="text-xs font-semibold text-slate-400">
              Adjust your search or filter options.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-slate-700">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-4">Employee</th>
                  <th className="px-5 py-4">Type</th>
                  <th className="px-5 py-4">Duration</th>
                  <th className="px-5 py-4">Days</th>
                  <th className="px-5 py-4">Reason</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {leaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-extrabold text-slate-900">
                          {leave.employeeName}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {leave.employeeEmail}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-extrabold capitalize ring-1 ${
                          leaveTypeBadges[leave.leaveType] || "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {leave.leaveType}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-900 whitespace-nowrap">
                      {formatDate(leave.fromDate)} → {formatDate(leave.toDate)}
                    </td>
                    <td className="px-5 py-4 font-black text-slate-900">
                      {leave.numberOfDays} {leave.numberOfDays === 1 ? "day" : "days"}
                    </td>
                    <td className="px-5 py-4 max-w-xs truncate" title={leave.reason}>
                      {leave.reason}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-extrabold capitalize ring-1 ${
                          statusBadges[leave.status] || "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {leave.status === "pending" ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenActionModal(leave, "approved")}
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-xs hover:bg-emerald-700"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenActionModal(leave, "rejected")}
                            className="rounded-lg bg-rose-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-xs hover:bg-rose-700"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase">
                          {leave.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Approve/Reject Modal */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h3 className="text-lg font-black text-slate-900 capitalize">
                {modal.status} Leave Request
              </h3>
              <button
                type="button"
                onClick={() => setModal({ isOpen: false, leave: null, status: "approved", remarks: "" })}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleActionSubmit} className="mt-4 space-y-4">
              <div>
                <p className="text-xs font-extrabold text-slate-500">Employee</p>
                <p className="text-sm font-black text-slate-900">{modal.leave?.employeeName}</p>
              </div>

              <div>
                <p className="text-xs font-extrabold text-slate-500">Leave Period</p>
                <p className="text-xs font-bold text-slate-800">
                  {formatDate(modal.leave?.fromDate)} to {formatDate(modal.leave?.toDate)} ({modal.leave?.numberOfDays} days)
                </p>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700">
                  Admin Remarks / Notes
                </label>
                <textarea
                  rows={3}
                  value={modal.remarks}
                  onChange={(e) => setModal((prev) => ({ ...prev, remarks: e.target.value }))}
                  placeholder="Enter remarks for the employee..."
                  className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModal({ isOpen: false, leave: null, status: "approved", remarks: "" })}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`rounded-xl px-5 py-2 text-xs font-extrabold text-white shadow-xs ${
                    modal.status === "approved" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  {isSubmitting ? "Processing..." : `Confirm ${modal.status}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminLeaves;
