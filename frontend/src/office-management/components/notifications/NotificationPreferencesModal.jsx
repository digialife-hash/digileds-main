import React, { useState, useEffect } from "react";
import { X, Sliders, Bell, Mail, MessageSquare, MessageCircle, CheckCircle2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  getNotificationPreferencesApi,
  updateNotificationPreferencesApi,
} from "../../services/notificationService";

const NotificationPreferencesModal = ({ isOpen, onClose, onSuccess }) => {
  const [channels, setChannels] = useState({
    dashboard: true,
    email: true,
    sms: true,
    whatsApp: true,
  });

  const [categories, setCategories] = useState({
    referralUpdates: true,
    commissionUpdates: true,
    paymentUpdates: true,
    certificateUpdates: true,
    idCardUpdates: true,
    accountUpdates: true,
    documentExpiry: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPreferences();
    }
  }, [isOpen]);

  const fetchPreferences = async () => {
    try {
      setIsLoading(true);
      const res = await getNotificationPreferencesApi();
      if (res.success && res.data?.preference) {
        if (res.data.preference.channels) setChannels(res.data.preference.channels);
        if (res.data.preference.categories) setCategories(res.data.preference.categories);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      const res = await updateNotificationPreferencesApi({
        channels,
        categories,
      });

      if (res.success) {
        toast.success("Notification preferences saved successfully!");
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(res.message || "Failed to save preferences");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save preferences");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Notification Preferences
              </h2>
              <p className="text-xs text-slate-500">
                Choose how and when you receive notification updates
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              {/* Delivery Channels */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Delivery Channels
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: "dashboard", label: "In-App Bell", icon: Bell },
                    { key: "email", label: "Email Messages", icon: Mail },
                    { key: "sms", label: "SMS Alerts", icon: MessageSquare },
                    { key: "whatsApp", label: "WhatsApp Alerts", icon: MessageCircle },
                  ].map((ch) => {
                    const Icon = ch.icon;
                    return (
                      <label
                        key={ch.key}
                        className={`flex cursor-pointer items-center justify-between rounded-2xl border p-3 text-xs font-bold transition ${
                          channels[ch.key]
                            ? "border-blue-600 bg-blue-50/50 text-blue-900"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-blue-600" />
                          <span>{ch.label}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={Boolean(channels[ch.key])}
                          onChange={(e) =>
                            setChannels((prev) => ({
                              ...prev,
                              [ch.key]: e.target.checked,
                            }))
                          }
                          className="h-4 w-4 rounded-md border-slate-300 text-blue-600"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Notification Categories */}
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Notification Categories
                </h3>
                <div className="space-y-2">
                  {[
                    { key: "referralUpdates", label: "Referral Updates (Accepted, Converted, Status changes)" },
                    { key: "commissionUpdates", label: "Commission Updates (Approved, Calculated, Adjustments)" },
                    { key: "paymentUpdates", label: "Payment Updates (Payout released, Transaction receipts)" },
                    { key: "certificateUpdates", label: "Certificate Updates (Issued, Renewed, Revoked)" },
                    { key: "idCardUpdates", label: "ID Card Updates (Generated, Renewed, Revoked)" },
                    { key: "accountUpdates", label: "Account & Profile Updates" },
                    { key: "documentExpiry", label: "Document & KYC Expiry Alerts" },
                  ].map((cat) => (
                    <label
                      key={cat.key}
                      className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs font-semibold text-slate-800 hover:bg-slate-100/80 transition"
                    >
                      <span>{cat.label}</span>
                      <input
                        type="checkbox"
                        checked={Boolean(categories[cat.key])}
                        onChange={(e) =>
                          setCategories((prev) => ({
                            ...prev,
                            [cat.key]: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 rounded-md border-slate-300 text-blue-600"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions */}
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
                  <span>Save Preferences</span>
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default NotificationPreferencesModal;
