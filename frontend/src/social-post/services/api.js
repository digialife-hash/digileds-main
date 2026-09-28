const API_URL =
  import.meta.env.VITE_SOCIAL_API_URL ||
  import.meta.env.VITE_API_URL ||
  "/api/social-app";

export function isSocialSurface() {
  const path = window.location.pathname;
  const hash = window.location.hash;
  const selectedSection = window.localStorage.getItem(
    "amit.admin.selected-section",
  );
  return (
    path.startsWith("/social-post") ||
    hash.startsWith("#social-") ||
    selectedSection?.startsWith("social-")
  );
}

export function hasSocialSession() {
  return Boolean(getAuthToken());
}

function getAuthToken() {
  const socialToken = localStorage.getItem("social-token");
  if (socialToken) return socialToken;

  for (const key of ["demo_admin_user", "office_user"]) {
    try {
      const stored = JSON.parse(localStorage.getItem(key) || "null");
      const user = stored?.data?.user || stored?.user || stored;
      if (user?.token) return user.token;
    } catch {
      // Try the next supported auth storage key.
    }
  }

  return "";
}

export async function apiBlob(path) {
  if (!isSocialSurface()) {
    throw new Error("Social API is unavailable outside the social workspace.");
  }

  const token = getAuthToken();
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error("Media request failed");
  return response.blob();
}

export async function apiRequest(path, options = {}) {
  const { allowSocialSurface = false, ...requestOptions } = options;

  if (!allowSocialSurface && !isSocialSurface()) {
    throw new Error("Social API is unavailable outside the social workspace.");
  }

  const token = getAuthToken();
  if (requestOptions.body instanceof FormData && requestOptions.onProgress) {
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open(requestOptions.method || "GET", `${API_URL}${path}`);
      request.withCredentials = true;
      if (token) request.setRequestHeader("Authorization", `Bearer ${token}`);
      request.upload.onprogress = (event) => {
        if (event.lengthComputable) requestOptions.onProgress(Math.round((event.loaded / event.total) * 90));
      };
      request.onerror = () => reject(new Error("Network request failed"));
      request.onload = () => {
        const data = JSON.parse(request.responseText || "{}");
        if (request.status < 200 || request.status >= 300) {
          reject(new Error(data.message || "Request failed"));
          return;
        }
        requestOptions.onProgress(100);
        resolve(data);
      };
      request.send(requestOptions.body);
    });
  }
  const response = await fetch(`${API_URL}${path}`, {
    ...requestOptions,
    credentials: "include",
    headers: {
      ...(requestOptions.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(requestOptions.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}
