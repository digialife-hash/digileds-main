import React, { useState } from "react";
import { X, FileCode, CheckCircle2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { createOrUpdateNotificationTemplateApi } from "../../services/notificationService";

const NotificationTemplateModal = ({
  isOpen,
  onClose,
  template = null,
  onSuccess,
}) => {
  const [templateCode, setTemplateCode] = useState(template?.templateCode || "");
  const [title, setTitle] = useState(template?.title || "");
  const [category, setCategory] = useState(template?.category || "Account Updates");
  const [dashboardTemplate, setDashboardTemplate] = useState(
    template?.dashboardTemplate || ""
  );
  const [emailTemplate, setEmailTemplate] = useState(
    template?.emailTemplate || ""
  );
  const [smsTemplate, setSmsTemplate] = useState(
    template?.smsTemplate || ""
  );
  const [whatsAppTemplate, setWhatsAppTemplate] = useState(
    template?.whatsAppTemplate || ""
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!templateCode || !title) {
      toast.error("Template Code and Title are required");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await createOrUpdateNotificationTemplateApi({
        templateCode,
        title,
        category,
        dashboardTemplate,
        emailTemplate,
        smsTemplate,
        whatsAppTemplate,
      });

      if (res.success) {
        toast.success("Notification template saved successfully!");
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(res.message || "Failed to save template");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save template");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white shadow-md shadow-purple-500/20">
              <FileCode className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {template ? "Edit Notification Template" : "Create Notification Template"}
              </h2>
              <p className="text-xs text-slate-500">
                Configure placeholders e.g. &#123;partnerName&#125;, &#123;commissionAmount&#125;
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

        <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Template Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={templateCode}
                onChange={(e) => setTemplateCode(e.target.value.toUpperCase())}
                placeholder="e.g. REFERRAL_CONVERTED"
                required
                disabled={Boolean(template)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-mono font-bold text-slate-900 focus:border-purple-600 focus:outline-hidden disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Referral Converted"
                required
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-purple-600 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Dashboard In-App Template
            </label>
            <textarea
              rows="2"
              value={dashboardTemplate}
              onChange={(e) => setDashboardTemplate(e.target.value)}
              placeholder="e.g. Congratulations! Referral {referralNumber} converted."
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-900 focus:border-purple-600 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Email Template (HTML supported)
            </label>
            <textarea
              rows="3"
              value={emailTemplate}
              onChange={(e) => setEmailTemplate(e.target.value)}
              placeholder="e.g. Hello {partnerName}, referral {referralNumber} converted."
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-900 focus:border-purple-600 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              SMS Template
            </label>
            <textarea
              rows="2"
              value={smsTemplate}
              onChange={(e) => setSmsTemplate(e.target.value)}
              placeholder="Short SMS text..."
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-900 focus:border-purple-600 focus:outline-hidden"
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
              <span>Save Template</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NotificationTemplateModal;
