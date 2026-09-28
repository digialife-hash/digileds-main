import { useEffect, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Send,
  X,
  XCircle,
} from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import PageBackButton from "../../components/common/PageBackButton";
import {
  applyLeaveApi,
  cancelMyLeaveApi,
  getMyLeavesApi,
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

const EmployeeLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: "casual",
    fromDate: "",
    toDate: "",
    reason: "",
  });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMyLeaves = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const res = await getMyLeavesApi();
      setLeaves(res.data.leaves || []);
      setPagination(res.data.pagination || pagination);
    } catch (err) {
      setErrorMessage(err.message || "Failed to fetch leave history");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.fromDate || !formData.toDate) {
      setFormError("From date and To date are required");
      return;
    }

    if (!formData.reason.trim()) {
      setFormError("Please enter a valid reason for your leave");
      return;
    }

    const start = new Date(formData.fromDate);
    const end = new Date(formData.toDate);
    if (end < start) {
      setFormError("End date cannot be before start date");
      return;
    }

    try {
      setIsSubmitting(true);
      await applyLeaveApi(formData);
      setSuccessMessage("Leave request submitted successfully");
      setTimeout(() => setSuccessMessage(""), 4000);
      setIsApplyModalOpen(false);
      setFormData({ leaveType: "casual", fromDate: "", toDate: "", reason: "" });
      fetchMyLeaves();
    } catch (err) {
      setFormError(err.message || "Failed to submit leave request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelLeave = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this leave request?")) return;
    try {
      await cancelMyLeaveApi(id);
      setSuccessMessage("Leave request cancelled");
      setTimeout(() => setSuccessMessage(""), 4000);
      fetchMyLeaves();
    } catch (err) {
      setErrorMessage(err.message || "Failed to cancel leave");
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <PageBackButton />
            <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">
              My Leave Portal
            </h1>
          </div>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Apply for leave, check leave approval status, and review history.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsApplyModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-blue-700"
        >
          <Plus size={16} />
          Apply for Leave
        </button>
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
              No leave applications found
            </p>
            <p className="text-xs font-semibold text-slate-400">
              Click "Apply for Leave" above to submit a new request.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-slate-700">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-4">Applied Date</th>
                  <th className="px-5 py-4">Leave Type</th>
                  <th className="px-5 py-4">Dates</th>
                  <th className="px-5 py-4">Days</th>
                  <th className="px-5 py-4">Reason</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {leaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-4 text-slate-500 font-medium">
                      {formatDate(leave.appliedDate)}
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
                      {leave.status === "pending" && (
                        <button
                          type="button"
                          onClick={() => handleCancelLeave(leave._id)}
                          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-100"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h3 className="text-lg font-black text-slate-900">
                Submit Leave Application
              </h3>
              <button
                type="button"
                onClick={() => setIsApplyModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleApplySubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700">
                  Leave Type
                </label>
                <select
                  value={formData.leaveType}
                  onChange={(e) => setFormData((prev) => ({ ...prev, leaveType: e.target.value }))}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                >
                  <option value="casual">Casual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="paid">Paid Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                  <option value="emergency">Emergency Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={formData.fromDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, fromDate: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={formData.toDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, toDate: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700">
                  Reason for Leave
                </label>
                <textarea
                  rows={3}
                  value={formData.reason}
                  onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
                  placeholder="Explain why you are taking leave..."
                  className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-extrabold text-white shadow-xs hover:bg-blue-700"
                >
                  <Send size={14} />
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeLeaves;
