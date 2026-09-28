import React, { useState } from "react";
import { Globe, Code, Layout, ShieldAlert, Save, Send, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { saveServiceDetailDraftApi, submitServiceDetailApi } from "../../services/clientServiceDetailService";

const WebsiteDevelopmentForm = ({ serviceDetail, onRefresh, isReadOnly = false }) => {
  const [formData, setFormData] = useState(serviceDetail?.formData || {});
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveDraft = async () => {
    try {
      setIsSaving(true);
      const res = await saveServiceDetailDraftApi("website_development", { formData });
      if (res.success) {
        toast.success("Website Development details draft saved!");
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
      const res = await submitServiceDetailApi("website_development", { formData });
      if (res.success) {
        toast.success("Website Development details submitted for review!");
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
        <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
          <Globe size={22} />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Website Development Requirements</h3>
          <p className="text-xs text-slate-500">Provide website structure, features, domain info & references</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Website Type</label>
          <select
            disabled={isLocked}
            value={formData.websiteType || "Corporate / Business"}
            onChange={(e) => handleInputChange("websiteType", e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold bg-white"
          >
            <option value="Corporate / Business">Corporate / Business Website</option>
            <option value="E-Commerce Store">E-Commerce Store</option>
            <option value="Landing Page">High-Converting Landing Page</option>
            <option value="SaaS / Web Portal">SaaS / Web Portal</option>
            <option value="Portfolio / Personal">Portfolio / Personal</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Existing Website URL (if any)</label>
          <input
            type="url"
            disabled={isLocked}
            value={formData.existingWebsiteUrl || ""}
            onChange={(e) => handleInputChange("existingWebsiteUrl", e.target.value)}
            placeholder="https://example.com"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-blue-600 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">Required Pages & Sitemap</label>
        <textarea
          rows={3}
          disabled={isLocked}
          value={formData.requiredPages || ""}
          onChange={(e) => handleInputChange("requiredPages", e.target.value)}
          placeholder="e.g. Home, About Us, Services (with 4 sub-pages), Portfolio, Blog, Contact Us"
          className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-blue-600 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Domain Name & Status</label>
          <input
            type="text"
            disabled={isLocked}
            value={formData.domainStatus || ""}
            onChange={(e) => handleInputChange("domainStatus", e.target.value)}
            placeholder="e.g. Purchased via GoDaddy (example.com)"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Hosting Provider & Access Method</label>
          <input
            type="text"
            disabled={isLocked}
            value={formData.hostingStatus || ""}
            onChange={(e) => handleInputChange("hostingStatus", e.target.value)}
            placeholder="e.g. Hostinger / AWS (Invite via email)"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-blue-600 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">Reference Websites (Inspiration)</label>
        <textarea
          rows={2}
          disabled={isLocked}
          value={formData.referenceWebsites || ""}
          onChange={(e) => handleInputChange("referenceWebsites", e.target.value)}
          placeholder="Paste links to 2-3 websites you like in terms of design, layout, or features..."
          className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-blue-600 focus:outline-none"
        />
      </div>

      {/* Security Banner */}
      <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3 flex items-center space-x-2 text-amber-900 text-xs font-semibold">
        <ShieldAlert size={18} className="text-amber-600 shrink-0" />
        <span>Do not submit cPanel, hosting, domain, or database passwords in text fields. Provide delegated access or invite our developer email.</span>
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
            className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-500/25"
          >
            {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            <span>Submit for Review</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default WebsiteDevelopmentForm;
