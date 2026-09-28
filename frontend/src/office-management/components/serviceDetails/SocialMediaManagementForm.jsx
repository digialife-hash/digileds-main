import React, { useState, useEffect } from "react";
import {
  Building2,
  Share2,
  KeyRound,
  Palette,
  Users,
  Target,
  FileText,
  FolderOpen,
  Eye,
  CheckSquare,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  ShieldAlert,
  Upload,
  ExternalLink,
  Copy,
  CheckCircle2,
  Save,
  Send,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  saveServiceDetailDraftApi,
  submitServiceDetailApi,
  uploadServiceResourceApi,
  deleteServiceResourceApi,
} from "../../services/clientServiceDetailService";
import { resolveFileUrl } from "../../utils/urlUtils";

const TABS = [
  { id: "business", label: "1. Business", icon: Building2 },
  { id: "profiles", label: "2. Social Profiles", icon: Share2 },
  { id: "access", label: "3. Account Access", icon: KeyRound, isSecurity: true },
  { id: "brand", label: "4. Brand", icon: Palette },
  { id: "audience", label: "5. Audience", icon: Users },
  { id: "goals", label: "6. Goals", icon: Target },
  { id: "content", label: "7. Content", icon: FileText },
  { id: "resources", label: "8. Resources", icon: FolderOpen },
  { id: "competitors", label: "9. Competitors", icon: Eye },
  { id: "approval", label: "10. Approval", icon: CheckSquare },
  { id: "campaigns", label: "11. Dates", icon: Calendar },
  { id: "advertising", label: "12. Advertising", icon: DollarSign },
];

const PLATFORM_OPTIONS = [
  "Facebook",
  "Instagram",
  "LinkedIn",
  "YouTube",
  "X",
  "Pinterest",
  "Google Business Profile",
  "Threads",
  "Snapchat",
  "Other",
];

const TONE_OPTIONS = [
  "Professional",
  "Friendly",
  "Premium",
  "Informative",
  "Educational",
  "Energetic",
  "Humorous",
  "Inspirational",
  "Conversational",
  "Formal",
];

const CONTENT_TYPE_OPTIONS = [
  "Static Posts",
  "Carousels",
  "Stories",
  "Reels",
  "Shorts",
  "Long-form Videos",
  "Polls",
  "Infographics",
  "Testimonials",
  "Offers & Discounts",
  "Product Showcase",
  "Educational Posts",
  "Behind The Scenes",
  "Team & Culture",
];

const GOAL_OPTIONS = [
  "Brand Awareness",
  "Audience Growth",
  "Engagement",
  "Lead Generation",
  "Website Traffic",
  "Product Sales",
  "Service Enquiries",
  "Event Promotion",
  "App Installs",
  "Community Building",
  "Reputation Management",
];

const SocialMediaManagementForm = ({ serviceDetail, onRefresh, isReadOnly = false }) => {
  const [activeTab, setActiveTab] = useState("business");
  const [formData, setFormData] = useState(serviceDetail?.formData || {});
  const [socialProfiles, setSocialProfiles] = useState(serviceDetail?.socialProfiles || []);
  const [competitors, setCompetitors] = useState(serviceDetail?.competitors || []);
  const [campaignDates, setCampaignDates] = useState(serviceDetail?.campaignDates || []);
  const [personas, setPersonas] = useState(serviceDetail?.personas || []);
  const [resources, setResources] = useState(serviceDetail?.resources || []);

  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (serviceDetail) {
      setFormData(serviceDetail.formData || {});
      setSocialProfiles(serviceDetail.socialProfiles || []);
      setCompetitors(serviceDetail.competitors || []);
      setCampaignDates(serviceDetail.campaignDates || []);
      setPersonas(serviceDetail.personas || []);
      setResources(serviceDetail.resources || []);
    }
  }, [serviceDetail]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMultiSelectToggle = (field, item) => {
    const current = formData[field] || [];
    const exists = current.includes(item);
    const updated = exists ? current.filter((x) => x !== item) : [...current, item];
    setFormData((prev) => ({ ...prev, [field]: updated }));
  };

  // 1. Save Draft
  const handleSaveDraft = async () => {
    try {
      setIsSaving(true);
      const res = await saveServiceDetailDraftApi("social_media_management", {
        formData,
        socialProfiles,
        competitors,
        campaignDates,
        personas,
      });

      if (res.success) {
        toast.success("Draft saved successfully!");
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save draft");
    } finally {
      setIsSaving(false);
    }
  };

  // 2. Submit for Review
  const handleSubmitReview = async () => {
    try {
      setIsSubmitting(true);
      const res = await submitServiceDetailApi("social_media_management", {
        formData,
        socialProfiles,
      });

      if (res.success) {
        toast.success("Social Media details submitted for review!");
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit details");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Social Profile Management
  const handleAddProfile = () => {
    setSocialProfiles([
      ...socialProfiles,
      {
        platform: "Instagram",
        profileName: "",
        profileUrl: "",
        username: "",
        accountType: "Business",
        followerCount: 0,
        accessMethod: "Meta Business Manager",
        accessStatus: "Pending From Client",
        accessInvitationEmail: "",
        businessManagerId: "",
      },
    ]);
  };

  const handleUpdateProfile = (index, field, value) => {
    const copy = [...socialProfiles];
    copy[index][field] = value;
    setSocialProfiles(copy);
  };

  const handleRemoveProfile = (index) => {
    setSocialProfiles(socialProfiles.filter((_, i) => i !== index));
  };

  // 4. Competitors Management
  const handleAddCompetitor = () => {
    setCompetitors([...competitors, { name: "", website: "", instagramUrl: "", likes: "", dislikes: "" }]);
  };

  const handleUpdateCompetitor = (index, field, value) => {
    const copy = [...competitors];
    copy[index][field] = value;
    setCompetitors(copy);
  };

  // 5. Campaign Dates Management
  const handleAddCampaign = () => {
    setCampaignDates([
      ...campaignDates,
      { title: "", date: new Date().toISOString().split("T")[0], objective: "", priority: "Medium" },
    ]);
  };

  const handleUpdateCampaign = (index, field, value) => {
    const copy = [...campaignDates];
    copy[index][field] = value;
    setCampaignDates(copy);
  };

  // 6. Personas Management
  const handleAddPersona = () => {
    setPersonas([...personas, { name: "Ideal Customer", ageGroup: "25-45", location: "", problems: "" }]);
  };

  const handleUpdatePersona = (index, field, value) => {
    const copy = [...personas];
    copy[index][field] = value;
    setPersonas(copy);
  };

  // 7. File Upload Handler
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const data = new FormData();
      data.append("resourceFile", file);
      data.append("resourceType", "Brand Asset");
      data.append("title", file.name);

      const res = await uploadServiceResourceApi("social_media_management", data);
      if (res.success) {
        toast.success("Resource uploaded successfully!");
        setResources(res.data.resources || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload file resource");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteResource = async (resourceId) => {
    try {
      const res = await deleteServiceResourceApi("social_media_management", resourceId);
      if (res.success) {
        toast.success("Resource removed");
        setResources(res.data.resources || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove resource");
    }
  };

  const isLocked = serviceDetail?.status === "approved" || isReadOnly;

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-white text-blue-700 shadow-2xs"
                  : tab.isSecurity
                  ? "text-rose-700 hover:bg-rose-50"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Icon size={14} className={tab.isSecurity ? "text-rose-600" : ""} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Business Information */}
      {activeTab === "business" && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Building2 size={18} className="text-blue-600" />
            <span>Section 1: Business & Brand Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Brand or Business Name *</label>
              <input
                type="text"
                disabled={isLocked}
                value={formData.brandName || ""}
                onChange={(e) => handleInputChange("brandName", e.target.value)}
                placeholder="e.g. Acme Studio"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Registered Company Name</label>
              <input
                type="text"
                disabled={isLocked}
                value={formData.companyName || ""}
                onChange={(e) => handleInputChange("companyName", e.target.value)}
                placeholder="e.g. Acme Pvt Ltd"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Business Category / Industry *</label>
              <input
                type="text"
                disabled={isLocked}
                value={formData.businessCategory || ""}
                onChange={(e) => handleInputChange("businessCategory", e.target.value)}
                placeholder="e.g. E-commerce / Fashion"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Website URL</label>
              <input
                type="url"
                disabled={isLocked}
                value={formData.websiteUrl || ""}
                onChange={(e) => handleInputChange("websiteUrl", e.target.value)}
                placeholder="https://example.com"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Business Description & Core Offerings</label>
            <textarea
              rows={3}
              disabled={isLocked}
              value={formData.businessDescription || ""}
              onChange={(e) => handleInputChange("businessDescription", e.target.value)}
              placeholder="Brief summary of your business, main products/services, and value proposition..."
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Main Contact Person</label>
              <input
                type="text"
                disabled={isLocked}
                value={formData.mainContactPerson || ""}
                onChange={(e) => handleInputChange("mainContactPerson", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Official Business Email</label>
              <input
                type="email"
                disabled={isLocked}
                value={formData.officialEmail || ""}
                onChange={(e) => handleInputChange("officialEmail", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Official Business Phone</label>
              <input
                type="text"
                disabled={isLocked}
                value={formData.officialPhone || ""}
                onChange={(e) => handleInputChange("officialPhone", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Social Media Platforms */}
      {activeTab === "profiles" && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Share2 size={18} className="text-blue-600" />
              <span>Section 2: Social Media Platforms ({socialProfiles.length})</span>
            </h3>
            {!isLocked && (
              <button
                type="button"
                onClick={handleAddProfile}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition"
              >
                <Plus size={14} />
                <span>Add Platform</span>
              </button>
            )}
          </div>

          {socialProfiles.length === 0 ? (
            <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-2xl">
              <Share2 className="mx-auto text-slate-300 mb-2" size={32} />
              <p className="text-xs font-bold text-slate-600">No Social Profiles Added Yet</p>
              <button
                type="button"
                onClick={handleAddProfile}
                className="mt-2 inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
              >
                <Plus size={14} />
                <span>Add Profile</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {socialProfiles.map((prof, idx) => (
                <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-extrabold text-blue-700 uppercase tracking-wider">
                      Platform #{idx + 1}
                    </span>
                    {!isLocked && (
                      <button
                        type="button"
                        onClick={() => handleRemoveProfile(idx)}
                        className="text-rose-600 hover:text-rose-800 text-xs font-semibold"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Platform</label>
                      <select
                        disabled={isLocked}
                        value={prof.platform}
                        onChange={(e) => handleUpdateProfile(idx, "platform", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold bg-white"
                      >
                        {PLATFORM_OPTIONS.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Page / Profile Name</label>
                      <input
                        type="text"
                        disabled={isLocked}
                        value={prof.profileName}
                        onChange={(e) => handleUpdateProfile(idx, "profileName", e.target.value)}
                        placeholder="e.g. Acme Official"
                        className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Profile URL</label>
                      <input
                        type="url"
                        disabled={isLocked}
                        value={prof.profileUrl}
                        onChange={(e) => handleUpdateProfile(idx, "profileUrl", e.target.value)}
                        placeholder="https://..."
                        className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Account Type</label>
                      <select
                        disabled={isLocked}
                        value={prof.accountType}
                        onChange={(e) => handleUpdateProfile(idx, "accountType", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold bg-white"
                      >
                        <option value="Business">Business</option>
                        <option value="Creator">Creator</option>
                        <option value="Company Page">Company Page</option>
                        <option value="Personal">Personal</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Followers Count</label>
                      <input
                        type="number"
                        disabled={isLocked}
                        value={prof.followerCount}
                        onChange={(e) => handleUpdateProfile(idx, "followerCount", parseInt(e.target.value) || 0)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Access Method</label>
                      <input
                        type="text"
                        disabled={isLocked}
                        value={prof.accessMethod}
                        onChange={(e) => handleUpdateProfile(idx, "accessMethod", e.target.value)}
                        placeholder="e.g. Meta Business Manager"
                        className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold bg-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Account Access Security Notice & Guidance */}
      {activeTab === "access" && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 space-y-4">
          {/* Security Banner */}
          <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 flex items-start space-x-3 text-rose-900">
            <ShieldAlert size={24} className="text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <h4 className="font-extrabold text-sm uppercase tracking-wide text-rose-700">
                🔒 Security & Official Access Policy Notice
              </h4>
              <p className="font-semibold leading-relaxed">
                Do not submit your social media password, email password, OTP, recovery code, or backup code in ordinary text fields.
              </p>
              <p className="text-rose-800">
                Please grant agency access exclusively through official platform delegation tools: Meta Business Manager, LinkedIn Page Admin, Google Business Profile Manager, or YouTube Brand Account permissions.
              </p>
            </div>
          </div>

          <h3 className="text-sm font-bold text-slate-900 pt-2">Official Platform Access Instructions</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5 text-xs">
              <h5 className="font-bold text-blue-700 flex items-center space-x-1.5">
                <span>Facebook & Instagram</span>
              </h5>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Add our agency Meta Business Portfolio ID or assign Page Admin / Task permissions to our official email.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5 text-xs">
              <h5 className="font-bold text-indigo-700 flex items-center space-x-1.5">
                <span>LinkedIn Page</span>
              </h5>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Go to Page Admin Tools → Manage Admins → Add Manager access for our business email.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5 text-xs">
              <h5 className="font-bold text-amber-700 flex items-center space-x-1.5">
                <span>Google Business Profile</span>
              </h5>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                In Profile Settings → Users → Invite Manager role to our official agency email.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5 text-xs">
              <h5 className="font-bold text-rose-700 flex items-center space-x-1.5">
                <span>YouTube Channel</span>
              </h5>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Studio Settings → Permissions → Invite Editor or Manager permission to agency email.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Brand Guidelines & Assets */}
      {activeTab === "brand" && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Palette size={18} className="text-blue-600" />
            <span>Section 4: Brand Identity & Tone of Voice</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Brand Tagline</label>
              <input
                type="text"
                disabled={isLocked}
                value={formData.brandTagline || ""}
                onChange={(e) => handleInputChange("brandTagline", e.target.value)}
                placeholder="e.g. Innovating Digital Future"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Primary Brand Colors (Hex Codes)</label>
              <input
                type="text"
                disabled={isLocked}
                value={formData.brandColors || ""}
                onChange={(e) => handleInputChange("brandColors", e.target.value)}
                placeholder="e.g. #2563EB, #1E293B, #F59E0B"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Brand Tone of Voice (Multi-select)</label>
            <div className="flex flex-wrap gap-2">
              {TONE_OPTIONS.map((tone) => {
                const isSelected = (formData.brandTone || []).includes(tone);
                return (
                  <button
                    key={tone}
                    type="button"
                    disabled={isLocked}
                    onClick={() => handleMultiSelectToggle("brandTone", tone)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {tone}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Words / Phrases to Use</label>
              <textarea
                rows={2}
                disabled={isLocked}
                value={formData.preferredWords || ""}
                onChange={(e) => handleInputChange("preferredWords", e.target.value)}
                placeholder="e.g. Premium, Eco-friendly, Certified..."
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Topics / Words to Avoid</label>
              <textarea
                rows={2}
                disabled={isLocked}
                value={formData.avoidWords || ""}
                onChange={(e) => handleInputChange("avoidWords", e.target.value)}
                placeholder="e.g. Cheap, Political topics, Controversial claims..."
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Target Audience */}
      {activeTab === "audience" && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Users size={18} className="text-blue-600" />
            <span>Section 5: Target Audience & Customer Profile</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Primary Target Audience</label>
              <input
                type="text"
                disabled={isLocked}
                value={formData.primaryTargetAudience || ""}
                onChange={(e) => handleInputChange("primaryTargetAudience", e.target.value)}
                placeholder="e.g. Small Business Owners, Tech Professionals"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Age Group Range</label>
              <input
                type="text"
                disabled={isLocked}
                value={formData.targetAgeRange || ""}
                onChange={(e) => handleInputChange("targetAgeRange", e.target.value)}
                placeholder="e.g. 24 - 45 years"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Locations</label>
              <input
                type="text"
                disabled={isLocked}
                value={formData.targetLocations || ""}
                onChange={(e) => handleInputChange("targetLocations", e.target.value)}
                placeholder="e.g. Mumbai, Delhi NCR, Pan-India"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Customer Pain Points & Key Solutions Offered</label>
            <textarea
              rows={3}
              disabled={isLocked}
              value={formData.customerPainPoints || ""}
              onChange={(e) => handleInputChange("customerPainPoints", e.target.value)}
              placeholder="What problem does your product or service solve for your audience?"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Tab 6: Social Media Goals */}
      {activeTab === "goals" && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Target size={18} className="text-blue-600" />
            <span>Section 6: Campaign Goals & Expected Outcomes</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Primary Objectives (Multi-select)</label>
            <div className="flex flex-wrap gap-2">
              {GOAL_OPTIONS.map((g) => {
                const isSelected = (formData.goals || []).includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    disabled={isLocked}
                    onClick={() => handleMultiSelectToggle("goals", g)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Lead / Enquiry Target</label>
              <input
                type="text"
                disabled={isLocked}
                value={formData.monthlyLeadTarget || ""}
                onChange={(e) => handleInputChange("monthlyLeadTarget", e.target.value)}
                placeholder="e.g. 50 verified enquiries / month"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Follower & Engagement Expectations</label>
              <input
                type="text"
                disabled={isLocked}
                value={formData.engagementTarget || ""}
                onChange={(e) => handleInputChange("engagementTarget", e.target.value)}
                placeholder="e.g. 1,000 active followers per month"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Content Preferences */}
      {activeTab === "content" && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <FileText size={18} className="text-blue-600" />
            <span>Section 7: Content Format & Posting Preferences</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Preferred Content Formats</label>
            <div className="flex flex-wrap gap-2">
              {CONTENT_TYPE_OPTIONS.map((ct) => {
                const isSelected = (formData.preferredContentTypes || []).includes(ct);
                return (
                  <button
                    key={ct}
                    type="button"
                    disabled={isLocked}
                    onClick={() => handleMultiSelectToggle("preferredContentTypes", ct)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {ct}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Posting Frequency</label>
              <select
                disabled={isLocked}
                value={formData.postingFrequency || "5 Posts / Week"}
                onChange={(e) => handleInputChange("postingFrequency", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold bg-white"
              >
                <option value="3 Posts / Week">3 Posts / Week</option>
                <option value="5 Posts / Week">5 Posts / Week</option>
                <option value="Daily (7 Posts / Week)">Daily (7 Posts / Week)</option>
                <option value="Custom Plan">Custom Plan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Content Approval Requirement</label>
              <select
                disabled={isLocked}
                value={formData.contentApprovalRequired || "Yes"}
                onChange={(e) => handleInputChange("contentApprovalRequired", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold bg-white"
              >
                <option value="Yes">Yes - Client Approval Required Before Publishing</option>
                <option value="No">No - Direct Auto-Publishing Allowed</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tab 8: Content Resources Uploads */}
      {activeTab === "resources" && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <FolderOpen size={18} className="text-blue-600" />
              <span>Section 8: Brand Assets & Content Resources ({resources.length})</span>
            </h3>

            {!isLocked && (
              <label className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 cursor-pointer shadow-xs">
                {isUploading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Upload size={14} />
                )}
                <span>{isUploading ? "Uploading..." : "Upload Asset File"}</span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*,video/*,application/pdf,.docx"
                />
              </label>
            )}
          </div>

          {resources.length === 0 ? (
            <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-2xl">
              <FolderOpen className="mx-auto text-slate-300 mb-2" size={32} />
              <p className="text-xs font-bold text-slate-600">No Brand Assets Uploaded Yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Upload logos, product catalogues, brochures, raw photos, or brand guidelines.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {resources.map((resItem) => (
                <div key={resItem._id || resItem.fileUrl} className="p-3 rounded-2xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-slate-900 truncate">{resItem.fileName}</p>
                    <span className="text-[10px] text-slate-500 font-semibold">{resItem.resourceType || "Asset"}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <a
                      href={resolveFileUrl(resItem.fileUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"
                      title="View Asset"
                    >
                      <ExternalLink size={14} />
                    </a>
                    {!isLocked && (
                      <button
                        type="button"
                        onClick={() => handleDeleteResource(resItem._id)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                        title="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 9: Competitors */}
      {activeTab === "competitors" && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Eye size={18} className="text-blue-600" />
              <span>Section 9: Competitor Analysis ({competitors.length})</span>
            </h3>
            {!isLocked && (
              <button
                type="button"
                onClick={handleAddCompetitor}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition"
              >
                <Plus size={14} />
                <span>Add Competitor</span>
              </button>
            )}
          </div>

          {competitors.map((comp, idx) => (
            <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Competitor Name</label>
                  <input
                    type="text"
                    disabled={isLocked}
                    value={comp.name}
                    onChange={(e) => handleUpdateCompetitor(idx, "name", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Instagram / Web URL</label>
                  <input
                    type="url"
                    disabled={isLocked}
                    value={comp.instagramUrl || comp.website}
                    onChange={(e) => handleUpdateCompetitor(idx, "instagramUrl", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-0.5">What You Like About Them</label>
                  <input
                    type="text"
                    disabled={isLocked}
                    value={comp.likes}
                    onChange={(e) => handleUpdateCompetitor(idx, "likes", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold bg-white"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 10: Approval Workflow */}
      {activeTab === "approval" && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <CheckSquare size={18} className="text-blue-600" />
            <span>Section 10: Content Approval Contacts & Workflow</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Primary Approver Name</label>
              <input
                type="text"
                disabled={isLocked}
                value={formData.approverName || ""}
                onChange={(e) => handleInputChange("approverName", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Approver Email</label>
              <input
                type="email"
                disabled={isLocked}
                value={formData.approverEmail || ""}
                onChange={(e) => handleInputChange("approverEmail", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Approval Channel</label>
              <select
                disabled={isLocked}
                value={formData.preferredApprovalMethod || "Client Panel"}
                onChange={(e) => handleInputChange("preferredApprovalMethod", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold bg-white"
              >
                <option value="Client Panel">Client Panel</option>
                <option value="Email">Email</option>
                <option value="WhatsApp">WhatsApp</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tab 11: Campaign Dates */}
      {activeTab === "campaigns" && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Calendar size={18} className="text-blue-600" />
              <span>Section 11: Upcoming Campaigns & Important Dates ({campaignDates.length})</span>
            </h3>
            {!isLocked && (
              <button
                type="button"
                onClick={handleAddCampaign}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition"
              >
                <Plus size={14} />
                <span>Add Event Date</span>
              </button>
            )}
          </div>

          {campaignDates.map((camp, idx) => (
            <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Campaign / Event Title</label>
                  <input
                    type="text"
                    disabled={isLocked}
                    value={camp.title}
                    onChange={(e) => handleUpdateCampaign(idx, "title", e.target.value)}
                    placeholder="e.g. Diwali Offer Launch"
                    className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Event Date</label>
                  <input
                    type="date"
                    disabled={isLocked}
                    value={camp.date ? new Date(camp.date).toISOString().split("T")[0] : ""}
                    onChange={(e) => handleUpdateCampaign(idx, "date", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Objective / Offer Details</label>
                  <input
                    type="text"
                    disabled={isLocked}
                    value={camp.objective}
                    onChange={(e) => handleUpdateCampaign(idx, "objective", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold bg-white"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 12: Paid Advertising Information */}
      {activeTab === "advertising" && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <DollarSign size={18} className="text-blue-600" />
            <span>Section 12: Paid Social Advertising Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Ad Budget (INR / USD)</label>
              <input
                type="text"
                disabled={isLocked}
                value={formData.adBudget || ""}
                onChange={(e) => handleInputChange("adBudget", e.target.value)}
                placeholder="e.g. ₹50,000 / month"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Meta Ad Account ID</label>
              <input
                type="text"
                disabled={isLocked}
                value={formData.metaAdAccountId || ""}
                onChange={(e) => handleInputChange("metaAdAccountId", e.target.value)}
                placeholder="act_123456789"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Google Ads / LinkedIn ID</label>
              <input
                type="text"
                disabled={isLocked}
                value={formData.googleAdsId || ""}
                onChange={(e) => handleInputChange("googleAdsId", e.target.value)}
                placeholder="123-456-7890"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Form Action Controls */}
      {!isLocked && (
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSaving || isSubmitting}
            className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>{isSaving ? "Saving..." : "Save Draft"}</span>
          </button>

          <button
            type="button"
            onClick={handleSubmitReview}
            disabled={isSaving || isSubmitting}
            className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-500/25 transition disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            <span>{isSubmitting ? "Submitting..." : "Submit for Review"}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default SocialMediaManagementForm;
