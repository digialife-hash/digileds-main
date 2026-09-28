import React, { useState, useEffect } from "react";
import {
  User,
  ShieldCheck,
  Building,
  Lock,
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  CreditCard,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getProfileApi,
  updatePersonalDetailsApi,
  updateContactDetailsApi,
  updateBankDetailsApi,
  uploadProfilePictureApi,
  changePasswordApi,
} from "../../services/partnerProfileService";
import { useAuth } from "../../context/authStore";
import { resolveFileUrl } from "../../utils/urlUtils";

const PartnerProfilePage = () => {
  const { user, setUser, updateUser } = useAuth();
  const [partner, setPartner] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState("personal"); // 'personal', 'contact', 'bank', 'security'

  // Personal Details Form
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [occupation, setOccupation] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("India");
  const [postalCode, setPostalCode] = useState("");

  // Contact Details Form
  const [phone, setPhone] = useState("");
  const [alternateMobile, setAlternateMobile] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");

  // Bank Details Form
  const [accountHolderName, setAccountHolderName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [branchName, setBranchName] = useState("");
  const [upiId, setUpiId] = useState("");

  // Change Password Form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const res = await getProfileApi();
      if (res.success) {
        const u = res.data.user;
        const p = res.data.partner;
        const d = res.data.dashboard;

        setPartner(p);
        setDashboard(d);

        // Sync central auth state if user details changed
        if (u && updateUser) {
          updateUser(u);
        }

        // Populate Form Fields
        setName(u?.name || "");
        setPhone(u?.phone || "");
        if (p?.dob) setDob(new Date(p.dob).toISOString().split("T")[0]);
        setGender(p?.gender || "");
        setOccupation(p?.occupation || "");
        setStreet(p?.address?.street || "");
        setCity(p?.address?.city || "");
        setState(p?.address?.state || "");
        setCountry(p?.address?.country || "India");
        setPostalCode(p?.address?.postalCode || "");
        setAlternateMobile(p?.alternateMobile || "");
        setEmergencyContact(p?.emergencyContact || "");

        if (p?.bankDetails) {
          setAccountHolderName(p.bankDetails.accountHolderName || "");
          setBankName(p.bankDetails.bankName || "");
          setAccountNumber(p.bankDetails.accountNumber || "");
          setIfscCode(p.bankDetails.ifscCode || "");
          setBranchName(p.bankDetails.branchName || "");
          setUpiId(p.bankDetails.upiId || "");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load profile details");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePersonalSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await updatePersonalDetailsApi({
        name,
        dob,
        gender,
        occupation,
        address: { street, city, state, country, postalCode },
      });
      if (res.success) {
        toast.success("Personal details updated successfully");
        if (updateUser) updateUser({ name });
        fetchProfile();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update personal details");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await updateContactDetailsApi({
        phone,
        alternateMobile,
        emergencyContact,
      });
      if (res.success) {
        toast.success("Contact details updated successfully");
        if (updateUser) updateUser({ phone });
        fetchProfile();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update contact details");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBankSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await updateBankDetailsApi({
        accountHolderName,
        bankName,
        accountNumber,
        ifscCode,
        branchName,
        upiId,
      });
      if (res.success) {
        toast.success("Bank details saved successfully");
        fetchProfile();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update bank details");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await changePasswordApi({ currentPassword, newPassword });
      if (res.success) {
        toast.success("Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      toast.loading("Uploading profile picture...");
      const formData = new FormData();
      formData.append("profilePicture", file);
      const res = await uploadProfilePictureApi(formData);
      toast.dismiss();
      if (res.success) {
        toast.success("Profile picture updated!");
        if (res.data?.profilePicture && updateUser) {
          updateUser({ profilePicture: res.data.profilePicture });
        }
        fetchProfile();
      }
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to upload profile picture");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const completion = dashboard?.profileCompletion || 30;

  return (
    <div className="space-y-6">
      {/* Header Profile Dashboard Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-20 w-20 overflow-hidden rounded-2xl bg-blue-50 border-2 border-blue-600 flex items-center justify-center text-blue-600 font-extrabold text-2xl">
              {partner?.profilePicture ? (
                <img
                  src={
                    partner.profilePicture.startsWith("http")
                      ? partner.profilePicture
                      : resolveFileUrl(partner.profilePicture)
                  }
                  alt={name}
                  className="h-full w-full object-cover"
                />
              ) : (
                name.charAt(0).toUpperCase()
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-xl bg-blue-600 text-white shadow-md hover:bg-blue-700">
              <Camera className="h-4 w-4" />
              <input type="file" onChange={handlePictureUpload} accept="image/*" className="hidden" />
            </label>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900">{name}</h1>
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                {dashboard?.partnerLevel} Partner
              </span>
            </div>
            <p className="text-xs font-mono font-bold text-blue-600 mt-0.5">
              Code: {dashboard?.referralCode}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Member since {new Date(dashboard?.joiningDate).toLocaleDateString("en-IN")}
            </p>
          </div>
        </div>

        {/* Completion Bar & Verification Badges */}
        <div className="w-full md:w-72 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-700">Profile Completion</span>
            <span className="text-blue-600">{completion}%</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${completion}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-500 font-medium">KYC Verification</span>
            <span className="font-bold text-emerald-600 uppercase tracking-wider text-[10px] bg-emerald-50 px-2 py-0.5 rounded-md">
              {dashboard?.verificationStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 text-xs font-bold">
        {[
          { key: "personal", label: "Personal Details", icon: User },
          { key: "contact", label: "Contact Details", icon: Phone },
          { key: "bank", label: "Bank Account Details", icon: CreditCard },
          { key: "security", label: "Security & Password", icon: Lock },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-1.5 rounded-t-2xl px-4 py-2.5 transition ${
                activeTab === tab.key
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PERSONAL DETAILS */}
      {activeTab === "personal" && (
        <form onSubmit={handlePersonalSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-600"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-600"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Occupation</label>
              <input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="e.g. Business Consultant"
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-600"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Address Information</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-slate-700">Street Address</label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="House #, Street name..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              <span>Save Personal Details</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: CONTACT DETAILS */}
      {activeTab === "contact" && (
        <form onSubmit={handleContactSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Mobile Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Alternate Mobile</label>
              <input
                type="text"
                value={alternateMobile}
                onChange={(e) => setAlternateMobile(e.target.value)}
                placeholder="Alternate phone..."
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-slate-700">Emergency Contact Phone</label>
              <input
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="Emergency contact..."
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              <span>Save Contact Details</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: BANK DETAILS */}
      {activeTab === "bank" && (
        <form onSubmit={handleBankSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Account Holder Name</label>
              <input
                type="text"
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                placeholder="Name as per bank account"
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Bank Name</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. HDFC Bank"
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Account Number</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Account number"
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">IFSC Code</label>
              <input
                type="text"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                placeholder="IFSC Code"
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-mono font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">UPI ID (Optional)</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. name@upi"
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              <span>Save Bank Account</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: SECURITY & PASSWORD */}
      {activeTab === "security" && (
        <form onSubmit={handlePasswordSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 max-w-md">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              <span>Change Password</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PartnerProfilePage;
