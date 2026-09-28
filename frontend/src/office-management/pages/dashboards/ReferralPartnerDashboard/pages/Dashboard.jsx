import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  LogOut,
  X,
  User,
  Plus,
  RefreshCcw,
  AlertCircle,
  Building,
  Phone,
  Mail,
  UserCheck,
} from "lucide-react";
import { useAuth } from "../../../../context/authStore";
import { ROUTES } from "../../../../routes/routeConstants";
import LoadingSpinner from "../../../../components/common/LoadingSpinner";
import AddReferralModal from "../../../../components/referrals/AddReferralModal";
import PartnerCompanyDocumentsModal from "../../../../components/referrals/PartnerCompanyDocumentsModal";


import {
  getDashboardStatsApi,
  getDashboardAnalyticsApi,
  getActivitiesApi,
  getNotificationsApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
  getReferralsApi,
  getCommissionsApi,
  updatePartnerProfileApi,
} from "../../../../services/referralPartnerService";

import DashboardCards from "../components/DashboardCards";
import Analytics from "../components/Analytics";
import RecentActivities from "../components/RecentActivities";
import Notifications from "../components/Notifications";
import QuickActions from "../components/QuickActions";
import ReferralWidget from "../components/ReferralWidget";
import PerformanceSummary from "../components/PerformanceSummary";
import ReminderWidget from "../components/ReminderWidget";
import { resolveFileUrl } from "../../../../utils/urlUtils";

const ReferralPartnerDashboard = () => {
  const navigate = useNavigate();
  const { logout, user, updateUser } = useAuth();

  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [activityPage, setActivityPage] = useState(1);
  const [activitySearch, setActivitySearch] = useState("");
  const [activityPagination, setActivityPagination] = useState(null);

  // Modal States
  const [isReferModalOpen, setIsReferModalOpen] = useState(false);
  const [isReferralsModalOpen, setIsReferralsModalOpen] = useState(false);
  const [isCommissionsModalOpen, setIsCommissionsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCompanyDocsModalOpen, setIsCompanyDocsModalOpen] = useState(false);


  // Modal List Data
  const [referralList, setReferralList] = useState([]);
  const [commissionList, setCommissionList] = useState([]);

  // Profile Form State
  const [profileFormData, setProfileFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    profilePicture: "",
  });

  useEffect(() => {
    if (user) {
      setProfileFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const results = await Promise.allSettled([
        getDashboardStatsApi(),
        getDashboardAnalyticsApi(),
        getNotificationsApi(),
      ]);

      const [statsResult, analyticsResult, notificationsResult] = results;

      if (statsResult.status === "fulfilled") {
        setStats(statsResult.value.data);
        const p = statsResult.value.data?.partner;
        if (p && updateUser) {
          updateUser({
            name: p.name,
            email: p.email,
            phone: p.phone,
            profilePicture: p.profilePicture,
          });
        }
      } else {
        setErrorMessage("Failed to load partner statistics");
      }

      if (analyticsResult.status === "fulfilled") {
        setAnalytics(analyticsResult.value.data);
      }

      if (notificationsResult.status === "fulfilled") {
        setNotifications(notificationsResult.value.data.notifications || []);
        setUnreadCount(notificationsResult.value.data.unreadCount || 0);
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchActivities = useCallback(async (page = 1, search = "") => {
    try {
      setActivitiesLoading(true);
      const res = await getActivitiesApi({ page, limit: 5, search });
      setActivities(res.data.activities || []);
      setActivityPagination(res.data.pagination || null);
    } catch {
      toast.error("Failed to load activities");
    } finally {
      setActivitiesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchActivities(1, "");
  }, [fetchDashboardData, fetchActivities]);

  const handlePageChange = (newPage) => {
    setActivityPage(newPage);
    fetchActivities(newPage, activitySearch);
  };

  const handleSearch = (searchVal) => {
    setActivitySearch(searchVal);
    setActivityPage(1);
    fetchActivities(1, searchVal);
  };

  const handleMarkRead = async (id) => {
    try {
      await markNotificationReadApi(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsReadApi();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch {}
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await updatePartnerProfileApi(profileFormData);
      toast.success("Profile updated successfully!");
      setIsProfileModalOpen(false);
      fetchDashboardData();
    } catch {
      toast.error("Failed to update profile");
    }
  };

  // Open modals & load lists
  const openReferralsModal = async () => {
    try {
      setIsReferralsModalOpen(true);
      const res = await getReferralsApi();
      setReferralList(res.data.referrals || []);
    } catch {
      toast.error("Failed to fetch referrals list");
    }
  };

  const openCommissionsModal = async () => {
    try {
      setIsCommissionsModalOpen(true);
      const res = await getCommissionsApi();
      setCommissionList(res.data.commissions || []);
    } catch {
      toast.error("Failed to fetch commissions list");
    }
  };

  const handleClientAddedSuccess = () => {
    fetchDashboardData();
    fetchActivities(1, "");
  };

  const formatDateString = (dateVal) => {
    if (!dateVal) return "—";
    try {
      const d = new Date(dateVal);
      return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  };

  return (
    <div className="space-y-6 text-slate-900">
      {/* Top Header Card */}
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            {stats?.partner?.profilePicture ? (
              <img
                src={
                  stats.partner.profilePicture.startsWith("http")
                    ? stats.partner.profilePicture
                    : resolveFileUrl(stats.partner.profilePicture)
                }
                alt="Profile"
                className="h-14 w-14 rounded-2xl border-2 border-blue-600 object-cover shadow-sm"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-slate-200 bg-slate-100 text-slate-600">
                <User size={24} />
              </div>
            )}
            <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-950 sm:text-2xl">
                Welcome, {stats?.partner?.name || user?.name}
              </h1>
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-blue-700 ring-1 ring-blue-200">
                Referral Partner
              </span>
            </div>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              Partner ID: <span className="font-mono font-bold text-slate-800">{stats?.partner?.referralCode || "N/A"}</span> • Member Since:{" "}
              {formatDateString(stats?.partner?.memberSince)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsReferModalOpen(true)}
            className="flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700 active:scale-95"
          >
            <Plus size={16} /> Refer New Client
          </button>
          <button
            onClick={fetchDashboardData}
            title="Refresh Dashboard"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-xs transition hover:bg-slate-50 hover:text-slate-900"
          >
            <RefreshCcw size={16} />
          </button>
          <button
            onClick={logout}
            className="flex h-10 items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 text-xs font-bold text-rose-700 transition hover:bg-rose-100 active:scale-95"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </header>

      {/* Main dashboard content */}
      {loading && (
        <div className="flex min-h-96 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-xs">
          <LoadingSpinner />
        </div>
      )}

      {!loading && errorMessage && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm font-medium text-rose-800">
          <AlertCircle className="mt-0.5 shrink-0 text-rose-600" size={20} />
          <div>
            <p className="font-bold">Unable to load dashboard</p>
            <p className="mt-1 text-rose-700">{errorMessage}</p>
            <button
              onClick={fetchDashboardData}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700"
            >
              <RefreshCcw size={14} /> Retry Loading
            </button>
          </div>
        </div>
      )}

      {!loading && !errorMessage && (
        <div className="space-y-6">
          <DashboardCards statistics={stats} loading={loading} />

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Analytics analyticsData={analytics} loading={loading} />
              <RecentActivities
                activities={activities}
                pagination={activityPagination}
                onPageChange={handlePageChange}
                onSearch={handleSearch}
                loading={activitiesLoading}
              />
            </div>

            <div className="space-y-6">
              <ReferralWidget referralCode={stats?.partner?.referralCode} />
              <QuickActions
                onReferClick={() => setIsReferModalOpen(true)}
                onViewReferrals={() => navigate(ROUTES.REFERRAL_PARTNER_REFERRALS)}
                onViewCommissions={() => navigate(ROUTES.REFERRAL_PARTNER_COMMISSIONS)}
                onViewCompanyDocs={() => setIsCompanyDocsModalOpen(true)}
                onDownloadID={() => {
                  if (stats?.statistics?.documents?.idCardUrl) {
                    window.open(stats.statistics.documents.idCardUrl);
                  } else {
                    navigate(ROUTES.REFERRAL_PARTNER_ID_CARD);
                  }
                }}
                onDownloadCert={() => {
                  if (stats?.statistics?.documents?.certificateUrl) {
                    window.open(stats.statistics.documents.certificateUrl);
                  } else {
                    navigate(ROUTES.REFERRAL_PARTNER_CERTIFICATES);
                  }
                }}
                onContactSupport={() => navigate(ROUTES.REFERRAL_PARTNER_SUPPORT)}
                onUpdateProfile={() => navigate(ROUTES.REFERRAL_PARTNER_PROFILE)}
              />

              <PerformanceSummary statistics={stats?.statistics} />
              <ReminderWidget statistics={stats} />
              <Notifications
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkRead={handleMarkRead}
                onMarkAllRead={handleMarkAllRead}
                loading={loading}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal: Refer New Client with Full Client Details & Attachments */}
      <AddReferralModal
        isOpen={isReferModalOpen}
        onClose={() => setIsReferModalOpen(false)}
        onSuccess={handleClientAddedSuccess}
      />

      {/* Modal: Referrals List */}
      {isReferralsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-950">Your Referred Clients</h3>
              <button
                onClick={() => setIsReferralsModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-4 overflow-x-auto max-h-[360px]">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Client Name</th>
                    <th className="p-3">Contact Info</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {referralList.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-6 text-center text-slate-500 font-semibold">
                        No referrals found.
                      </td>
                    </tr>
                  ) : (
                    referralList.map((ref) => (
                      <tr key={ref._id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{ref.clientName}</td>
                        <td className="p-3">
                          <div className="font-semibold">{ref.clientEmail}</div>
                          <div className="text-[10px] text-slate-500">{ref.clientPhone || ref.mobileNumber}</div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                              ref.status?.toLowerCase() === "converted"
                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                                : ref.status?.toLowerCase() === "rejected" || ref.status?.toLowerCase() === "cancelled"
                                ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                                : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                            }`}
                          >
                            {ref.status}
                          </span>
                        </td>
                        <td className="p-3 text-[11px] font-medium text-slate-500">
                          {formatDateString(ref.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Commissions List */}
      {isCommissionsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-950">Commissions History</h3>
              <button
                onClick={() => setIsCommissionsModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-4 overflow-x-auto max-h-[360px]">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Referral</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {commissionList.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-6 text-center text-slate-500 font-semibold">
                        No commissions generated.
                      </td>
                    </tr>
                  ) : (
                    commissionList.map((comm) => (
                      <tr key={comm._id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">
                          {comm.referralId?.clientName || "Unknown Referral"}
                        </td>
                        <td className="p-3 font-black text-emerald-600">₹{(comm.amount || 0).toLocaleString("en-IN")}</td>
                        <td className="p-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                              comm.status === "paid"
                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                                : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                            }`}
                          >
                            {comm.status}
                          </span>
                        </td>
                        <td className="p-3 text-[11px] font-medium text-slate-500">
                          {formatDateString(comm.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Company Documents */}
      <PartnerCompanyDocumentsModal
        isOpen={isCompanyDocsModalOpen}
        onClose={() => setIsCompanyDocsModalOpen(false)}
      />
    </div>
  );
};

export default ReferralPartnerDashboard;
