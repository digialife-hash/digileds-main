import API from "../api/axiosInstance";
import getApiErrorMessage from "../utils/getApiErrorMessage";

const handleServiceError = (error, fallbackMessage) => {
  const message = getApiErrorMessage(error, fallbackMessage);
  const apiError = new Error(message);
  apiError.status = error?.response?.status;
  apiError.code = error?.response?.data?.error?.code;
  throw apiError;
};

export const getAccountsSummaryApi = async () => {
  try {
    const response = await API.get("/accounts/summary");
    return response.data;
  } catch (error) {
    handleServiceError(error, "Failed to fetch accounts summary");
  }
};

export const getTotalWorkAmountListApi = async (params = {}) => {
  try {
    const response = await API.get("/accounts/work-amount", { params });
    return response.data;
  } catch (error) {
    handleServiceError(error, "Failed to fetch work amount list");
  }
};

export const getPendingAmountListApi = async (params = {}) => {
  try {
    const response = await API.get("/accounts/pending-amount", { params });
    return response.data;
  } catch (error) {
    handleServiceError(error, "Failed to fetch pending amounts");
  }
};

export const getIncomeListApi = async (params = {}) => {
  try {
    const response = await API.get("/accounts/income", { params });
    return response.data;
  } catch (error) {
    handleServiceError(error, "Failed to fetch income list");
  }
};

export const createIncomeApi = async (data) => {
  try {
    const response = await API.post("/accounts/income", data);
    return response.data;
  } catch (error) {
    handleServiceError(error, "Failed to create income record");
  }
};

export const deleteIncomeApi = async (id) => {
  try {
    const response = await API.delete(`/accounts/income/${id}`);
    return response.data;
  } catch (error) {
    handleServiceError(error, "Failed to delete income record");
  }
};

export const getExpenseListApi = async (params = {}) => {
  try {
    const response = await API.get("/accounts/expenses", { params });
    return response.data;
  } catch (error) {
    handleServiceError(error, "Failed to fetch expense list");
  }
};

export const getExpenseDetailsApi = async (id) => {
  try {
    const response = await API.get(`/accounts/expenses/${id}`);
    return response.data;
  } catch (error) {
    handleServiceError(error, "Failed to fetch expense details");
  }
};

export const getExpenseAnalyticsApi = async (params = {}) => {
  try {
    const response = await API.get("/accounts/expenses/analytics", { params });
    return response.data;
  } catch (error) {
    handleServiceError(error, "Failed to fetch expense analytics");
  }
};

export const createExpenseApi = async (data) => {
  try {
    const response = await API.post("/accounts/expenses", data, data instanceof FormData ? {
      headers: { "Content-Type": "multipart/form-data" },
    } : undefined);
    return response.data;
  } catch (error) {
    handleServiceError(error, "Failed to record expense");
  }
};

export const updateExpenseApi = async (id, data) => {
  try {
    const response = await API.put(`/accounts/expenses/${id}`, data, data instanceof FormData ? {
      headers: { "Content-Type": "multipart/form-data" },
    } : undefined);
    return response.data;
  } catch (error) {
    handleServiceError(error, "Failed to update expense");
  }
};

export const addExpensePaymentApi = async (id, data) => {
  try {
    const response = await API.post(`/accounts/expenses/${id}/payments`, data);
    return response.data;
  } catch (error) {
    handleServiceError(error, "Failed to record expense payment");
  }
};

export const approveExpenseApi = async (id, data = {}) => {
  try {
    const response = await API.patch(`/accounts/expenses/${id}/approve`, data);
    return response.data;
  } catch (error) {
    handleServiceError(error, "Failed to approve expense");
  }
};

export const rejectExpenseApi = async (id, data = {}) => {
  try {
    const response = await API.patch(`/accounts/expenses/${id}/reject`, data);
    return response.data;
  } catch (error) {
    handleServiceError(error, "Failed to reject expense");
  }
};

export const deleteExpenseApi = async (id) => {
  try {
    const response = await API.delete(`/accounts/expenses/${id}`);
    return response.data;
  } catch (error) {
    handleServiceError(error, "Failed to delete expense");
  }
};

export const exportExpensesApi = async (params = {}) => {
  try {
    const response = await API.get("/accounts/expenses/export", {
      params,
      responseType: "blob",
    });
    return response;
  } catch (error) {
    handleServiceError(error, "Failed to export expense records");
  }
};

export const getProfitLossSummaryApi = async (params = {}) => {
  try {
    const response = await API.get("/accounts/profit-loss", { params });
    return response.data;
  } catch (error) {
    handleServiceError(error, "Failed to fetch profit & loss summary");
  }
};
