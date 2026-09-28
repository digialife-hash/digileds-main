import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth.js";
import Sidebar from "./Sidebar.jsx";
import MobileMenu from "./MobileMenu.jsx";
import { useNotifications } from "../../context/NotificationContext.jsx";
import ThemeToggleButton from "../../../components/ui/ThemeToggleButton.jsx";
import "../../index.css";

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotifications();
  const recentNotifications = notifications
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const userName = user?.name || "Ashish";
  const userInitial =
    userName.charAt(0).toUpperCase();

  return (
    <div className="social-dashboard-shell min-h-screen bg-[#faf9f7] text-stone-900 transition-colors duration-300 dark:bg-[#070b14] dark:text-slate-100">
      {/* =====================================================
          DESKTOP SIDEBAR
      ====================================================== */}

      <Sidebar />

      {/* =====================================================
          MOBILE MENU
      ====================================================== */}

      <MobileMenu
        open={open}
        onClose={() => setOpen(false)}
      />

      {/* =====================================================
          MAIN AREA
      ====================================================== */}

      <main className="min-h-screen min-w-0 lg:ml-64">
        {/* ===================================================
            TOPBAR
        ==================================================== */}

        <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-stone-200/80 bg-[#faf9f7]/95 px-4 backdrop-blur-md transition-colors sm:px-6 lg:px-8 dark:border-white/[0.08] dark:bg-[#070b14]/95">
          {/* LEFT */}
          <div className="flex min-w-0 items-center gap-3">
            {/* mobile menu */}
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-stone-200 bg-white text-stone-600 transition hover:border-stone-300 hover:bg-stone-50 hover:text-stone-900 lg:hidden dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.08] dark:hover:text-white"
              aria-label="Open menu"
            >
              <Menu size={19} />
            </button>

            {/* search */}
            <div className="hidden h-10 w-64 items-center gap-2.5 rounded-xl border border-stone-200 bg-white px-3.5 transition focus-within:border-stone-300 focus-within:ring-4 focus-within:ring-stone-100 sm:flex md:w-72 dark:border-white/[0.08] dark:bg-white/[0.04] dark:focus-within:border-white/[0.18] dark:focus-within:ring-white/[0.05]">
              <Search
                size={16}
                strokeWidth={1.8}
                className="shrink-0 text-stone-400"
              />

              <input
                type="search"
                placeholder="Search..."
                className="min-w-0 flex-1 bg-transparent text-xs font-medium text-stone-800 outline-none placeholder:text-stone-400 dark:text-slate-200 dark:placeholder:text-slate-500"
              />

              <kbd className="hidden rounded-md border border-stone-200 bg-stone-50 px-1.5 py-0.5 text-[9px] font-medium text-stone-400 md:block dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-500">
                /
              </kbd>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <ThemeToggleButton
              variant="compact"
              srLabel="Toggle social dashboard theme"
            />
            {/* notification */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationOpen((value) => !value)}
                className="relative grid h-10 w-10 place-items-center rounded-xl text-stone-500 transition hover:bg-white hover:text-stone-900 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white"
                aria-label="Notifications"
                aria-expanded={notificationOpen}
              >
                <Bell size={18} strokeWidth={1.8} />
                {unreadCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-violet-600 px-1 text-[9px] font-bold text-white ring-2 ring-[#faf9f7] dark:ring-[#070b14]">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notificationOpen && (
                <div className="absolute right-0 top-12 z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_20px_60px_rgba(28,25,23,0.16)] dark:border-white/[0.08] dark:bg-[#111827]">
                  <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3 dark:border-white/[0.08]">
                    <div>
                      <p className="text-sm font-bold text-stone-900 dark:text-white">Notifications</p>
                      <p className="mt-0.5 text-[11px] text-stone-400 dark:text-slate-500">{unreadCount} unread</p>
                    </div>
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      disabled={!unreadCount}
                      className="text-[11px] font-semibold text-violet-600 disabled:opacity-40"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {recentNotifications.length ? recentNotifications.map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() => {
                          markAsRead(notification.id);
                          setNotificationOpen(false);
                          navigate(notification.link || "/dashboard/notifications");
                        }}
                        className={`block w-full border-b border-stone-100 px-4 py-3 text-left transition hover:bg-stone-50 dark:border-white/[0.06] dark:hover:bg-white/[0.05] ${notification.read ? "" : "bg-violet-50/60 dark:bg-violet-400/[0.08]"}`}
                      >
                        <div className="flex items-start gap-2">
                          {!notification.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-violet-600" />}
                          <span className="min-w-0">
                            <span className="block truncate text-xs font-bold text-stone-800 dark:text-slate-200">{notification.title}</span>
                            <span className="mt-1 block text-[11px] leading-4 text-stone-500 dark:text-slate-400">{notification.message}</span>
                          </span>
                        </div>
                      </button>
                    )) : (
                      <p className="px-4 py-8 text-center text-xs text-stone-400 dark:text-slate-500">No notifications yet.</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNotificationOpen(false);
                      navigate("/dashboard/notifications");
                    }}
                    className="w-full bg-stone-50 px-4 py-3 text-xs font-bold text-stone-700 hover:bg-stone-100 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.08]"
                  >
                    View all notifications
                  </button>
                </div>
              )}
            </div>

            {/* divider */}
            <div className="mx-1 hidden h-7 w-px bg-stone-200 sm:block dark:bg-white/[0.08]" />

            {/* profile */}
            <Link
              to="/dashboard/settings"
              className="group flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-white dark:hover:bg-white/[0.06]"
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-stone-200 text-sm font-semibold text-stone-700 ring-1 ring-stone-300/70 dark:bg-white/[0.08] dark:text-slate-200 dark:ring-white/[0.12]">
                {userInitial}
              </div>

              <div className="hidden min-w-0 text-left sm:block">
                <p className="max-w-[130px] truncate text-xs font-semibold text-stone-900 dark:text-white">
                  {userName}
                </p>

                <p className="mt-0.5 text-[10px] text-stone-400 dark:text-slate-500">
                  Account
                </p>
              </div>

              <ChevronDown
                size={14}
                className="hidden text-stone-400 transition-transform group-hover:text-stone-700 sm:block dark:text-slate-500 dark:group-hover:text-white"
              />
            </Link>
          </div>
        </header>

        {/* ===================================================
            PAGE CONTENT
        ==================================================== */}

        <div className="min-h-[calc(100vh-68px)]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}