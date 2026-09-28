import React, { useState } from "react";
import { X, RefreshCw, Loader2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { updateReferralStatusApi } from "../../services/referralClientService";
import ReferralStatusBadge from "./ReferralStatusBadge";

const STATUSES = [
  "New",
  "Assigned",
  "Contacted",
  "Interested",
  "Follow Up",
  "Negotiation",
  "Converted",
  "Lost",
  "Cancelled",
];

const ReferralStatusChangeModal = ({
  isOpen,
  onClose,
  referral,
  onSuccess,
}) => {
  const [status, setStatus] = useState(referral?.status || "New");
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !referral) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (status === referral.status) {
      toast.error("Please select a different status");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await updateReferralStatusApi(referral._id, {
        status,
        remarks,
      });

      if (res.success) {
        toast.success(`Status changed to ${status}`);
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(res.message || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white shadow-md shadow-purple-500/20">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Update Referral Status
              </h2>
              <p className="text-xs text-slate-500">
                {referral.referralId} – {referral.clientName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">
              Current Status
            </label>
            <ReferralStatusBadge status={referral.status} />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              New Status <span className="text-rose-500">*</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
            >
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Remarks / Reason
            </label>
            <textarea
              rows="3"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add details or notes regarding this status transition..."
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-purple-500/20 hover:bg-purple-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Save Status</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReferralStatusChangeModal;
