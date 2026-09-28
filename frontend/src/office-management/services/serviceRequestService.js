import API from "../api/axiosInstance";
import getApiErrorMessage from "../utils/getApiErrorMessage";

const handleServiceRequestError = (error, fallbackMessage) => {
  const message = getApiErrorMessage(error, fallbackMessage);
  const apiError = new Error(message);

  apiError.status = error?.response?.status;
  apiError.code = error?.response?.data?.error?.code;

  throw apiError;
};

export const createServiceRequest = async (payload) => {
  try {
    const response = await API.post("/service-requests", payload);
    return response.data;
  } catch (error) {
    handleServiceRequestError(error, "Unable to create service request");
  }
};

export const createServiceRequestBySuperAdmin = async (payload) => {
  try {
    const response = await API.post("/service-requests/super-admin", payload);
    return response.data;
  } catch (error) {
    handleServiceRequestError(error, "Unable to create service request");
  }
};

export const getMyServiceRequests = async (params = {}) => {
  try {
    const response = await API.get("/service-requests/my-requests", {
      params,
    });
    return response.data;
  } catch (error) {
    handleServiceRequestError(error, "Unable to fetch your service requests");
  }
};

export const getMyServiceRequestById = async (id) => {
  try {
    const response = await API.get(`/service-requests/my-requests/${id}`);
    return response.data;
  } catch (error) {
    handleServiceRequestError(error, "Unable to fetch service request");
  }
};

export const updateMyServiceRequest = async (id, payload) => {
  try {
    const response = await API.patch(
      `/service-requests/my-requests/${id}`,
      payload
    );
    return response.data;
  } catch (error) {
    handleServiceRequestError(error, "Unable to update service request");
  }
};

export const getAllServiceRequests = async (params = {}) => {
  try {
    const response = await API.get("/service-requests", { params });
    return response.data;
  } catch (error) {
    handleServiceRequestError(error, "Unable to fetch service requests");
  }
};

export const getServiceRequestById = async (id) => {
  try {
    const response = await API.get(`/service-requests/${id}`);
    return response.data;
  } catch (error) {
    handleServiceRequestError(error, "Unable to fetch service request");
  }
};

export const updateServiceRequestStatus = async (id, payload) => {
  try {
    const response = await API.patch(`/service-requests/${id}/status`, payload);
    return response.data;
  } catch (error) {
    handleServiceRequestError(
      error,
      "Unable to update service request status"
    );
  }
};

export const updateServiceRequestBySuperAdmin = async (id, payload) => {
  try {
    const response = await API.patch(`/service-requests/${id}`, payload);
    return response.data;
  } catch (error) {
    handleServiceRequestError(error, "Unable to update service request");
  }
};

export const convertServiceRequestToProject = async (id) => {
  try {
    const response = await API.post(
      `/service-requests/${id}/convert-to-project`
    );
    return response.data;
  } catch (error) {
    handleServiceRequestError(
      error,
      "Unable to convert service request to project"
    );
  }
};

export const deleteServiceRequest = async (id) => {
  try {
    const response = await API.delete(`/service-requests/${id}`);
    return response.data;
  } catch (error) {
    handleServiceRequestError(error, "Unable to delete service request");
  }
};
