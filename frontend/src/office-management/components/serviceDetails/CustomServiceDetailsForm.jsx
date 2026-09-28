import React, { useState } from "react";
import { Sliders, Save, Send, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { saveServiceDetailDraftApi, submitServiceDetailApi } from "../../services/clientServiceDetailService";

const CustomServiceDetailsForm = ({ serviceDetail, onRefresh, isReadOnly = false }) => {
  const [formData, setFormData] = useState(serviceDetail?.formData || {});
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveDraft = async () => {
    try {
      setIsSaving(true);
      const res = await saveServiceDetailDraftApi(serviceDetail?.serviceType || "custom_service", { formData });
      if (res.success) {
        toast.success("Service requirements draft saved!");
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
      const res = await submitServiceDetailApi(serviceDetail?.serviceType || "custom_service", { formData });
      if (res.success) {
        toast.success("Service requirements submitted for review!");
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
        <div className="p-2.5 rounded-2xl bg-slate-100 text-slate-700">
          <Sliders size={22} />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">{serviceDetail?.serviceName || "Service Requirements"}</h3>
          <p className="text-xs text-slate-500">Provide details and specifications for your assigned service</p>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">Project / Service Scope Description</label>
        <textarea
          rows={4}
          disabled={isLocked}
          value={formData.requirements || ""}
          onChange={(e) => handleInputChange("requirements", e.target.value)}
          placeholder="Describe your goals, requirements, expectations, and any special instructions..."
          className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-slate-600 focus:outline-none"
        />
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
            className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 shadow-md"
          >
            {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            <span>Submit for Review</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomServiceDetailsForm;
