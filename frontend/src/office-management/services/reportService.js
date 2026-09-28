import API from "../api/axiosInstance";

export const getReportsDashboardAnalyticsApi = async () => {
  const response = await API.get("/reports/dashboard/analytics");
  return response.data;
};

export const getReferralReportApi = async (params = {}) => {
  const response = await API.get("/reports/referrals", { params });
  return response.data;
};

export const getPartnerPerformanceReportApi = async (params = {}) => {
  const response = await API.get("/reports/partner-performance", { params });
  return response.data;
};

export const getMonthlyReferralReportApi = async (params = {}) => {
  const response = await API.get("/reports/monthly", { params });
  return response.data;
};

export const getClientConversionReportApi = async (params = {}) => {
  const response = await API.get("/reports/client-conversion", { params });
  return response.data;
};

export const getCommissionReportApi = async (params = {}) => {
  const response = await API.get("/reports/commissions", { params });
  return response.data;
};

export const getPaymentReportApi = async (params = {}) => {
  const response = await API.get("/reports/payments", { params });
  return response.data;
};

export const getTerritoryReportApi = async (params = {}) => {
  const response = await API.get("/reports/territory", { params });
  return response.data;
};

export const getScheduledReportsApi = async () => {
  const response = await API.get("/reports/schedules");
  return response.data;
};

export const createScheduledReportApi = async (scheduleData) => {
  const response = await API.post("/reports/schedules", scheduleData);
  return response.data;
};

export const getReportHistoryApi = async () => {
  const response = await API.get("/reports/history");
  return response.data;
};

export const getEmployeeReportApi = async (params = {}) => {
  const response = await API.get("/reports/employee", { params });
  return response.data;
};

export const getSalesReportApi = async (params = {}) => {
  const response = await API.get("/reports/sales", { params });
  return response.data;
};

export const getClientReportApi = async (params = {}) => {
  const response = await API.get("/reports/client", { params });
  return response.data;
};

