export const permissionModules = [
  "adminDashboard",
  "socialDashboard",
  "officeDashboard",
  "clients",
  "serviceRequests",
  "projects",
  "employees",
  "teams",
  "tasks",
  "payroll",
  "reports",
  "settings",
  "leaves",
  "attendance",
  "documents",
  "holidays",
  "announcements",
  "meetings",
];

export const permissionActions = [
  "view",
  "create",
  "edit",
  "delete",
  "approve",
  "assign",
  "convertToProject",
];

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

const defaultAdminPermissionMap = {
  clients: {
    view: true,
    create: true,
    edit: true,
    delete: false,
  },
  serviceRequests: {
    view: true,
    create: false,
    edit: true,
    delete: false,
    approve: false,
    convertToProject: false,
  },
  projects: {
    view: true,
    create: true,
    edit: true,
    delete: false,
  },
  employees: {
    view: true,
    create: false,
    edit: true,
    delete: false,
  },
  teams: {
    view: true,
    create: true,
    edit: true,
    delete: false,
  },
  tasks: {
    view: true,
    create: true,
    edit: true,
    delete: false,
    assign: true,
  },
  payroll: {
    view: false,
    create: false,
    edit: false,
    delete: false,
  },
  reports: {
    view: true,
  },
  settings: {
    view: false,
    edit: false,
  },
  documents: {
    view: true,
    create: true,
    edit: true,
    delete: false,
  },
  holidays: {
    view: true,
    create: true,
    edit: true,
    delete: false,
  },
  announcements: {
    view: true,
    create: true,
    edit: true,
    delete: false,
  },
  meetings: {
    view: true,
    create: true,
    edit: true,
    delete: false,
  },
};

const defaultHRPermissionMap = {
  employees: {
    view: true,
    create: true,
    edit: true,
    delete: false,
  },
  payroll: {
    view: true,
    create: true,
    edit: true,
    delete: false,
    approve: true,
  },
  leaves: {
    view: true,
    create: false,
    edit: true,
    delete: false,
    approve: true,
  },
  attendance: {
    view: true,
    create: false,
    edit: true,
    delete: false,
    approve: true,
  },
  reports: {
    view: true,
  },
  documents: {
    view: true,
    create: true,
    edit: true,
    delete: false,
  },
  holidays: {
    view: true,
    create: true,
    edit: true,
    delete: false,
  },
  announcements: {
    view: true,
    create: true,
    edit: true,
    delete: false,
  },
  meetings: {
    view: true,
    create: true,
    edit: true,
    delete: false,
  },
  settings: {
    view: false,
    edit: false,
  },
};

const defaultEmployeePermissionMap = {
  documents: {
    view: true,
    create: true,
    delete: false,
  },
};

const isPlainObject = (value) => {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
};

export const sanitizePermissions = (inputPermissions = {}) => {
  if (!isPlainObject(inputPermissions)) return {};

  return permissionModules.reduce((sanitized, moduleName) => {
    const modulePermissions = inputPermissions[moduleName];

    if (!isPlainObject(modulePermissions)) return sanitized;

    const cleanedModulePermissions = permissionActions.reduce(
      (actions, action) => {
        if (Object.prototype.hasOwnProperty.call(modulePermissions, action)) {
          actions[action] = Boolean(modulePermissions[action]);
        }

        return actions;
      },
      {}
    );

    if (Object.keys(cleanedModulePermissions).length) {
      sanitized[moduleName] = cleanedModulePermissions;
    }

    return sanitized;
  }, {});
};

export const getDefaultAdminPermissions = () => {
  return sanitizePermissions(defaultAdminPermissionMap);
};

export const getDefaultHRPermissions = () => {
  return sanitizePermissions(defaultHRPermissionMap);
};

export const mergePermissions = (
  existingPermissions = {},
  newPermissions = {}
) => {
  const sanitizedExisting = sanitizePermissions(existingPermissions);
  const sanitizedNew = sanitizePermissions(newPermissions);

  return permissionModules.reduce((merged, moduleName) => {
    const modulePermissions = {
      ...(sanitizedExisting[moduleName] || {}),
      ...(sanitizedNew[moduleName] || {}),
    };

    if (Object.keys(modulePermissions).length) {
      merged[moduleName] = modulePermissions;
    }

    return merged;
  }, {});
};

export const hasPermission = (user, moduleName, action) => {
  if (!user) return false;

  // Super admin has all permissions
  if (user.role === "super_admin") return true;

  if (user.role === "admin") {
    const configuredModule = user.permissions?.[moduleName];
    return configuredModule?.[action] === true;
  }

  if (user.role === "hr") {
    const configuredModule = user.permissions?.[moduleName];

    // Older HR accounts may not have newly introduced modules persisted yet.
    // Preserve the default HR policy unless Super Admin explicitly overrides
    // the requested action on that module.
    if (configuredModule && Object.prototype.hasOwnProperty.call(configuredModule, action)) {
      return configuredModule[action] === true;
    }

    return defaultHRPermissionMap[moduleName]?.[action] === true;
  }

  if (user.role === "employee") {
    const configuredModule = user.permissions?.[moduleName];
    if (
      configuredModule &&
      Object.prototype.hasOwnProperty.call(configuredModule, action)
    ) {
      return configuredModule[action] === true;
    }

    return defaultEmployeePermissionMap[moduleName]?.[action] === true;
  }

  return user.permissions?.[moduleName]?.[action] === true;
};
