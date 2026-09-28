import API from "../api/axiosInstance";

export const getPaymentAnalyticsApi = async () => {
  const response = await API.get("/payments/dashboard/analytics");
  return response.data;
};

export const getPaymentHistoryApi = async (params = {}) => {
  const response = await API.get("/payments", { params });
  return response.data;
};

export const getPaymentByIdApi = async (id) => {
  const response = await API.get(`/payments/${id}`);
  return response.data;
};

export const updatePaymentStatusApi = async (id, statusData) => {
  const response = await API.put(`/payments/${id}/status`, statusData);
  return response.data;
};

export const getPaymentReceiptApi = async (id) => {
  const response = await API.get(`/payments/${id}/receipt`);
  return response.data;
};

export const exportPaymentHistoryApi = async (params = {}) => {
  const response = await API.get("/payments/export", {
    params,
    responseType: "blob",
  });
  return response;
};
