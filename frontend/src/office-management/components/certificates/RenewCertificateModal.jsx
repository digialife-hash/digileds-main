import React, { useState, useEffect } from "react";
import { X, RefreshCw, Loader2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  renewCertificateApi,
  getCertificateTypesApi,
} from "../../services/certificateService";

const RenewCertificateModal = ({
  isOpen,
  onClose,
  certificate,
  onSuccess,
}) => {
  const defaultExp = new Date();
  defaultExp.setFullYear(defaultExp.getFullYear() + 1);
  const [newExpiryDate, setNewExpiryDate] = useState(
    defaultExp.toISOString().split("T")[0]
  );
  const [updatedType, setUpdatedType] = useState(
    certificate?.certificateType || ""
  );
  const [remarks, setRemarks] = useState("");
  const [types, setTypes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTypes();
    }
  }, [isOpen]);

  const fetchTypes = async () => {
    try {
      const res = await getCertificateTypesApi();
      if (res.success && res.data?.types) {
        setTypes(res.data.types);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen || !certificate) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      const res = await renewCertificateApi(certificate._id, {
        newExpiryDate,
        updatedType,
        remarks,
      });

      if (res.success) {
        toast.success("Certificate renewed successfully!");
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(res.message || "Failed to renew Certificate");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to renew Certificate");
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
                Renew Certificate Validity
              </h2>
              <p className="text-xs text-slate-500">
                {certificate.certificateNumber} – {certificate.partnerName}
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
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              New Expiry Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={newExpiryDate}
              onChange={(e) => setNewExpiryDate(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-purple-600 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Update Category / Tier Type
            </label>
            <select
              value={updatedType}
              onChange={(e) => setUpdatedType(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-purple-600 focus:outline-hidden"
            >
              {types.map((t) => (
                <option key={t.name} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Renewal Remarks
            </label>
            <textarea
              rows="3"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Audit notes / reason for renewal..."
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium"
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
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              <span>Confirm Renewal</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RenewCertificateModal;
