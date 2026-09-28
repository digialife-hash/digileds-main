import React, { useState, useEffect } from "react";
import { X, IdCard, Upload, Loader2, CheckCircle2, Eye, User, Building2 } from "lucide-react";
import toast from "react-hot-toast";
import { generateIDCardApi } from "../../services/idCardService";
import { getReferralPartnersApi } from "../../services/referralPartnerService";
import { getEmployees } from "../../services/employeeService";
import IDCardTemplate from "./IDCardTemplate";
import { ID_CARD_ENTITY_TYPES, idCardConfig } from "../../config/idCardConfig";

const GenerateIDCardModal = ({
  isOpen,
  onClose,
  onSuccess,
  initialEntityType = ID_CARD_ENTITY_TYPES.EMPLOYEE,
  initialEntityId = "",
}) => {
  const [entityType, setEntityType] = useState(initialEntityType);
  const [employees, setEmployees] = useState([]);
  const [partners, setPartners] = useState([]);

  const [selectedEntityId, setSelectedEntityId] = useState(initialEntityId);
  const [customHolderName, setCustomHolderName] = useState("");
  const [customDisplayId, setCustomDisplayId] = useState("");

  const [designation, setDesignation] = useState("Frontend Developer");
  const [department, setDepartment] = useState("Engineering");
  const [joiningDate, setJoiningDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const defaultExp = new Date();
  defaultExp.setFullYear(defaultExp.getFullYear() + 1);
  const [expiryDate, setExpiryDate] = useState(
    defaultExp.toISOString().split("T")[0]
  );

  const [companyName, setCompanyName] = useState("Digital Alife Pvt Ltd");
  const [cardOrientation, setCardOrientation] = useState("Portrait");
  const [cardSize, setCardSize] = useState("PVC Card");

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEntityType(initialEntityType);
      setSelectedEntityId(initialEntityId);
      fetchEntities();
    }
  }, [isOpen, initialEntityType, initialEntityId]);

  const fetchEntities = async () => {
    try {
      // Fetch Employees
      const empRes = await getEmployees({ limit: 100 });
      if (empRes?.data?.employees) {
        setEmployees(empRes.data.employees);
      } else if (Array.isArray(empRes?.employees)) {
        setEmployees(empRes.employees);
      }

      // Fetch Referral Partners
      const partnerRes = await getReferralPartnersApi({ limit: 100 });
      if (partnerRes?.success && partnerRes?.data?.partners) {
        setPartners(partnerRes.data.partners);
      }
    } catch (err) {
      console.error("Error fetching entities for ID card generation:", err);
    }
  };

  useEffect(() => {
    if (entityType === ID_CARD_ENTITY_TYPES.EMPLOYEE) {
      setDesignation("Software Engineer");
      setDepartment("Engineering");
      if (employees.length > 0) {
        const target = selectedEntityId
          ? employees.find((e) => e._id === selectedEntityId)
          : employees[0];
        if (target) {
          setSelectedEntityId(target._id);
          setCustomHolderName(target.name || "");
          setCustomDisplayId(target.employeeId || target.email?.split("@")[0]?.toUpperCase() || "");
          setDesignation(target.designation || "Software Engineer");
          setDepartment(target.department || "Engineering");
          if (target.joiningDate) {
            setJoiningDate(new Date(target.joiningDate).toISOString().split("T")[0]);
          }
          if (target.userId?.profilePicture || target.photo) {
            setPhotoPreview(target.userId?.profilePicture || target.photo);
          }
        }
      }
    } else {
      setDesignation("Authorized Referral Partner");
      setDepartment("Referral Network");
      if (partners.length > 0) {
        const target = selectedEntityId
          ? partners.find((p) => p._id === selectedEntityId)
          : partners[0];
        if (target) {
          setSelectedEntityId(target._id);
          setCustomHolderName(target.userId?.name || target.partnerName || "");
          setCustomDisplayId(target.referralCode || target.partnerCode || "");
          if (target.profilePicture || target.userId?.profilePicture) {
            setPhotoPreview(target.profilePicture || target.userId?.profilePicture);
          }
        }
      }
    }
  }, [entityType, employees, partners, selectedEntityId]);

  if (!isOpen) return null;

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSelectEntityChange = (e) => {
    const id = e.target.value;
    setSelectedEntityId(id);
    if (entityType === ID_CARD_ENTITY_TYPES.EMPLOYEE) {
      const emp = employees.find((item) => item._id === id);
      if (emp) {
        setCustomHolderName(emp.name || "");
        setCustomDisplayId(emp.employeeId || emp.email?.split("@")[0]?.toUpperCase() || "");
        setDesignation(emp.designation || "Employee");
        setDepartment(emp.department || "General");
        if (emp.joiningDate) {
          setJoiningDate(new Date(emp.joiningDate).toISOString().split("T")[0]);
        }
        if (emp.userId?.profilePicture || emp.photo) {
          setPhotoPreview(emp.userId?.profilePicture || emp.photo);
        } else {
          setPhotoPreview(null);
        }
      }
    } else {
      const p = partners.find((item) => item._id === id);
      if (p) {
        setCustomHolderName(p.userId?.name || p.partnerName || "");
        setCustomDisplayId(p.referralCode || p.partnerCode || "");
        if (p.profilePicture || p.userId?.profilePicture) {
          setPhotoPreview(p.profilePicture || p.userId?.profilePicture);
        } else {
          setPhotoPreview(null);
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalName = customHolderName.trim();
    if (!finalName) {
      toast.error(`Please select or enter ${idCardConfig[entityType].holderLabel} Name`);
      return;
    }

    if (!selectedEntityId) {
      toast.error(`Please select an active ${idCardConfig[entityType].holderLabel}`);
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("entityType", entityType);
      formData.append("entityId", selectedEntityId);

      if (entityType === ID_CARD_ENTITY_TYPES.EMPLOYEE) {
        formData.append("employeeId", selectedEntityId);
      } else {
        formData.append("partnerId", selectedEntityId);
      }

      formData.append("partnerName", finalName);
      formData.append("partnerCode", customDisplayId.trim());
      formData.append("designation", designation.trim());
      formData.append("department", department.trim());
      formData.append("joiningDate", joiningDate);
      formData.append("expiryDate", expiryDate);
      formData.append("companyName", companyName.trim());
      formData.append("cardOrientation", cardOrientation);
      formData.append("cardSize", cardSize);

      if (photoFile) {
        formData.append("partnerPhoto", photoFile);
      }

      const res = await generateIDCardApi(formData);

      if (res.success) {
        toast.success(
          `${idCardConfig[entityType].holderLabel} ID Card generated successfully! (${res.data.idCard.cardNumber})`
        );
        if (onSuccess) onSuccess(res.data.idCard);
        onClose();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || "Failed to generate ID Card");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Live preview mockup state
  const mockCardData = {
    entityType,
    entityId: selectedEntityId,
    partnerName: customHolderName || "Holder Full Name",
    holderName: customHolderName || "Holder Full Name",
    partnerCode: customDisplayId || (entityType === ID_CARD_ENTITY_TYPES.EMPLOYEE ? "EMP-2026-0001" : "RP-2026-0001"),
    displayId: customDisplayId || (entityType === ID_CARD_ENTITY_TYPES.EMPLOYEE ? "EMP-2026-0001" : "RP-2026-0001"),
    designation: designation || "Role",
    department: department || "Department",
    partnerPhoto: photoPreview,
    joiningDate,
    issueDate: new Date().toISOString(),
    expiryDate,
    cardNumber: entityType === ID_CARD_ENTITY_TYPES.EMPLOYEE ? "IDC-EMP-2026-0001" : "IDC-RP-2026-0001",
    status: "Active",
    companyName,
    companyEmail: "info@digitalalife.com",
    companyPhone: "+91 9876543210",
    companyWebsite: "www.digitalalife.com",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-blue-900 to-indigo-900 px-6 py-4 text-white">
          <div className="flex items-center space-x-3">
            <div className="rounded-xl bg-white/10 p-2 border border-white/20">
              <IdCard size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Generate Digital ID Card</h2>
              <p className="text-xs text-blue-200">
                Issue official employee or partner identity credentials
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

        {/* Entity Type Selection Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setEntityType(ID_CARD_ENTITY_TYPES.EMPLOYEE)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                entityType === ID_CARD_ENTITY_TYPES.EMPLOYEE
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              <User size={14} />
              <span>Employee ID Card</span>
            </button>
            <button
              type="button"
              onClick={() => setEntityType(ID_CARD_ENTITY_TYPES.REFERRAL_PARTNER)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                entityType === ID_CARD_ENTITY_TYPES.REFERRAL_PARTNER
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              <Building2 size={14} />
              <span>Referral Partner ID Card</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowLivePreview(!showLivePreview)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              showLivePreview
                ? "bg-blue-100 text-blue-700 border border-blue-200"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            <Eye size={14} />
            <span>{showLivePreview ? "Hide Live Preview" : "Show Live Preview"}</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[75vh] overflow-y-auto">
          {/* Form Side */}
          <form
            onSubmit={handleSubmit}
            className={`${
              showLivePreview ? "md:col-span-7" : "md:col-span-12"
            } p-6 space-y-4`}
          >
            {/* Entity Picker */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Select {idCardConfig[entityType].holderLabel} *
              </label>
              {entityType === ID_CARD_ENTITY_TYPES.EMPLOYEE ? (
                <select
                  value={selectedEntityId}
                  onChange={handleSelectEntityChange}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-medium focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">-- Select Employee --</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} ({emp.employeeId || emp.email}) - {emp.designation || "Employee"}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={selectedEntityId}
                  onChange={handleSelectEntityChange}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-medium focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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

            {/* Name & ID Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={customHolderName}
                  onChange={(e) => setCustomHolderName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  required
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {idCardConfig[entityType].identifierLabel}
                </label>
                <input
                  type="text"
                  value={customDisplayId}
                  onChange={(e) => setCustomDisplayId(e.target.value)}
                  placeholder={entityType === ID_CARD_ENTITY_TYPES.EMPLOYEE ? "EMP-1001" : "RP-1001"}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Designation & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Designation
                </label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Senior Frontend Developer"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Engineering / Marketing"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Profile Photo (JPEG/PNG)
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex-1 cursor-pointer flex items-center justify-center space-x-2 rounded-xl border border-dashed border-slate-300 p-3 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/50 transition">
                  <Upload size={18} className="text-slate-500" />
                  <span className="text-xs font-medium text-slate-600">
                    {photoFile ? photoFile.name : "Upload / Replace Photo"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
                {photoPreview && (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="h-12 w-12 rounded-xl object-cover border border-slate-300 shadow-2xs"
                  />
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date of Joining
                </label>
                <input
                  type="date"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Card Expiry Date
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Orientation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Card Orientation
                </label>
                <select
                  value={cardOrientation}
                  onChange={(e) => setCardOrientation(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="Portrait">Portrait (Standard Vertical)</option>
                  <option value="Landscape">Landscape (Horizontal)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
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
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-600/30 transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    <span>Generate ID Card</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Live Preview Side */}
          {showLivePreview && (
            <div className="md:col-span-5 bg-slate-100 p-6 flex flex-col items-center justify-center border-l border-slate-200 min-h-[400px]">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                Realtime Card Preview
              </span>
              <div className="transform scale-90 sm:scale-95 origin-center">
                <IDCardTemplate
                  idCard={mockCardData}
                  entityType={entityType}
                  orientation={cardOrientation}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateIDCardModal;
