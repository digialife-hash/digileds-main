import API from "../api/axiosInstance";

export const getMyAssignedServiceDetailsApi = async (clientId = "") => {
  const url = clientId
    ? `/client-service-details/assigned-services?clientId=${clientId}`
    : "/client-service-details/assigned-services";
  const res = await API.get(url);
  return res.data;
};

export const getServiceDetailByTypeApi = async (serviceType, clientId = "") => {
  const url = clientId
    ? `/client-service-details/service-type/${serviceType}?clientId=${clientId}`
    : `/client-service-details/service-type/${serviceType}`;
  const res = await API.get(url);
  return res.data;
};

export const saveServiceDetailDraftApi = async (serviceType, payload) => {
  const res = await API.post(`/client-service-details/service-type/${serviceType}/draft`, payload);
  return res.data;
};

export const submitServiceDetailApi = async (serviceType, payload) => {
  const res = await API.post(`/client-service-details/service-type/${serviceType}/submit`, payload);
  return res.data;
};

export const uploadServiceResourceApi = async (serviceType, formData) => {
  const res = await API.post(`/client-service-details/service-type/${serviceType}/resources`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteServiceResourceApi = async (serviceType, resourceId, clientId = "") => {
  const url = clientId
    ? `/client-service-details/service-type/${serviceType}/resources/${resourceId}?clientId=${clientId}`
    : `/client-service-details/service-type/${serviceType}/resources/${resourceId}`;
  const res = await API.delete(url);
  return res.data;
};

export const adminGetAllServiceDetailsApi = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await API.get(`/client-service-details/admin/all?${query}`);
  return res.data;
};

export const adminGetServiceDetailByIdApi = async (id) => {
  const res = await API.get(`/client-service-details/admin/${id}`);
  return res.data;
};

export const adminUpdateServiceDetailStatusApi = async (id, payload) => {
  const res = await API.patch(`/client-service-details/admin/${id}/review`, payload);
  return res.data;
};
