import React, { useState } from "react";
import { X, RefreshCw, Upload, Loader2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { renewIDCardApi } from "../../services/idCardService";

const RenewIDCardModal = ({ isOpen, onClose, idCard, onSuccess }) => {
  const defaultExp = new Date();
  defaultExp.setFullYear(defaultExp.getFullYear() + 1);
  const [newExpiryDate, setNewExpiryDate] = useState(
    defaultExp.toISOString().split("T")[0]
  );
  const [updatedDesignation, setUpdatedDesignation] = useState(
    idCard?.designation || ""
  );
  const [updatedEmergencyContact, setUpdatedEmergencyContact] = useState(
    idCard?.emergencyContact || ""
  );
  const [remarks, setRemarks] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !idCard) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("newExpiryDate", newExpiryDate);
      formData.append("updatedDesignation", updatedDesignation);
      formData.append("updatedEmergencyContact", updatedEmergencyContact);
      formData.append("remarks", remarks);
      if (photoFile) formData.append("partnerPhoto", photoFile);

      const res = await renewIDCardApi(idCard._id, formData);
      if (res.success) {
        toast.success("ID Card renewed successfully!");
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(res.message || "Failed to renew ID Card");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to renew ID Card");
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
                Renew ID Card Validity
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
              Update Designation
            </label>
            <input
              type="text"
              value={updatedDesignation}
              onChange={(e) => setUpdatedDesignation(e.target.value)}
              placeholder="e.g. Senior Partner"
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-purple-600 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Update Emergency Contact
            </label>
            <input
              type="text"
              value={updatedEmergencyContact}
              onChange={(e) => setUpdatedEmergencyContact(e.target.value)}
              placeholder="+91 9876543210"
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-purple-600 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Renewal Remarks
            </label>
            <textarea
              rows="2"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Reason for renewal / notes..."
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Update Photo (Optional)
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
              <Upload className="h-4 w-4 text-purple-600" />
              <span>Select New Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files[0])}
                className="hidden"
              />
            </label>
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

export default RenewIDCardModal;
