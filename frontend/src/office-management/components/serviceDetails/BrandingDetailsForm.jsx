import React, { useState } from "react";
import { Palette, Layers, CheckSquare, Save, Send, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { saveServiceDetailDraftApi, submitServiceDetailApi } from "../../services/clientServiceDetailService";

const BrandingDetailsForm = ({ serviceDetail, onRefresh, isReadOnly = false }) => {
  const [formData, setFormData] = useState(serviceDetail?.formData || {});
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveDraft = async () => {
    try {
      setIsSaving(true);
      const res = await saveServiceDetailDraftApi("branding", { formData });
      if (res.success) {
        toast.success("Branding details draft saved!");
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
      const res = await submitServiceDetailApi("branding", { formData });
      if (res.success) {
        toast.success("Branding details submitted for review!");
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
        <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-600">
          <Palette size={22} />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Graphic Design & Branding Requirements</h3>
          <p className="text-xs text-slate-500">Provide logo preferences, deliverables, color guidelines & assets</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Brand Name *</label>
          <input
            type="text"
            disabled={isLocked}
            value={formData.brandName || ""}
            onChange={(e) => handleInputChange("brandName", e.target.value)}
            placeholder="e.g. Nexus Digital"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-purple-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Tagline / Slogan</label>
          <input
            type="text"
            disabled={isLocked}
            value={formData.brandTagline || ""}
            onChange={(e) => handleInputChange("brandTagline", e.target.value)}
            placeholder="e.g. Empowering Enterprise Growth"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-purple-600 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">Required Deliverables</label>
        <textarea
          rows={2}
          disabled={isLocked}
          value={formData.deliverables || ""}
          onChange={(e) => handleInputChange("deliverables", e.target.value)}
          placeholder="e.g. Logo Design, Business Card, Letterhead, Brochure, Social Media Templates"
          className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-purple-600 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Color Palette Preferences</label>
          <input
            type="text"
            disabled={isLocked}
            value={formData.preferredColors || ""}
            onChange={(e) => handleInputChange("preferredColors", e.target.value)}
            placeholder="e.g. Deep Blue, Gold, Slate Grey"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-purple-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Colors or Styles to Avoid</label>
          <input
            type="text"
            disabled={isLocked}
            value={formData.avoidColors || ""}
            onChange={(e) => handleInputChange("avoidColors", e.target.value)}
            placeholder="e.g. Neon Pink, Bright Yellow"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-purple-600 focus:outline-none"
          />
        </div>
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
            className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 shadow-md shadow-purple-500/25"
          >
            {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            <span>Submit for Review</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default BrandingDetailsForm;
