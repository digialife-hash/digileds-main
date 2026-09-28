import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Plus,
  KeyRound,
  Trash2,
  CheckCircle2,
  X,
  Loader2,
  ShieldCheck,
  Award,
  Edit,
  Eye,
  Copy,
  Ban,
  UserCheck,
  UserX,
  MapPin,
  Briefcase,
  Calendar,
  User,
  ShieldAlert,
  FolderCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { ROUTES } from "../../routes/routeConstants";
import CompanyDocumentsManagerModal from "../../components/referrals/CompanyDocumentsManagerModal";

import {
  getAdminPartnerDashboardApi,
  getAllPartnersAdminApi,
  createPartnerAdminApi,
  updatePartnerAdminApi,
  activatePartnerAdminApi,
  deactivatePartnerAdminApi,
  suspendPartnerAdminApi,
  updatePartnerLevelApi,
  resetPartnerPasswordAdminApi,
  deletePartnerAdminApi,
  getPartnerByIdAdminApi,
} from "../../services/adminPartnerService";

const AdminPartnerManagementPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [partners, setPartners] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [kycFilter, setKycFilter] = useState("");
  const [partnerLevelFilter, setPartnerLevelFilter] = useState("");

  // Create Partner Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    partnerLevel: "Authorized",
    territory: "",
    occupation: "",
  });
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [createdPartnerInfo, setCreatedPartnerInfo] = useState(null);

  // Edit Partner Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    partnerLevel: "Authorized",
    territory: "",
    occupation: "",
    status: "active",
  });
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Reset Password Modal State
  const [selectedPartnerId, setSelectedPartnerId] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [isSubmittingReset, setIsSubmittingReset] = useState(false);

  // Detail Drawer State
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Company Documents Modal State
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [docTargetPartner, setDocTargetPartner] = useState(null);


  useEffect(() => {
    fetchPartners();
    fetchDashboardAnalytics();
  }, [pagination.page, statusFilter, kycFilter, partnerLevelFilter, search, activeTab]);

  const fetchPartners = async () => {
    try {
      setIsLoading(true);
      let targetStatus = statusFilter;
      if (activeTab === "active") targetStatus = "active";
      if (activeTab === "inactive") targetStatus = "inactive";
      if (activeTab === "suspended") targetStatus = "suspended";

      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search,
        status: targetStatus,
        kycStatus: kycFilter,
        partnerLevel: partnerLevelFilter,
      };

      const res = await getAllPartnersAdminApi(params);
      if (res.success) {
        setPartners(res.data.partners || []);
        if (res.data.pagination) {
          setPagination((prev) => ({
            ...prev,
            total: res.data.pagination.total,
            totalPages: res.data.pagination.totalPages,
          }));
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load partner directory");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDashboardAnalytics = async () => {
    try {
      const res = await getAdminPartnerDashboardApi();
      if (res.success) setAnalytics(res.data.metrics);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.name || !createForm.email || !createForm.password) {
      toast.error("Name, email and password are required");
      return;
    }

    try {
      setIsSubmittingCreate(true);
      const res = await createPartnerAdminApi(createForm);
      if (res.success) {
        setCreatedPartnerInfo({
          partnerId: res.data.referralCode,
          name: createForm.name,
          email: createForm.email,
          password: createForm.password,
        });
        setCreateForm({
          name: "",
          email: "",
          password: "",
          phone: "",
          partnerLevel: "Authorized",
          territory: "",
          occupation: "",
        });
        fetchPartners();
        fetchDashboardAnalytics();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create partner account");
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  const handleOpenEdit = (partner) => {
    setEditForm({
      id: partner._id,
      name: partner.userId?.name || "",
      email: partner.userId?.email || "",
      phone: partner.userId?.phone || "",
      partnerLevel: partner.partnerLevel || "Authorized",
      territory: partner.territory || "",
      occupation: partner.occupation || "",
      status: partner.status || "active",
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmittingEdit(true);
      const res = await updatePartnerAdminApi(editForm.id, editForm);
      if (res.success) {
        toast.success("Partner profile updated successfully");
        setShowEditModal(false);
        fetchPartners();
        fetchDashboardAnalytics();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update partner profile");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleActivate = async (id) => {
    try {
      const res = await activatePartnerAdminApi(id);
      if (res.success) {
        toast.success("Partner account activated!");
        fetchPartners();
        fetchDashboardAnalytics();
      }
    } catch (err) {
      toast.error("Failed to activate partner account");
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this partner account?")) return;
    try {
      const res = await deactivatePartnerAdminApi(id);
      if (res.success) {
        toast.success("Partner account deactivated");
        fetchPartners();
        fetchDashboardAnalytics();
      }
    } catch (err) {
      toast.error("Failed to deactivate partner account");
    }
  };

  const handleSuspend = async (id) => {
    if (!window.confirm("Are you sure you want to suspend this partner account?")) return;
    try {
      const res = await suspendPartnerAdminApi(id);
      if (res.success) {
        toast.success("Partner account suspended");
        fetchPartners();
        fetchDashboardAnalytics();
      }
    } catch (err) {
      toast.error("Failed to suspend partner account");
    }
  };

  const handleLevelChange = async (id, level) => {
    try {
      const res = await updatePartnerLevelApi(id, { partnerLevel: level });
      if (res.success) {
        toast.success(`Partner level upgraded to ${level}`);
        fetchPartners();
      }
    } catch (err) {
      toast.error("Failed to update partner level");
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    try {
      setIsSubmittingReset(true);
      const res = await resetPartnerPasswordAdminApi(selectedPartnerId, { newPassword });
      if (res.success) {
        toast.success("Partner password reset successfully!");
        setShowResetModal(false);
        setNewPassword("");
        setSelectedPartnerId(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setIsSubmittingReset(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this partner account? This cannot be undone.")) return;

    try {
      const res = await deletePartnerAdminApi(id);
      if (res.success) {
        toast.success("Partner account deleted");
        fetchPartners();
        fetchDashboardAnalytics();
      }
    } catch (err) {
      toast.error("Failed to delete partner account");
    }
  };

  const handleViewDetail = async (id) => {
    try {
      setShowDetailDrawer(true);
      setLoadingDetail(true);
      const res = await getPartnerByIdAdminApi(id);
      if (res.success) {
        setDetailData(res.data);
      }
    } catch (err) {
      toast.error("Failed to load partner details");
    } finally {
      setLoadingDetail(false);
    }
  };

  const copyCredentials = (info) => {
    const text = `Referral Partner Login Credentials:\nPartner ID: ${info.partnerId}\nEmail: ${info.email}\nPassword: ${info.password}\nLogin Portal: ${window.location.origin}/login`;
    navigator.clipboard.writeText(text);
    toast.success("Credentials copied to clipboard!");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Referral Partner Accounts
          </h1>
          <p className="text-xs font-semibold text-slate-500">
            Admin-controlled partner onboarding, account provisioning & role management
          </p>
        </div>

        <button
          onClick={() => {
            setCreatedPartnerInfo(null);
            setShowCreateModal(true);
          }}
          className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Create Referral Partner</span>
        </button>
      </div>

      {/* Top Partner Hub Sub-Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <Link
          to={ROUTES.SUPER_ADMIN_PARTNER_MANAGEMENT}
          className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs"
        >
          Partner Directory
        </Link>
        <Link
          to={ROUTES.SUPER_ADMIN_REFERRALS}
          className="rounded-xl bg-slate-100 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
        >
          Referral Clients
        </Link>
        <Link
          to={ROUTES.SUPER_ADMIN_COMMISSIONS}
          className="rounded-xl bg-slate-100 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
        >
          Commissions
        </Link>
        <Link
          to={ROUTES.SUPER_ADMIN_ID_CARDS}
          className="rounded-xl bg-slate-100 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
        >
          Digital ID Cards
        </Link>
        <Link
          to={ROUTES.SUPER_ADMIN_CERTIFICATES}
          className="rounded-xl bg-slate-100 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
        >
          Certificates
        </Link>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-4">
        {[
          { title: "Total Partners", val: analytics?.totalPartners || 0, color: "text-blue-600", bg: "bg-blue-50/50" },
          { title: "Active Accounts", val: analytics?.activePartners || 0, color: "text-emerald-600", bg: "bg-emerald-50/50" },
          { title: "Inactive / Suspended", val: (analytics?.inactivePartners || 0) + (analytics?.suspendedPartners || 0), color: "text-rose-600", bg: "bg-rose-50/50" },
          { title: "Verified KYC", val: analytics?.verifiedPartners || 0, color: "text-purple-600", bg: "bg-purple-50/50" },
        ].map((c, i) => (
          <div key={i} className={`rounded-2xl border border-slate-200 ${c.bg} p-4 shadow-xs`}>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{c.title}</span>
            <div className={`mt-1 text-2xl font-black ${c.color}`}>{c.val}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 text-xs font-bold">
        {[
          { key: "all", label: `All Partners (${analytics?.totalPartners || 0})` },
          { key: "active", label: `Active (${analytics?.activePartners || 0})` },
          { key: "inactive", label: `Inactive (${analytics?.inactivePartners || 0})` },
          { key: "suspended", label: `Suspended (${analytics?.suspendedPartners || 0})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-t-2xl px-4 py-2.5 transition ${
              activeTab === tab.key
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Partner ID, Name, Email, Territory..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={partnerLevelFilter}
            onChange={(e) => setPartnerLevelFilter(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
          >
            <option value="">All Partner Tiers</option>
            <option value="Authorized">Authorized</option>
            <option value="Verified">Verified</option>
            <option value="Gold">Gold</option>
            <option value="Platinum">Platinum</option>
          </select>

          <select
            value={kycFilter}
            onChange={(e) => setKycFilter(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
          >
            <option value="">All KYC Status</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-bold text-slate-700 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3.5">Partner ID</th>
                <th className="px-4 py-3.5">Full Name</th>
                <th className="px-4 py-3.5">Contact Details</th>
                <th className="px-4 py-3.5">Territory</th>
                <th className="px-4 py-3.5">Partner Level</th>
                <th className="px-4 py-3.5">Account Status</th>
                <th className="px-4 py-3.5">Joined Date</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-600" />
                    <span className="mt-2 block">Loading partner directory...</span>
                  </td>
                </tr>
              ) : partners.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    No referral partner records found
                  </td>
                </tr>
              ) : (
                partners.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3.5 font-mono font-bold text-blue-600">
                      {p.referralCode}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      {p.userId?.name || "Partner"}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      <span className="block font-semibold">{p.userId?.email}</span>
                      <span className="text-[11px] text-slate-400">{p.userId?.phone || "No phone"}</span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-700">
                      {p.territory || p.occupation || "Global"}
                    </td>
                    <td className="px-4 py-3.5">
                      <select
                        value={p.partnerLevel || "Authorized"}
                        onChange={(e) => handleLevelChange(p._id, e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-800 focus:outline-none"
                      >
                        <option value="Authorized">Authorized</option>
                        <option value="Verified">Verified</option>
                        <option value="Gold">Gold</option>
                        <option value="Platinum">Platinum</option>
                      </select>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${
                          p.status === "active"
                            ? "bg-emerald-50 text-emerald-700"
                            : p.status === "suspended"
                            ? "bg-rose-50 text-rose-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            p.status === "active"
                              ? "bg-emerald-600"
                              : p.status === "suspended"
                              ? "bg-rose-600"
                              : "bg-amber-600"
                          }`}
                        />
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[11px] text-slate-500">
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {/* View Drawer */}
                        <button
                          onClick={() => handleViewDetail(p._id)}
                          title="View Partner Details"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {/* Company Documents */}
                        <button
                          onClick={() => {
                            setDocTargetPartner({
                              _id: p._id,
                              name: p.userId?.name,
                              referralCode: p.referralCode,
                              email: p.userId?.email,
                            });
                            setShowDocsModal(true);
                          }}
                          title="Manage Company Documents"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <FolderCheck className="h-4 w-4" />
                        </button>

                        {/* Edit Partner */}
                        <button
                          onClick={() => handleOpenEdit(p)}
                          title="Edit Partner Profile"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                          <Edit className="h-4 w-4" />
                        </button>


                        {/* Status Toggle */}
                        {p.status === "active" ? (
                          <button
                            onClick={() => handleDeactivate(p._id)}
                            title="Deactivate Account"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-amber-50 hover:text-amber-600"
                          >
                            <UserX className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(p._id)}
                            title="Activate Account"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                        )}

                        {/* Reset Password */}
                        <button
                          onClick={() => {
                            setSelectedPartnerId(p._id);
                            setShowResetModal(true);
                          }}
                          title="Reset Password"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-purple-50 hover:text-purple-600"
                        >
                          <KeyRound className="h-4 w-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(p._id)}
                          title="Delete Partner"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Partner */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Create Referral Partner</h2>
                <p className="text-xs font-semibold text-slate-500">
                  Provision new Referral Partner account with auto-generated Partner ID
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {createdPartnerInfo ? (
              <div className="p-6 space-y-5 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Partner Account Created!</h3>
                  <p className="text-xs font-semibold text-slate-500">
                    Share the following login credentials securely with the partner.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans font-bold">Partner ID:</span>
                    <span className="font-bold text-blue-600">{createdPartnerInfo.partnerId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans font-bold">Email:</span>
                    <span className="font-bold text-slate-800">{createdPartnerInfo.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans font-bold">Initial Password:</span>
                    <span className="font-bold text-slate-800">{createdPartnerInfo.password}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => copyCredentials(createdPartnerInfo)}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copy Credentials</span>
                  </button>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={createForm.name}
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={createForm.email}
                      onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                      placeholder="partner@company.com"
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Initial Password *</label>
                    <input
                      type="password"
                      required
                      minLength="8"
                      value={createForm.password}
                      onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                      placeholder="At least 8 characters"
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Phone / Mobile</label>
                    <input
                      type="text"
                      value={createForm.phone}
                      onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                      placeholder="10-digit mobile"
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Partner Tier Level</label>
                    <select
                      value={createForm.partnerLevel}
                      onChange={(e) => setCreateForm({ ...createForm, partnerLevel: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="Authorized">Authorized Partner</option>
                      <option value="Verified">Verified Partner</option>
                      <option value="Gold">Gold Partner</option>
                      <option value="Platinum">Platinum Partner</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Assigned Territory</label>
                    <input
                      type="text"
                      value={createForm.territory}
                      onChange={(e) => setCreateForm({ ...createForm, territory: e.target.value })}
                      placeholder="e.g. North Region / Delhi"
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Occupation / Domain</label>
                  <input
                    type="text"
                    value={createForm.occupation}
                    onChange={(e) => setCreateForm({ ...createForm, occupation: e.target.value })}
                    placeholder="e.g. Business Consultant"
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingCreate}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmittingCreate ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    <span>Create Partner Account</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Edit Partner */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
              <h2 className="text-base font-bold text-slate-900">Edit Partner Profile</h2>
              <button onClick={() => setShowEditModal(false)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Phone</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Account Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Partner Tier Level</label>
                  <select
                    value={editForm.partnerLevel}
                    onChange={(e) => setEditForm({ ...editForm, partnerLevel: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:outline-none"
                  >
                    <option value="Authorized">Authorized</option>
                    <option value="Verified">Verified</option>
                    <option value="Gold">Gold</option>
                    <option value="Platinum">Platinum</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Territory</label>
                  <input
                    type="text"
                    value={editForm.territory}
                    onChange={(e) => setEditForm({ ...editForm, territory: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmittingEdit ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reset Password */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
              <h2 className="text-base font-bold text-slate-900">Reset Partner Password</h2>
              <button onClick={() => setShowResetModal(false)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="p-6 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">New Password *</label>
                <input
                  type="password"
                  required
                  minLength="8"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter at least 8 characters"
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReset}
                  className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-purple-700 disabled:opacity-50"
                >
                  {isSubmittingReset ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                  <span>Reset Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Drawer: Partner Details */}
      {showDetailDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-xs">
          <div className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 p-5 bg-slate-50">
              <h2 className="text-base font-bold text-slate-900">Referral Partner Details</h2>
              <button onClick={() => setShowDetailDrawer(false)} className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {loadingDetail || !detailData ? (
                <div className="py-20 text-center text-slate-400">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-600" />
                  <span>Loading partner details...</span>
                </div>
              ) : (
                <>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono font-black text-blue-600">{detailData.partner.referralCode}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${
                        detailData.partner.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                      }`}>
                        {detailData.partner.status}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-slate-900">{detailData.partner.userId?.name}</h3>
                    <p className="text-xs font-semibold text-slate-500">{detailData.partner.userId?.email}</p>
                    <p className="text-xs font-semibold text-slate-500">{detailData.partner.userId?.phone || "No phone registered"}</p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Information</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Partner Tier:</span>
                        <span className="font-bold text-slate-900">{detailData.partner.partnerLevel}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Territory:</span>
                        <span className="font-bold text-slate-900">{detailData.partner.territory || "Not specified"}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Occupation / Domain:</span>
                        <span className="font-bold text-slate-900">{detailData.partner.occupation || "N/A"}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Created By:</span>
                        <span className="font-bold text-slate-900">{detailData.partner.createdBy?.name || "System Admin"}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Joining Date:</span>
                        <span className="font-bold text-slate-900">{new Date(detailData.partner.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Last Login:</span>
                        <span className="font-bold text-slate-900">
                          {detailData.partner.userId?.lastLogin
                            ? new Date(detailData.partner.userId.lastLogin).toLocaleString()
                            : "Never logged in"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Performance Overview</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                        <span className="text-xs font-semibold text-slate-500">Total Referrals</span>
                        <div className="text-lg font-black text-blue-600">{detailData.referrals?.length || 0}</div>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                        <span className="text-xs font-semibold text-slate-500">Total Commissions</span>
                        <div className="text-lg font-black text-emerald-600">{detailData.commissions?.length || 0}</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Manage Company Documents */}
      <CompanyDocumentsManagerModal
        isOpen={showDocsModal}
        onClose={() => setShowDocsModal(false)}
        partner={docTargetPartner}
      />
    </div>
  );
};

export default AdminPartnerManagementPage;
