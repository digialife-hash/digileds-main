import API from "../api/axiosInstance";
import axios from "axios";
import { getOfficeApiBaseUrl } from "../utils/urlUtils";

const SHARED_AUTH_API = axios.create({
  baseURL: getOfficeApiBaseUrl(),
  withCredentials: true,
});

SHARED_AUTH_API.interceptors.request.use((config) => {
  try {
    const savedUser = JSON.parse(localStorage.getItem("office_user") || "null");
    if (savedUser?.token) {
      config.headers.Authorization = `Bearer ${savedUser.token}`;
    }
  } catch {
    // The server cookie remains the fallback when the local auth cache is invalid.
  }
  return config;
});

export const registerClientApi = async (formData) => {
  const response = await API.post("/auth/register", formData);
  return response.data;
};

export const registerPartnerApi = async (formData) => {
  const response = await API.post("/referral-partner/register", formData);
  return response.data;
};

export const loginApi = async (formData) => {
  const response = await SHARED_AUTH_API.post("/auth/login", formData);
  return response.data;
};

export const verifySuperAdminLogin2FAApi = async (payload) => {
  const response = await SHARED_AUTH_API.post("/auth/mfa/verify", payload);
  return response.data;
};

export const getMeApi = async () => {
  const response = await SHARED_AUTH_API.get("/auth/me");
  return response.data;
};

export const refreshSessionApi = async () => {
  const response = await SHARED_AUTH_API.post("/auth/refresh");
  return response.data;
};

export const verifyEmailApi = async (payload) => {
  const response = await API.post("/auth/verify-email", payload);
  return response.data;
};

export const resendVerificationEmailApi = async (payload) => {
  const response = await API.post("/auth/resend-verification", payload);
  return response.data;
};

export const forgotPasswordApi = async (payload) => {
  const response = await API.post("/auth/forgot-password", payload);
  return response.data;
};

export const resetPasswordApi = async (payload) => {
  const response = await API.post("/auth/reset-password", payload);
  return response.data;
};

export const logoutApi = async () => {
  const response = await SHARED_AUTH_API.post("/auth/logout");
  return response.data;
};

export const logoutAllDevicesApi = async () => {
  const response = await SHARED_AUTH_API.post("/auth/logout-all");
  return response.data;
};
