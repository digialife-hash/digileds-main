import API from "../api/axiosInstance";
import getApiErrorMessage from "../utils/getApiErrorMessage";

const handleServiceError = (error, fallbackMessage) => {
  const message = getApiErrorMessage(error, fallbackMessage);
  const apiError = new Error(message);
  apiError.status = error?.response?.status;
  apiError.code = error?.response?.data?.error?.code;
  throw apiError;
};

export const createLeadApi = async (data) => {
  try {
    const response = await API.post("/leads", data);
    return response.data;
  } catch (error) {
    handleServiceError(error, "Failed to create lead");
  }
};

export const getAllLeadsApi = async (params = {}) => {
  try {
    const response = await API.get("/leads", { params });
    return response.data;
  } catch (error) {
    handleServiceError(error, "Failed to fetch leads");
  }
};

export const getLeadByIdApi = async (id) => {
  try {
    const response = await API.get(`/leads/${id}`);
    return response.data;
  } catch (error) {
    handleServiceError(error, "Failed to fetch lead details");
  }
};

export const updateLeadApi = async (id, data) => {
  try {
    const response = await API.put(`/leads/${id}`, data);
    return response.data;
  } catch (error) {
    handleServiceError(error, "Failed to update lead");
  }
};

export const deleteLeadApi = async (id) => {
  try {
    const response = await API.delete(`/leads/${id}`);
    return response.data;
  } catch (error) {
    handleServiceError(error, "Failed to delete lead");
  }
};

export const convertLeadToClientApi = async (id) => {
  try {
    const response = await API.post(`/leads/${id}/convert`);
    return response.data;
  } catch (error) {
    handleServiceError(error, "Failed to convert lead to client");
  }
};
