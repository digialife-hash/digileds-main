import React, { useState, useEffect } from "react";
import { X, Award, Eye, Loader2, CheckCircle2, User, Building2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  issueCertificateApi,
  getCertificateTypesApi,
} from "../../services/certificateService";
import { getReferralPartnersApi } from "../../services/referralPartnerService";
import { getEmployees } from "../../services/employeeService";
import CertificateTemplate from "./CertificateTemplate";

const IssueCertificateModal = ({
  isOpen,
  onClose,
  onSuccess,
  initialEntityType = "employee",
  initialEntityId = "",
}) => {
  const [entityType, setEntityType] = useState(initialEntityType);
  const [employees, setEmployees] = useState([]);
  const [partners, setPartners] = useState([]);
  const [types, setTypes] = useState([]);

  const [selectedEntityId, setSelectedEntityId] = useState(initialEntityId);
  const [customHolderName, setCustomHolderName] = useState("");
  const [customDisplayId, setCustomDisplayId] = useState("");

  const [certificateType, setCertificateType] = useState(
    "Certificate of Recognition"
  );
  const [achievement, setAchievement] = useState(
    "Excellence in Professional Performance & Contribution"
  );
  const [description, setDescription] = useState(
    "This is to certify that the recipient has fulfilled all professional standards, achievements, and performance milestones."
  );
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const defaultExp = new Date();
  defaultExp.setFullYear(defaultExp.getFullYear() + 2);
  const [expiryDate, setExpiryDate] = useState(
    defaultExp.toISOString().split("T")[0]
  );

  const [companyName, setCompanyName] = useState("Digital Alife Pvt Ltd");
  const [authorizedSignatory, setAuthorizedSignatory] = useState("Managing Director");
  const [orientation, setOrientation] = useState("Landscape");
  const [paperSize, setPaperSize] = useState("A4");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEntityType(initialEntityType);
      setSelectedEntityId(initialEntityId);
      fetchInitialData();
    }
  }, [isOpen, initialEntityType, initialEntityId]);

  const fetchInitialData = async () => {
    try {
      // Fetch Employees
      const empRes = await getEmployees({ limit: 100 });
      if (empRes?.data?.employees) {
        setEmployees(empRes.data.employees);
      } else if (Array.isArray(empRes?.employees)) {
        setEmployees(empRes.employees);
      }

      // Fetch Partners
      const partnerRes = await getReferralPartnersApi({ limit: 100 });
      if (partnerRes?.success && partnerRes?.data?.partners) {
        setPartners(partnerRes.data.partners);
      }

      // Certificate types
      const typeRes = await getCertificateTypesApi();
      if (typeRes?.success && typeRes?.data?.types?.length > 0) {
        setTypes(typeRes.data.types);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (entityType === "employee") {
      setCertificateType("Employee Certificate of Recognition");
      setAchievement("Outstanding Contributions & Employee Excellence");
      if (employees.length > 0) {
        const target = selectedEntityId
          ? employees.find((e) => e._id === selectedEntityId)
          : employees[0];
        if (target) {
          setSelectedEntityId(target._id);
          setCustomHolderName(target.name || "");
          setCustomDisplayId(target.employeeId || target.email?.split("@")[0]?.toUpperCase() || "");
        }
      }
    } else {
      setCertificateType("Authorized Partner Certificate");
      setAchievement("Excellence in Referral Partnership & Strategic Collaboration");
      if (partners.length > 0) {
        const target = selectedEntityId
          ? partners.find((p) => p._id === selectedEntityId)
          : partners[0];
        if (target) {
          setSelectedEntityId(target._id);
          setCustomHolderName(target.userId?.name || target.partnerName || "");
          setCustomDisplayId(target.referralCode || target.partnerCode || "");
        }
      }
    }
  }, [entityType, employees, partners, selectedEntityId]);

  if (!isOpen) return null;

  const handleSelectEntityChange = (e) => {
    const id = e.target.value;
    setSelectedEntityId(id);
    if (entityType === "employee") {
      const emp = employees.find((item) => item._id === id);
      if (emp) {
        setCustomHolderName(emp.name || "");
        setCustomDisplayId(emp.employeeId || emp.email?.split("@")[0]?.toUpperCase() || "");
      }
    } else {
      const p = partners.find((item) => item._id === id);
      if (p) {
        setCustomHolderName(p.userId?.name || p.partnerName || "");
        setCustomDisplayId(p.referralCode || p.partnerCode || "");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalName = customHolderName.trim();
    if (!finalName) {
      toast.error("Please enter or select recipient name");
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("entityType", entityType);
      formData.append("entityId", selectedEntityId);

      if (entityType === "employee") {
        formData.append("employeeId", selectedEntityId);
      } else {
        formData.append("partnerId", selectedEntityId);
      }

      formData.append("partnerName", finalName);
      formData.append("partnerCode", customDisplayId.trim());
      formData.append("certificateType", certificateType.trim());
      formData.append("achievement", achievement.trim());
      formData.append("description", description.trim());
      formData.append("companyName", companyName.trim());
      formData.append("authorizedSignatory", authorizedSignatory.trim());
      formData.append("issueDate", issueDate);
      formData.append("expiryDate", expiryDate);
      formData.append("orientation", orientation);
      formData.append("paperSize", paperSize);

      const res = await issueCertificateApi(formData);

      if (res.success) {
        toast.success(
          `Certificate issued successfully! (${res.data.certificate.certificateNumber})`
        );
        if (onSuccess) onSuccess(res.data.certificate);
        onClose();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || "Failed to issue Certificate");
    } finally {
      setIsSubmitting(false);
    }
  };

  const mockCertData = {
    entityType,
    entityId: selectedEntityId,
    partnerName: customHolderName || "Holder Name",
    partnerCode: customDisplayId || (entityType === "employee" ? "EMP-2026-0001" : "RP-2026-0001"),
    certificateNumber: entityType === "employee" ? "CERT-EMP-2026-0001" : "CERT-RP-2026-0001",
    certificateType,
    achievement,
    description,
    companyName,
    authorizedSignatory,
    issueDate,
    expiryDate,
    status: "Active",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 px-6 py-4 text-white">
          <div className="flex items-center space-x-3">
            <div className="rounded-xl bg-white/10 p-2 border border-white/20">
              <Award size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Issue Official Certificate</h2>
              <p className="text-xs text-amber-100">
                Generate verified credentials for employees and referral partners
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Entity Type Selector Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setEntityType("employee")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                entityType === "employee"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-500/20"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              <User size={14} />
              <span>Employee Certificate</span>
            </button>
            <button
              type="button"
              onClick={() => setEntityType("referral_partner")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                entityType === "referral_partner"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-500/20"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              <Building2 size={14} />
              <span>Referral Partner Certificate</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowLivePreview(!showLivePreview)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              showLivePreview
                ? "bg-amber-100 text-amber-800 border border-amber-200"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            <Eye size={14} />
            <span>{showLivePreview ? "Hide Preview" : "Show Preview"}</span>
          </button>
        </div>

        {/* Form Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[75vh] overflow-y-auto">
          <form
            onSubmit={handleSubmit}
            className={`${showLivePreview ? "md:col-span-7" : "md:col-span-12"} p-6 space-y-4`}
          >
            {/* Entity Picker */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Select Recipient ({entityType === "employee" ? "Employee" : "Referral Partner"}) *
              </label>
              {entityType === "employee" ? (
                <select
                  value={selectedEntityId}
                  onChange={handleSelectEntityChange}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-medium focus:border-amber-500 focus:outline-none"
                >
                  <option value="">-- Select Employee --</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} ({emp.employeeId || emp.email})
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={selectedEntityId}
                  onChange={handleSelectEntityChange}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-medium focus:border-amber-500 focus:outline-none"
                >
                  <option value="">-- Select Referral Partner --</option>
                  {partners.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.userId?.name || p.partnerName} ({p.referralCode})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Recipient Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Recipient Name *
                </label>
                <input
                  type="text"
                  value={customHolderName}
                  onChange={(e) => setCustomHolderName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {entityType === "employee" ? "Employee ID" : "Partner Code"}
                </label>
                <input
                  type="text"
                  value={customDisplayId}
                  onChange={(e) => setCustomDisplayId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Title & Achievement */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Certificate Title
                </label>
                <input
                  type="text"
                  value={certificateType}
                  onChange={(e) => setCertificateType(e.target.value)}
                  placeholder="e.g. Certificate of Recognition"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Achievement / Award Title
                </label>
                <input
                  type="text"
                  value={achievement}
                  onChange={(e) => setAchievement(e.target.value)}
                  placeholder="e.g. Employee of the Month"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description Text
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Signatory & Company */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Authorized Signatory
                </label>
                <input
                  type="text"
                  value={authorizedSignatory}
                  onChange={(e) => setAuthorizedSignatory(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold shadow-md shadow-amber-600/30 transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Issuing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    <span>Issue Certificate</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Live Preview Side */}
          {showLivePreview && (
            <div className="md:col-span-5 bg-slate-100 p-6 flex flex-col items-center justify-center border-l border-slate-200 min-h-[400px]">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                Realtime Certificate Preview
              </span>
              <div className="transform scale-50 origin-center">
                <CertificateTemplate
                  certificate={mockCertData}
                  orientation={orientation}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssueCertificateModal;
