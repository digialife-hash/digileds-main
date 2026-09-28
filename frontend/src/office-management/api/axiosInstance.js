import axios from "axios";
import { getOfficeApiBaseUrl } from "../utils/urlUtils";

const API = axios.create({
  baseURL: getOfficeApiBaseUrl(),
  withCredentials: true,
});

const SHARED_AUTH_API = axios.create({
  baseURL: getOfficeApiBaseUrl(),
  withCredentials: true,
});

const USER_KEY = "office_user";
let refreshPromise = null;

const persistAuthPayload = (payload) => {
  const user = payload?.data?.user;
  const token = payload?.data?.token;

  if (!user) return;

  try {
    const savedUser = JSON.parse(localStorage.getItem(USER_KEY) || "null");
    const storedUser = token || savedUser?.token
      ? { ...user, token: token || savedUser?.token }
      : user;

    localStorage.setItem(USER_KEY, JSON.stringify(storedUser));
  } catch {
    const storedUser = token ? { ...user, token } : user;
    localStorage.setItem(USER_KEY, JSON.stringify(storedUser));
  }
};

API.interceptors.request.use(
  (config) => {
    try {
      const savedUserStr = localStorage.getItem(USER_KEY);
      if (savedUserStr) {
        const savedUser = JSON.parse(savedUserStr);
        if (savedUser?.token) {
          config.headers.Authorization = `Bearer ${savedUser.token}`;
        }
      }
    } catch {
      // Ignore malformed auth cache and continue without an Authorization header.
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`[AXIOS RESPONSE] ${response.config.method.toUpperCase()} ${response.config.url} Status: ${response.status}`);
    }
    return response;
  },
  async (error) => {
    if (import.meta.env.DEV) {
      console.error(`[AXIOS RESPONSE ERROR] ${error.config?.method?.toUpperCase()} ${error.config?.url} Status: ${error.response?.status}`);
    }
    const originalRequest = error.config;
    const isAuthRefreshRequest = originalRequest?.url?.includes("/auth/refresh");
    const isAuthLoginRequest = originalRequest?.url?.includes("/auth/login");
    const isAuthRegisterRequest = originalRequest?.url?.includes("/auth/register");

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthRefreshRequest &&
      !isAuthLoginRequest &&
      !isAuthRegisterRequest
    ) {
      try {
        if (import.meta.env.DEV) {
          console.log(`[AXIOS INTERCEPTOR] Attempting to refresh token for original request ${originalRequest.url}`);
        }
        originalRequest._retry = true;
        refreshPromise =
          refreshPromise || SHARED_AUTH_API.post("/auth/refresh").finally(() => {
            refreshPromise = null;
          });
        const refreshResponse = await refreshPromise;
        persistAuthPayload(refreshResponse.data);
        delete originalRequest.headers.Authorization;
        if (import.meta.env.DEV) {
          console.log(`[AXIOS INTERCEPTOR] Token refreshed successfully. Retrying original request ${originalRequest.url}`);
        }
        return API(originalRequest);
      } catch (refreshError) {
        if (import.meta.env.DEV) {
          console.error("[AXIOS INTERCEPTOR] Token refresh failed.", refreshError);
        }
        window.localStorage?.removeItem(USER_KEY);
        const currentPath = window.location.pathname;
        if (
          !currentPath.endsWith("/login") &&
          !currentPath.startsWith("/register") &&
          !currentPath.startsWith("/verify")
        ) {
          window.location.href = "/office-management/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
