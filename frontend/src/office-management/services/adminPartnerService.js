import API from "../api/axiosInstance";

export const getAdminPartnerDashboardApi = async () => {
  const response = await API.get("/admin/partner-management/dashboard/analytics");
  return response.data;
};

export const getAllPartnersAdminApi = async (params = {}) => {
  const response = await API.get("/admin/partner-management", { params });
  return response.data;
};

export const createPartnerAdminApi = async (partnerData) => {
  const response = await API.post("/admin/partner-management", partnerData);
  return response.data;
};

export const getPartnerByIdAdminApi = async (id) => {
  const response = await API.get(`/admin/partner-management/${id}`);
  return response.data;
};

export const updatePartnerAdminApi = async (id, partnerData) => {
  const response = await API.put(`/admin/partner-management/${id}`, partnerData);
  return response.data;
};

export const activatePartnerAdminApi = async (id) => {
  const response = await API.put(`/admin/partner-management/${id}/activate`);
  return response.data;
};

export const deactivatePartnerAdminApi = async (id) => {
  const response = await API.put(`/admin/partner-management/${id}/deactivate`);
  return response.data;
};

export const suspendPartnerAdminApi = async (id) => {
  const response = await API.put(`/admin/partner-management/${id}/suspend`);
  return response.data;
};

export const approvePartnerApi = async (id) => {
  const response = await API.put(`/admin/partner-management/${id}/approve`);
  return response.data;
};

export const rejectPartnerApi = async (id, data = {}) => {
  const response = await API.put(`/admin/partner-management/${id}/reject`, data);
  return response.data;
};

export const updatePartnerLevelApi = async (id, levelData) => {
  const response = await API.put(`/admin/partner-management/${id}/level`, levelData);
  return response.data;
};

export const resetPartnerPasswordAdminApi = async (id, passwordData) => {
  const response = await API.put(`/admin/partner-management/${id}/reset-password`, passwordData);
  return response.data;
};

export const deletePartnerAdminApi = async (id) => {
  const response = await API.delete(`/admin/partner-management/${id}`);
  return response.data;
};

export const uploadPartnerCompanyDocumentsApi = async (partnerId, formData) => {
  const response = await API.post(`/admin/partner-management/${partnerId}/company-documents`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getPartnerCompanyDocumentsAdminApi = async (partnerId) => {
  const response = await API.get(`/admin/partner-management/${partnerId}/company-documents`);
  return response.data;
};

export const updatePartnerCompanyDocumentAdminApi = async (docId, formData) => {
  const isFormData = formData instanceof FormData;
  const response = await API.put(`/admin/partner-management/company-documents/${docId}`, formData, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
  });
  return response.data;
};

export const deletePartnerCompanyDocumentAdminApi = async (docId) => {
  const response = await API.delete(`/admin/partner-management/company-documents/${docId}`);
  return response.data;
};

export const downloadPartnerCompanyDocumentApi = async (docId, originalName) => {
  const response = await API.get(`/admin/partner-management/company-documents/${docId}/download`, {
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

