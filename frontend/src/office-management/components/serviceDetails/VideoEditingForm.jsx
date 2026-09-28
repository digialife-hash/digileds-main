import React, { useState } from "react";
import { Video, Film, Play, Save, Send, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { saveServiceDetailDraftApi, submitServiceDetailApi } from "../../services/clientServiceDetailService";

const VideoEditingForm = ({ serviceDetail, onRefresh, isReadOnly = false }) => {
  const [formData, setFormData] = useState(serviceDetail?.formData || {});
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveDraft = async () => {
    try {
      setIsSaving(true);
      const res = await saveServiceDetailDraftApi("video_editing", { formData });
      if (res.success) {
        toast.success("Video Editing details draft saved!");
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
      const res = await submitServiceDetailApi("video_editing", { formData });
      if (res.success) {
        toast.success("Video Editing details submitted for review!");
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
        <div className="p-2.5 rounded-2xl bg-rose-50 text-rose-600">
          <Video size={22} />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Video Editing Requirements</h3>
          <p className="text-xs text-slate-500">Provide platform presets, aspect ratio, raw footage links & music preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Target Platform Preset</label>
          <select
            disabled={isLocked}
            value={formData.targetPlatform || "Instagram Reel / Short"}
            onChange={(e) => handleInputChange("targetPlatform", e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold bg-white"
          >
            <option value="Instagram Reel / Short">Instagram Reel / Shorts (9:16)</option>
            <option value="YouTube Video">YouTube Long Video (16:9)</option>
            <option value="Facebook / LinkedIn Video">Facebook / LinkedIn (1:1 or 16:9)</option>
            <option value="Ad Commercial">Promotional Ad Commercial</option>
            <option value="Corporate Presentation">Corporate Presentation Video</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Raw Footage Link (Drive / Dropbox)</label>
          <input
            type="url"
            disabled={isLocked}
            value={formData.rawFootageUrl || ""}
            onChange={(e) => handleInputChange("rawFootageUrl", e.target.value)}
            placeholder="https://drive.google.com/..."
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-rose-600 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">Editing Style & Subtitle Preferences</label>
        <textarea
          rows={3}
          disabled={isLocked}
          value={formData.editingInstructions || ""}
          onChange={(e) => handleInputChange("editingInstructions", e.target.value)}
          placeholder="Mention caption style, background music preference, cut style, or reference video link..."
          className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-rose-600 focus:outline-none"
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
            className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-md shadow-rose-500/25"
          >
            {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            <span>Submit for Review</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoEditingForm;
