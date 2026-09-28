import API from "../api/axiosInstance";
import getApiErrorMessage from "../utils/getApiErrorMessage";

const handleServiceError = (error, fallbackMessage) => {
  const message = getApiErrorMessage(error, fallbackMessage);
  const apiError = new Error(message);
  apiError.status = error?.response?.status;
  apiError.code = error?.response?.data?.error?.code;
  throw apiError;
};

export const applyLeaveApi = async (data) => {
  try {
    const response = await API.post("/leaves/apply", data);
    return response.data;
  } catch (error) {
    handleServiceError(error, "Failed to submit leave request");
  }
};

export const getMyLeavesApi = async (params = {}) => {
  try {
    const response = await API.get("/leaves/my-leaves", { params });
    return response.data;
  } catch (error) {
    handleServiceError(error, "Failed to fetch leave history");
  }
};

export const cancelMyLeaveApi = async (id) => {
  try {
    const response = await API.patch(`/leaves/${id}/cancel`);
    return response.data;
  } catch (error) {
    handleServiceError(error, "Failed to cancel leave request");
  }
};

export const getAllLeavesApi = async (params = {}) => {
  try {
    const response = await API.get("/leaves/all", { params });
    return response.data;
  } catch (error) {
    handleServiceError(error, "Failed to fetch leave requests");
  }
};

export const updateLeaveStatusApi = async (id, data) => {
  try {
    const response = await API.patch(`/leaves/${id}/status`, data);
    return response.data;
  } catch (error) {
    handleServiceError(error, "Failed to update leave status");
  }
};
