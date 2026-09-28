import { useEffect, useRef, useState } from "react";
import { Bell, LogOut, Menu, Moon, PanelLeftClose, PanelLeftOpen, Receipt, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BrandLogo from "../common/BrandLogo";
import { useAuth } from "../../context/authStore";
import { ROUTES } from "../../routes/routeConstants";
import { getMyClientNotifications } from "../../services/notificationService";
import NotificationBellDropdown from "../notifications/NotificationBellDropdown";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const formatLabel = (value = "") => {
  if (value === "super_admin") return "super admin";
  if (value === "admin") return "admin";
  return value.replaceAll("_", " ");
};

const Navbar = ({ isSidebarCollapsed, onMenuClick, onToggleSidebarCollapse }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  // console.log(user)
  const notificationRef = useRef(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDark, setIsDark] = useState(
    () => document.documentElement.getAttribute("data-theme") === "dark",
  );
  const isClient = user?.role === "client";

  useEffect(() => {
    if (!isClient) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    let isMounted = true;

    const fetchNotifications = async () => {
      try {
        const result = await getMyClientNotifications({ limit: 5 });
        if (!isMounted) return;

        setNotifications(result.data.notifications || []);
        setUnreadCount(result.data.unreadCount || 0);
      } catch {
        if (!isMounted) return;
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    void fetchNotifications();

    return () => {
      isMounted = false;
    };
  }, [isClient]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const handleViewInvoices = () => {
    setIsNotificationOpen(false);
    navigate(ROUTES.CLIENT_INVOICES);
  };

  const toggleTheme = () => {
    const nextTheme = isDark ? "light" : "dark";
    localStorage.setItem("theme-mode", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    setIsDark(nextTheme === "dark");
    window.dispatchEvent(new Event("themechange"));
  };

  return (
    <header className="office-navbar sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu size={22} />
          </button>

          <button
            type="button"
            onClick={onToggleSidebarCollapse}
            className="hidden rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 lg:inline-flex"
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? <PanelLeftOpen size={21} /> : <PanelLeftClose size={21} />}
          </button>

          <div>
            <h2 className="text-base font-bold text-slate-900">
              Welcome, {user?.role === "super_admin" ? "Super Admin" : user?.role === "admin" ? "Admin" : (user?.name?.split(" ")[0] || "User")}
            </h2>
            <p className="hidden text-xs capitalize text-slate-500 sm:block">
              {formatLabel(user?.role)} panel
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <BrandLogo size="navbar" variant="glass" companySubtitle="OFFICE SYSTEM" />
          </div>

          {!isClient && <NotificationBellDropdown />}

          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-2xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Light mode" : "Dark mode"}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isClient && (
            <div ref={notificationRef} className="relative">
              <button
                type="button"
                onClick={() => setIsNotificationOpen((current) => !current)}
                className="relative rounded-2xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50"
                aria-label="Client notifications"
              >
                <Bell size={19} />
                {unreadCount > 0 && (
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
                )}
              </button>

              {isNotificationOpen && (
                <div className="absolute right-0 mt-3 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <div>
                      <p className="text-sm font-black text-slate-950">
                        Notifications
                      </p>
                      <p className="text-xs font-semibold text-slate-500">
                        {unreadCount} unread invoice updates
                      </p>
                    </div>
                    <Receipt size={18} className="text-blue-600" />
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center">
                        <p className="text-sm font-bold text-slate-900">
                          No invoice notifications
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          New invoice alerts will appear here.
                        </p>
                      </div>
                    ) : (
                      notifications.map((notification) => {
                        const invoice = notification.invoice;
                        const projectName =
                          invoice?.project?.projectName || "Project";

                        return (
                          <button
                            key={notification._id}
                            type="button"
                            onClick={handleViewInvoices}
                            className="block w-full border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-slate-50"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-black text-slate-950">
                                  {invoice?.invoiceNumber || notification.title}
                                </p>
                                <p className="mt-1 text-xs font-semibold text-slate-600">
                                  {notification.message}
                                </p>
                              </div>
                              {!notification.readAt && (
                                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                              )}
                            </div>

                            <div className="mt-3 grid gap-1 text-xs font-semibold text-slate-500">
                              <p className="truncate">{projectName}</p>
                              <p>
                                {formatCurrency(invoice?.amount)} - Due{" "}
                                {formatDate(invoice?.dueDate)}
                              </p>
                              <p className="capitalize">
                                {formatLabel(invoice?.paymentStatus || "pending")}
                              </p>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleViewInvoices}
                    className="w-full border-t border-slate-100 bg-slate-50 px-4 py-3 text-sm font-black text-blue-700 transition hover:bg-blue-50"
                  >
                    View payment status
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-red-50 hover:text-red-600"
            title="Logout"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
