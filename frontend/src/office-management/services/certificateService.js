import API from "../api/axiosInstance";

export const getCertificateAnalyticsApi = async () => {
  const response = await API.get("/certificates/dashboard/analytics");
  return response.data;
};

export const verifyCertificatePublicApi = async (certificateNumber) => {
  const response = await API.get(`/certificates/verify/${certificateNumber}`);
  return response.data;
};

export const issueCertificateApi = async (formData) => {
  const response = await API.post("/certificates/issue", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getCertificatesApi = async (params = {}) => {
  const response = await API.get("/certificates", { params });
  return response.data;
};

export const getCertificateByIdApi = async (id) => {
  const response = await API.get(`/certificates/${id}`);
  return response.data;
};

export const renewCertificateApi = async (id, renewalData) => {
  const response = await API.put(`/certificates/${id}/renew`, renewalData);
  return response.data;
};

export const revokeCertificateApi = async (id, revocationData) => {
  const response = await API.put(`/certificates/${id}/revoke`, revocationData);
  return response.data;
};

export const updateCertificateApi = async (id, updateData) => {
  const response = await API.put(`/certificates/${id}`, updateData);
  return response.data;
};

export const deleteCertificateApi = async (id) => {
  const response = await API.delete(`/certificates/${id}`);
  return response.data;
};

export const getCertificateTypesApi = async () => {
  const response = await API.get("/certificates/types");
  return response.data;
};

export const createCertificateTypeApi = async (typeData) => {
  const response = await API.post("/certificates/types", typeData);
  return response.data;
};

export const exportCertificatesApi = async (params = {}) => {
  const response = await API.get("/certificates/export", {
    params,
    responseType: "blob",
  });
  return response;
};
