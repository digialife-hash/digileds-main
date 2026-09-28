import React, { useState } from "react";
import { X, SlidersHorizontal, Loader2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { adjustCommissionApi } from "../../services/commissionService";

const ADJUSTMENT_TYPES = ["Increase", "Reduce", "Bonus", "Penalty", "Correction"];

const CommissionAdjustmentModal = ({
  isOpen,
  onClose,
  commission,
  onSuccess,
}) => {
  const [adjustmentType, setAdjustmentType] = useState("Bonus");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !commission) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid positive adjustment amount");
      return;
    }
    if (!reason.trim()) {
      toast.error("Adjustment reason/remarks is required");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await adjustCommissionApi(commission._id, {
        adjustmentType,
        amount: Number(amount),
        reason: reason.trim(),
      });

      if (res.success) {
        toast.success(`Commission adjusted (${adjustmentType}) successfully!`);
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(res.message || "Failed to adjust commission");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to adjust commission");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-white shadow-md shadow-orange-500/20">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Manual Commission Adjustment
              </h2>
              <p className="text-xs text-slate-500">
                {commission.commissionId} – Current Net: ₹{commission.netCommission}
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
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Adjustment Type <span className="text-rose-500">*</span>
            </label>
            <select
              value={adjustmentType}
              onChange={(e) => setAdjustmentType(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-semibold text-slate-900 focus:border-orange-600 focus:outline-hidden"
            >
              {ADJUSTMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Adjustment Amount (₹) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 1000"
              min="1"
              required
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-semibold text-slate-900 focus:border-orange-600 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Reason / Remarks <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows="3"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Mandatory reason for this commission adjustment..."
              required
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-orange-600 focus:outline-hidden"
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
              className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-orange-500/20 hover:bg-orange-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Apply Adjustment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommissionAdjustmentModal;
