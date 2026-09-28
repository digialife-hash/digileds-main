import { useState, useMemo, useEffect } from "react";
import {
  X,
  ChevronDown,
  ChevronRight,
  Search,
  LogOut,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import BrandLogo from "../common/BrandLogo";
import { sidebarCategories } from "../../config/sidebarLinks";
import { useAuth } from "../../context/authStore";
import canShowMenu from "../../utils/canShowMenu";
import { ROUTES } from "../../routes/routeConstants";

const getDisplayRole = (role = "") => {
  if (role === "super_admin") return "Super Admin";
  if (role === "admin") return "Admin";
  return role.replace("_", " ");
};

const Sidebar = ({
  isOpen = false,
  isCollapsed = false,
  onClose = () => {},
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [openCategories, setOpenCategories] = useState({
    dashboard: true,
    employee_mgmt: false,
    project_mgmt: false,
    client_crm: false,
    accounts: false,
    hr_attendance: false,
    notices: false,
    reports: false,
    business_partner: false,
    main: true,
    partner_hub: true,
    hr_workspace: true,
  });

  // Filter categories based on RBAC and search query
  const categories = useMemo(() => {
    const rawCategories = sidebarCategories[user?.role] || [];
    return rawCategories
      .map((cat) => {
        const filteredItems = cat.items.filter((item) => {
          const hasPerm = canShowMenu(user, item);
          if (!hasPerm) return false;

          if (!searchQuery.trim()) return true;
          return item.label
            .toLowerCase()
            .includes(searchQuery.toLowerCase().trim());
        });

        return { ...cat, items: filteredItems };
      })
      .filter((cat) => cat.items.length > 0);
  }, [user, searchQuery]);

  // Auto-expand category containing current active path
  useEffect(() => {
    const fullPath = location.pathname + location.search;
    categories.forEach((cat) => {
      const hasActiveChild = cat.items.some(
        (item) => item.path === location.pathname || fullPath === item.path
      );
      if (hasActiveChild) {
        setOpenCategories((prev) => (prev[cat.id] ? prev : { ...prev, [cat.id]: true }));
      }
    });
  }, [location.pathname, location.search, categories]);

  const toggleCategory = (cat) => {
    if (cat.headerPath) {
      const dashboardPath =
        cat.id === "dashboard" && user?.role === "admin"
          ? ROUTES.ADMIN_DASHBOARD
          : cat.headerPath;
      navigate(dashboardPath);
    }
    setOpenCategories((prev) => ({ ...prev, [cat.id]: !prev[cat.id] }));
  };

  return (
    <>
      {/* Mobile Overlay */}
      <button
        type="button"
        aria-label="Close sidebar overlay"
        onClick={onClose}
        className={`sidebar-overlay fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-xs lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Sidebar Drawer Container */}
      <aside
        data-open={isOpen}
        data-collapsed={isCollapsed}
        className="sidebar-panel fixed left-0 top-0 z-50 h-screen border-r border-slate-200 bg-white text-slate-900 shadow-xs lg:z-40"
      >
        <div className="flex h-full min-h-0 flex-col">
          {/* Header Brand */}
          <div
            className={`relative border-b border-slate-200 py-3.5 transition-[padding] duration-300 ${
              isCollapsed ? "px-2" : "px-3.5"
            }`}
          >
            <div
              className={`flex items-center justify-between ${
                isCollapsed ? "justify-center" : ""
              }`}
            >
              {isCollapsed ? (
                <div title="Digital Alife Management Portal">
                  <BrandLogo
                    size="sidebar"
                    variant="glass"
                    showName={false}
                  />
                </div>
              ) : (
                <BrandLogo
                  size="sidebar"
                  variant="glass"
                  companyName="Digital Alife"
                  companySubtitle="MANAGEMENT PORTAL"
                />
              )}

              <button
                type="button"
                onClick={onClose}
                className={`rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 lg:hidden ${
                  isCollapsed ? "hidden" : "ml-auto"
                }`}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Search Input Box */}
          {!isCollapsed && (
            <div className="px-3 pt-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search menu..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs font-medium leading-5 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* Navigation Category Groups */}
          <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-3 space-y-2">
            {categories.map((cat) => {
              const CatIcon = cat.icon;
              const isOpenCat = !!openCategories[cat.id] || !!searchQuery.trim();

              return (
                <div key={cat.id} className="rounded-xl transition-all">
                  {/* Category Header */}
                  {!isCollapsed && (
                    <button
                      type="button"
                      onClick={(e) => toggleCategory(cat, e)}
                      className="flex min-h-9 w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs font-semibold leading-5 text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <CatIcon className="h-4 w-4 shrink-0 text-blue-600" />
                        <span className="truncate">{cat.title}</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-1">
                        {isOpenCat ? (
                          <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                        )}
                      </span>
                    </button>
                  )}

                  {/* Category Items */}
                  {(isOpenCat || isCollapsed) && (
                    <div className={`mt-1 space-y-0.5 ${!isCollapsed ? "pl-4" : ""}`}>
                      {cat.items.map((item) => {
                        const ItemIcon = item.icon;
                        const fullPath = location.pathname + location.search;
                        const isExactActive =
                          fullPath === item.path ||
                          (item.path.includes("?")
                            ? fullPath === item.path
                            : location.pathname === item.path && !location.search);

                        return (
                          <NavLink
                            key={item.path + item.label}
                            to={item.path}
                            onClick={onClose}
                            title={isCollapsed ? item.label : undefined}
                            className={({ isActive }) =>
                              `group flex min-h-8 items-center rounded-lg text-xs font-medium leading-5 transition-all duration-200 ${
                                isCollapsed
                                  ? "justify-center p-2.5"
                                  : "gap-2.5 px-3 py-1.5"
                              } ${
                                isExactActive || isActive
                                  ? "bg-blue-600 font-semibold text-white shadow-xs"
                                  : "text-slate-700 hover:bg-slate-100 hover:text-blue-600"
                              }`
                            }
                          >
                            <ItemIcon className="h-3.5 w-3.5 shrink-0" />
                            {!isCollapsed && (
                              <span className="truncate">{item.label}</span>
                            )}
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Footer User Profile & Logout */}
          <div className="border-t border-slate-200 bg-slate-50/50 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                  {user?.role === "super_admin" || user?.role === "admin" ? "A" : (user?.name?.charAt(0).toUpperCase() || "U")}
                </div>
                {!isCollapsed && (
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold leading-5 text-slate-900">
                      {user?.role === "super_admin" || user?.role === "admin" ? getDisplayRole(user.role) : user?.name}
                    </p>
                    <p className="truncate text-[10px] font-medium leading-4 text-slate-500">
                      {getDisplayRole(user?.role)}
                    </p>
                  </div>
                )}
              </div>

              {!isCollapsed && (
                <button
                  type="button"
                  onClick={logout}
                  title="Logout"
                  className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
