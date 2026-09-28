import API from "../api/axiosInstance";
import getApiErrorMessage from "../utils/getApiErrorMessage";

const handleServiceError = (error, fallbackMessage) => {
  const message = getApiErrorMessage(error, fallbackMessage);
  const apiError = new Error(message);
  apiError.status = error?.response?.status;
  apiError.code = error?.response?.data?.error?.code;
  throw apiError;
};

export const createFollowUpApi = async (data) => {
  try {
    const response = await API.post("/follow-ups", data);
    return response.data;
  } catch (error) {
    handleServiceError(error, "Failed to create follow-up");
  }
};

export const getAllFollowUpsApi = async (params = {}) => {
  try {
    const response = await API.get("/follow-ups", { params });
    return response.data;
  } catch (error) {
    handleServiceError(error, "Failed to fetch follow-ups");
  }
};

export const getFollowUpStatsApi = async () => {
  try {
    const response = await API.get("/follow-ups/stats");
    return response.data;
  } catch (error) {
    handleServiceError(error, "Failed to fetch follow-up statistics");
  }
};

export const getFollowUpByIdApi = async (id) => {
  try {
    const response = await API.get(`/follow-ups/${id}`);
    return response.data;
  } catch (error) {
    handleServiceError(error, "Failed to fetch follow-up details");
  }
};

export const updateFollowUpApi = async (id, data) => {
  try {
    const response = await API.put(`/follow-ups/${id}`, data);
    return response.data;
  } catch (error) {
    handleServiceError(error, "Failed to update follow-up");
  }
};

export const deleteFollowUpApi = async (id) => {
  try {
    const response = await API.delete(`/follow-ups/${id}`);
    return response.data;
  } catch (error) {
    handleServiceError(error, "Failed to delete follow-up");
  }
};
