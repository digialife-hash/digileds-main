import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  ExternalLink,
  Loader2,
  Trash2,
  Volume2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getNotificationsApi,
  markAsReadApi,
  markAllAsReadApi,
} from "../../services/notificationService";
import { useAuth } from "../../context/authStore";

const NotificationBellDropdown = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchBellNotifications();
    const interval = setInterval(fetchBellNotifications, 30000); // Auto refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchBellNotifications = async () => {
    try {
      const res = await getNotificationsApi({ limit: 5, isRead: "false" });
      if (res.success) {
        setUnreadCount(res.data.unreadCount || 0);
        setNotifications(res.data.notifications || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAsRead = async (id, link) => {
    try {
      await markAsReadApi(id);
      fetchBellNotifications();
      if (link) {
        setIsOpen(false);
        navigate(link);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadApi();
      toast.success("All notifications marked as read");
      fetchBellNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const navPath =
    user?.role === "super_admin"
      ? "/super-admin/notifications"
      : "/referral-partner/notifications";

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-2xl border border-slate-200/80 bg-white p-2.5 text-slate-600 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition"
        title="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-extrabold text-white shadow-md animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 z-50 w-80 sm:w-96 overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xl transition-all">
          {/* Panel Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-slate-900">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                  {unreadCount} Unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800"
              >
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
          </div>

          {/* List Body */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <Bell className="mx-auto h-6 w-6 text-slate-300 mb-1" />
                <p className="font-semibold">No unread notifications</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item._id}
                  onClick={() => handleMarkAsRead(item._id, item.link)}
                  className="group flex cursor-pointer items-start gap-3 p-3.5 hover:bg-blue-50/40 transition"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold">
                    <Bell className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="font-bold text-slate-900 line-clamp-1">
                      {item.title}
                    </p>
                    <p className="text-[11px] font-medium text-slate-600 line-clamp-2">
                      {item.message}
                    </p>
                    <span className="text-[10px] text-slate-400 block pt-1">
                      {new Date(item.createdAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Panel Footer */}
          <div className="border-t border-slate-100 bg-slate-50/50 p-2.5 text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate(navPath);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800"
            >
              <span>View All Notifications</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBellDropdown;
