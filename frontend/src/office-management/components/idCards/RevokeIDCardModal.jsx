import React, { useState } from "react";
import { X, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { revokeIDCardApi } from "../../services/idCardService";

const REVOCATION_REASONS = [
  "Partner Left",
  "Suspended",
  "Expired",
  "Misuse",
  "Duplicate",
  "Other",
];

const RevokeIDCardModal = ({ isOpen, onClose, idCard, onSuccess }) => {
  const [reason, setReason] = useState("Partner Left");
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !idCard) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!remarks.trim()) {
      toast.error("Revocation remarks/audit notes are required");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await revokeIDCardApi(idCard._id, {
        reason,
        remarks: remarks.trim(),
      });

      if (res.success) {
        toast.success(`ID Card ${idCard.cardNumber} revoked successfully`);
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(res.message || "Failed to revoke ID Card");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to revoke ID Card");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white shadow-md shadow-rose-500/20">
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Revoke ID Card
              </h2>
              <p className="text-xs text-slate-500">
                {idCard.cardNumber} – {idCard.partnerName}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex items-center gap-2 rounded-2xl bg-rose-50 p-3.5 border border-rose-200 text-xs text-rose-800 font-semibold">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
            <span>
              Revoking this ID card will immediately render its QR verification code invalid!
            </span>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Revocation Reason <span className="text-rose-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-rose-600 focus:outline-hidden"
            >
              {REVOCATION_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Revocation Remarks / Audit Notes <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows="3"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Mandatory reason for revoking this ID card..."
              required
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-rose-600 focus:outline-hidden"
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
              className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-500/20 hover:bg-rose-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <span>Confirm Revocation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RevokeIDCardModal;
