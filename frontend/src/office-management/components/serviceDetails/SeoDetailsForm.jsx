import React, { useState } from "react";
import { Search, Globe, Target, ShieldAlert, Save, Send, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { saveServiceDetailDraftApi, submitServiceDetailApi } from "../../services/clientServiceDetailService";

const SeoDetailsForm = ({ serviceDetail, onRefresh, isReadOnly = false }) => {
  const [formData, setFormData] = useState(serviceDetail?.formData || {});
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveDraft = async () => {
    try {
      setIsSaving(true);
      const res = await saveServiceDetailDraftApi("seo", { formData });
      if (res.success) {
        toast.success("SEO details draft saved!");
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save draft");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitReview = async () => {
    try {
      setIsSubmitting(true);
      const res = await submitServiceDetailApi("seo", { formData });
      if (res.success) {
        toast.success("SEO details submitted for review!");
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit details");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLocked = serviceDetail?.status === "approved" || isReadOnly;

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 space-y-6">
      <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
        <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
          <Search size={22} />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Search Engine Optimization (SEO) Requirements</h3>
          <p className="text-xs text-slate-500">Provide website URL, target keywords, target locations & competitors</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Target Website URL *</label>
          <input
            type="url"
            disabled={isLocked}
            value={formData.websiteUrl || ""}
            onChange={(e) => handleInputChange("websiteUrl", e.target.value)}
            placeholder="https://example.com"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-emerald-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Target Locations / Markets</label>
          <input
            type="text"
            disabled={isLocked}
            value={formData.targetLocations || ""}
            onChange={(e) => handleInputChange("targetLocations", e.target.value)}
            placeholder="e.g. Mumbai, Delhi NCR, Pan India, USA"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-emerald-600 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">Target Keywords & Search Terms</label>
        <textarea
          rows={3}
          disabled={isLocked}
          value={formData.targetKeywords || ""}
          onChange={(e) => handleInputChange("targetKeywords", e.target.value)}
          placeholder="List main keywords you want to rank for (e.g. best office management software, IT consulting in Mumbai)..."
          className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-emerald-600 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Google Search Console Status</label>
          <input
            type="text"
            disabled={isLocked}
            value={formData.searchConsoleStatus || ""}
            onChange={(e) => handleInputChange("searchConsoleStatus", e.target.value)}
            placeholder="e.g. Access invited to agency email"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-emerald-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Google Analytics (GA4) Status</label>
          <input
            type="text"
            disabled={isLocked}
            value={formData.analyticsStatus || ""}
            onChange={(e) => handleInputChange("analyticsStatus", e.target.value)}
            placeholder="e.g. Viewer / Analyst access granted"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-emerald-600 focus:outline-none"
          />
        </div>
      </div>

      <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3 flex items-center space-x-2 text-amber-900 text-xs font-semibold">
        <ShieldAlert size={18} className="text-amber-600 shrink-0" />
        <span>Do not provide Google account passwords. Use Google Search Console & Analytics user invitation controls.</span>
      </div>

      {!isLocked && (
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSaving || isSubmitting}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100"
          >
            {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={handleSubmitReview}
            disabled={isSaving || isSubmitting}
            className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-md shadow-emerald-500/25"
          >
            {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            <span>Submit for Review</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default SeoDetailsForm;
