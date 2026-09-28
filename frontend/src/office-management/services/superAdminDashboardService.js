import API from "../api/axiosInstance";
import getApiErrorMessage from "../utils/getApiErrorMessage";

const handleServiceError = (error, fallbackMessage) => {
  const message = getApiErrorMessage(error, fallbackMessage);
  const apiError = new Error(message);
  apiError.status = error?.response?.status;
  apiError.code = error?.response?.data?.error?.code;
  throw apiError;
};

export const getSuperAdminDashboardSummary = async (params = {}) => {
  try {
    const response = await API.get("/super-admin/dashboard/summary", { params });
    return response.data;
  } catch (error) {
    handleServiceError(error, "Unable to fetch admin dashboard summary");
  }
};

export const getEmployeeDocuments = async () => {
  try {
    const response = await API.get("/adminDocument/All_Employee");
    console.log("Employee Documents Response:", response.data); // Log the response data for debugging
    return response.data;
  } catch (error) {
    handleServiceError(error, "Unable to fetch employee documents");
  }
};

export const deleteEmployeeDocument = async (id) => {
  const response = await API.delete(`/adminDocument/All_Employee/${id}`);
  return response.data;
};

export const getClientDocuments = async () => {
  try {
    const response = await API.get("/adminDocument/All_Client");
    return response.data;
  } catch (error) {
    handleServiceError(error, "Unable to fetch client documents");
  }
};

export const deleteClientDocument = async (id) => {
  const response = await API.delete(`/adminDocument/All_Client/${id}`);
  return response.data;
};