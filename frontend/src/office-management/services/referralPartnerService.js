import API from "../api/axiosInstance";

export const getDashboardStatsApi = async () => {
  const response = await API.get("/referral-partner/stats");
  return response.data;
};

export const getDashboardAnalyticsApi = async () => {
  const response = await API.get("/referral-partner/analytics");
  return response.data;
};

export const getActivitiesApi = async (params = {}) => {
  const response = await API.get("/referral-partner/activities", { params });
  return response.data;
};

export const getNotificationsApi = async () => {
  const response = await API.get("/referral-partner/notifications");
  return response.data;
};

export const markNotificationReadApi = async (id) => {
  const response = await API.put(`/referral-partner/notifications/${id}/read`);
  return response.data;
};

export const markAllNotificationsReadApi = async () => {
  const response = await API.put("/referral-partner/notifications/read-all");
  return response.data;
};

export const referClientApi = async (formData) => {
  const response = await API.post("/referral-partner/referral", formData);
  return response.data;
};

export const getReferralsApi = async () => {
  const response = await API.get("/referral-partner/referrals");
  return response.data;
};

export const getCommissionsApi = async () => {
  const response = await API.get("/referral-partner/commissions");
  return response.data;
};

export const updatePartnerProfileApi = async (formData) => {
  const response = await API.put("/referral-partner/profile", formData);
  return response.data;
};

export const getReferralPartnersApi = async (params = {}) => {
  try {
    const response = await API.get("/admin/partner-management", { params });
    if (response.data?.data?.partners) {
      return response.data;
    }
  } catch (err) {
    // If forbidden or error on admin endpoint, fallback to partner endpoint
  }
  const response = await API.get("/referral-partner/all", { params });
  return response.data;
};

export const getMyCompanyDocumentsApi = async () => {
  const response = await API.get("/referral-partner/company-documents");
  return response.data;
};

export const downloadMyCompanyDocumentApi = async (docId, originalName) => {
  const response = await API.get(`/referral-partner/company-documents/${docId}/download`, {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", originalName || "document");
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  return true;
};

