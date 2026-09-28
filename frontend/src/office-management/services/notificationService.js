import API from "../api/axiosInstance";

export const getNotificationAnalyticsApi = async () => {
  const response = await API.get("/notifications/dashboard/analytics");
  return response.data;
};

export const getNotificationsApi = async (params = {}) => {
  const response = await API.get("/notifications", { params });
  return response.data;
};

export const getMyClientNotifications = async (params = {}) => {
  const response = await API.get("/notifications", { params });
  return response.data;
};

export const getNotificationByIdApi = async (id) => {
  const response = await API.get(`/notifications/${id}`);
  return response.data;
};

export const markAsReadApi = async (id) => {
  const response = await API.put(`/notifications/${id}/read`);
  return response.data;
};

export const markAllAsReadApi = async () => {
  const response = await API.put("/notifications/read-all");
  return response.data;
};

export const deleteNotificationApi = async (id) => {
  const response = await API.delete(`/notifications/${id}`);
  return response.data;
};

export const archiveNotificationApi = async (id) => {
  const response = await API.put(`/notifications/${id}/archive`);
  return response.data;
};

export const getNotificationPreferencesApi = async () => {
  const response = await API.get("/notifications/preferences");
  return response.data;
};

export const updateNotificationPreferencesApi = async (preferenceData) => {
  const response = await API.put("/notifications/preferences", preferenceData);
  return response.data;
};

export const getNotificationTemplatesApi = async () => {
  const response = await API.get("/notifications/templates");
  return response.data;
};

export const createOrUpdateNotificationTemplateApi = async (templateData) => {
  const response = await API.post("/notifications/templates", templateData);
  return response.data;
};

export const resendNotificationApi = async (id) => {
  const response = await API.post(`/notifications/${id}/resend`);
  return response.data;
};

export const exportNotificationsApi = async (params = {}) => {
  const response = await API.get("/notifications/export", {
    params,
    responseType: "blob",
  });
  return response;
};
