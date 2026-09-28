import API from "../api/axiosInstance";
import getApiErrorMessage from "../utils/getApiErrorMessage";

const handleDailyReportError = (error, fallbackMessage) => {
  const message = getApiErrorMessage(error, fallbackMessage);
  const apiError = new Error(message);
  apiError.status = error?.response?.status;
  apiError.code = error?.response?.data?.error?.code;
  apiError.data = error?.response?.data?.data;
  throw apiError;
};

const multipartConfig = { headers: { "Content-Type": "multipart/form-data" } };

export const getDailyWorkReports = async (params = {}) => {
  try {
    const response = await API.get("/daily-work-reports", { params });
    return response.data;
  } catch (error) {
    handleDailyReportError(error, "Unable to fetch daily work reports");
  }
};

export const getMyTodayDailyReport = async () => {
  try {
    const response = await API.get("/daily-work-reports/me/today");
    return response.data;
  } catch (error) {
    handleDailyReportError(error, "Unable to fetch today's report");
  }
};

export const getDailyWorkReportById = async (id) => {
  try {
    const response = await API.get(`/daily-work-reports/${id}`);
    return response.data;
  } catch (error) {
    handleDailyReportError(error, "Unable to fetch daily work report");
  }
};

export const createDailyWorkReport = async (payload) => {
  try {
    const response = await API.post("/daily-work-reports", payload, payload instanceof FormData ? multipartConfig : {});
    return response.data;
  } catch (error) {
    handleDailyReportError(error, "Unable to save daily work report");
  }
};

export const updateDailyWorkReport = async (id, payload) => {
  try {
    const response = await API.put(`/daily-work-reports/${id}`, payload, payload instanceof FormData ? multipartConfig : {});
    return response.data;
  } catch (error) {
    handleDailyReportError(error, "Unable to update daily work report");
  }
};

export const submitDailyWorkReport = async (id) => {
  try {
    const response = await API.post(`/daily-work-reports/${id}/submit`);
    return response.data;
  } catch (error) {
    handleDailyReportError(error, "Unable to submit daily work report");
  }
};

export const reviewDailyWorkReport = async (id, payload) => {
  try {
    const response = await API.patch(`/daily-work-reports/${id}/review`, payload);
    return response.data;
  } catch (error) {
    handleDailyReportError(error, "Unable to review daily work report");
  }
};

export const respondToDailyReportClarification = async (id, clarificationId, payload) => {
  try {
    const response = await API.post(`/daily-work-reports/${id}/clarifications/${clarificationId}/respond`, payload);
    return response.data;
  } catch (error) {
    handleDailyReportError(error, "Unable to send clarification response");
  }
};

export const getDailyReportAnalytics = async (params = {}) => {
  try {
    const response = await API.get("/daily-work-reports/analytics/daily", { params });
    return response.data;
  } catch (error) {
    handleDailyReportError(error, "Unable to fetch daily report analytics");
  }
};

export const getMonthlyReportAnalytics = async (params = {}) => {
  try {
    const response = await API.get("/daily-work-reports/analytics/monthly", { params });
    return response.data;
  } catch (error) {
    handleDailyReportError(error, "Unable to fetch monthly report analytics");
  }
};

export const exportDailyWorkReports = async (params = {}) => {
  try {
    const response = await API.get("/daily-work-reports/export", { params, responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `daily-work-reports-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    handleDailyReportError(error, "Unable to export daily work reports");
  }
};

export const downloadDailyWorkReportPdf = async (id, filename = "daily-work-report.pdf") => {
  try {
    const response = await API.get(`/daily-work-reports/${id}/download-pdf`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    handleDailyReportError(error, "Unable to download daily report PDF");
  }
};
