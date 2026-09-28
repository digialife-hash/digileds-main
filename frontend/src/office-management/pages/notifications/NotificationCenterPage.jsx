import React, { useState, useEffect } from "react";
import {
  Bell,
  Search,
  CheckCheck,
  Check,
  Archive,
  Trash2,
  RefreshCw,
  FileSpreadsheet,
  BarChart2,
  Sliders,
  FileCode,
  ListFilter,
  Plus,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
  MessageSquare,
  MessageCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getNotificationsApi,
  getNotificationAnalyticsApi,
  getNotificationTemplatesApi,
  markAsReadApi,
  markAllAsReadApi,
  deleteNotificationApi,
  archiveNotificationApi,
  resendNotificationApi,
  exportNotificationsApi,
} from "../../services/notificationService";
import { useAuth } from "../../context/authStore";

import NotificationAnalyticsDashboard from "../../components/notifications/NotificationAnalyticsDashboard";
import NotificationPreferencesModal from "../../components/notifications/NotificationPreferencesModal";
import NotificationTemplateModal from "../../components/notifications/NotificationTemplateModal";

const CATEGORY_OPTIONS = [
  "Referral Updates",
  "Commission Updates",
  "Payment Updates",
  "Certificate Updates",
  "ID Card Updates",
  "Account Updates",
  "Document Expiry",
];

const CHANNEL_OPTIONS = ["Dashboard", "Email", "SMS", "WhatsApp"];
const STATUS_OPTIONS = ["Pending", "Queued", "Sending", "Delivered", "Failed", "Read", "Archived"];

const NotificationCenterPage = () => {
  const { user } = useAuth();
  const isAdmin = ["super_admin", "admin"].includes(user?.role);

  const [activeTab, setActiveTab] = useState("all"); // 'all', 'analytics', 'templates'
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [templates, setTemplates] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [analytics, setAnalytics] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  // Filters State
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedChannel, setSelectedChannel] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Modals
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  useEffect(() => {
    fetchNotifications();
    fetchAnalytics();
    if (isAdmin) fetchTemplates();
  }, [pagination.page, selectedCategory, selectedChannel, selectedStatus, search]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search,
        category: selectedCategory,
        deliveryChannel: selectedChannel,
        status: selectedStatus,
      };

      const res = await getNotificationsApi(params);
      if (res.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
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
      toast.error("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setIsLoadingAnalytics(true);
      const res = await getNotificationAnalyticsApi();
      if (res.success) {
        setAnalytics(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await getNotificationTemplatesApi();
      if (res.success && res.data?.templates) {
        setTemplates(res.data.templates);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      const res = await markAsReadApi(id);
      if (res.success) {
        toast.success("Notification marked as read");
        fetchNotifications();
        fetchAnalytics();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await markAllAsReadApi();
      if (res.success) {
        toast.success("All notifications marked as read");
        fetchNotifications();
        fetchAnalytics();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to mark all as read");
    }
  };

  const handleArchive = async (id) => {
    try {
      const res = await archiveNotificationApi(id);
      if (res.success) {
        toast.success("Notification archived");
        fetchNotifications();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to archive notification");
    }
  };

  const handleResend = async (id) => {
    try {
      toast.loading("Resending notification...");
      const res = await resendNotificationApi(id);
      toast.dismiss();
      if (res.success) {
        toast.success("Notification resent successfully");
        fetchNotifications();
        fetchAnalytics();
      }
    } catch (err) {
      toast.dismiss();
      console.error(err);
      toast.error("Failed to resend notification");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) return;

    try {
      const res = await deleteNotificationApi(id);
      if (res.success) {
        toast.success("Notification deleted");
        fetchNotifications();
        fetchAnalytics();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete notification");
    }
  };

  const handleExport = async () => {
    try {
      toast.loading("Exporting notifications...");
      const response = await exportNotificationsApi({
        search,
        category: selectedCategory,
        deliveryChannel: selectedChannel,
        status: selectedStatus,
      });

      toast.dismiss();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `notifications-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Notifications exported successfully");
    } catch (err) {
      toast.dismiss();
      console.error(err);
      toast.error("Failed to export notifications");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Notification Center
            </h1>
            {unreadCount > 0 && (
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs font-semibold text-slate-500">
            Centralized notification logs, preferences & automation rules
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100"
            >
              <CheckCheck className="h-4 w-4" />
              <span>Mark All Read</span>
            </button>
          )}

          <button
            onClick={() => setShowPreferencesModal(true)}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50"
          >
            <Sliders className="h-4 w-4 text-blue-600" />
            <span>Preferences</span>
          </button>

          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "all"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            <ListFilter className="h-4 w-4" />
            <span>Notifications Log</span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "analytics"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            <BarChart2 className="h-4 w-4" />
            <span>Analytics Dashboard</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab("templates")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === "templates"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              <FileCode className="h-4 w-4" />
              <span>Automation Templates ({templates.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: ALL NOTIFICATIONS TABLE */}
      {activeTab === "all" && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                placeholder="Search Title, Message, ID..."
                className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800"
              >
                <option value="">All Categories</option>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={selectedChannel}
                onChange={(e) => {
                  setSelectedChannel(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800"
              >
                <option value="">All Channels</option>
                {CHANNEL_OPTIONS.map((ch) => (
                  <option key={ch} value={ch}>
                    {ch}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800"
              >
                <option value="">All Statuses</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-3xl border border-slate-200/80 bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/80 font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3.5">ID & Title</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Channel</th>
                  <th className="px-4 py-3.5">Recipient</th>
                  <th className="px-4 py-3.5">Date & Time</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {isLoading ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        <span className="text-xs text-slate-500 font-semibold">
                          Loading notifications...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : notifications.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Bell className="h-8 w-8 text-slate-300" />
                        <p className="text-xs font-bold text-slate-600">
                          No notifications found
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  notifications.map((item) => (
                    <tr
                      key={item._id}
                      className={`group hover:bg-slate-50/80 transition-colors ${
                        !item.readAt ? "bg-blue-50/20" : ""
                      }`}
                    >
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5 max-w-sm">
                          <span className="font-mono text-[10px] font-bold text-blue-600 block">
                            {item.notificationId || "NOTIF-ID"}
                          </span>
                          <span className="font-bold text-slate-900 block">
                            {item.title}
                          </span>
                          <p className="text-[11px] text-slate-500 line-clamp-1">
                            {item.message}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-bold text-slate-800 whitespace-nowrap">
                        {item.category || "Account Updates"}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                          {item.deliveryChannel === "Email" && <Mail className="h-3.5 w-3.5 text-indigo-600" />}
                          {item.deliveryChannel === "SMS" && <MessageSquare className="h-3.5 w-3.5 text-purple-600" />}
                          {item.deliveryChannel === "WhatsApp" && <MessageCircle className="h-3.5 w-3.5 text-teal-600" />}
                          {item.deliveryChannel === "Dashboard" && <Bell className="h-3.5 w-3.5 text-blue-600" />}
                          <span>{item.deliveryChannel || "Dashboard"}</span>
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-semibold text-slate-800 whitespace-nowrap">
                        {item.recipientUser?.name || "User"}
                      </td>

                      <td className="px-4 py-3.5 text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleDateString("en-IN")}{" "}
                        {new Date(item.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            !item.readAt
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {!item.readAt ? "Unread" : "Read"}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {!item.readAt && (
                            <button
                              onClick={() => handleMarkAsRead(item._id)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                              title="Mark Read"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}

                          {isAdmin && (
                            <button
                              onClick={() => handleResend(item._id)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-purple-50 hover:text-purple-600"
                              title="Resend Notification"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </button>
                          )}

                          <button
                            onClick={() => handleArchive(item._id)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                            title="Archive"
                          >
                            <Archive className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(item._id)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                            title="Delete"
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

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-xs">
              <span className="font-semibold text-slate-500">
                Showing {notifications.length} of {pagination.total} notifications
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                  className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="font-bold text-slate-800">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                  className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ANALYTICS DASHBOARD */}
      {activeTab === "analytics" && (
        <NotificationAnalyticsDashboard
          analytics={analytics}
          isLoading={isLoadingAnalytics}
        />
      )}

      {/* TAB 3: ADMIN AUTOMATION TEMPLATES */}
      {activeTab === "templates" && isAdmin && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Notification Automation Templates
            </h2>
            <button
              onClick={() => {
                setEditingTemplate(null);
                setShowTemplateModal(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-purple-500/20 hover:bg-purple-700"
            >
              <Plus className="h-4 w-4" />
              <span>Create Template</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((tpl) => (
              <div
                key={tpl._id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg">
                    {tpl.templateCode}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">
                    {tpl.category}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">{tpl.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {tpl.dashboardTemplate || tpl.emailTemplate}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-center justify-end">
                  <button
                    onClick={() => {
                      setEditingTemplate(tpl);
                      setShowTemplateModal(true);
                    }}
                    className="text-xs font-bold text-purple-600 hover:text-purple-800"
                  >
                    Edit Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <NotificationPreferencesModal
        isOpen={showPreferencesModal}
        onClose={() => setShowPreferencesModal(false)}
        onSuccess={() => {
          fetchNotifications();
          fetchAnalytics();
        }}
      />

      <NotificationTemplateModal
        isOpen={showTemplateModal}
        onClose={() => {
          setShowTemplateModal(false);
          setEditingTemplate(null);
        }}
        template={editingTemplate}
        onSuccess={() => {
          fetchTemplates();
        }}
      />
    </div>
  );
};

export default NotificationCenterPage;
