import API from "../api/axiosInstance";

export const getCommissionAnalyticsApi = async () => {
  const response = await API.get("/commissions/dashboard/analytics");
  return response.data;
};

export const getCommissionRulesApi = async () => {
  const response = await API.get("/commissions/rules");
  return response.data;
};

export const saveCommissionRuleApi = async (ruleData) => {
  const response = await API.post("/commissions/rules", ruleData);
  return response.data;
};

export const previewCommissionApi = async (previewData) => {
  const response = await API.post("/commissions/preview", previewData);
  return response.data;
};

export const autoGenerateCommissionApi = async (referralId) => {
  const response = await API.post("/commissions/auto-generate", { referralId });
  return response.data;
};

export const getCommissionsApi = async (params = {}) => {
  const response = await API.get("/commissions", { params });
  return response.data;
};

export const getCommissionByIdApi = async (id) => {
  const response = await API.get(`/commissions/${id}`);
  return response.data;
};

export const approveCommissionApi = async (id, approvalData) => {
  const response = await API.put(`/commissions/${id}/approve`, approvalData);
  return response.data;
};

export const adjustCommissionApi = async (id, adjustmentData) => {
  const response = await API.post(`/commissions/${id}/adjust`, adjustmentData);
  return response.data;
};

export const processPaymentApi = async (paymentData) => {
  const response = await API.post("/commissions/process-payment", paymentData);
  return response.data;
};

export const uploadPaymentProofApi = async (paymentId, formData) => {
  const response = await API.post(`/commissions/payments/${paymentId}/proof`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const exportCommissionsApi = async (params = {}) => {
  const response = await API.get("/commissions/export", {
    params,
    responseType: "blob",
  });
  return response;
};
