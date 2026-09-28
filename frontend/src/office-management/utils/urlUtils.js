const trimTrailingSlash = (value = "") => value.replace(/\/+$/, "");

const isAbsoluteUrl = (value = "") =>
  /^(?:https?:|blob:|data:)/i.test(String(value));

export const getOfficeApiBaseUrl = () => {
  const configuredBaseUrl = trimTrailingSlash(
    import.meta.env.VITE_API_BASE_URL || "",
  );

  if (!configuredBaseUrl) return "/api/office-management";
  if (configuredBaseUrl.endsWith("/api/office-management")) {
    return configuredBaseUrl;
  }
  if (configuredBaseUrl.endsWith("/api")) {
    return `${configuredBaseUrl}/office-management`;
  }
  return `${configuredBaseUrl}/api/office-management`;
};

export const getApiOrigin = () => {
  const configuredBaseUrl = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL || "");

  if (!configuredBaseUrl) return "";

  try {
    const parsedUrl = new URL(configuredBaseUrl, window.location.origin);
    return parsedUrl.pathname.endsWith("/api")
      ? parsedUrl.origin + parsedUrl.pathname.slice(0, -4)
      : parsedUrl.origin + parsedUrl.pathname;
  } catch {
    return "";
  }
};

export const resolveFileUrl = (filePath = "") => {
  if (!filePath) return "";
  if (isAbsoluteUrl(filePath)) return filePath;

  const cleanPath = filePath.startsWith("/") ? filePath : `/${filePath}`;
  return `${getApiOrigin()}${cleanPath}`;
};

export const resolvePublicUrl = (path = "") => {
  if (!path) return "";
  if (isAbsoluteUrl(path)) return path;

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${window.location.origin}${cleanPath}`;
};
