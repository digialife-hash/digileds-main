const defaultHRPermissions = {
  employees: { view: true, create: true, edit: true, delete: false },
  payroll: { view: true, create: true, edit: true, delete: false, approve: true },
  leaves: { view: true, create: false, edit: true, delete: false, approve: true },
  attendance: { view: true, create: false, edit: true, delete: false, approve: true },
  reports: { view: true },
  documents: { view: true, create: true, edit: true, delete: false },
  holidays: { view: true, create: true, edit: true, delete: false },
  announcements: { view: true, create: true, edit: true, delete: false },
  meetings: { view: true, create: true, edit: true, delete: false },
};

const hasPermission = (user, moduleName, action) => {
  if (user?.role === "super_admin") return true;
  const configuredModule = user?.permissions?.[moduleName];

  if (configuredModule && Object.prototype.hasOwnProperty.call(configuredModule, action)) {
    return configuredModule[action] === true;
  }

  return defaultHRPermissions[moduleName]?.[action] === true;
};

export const hasDashboardPermission = (user, dashboard) => {
  if (!user) return false;
  if (user.role === "super_admin") return true;

  const key = dashboard === "social"
    ? "socialDashboard"
    : dashboard === "admin"
      ? "adminDashboard"
      : "officeDashboard";
  const configured = user.permissions?.[key];
  return configured?.view === true;
};

const moduleForPath = (path = "") => {
  const cleanPath = path.split("?")[0];
  if (cleanPath.includes("client")) return "clients";
  if (cleanPath.includes("document")) return "documents";
  if (cleanPath.includes("id-card") || cleanPath.includes("certificate")) return "documents";
  if (cleanPath.includes("employee")) return "employees";
  if (cleanPath.includes("project")) return "projects";
  if (cleanPath.includes("team")) return "teams";
  if (cleanPath.includes("task")) return "tasks";
  if (cleanPath.includes("payroll")) return "payroll";
  if (cleanPath.includes("attendance")) return "attendance";
  if (cleanPath.includes("leave")) return "leaves";
  if (cleanPath.includes("report")) return "reports";
  if (cleanPath.includes("notice") || cleanPath.includes("announcement") || cleanPath.includes("meeting")) return "announcements";
  if (cleanPath.includes("service-request") || cleanPath.includes("quotation")) return "serviceRequests";
  return null;
};

const canShowMenu = (user, menuItem) => {
  if (!user || !menuItem) return false;

  if (user.role === "super_admin") return true;

  if (user.role === "admin") {
    const moduleName = menuItem.module || moduleForPath(menuItem.path);
    return !moduleName || hasPermission(user, moduleName, "view");
  }

  if (user.role === "employee" || user.role === "client") {
    return !menuItem.module;
  }

  if (user.role === "hr" && menuItem.module) {
    return hasPermission(user, menuItem.module, "view");
  }

  return true;
};

export const hasHRPermission = (user, moduleName, action) =>
  hasPermission(user, moduleName, action);

export default canShowMenu;
