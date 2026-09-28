import API from "../api/axiosInstance";
import getApiErrorMessage from "../utils/getApiErrorMessage";

const handlePayrollServiceError = (error, fallbackMessage) => {
  const message = getApiErrorMessage(error, fallbackMessage);
  const apiError = new Error(message);

  apiError.status = error?.response?.status;
  apiError.code = error?.response?.data?.error?.code;

  throw apiError;
};

export const getPayrolls = async (params = {}) => {
  try {
    const response = await API.get("/payroll", { params });
    return response.data;
  } catch (error) {
    handlePayrollServiceError(error, "Unable to fetch payroll records");
  }
};

export const createPayroll = async (payload) => {
  try {
    const response = await API.post("/payroll", payload);
    return response.data;
  } catch (error) {
    handlePayrollServiceError(error, "Unable to create payroll record");
  }
};

export const getPayrollById = async (id) => {
  try {
    const response = await API.get(`/payroll/${id}`);
    return response.data;
  } catch (error) {
    handlePayrollServiceError(error, "Unable to fetch payroll record");
  }
};

export const updatePayroll = async (id, payload) => {
  try {
    const response = await API.patch(`/payroll/${id}`, payload);
    return response.data;
  } catch (error) {
    handlePayrollServiceError(error, "Unable to update payroll record");
  }
};

export const deletePayroll = async (id) => {
  try {
    const response = await API.delete(`/payroll/${id}`);
    return response.data;
  } catch (error) {
    handlePayrollServiceError(error, "Unable to delete payroll record");
  }
};

export const getPayrollByEmployee = async (employeeId, params = {}) => {
  try {
    const response = await API.get(`/payroll/employee/${employeeId}`, {
      params,
    });
    return response.data;
  } catch (error) {
    handlePayrollServiceError(error, "Unable to fetch employee payroll records");
  }
};

export const getPayrollPreview = async (params = {}) => {
  try {
    const response = await API.get("/payroll/preview", { params });
    return response.data;
  } catch (error) {
    handlePayrollServiceError(error, "Unable to fetch payroll preview");
  }
};

export const generateBulkPayroll = async (payload) => {
  try {
    const response = await API.post("/payroll/bulk-generate", payload);
    return response.data;
  } catch (error) {
    handlePayrollServiceError(error, "Unable to generate payroll");
  }
};

export const approvePayroll = async (id, action) => {
  try {
    const response = await API.put(`/payroll/approve/${id}`, { action });
    return response.data;
  } catch (error) {
    handlePayrollServiceError(error, "Unable to update payroll approval status");
  }
};

export const recalculatePayroll = async (id) => {
  try {
    const response = await API.post(`/payroll/recalculate/${id}`);
    return response.data;
  } catch (error) {
    handlePayrollServiceError(error, "Unable to recalculate payroll");
  }
};
