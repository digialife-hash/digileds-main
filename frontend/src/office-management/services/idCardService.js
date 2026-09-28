import API from "../api/axiosInstance";

export const getIDCardAnalyticsApi = async () => {
  const response = await API.get("/id-cards/dashboard/analytics");
  return response.data;
};

export const verifyQRCodePublicApi = async (identifier) => {
  // Can be token or card number
  const endpoint = identifier.length > 20 ? `/id-cards/verify-token/${identifier}` : `/id-cards/verify/${identifier}`;
  const response = await API.get(endpoint);
  return response.data;
};

export const generateIDCardApi = async (formData) => {
  const response = await API.post("/id-cards/generate", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getIDCardsApi = async (params = {}) => {
  const response = await API.get("/id-cards", { params });
  return response.data;
};

export const getMyIDCardApi = async () => {
  const response = await API.get("/id-cards/my-card");
  return response.data;
};

export const getIDCardByIdApi = async (id) => {
  const response = await API.get(`/id-cards/${id}`);
  return response.data;
};

export const renewIDCardApi = async (id, formData) => {
  const response = await API.put(`/id-cards/${id}/renew`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const revokeIDCardApi = async (id, revocationData) => {
  const response = await API.put(`/id-cards/${id}/revoke`, revocationData);
  return response.data;
};

export const suspendIDCardApi = async (id, suspendData = {}) => {
  const response = await API.put(`/id-cards/${id}/suspend`, suspendData);
  return response.data;
};

export const regenerateQRTokenApi = async (id) => {
  const response = await API.post(`/id-cards/${id}/regenerate-qr`);
  return response.data;
};

export const updateIDCardApi = async (id, formData) => {
  const response = await API.put(`/id-cards/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteIDCardApi = async (id) => {
  const response = await API.delete(`/id-cards/${id}`);
  return response.data;
};

export const exportIDCardsApi = async (params = {}) => {
  const response = await API.get("/id-cards/export", {
    params,
    responseType: "blob",
  });
  return response;
};
