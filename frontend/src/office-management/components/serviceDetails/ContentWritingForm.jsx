import React, { useState } from "react";
import { FileText, Type, MessageSquare, Save, Send, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { saveServiceDetailDraftApi, submitServiceDetailApi } from "../../services/clientServiceDetailService";

const ContentWritingForm = ({ serviceDetail, onRefresh, isReadOnly = false }) => {
  const [formData, setFormData] = useState(serviceDetail?.formData || {});
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveDraft = async () => {
    try {
      setIsSaving(true);
      const res = await saveServiceDetailDraftApi("content_writing", { formData });
      if (res.success) {
        toast.success("Content Writing details draft saved!");
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
      const res = await submitServiceDetailApi("content_writing", { formData });
      if (res.success) {
        toast.success("Content Writing details submitted for review!");
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
        <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
          <FileText size={22} />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Content Writing Requirements</h3>
          <p className="text-xs text-slate-500">Provide topic details, word count, target audience, tone & keywords</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Content Type</label>
          <select
            disabled={isLocked}
            value={formData.contentType || "Blog / Article"}
            onChange={(e) => handleInputChange("contentType", e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold bg-white"
          >
            <option value="Blog / Article">Blog / Article</option>
            <option value="Website Copy">Website Copy</option>
            <option value="Social Media Captions">Social Media Captions</option>
            <option value="Product Descriptions">Product Descriptions</option>
            <option value="Press Release">Press Release</option>
            <option value="Email Newsletter">Email Newsletter</option>
            <option value="Case Study">Case Study</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Target Word Count / Volume</label>
          <input
            type="text"
            disabled={isLocked}
            value={formData.wordCount || ""}
            onChange={(e) => handleInputChange("wordCount", e.target.value)}
            placeholder="e.g. 1,200 words per article"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-indigo-600 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">Topic & Content Outline</label>
        <textarea
          rows={3}
          disabled={isLocked}
          value={formData.topicOutline || ""}
          onChange={(e) => handleInputChange("topicOutline", e.target.value)}
          placeholder="Main topics, key takeaways, or structure to cover..."
          className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-indigo-600 focus:outline-none"
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
            className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-md shadow-indigo-500/25"
          >
            {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            <span>Submit for Review</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ContentWritingForm;
