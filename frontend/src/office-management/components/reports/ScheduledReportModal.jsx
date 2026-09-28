import React, { useState } from "react";
import { X, Calendar, CheckCircle2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { createScheduledReportApi } from "../../services/reportService";

const REPORT_TYPES = [
  "Referral",
  "Partner Performance",
  "Monthly",
  "Client Conversion",
  "Commission",
  "Payment",
  "Territory",
];

const ScheduledReportModal = ({ isOpen, onClose, onSuccess }) => {
  const [reportName, setReportName] = useState("");
  const [reportType, setReportType] = useState("Referral");
  const [frequency, setFrequency] = useState("Weekly");
  const [recipients, setRecipients] = useState("");
  const [deliveryChannel, setDeliveryChannel] = useState("Both");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reportName.trim()) {
      toast.error("Report name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      const recipientList = recipients
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);

      const res = await createScheduledReportApi({
        reportName,
        reportType,
        frequency,
        recipients: recipientList,
        deliveryChannel,
      });

      if (res.success) {
        toast.success("Report schedule created successfully!");
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(res.message || "Failed to schedule report");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to schedule report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Schedule Automated Report
              </h2>
              <p className="text-xs text-slate-500">
                Deliver periodic reports to email / dashboard
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
              Schedule Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              placeholder="e.g. Weekly Partner Performance Dispatch"
              required
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Report Type
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900"
              >
                {REPORT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900"
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Recipient Email Addresses (Comma separated)
            </label>
            <input
              type="text"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              placeholder="e.g. admin@company.com, partner@company.com"
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Delivery Channel
            </label>
            <select
              value={deliveryChannel}
              onChange={(e) => setDeliveryChannel(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900"
            >
              <option value="Both">Both (Email & Dashboard)</option>
              <option value="Email">Email Only</option>
              <option value="Dashboard">Dashboard Only</option>
            </select>
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
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              <span>Create Schedule</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduledReportModal;
