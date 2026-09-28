import API from "../api/axiosInstance";
import getApiErrorMessage from "../utils/getApiErrorMessage";

const handleServiceError = (error, fallbackMessage) => {
  const message = getApiErrorMessage(error, fallbackMessage);
  const apiError = new Error(message);
  apiError.status = error?.response?.status;
  apiError.code = error?.response?.data?.error?.code;
  throw apiError;
};

export const createQuotationApi = async (data) => {
  try {
    const response = await API.post("/quotations", data);
    return response.data;
  } catch (error) {
    handleServiceError(error, "Failed to create quotation");
  }
};

export const getAllQuotationsApi = async (params = {}) => {
  try {
    const response = await API.get("/quotations", { params });
    return response.data;
  } catch (error) {
    handleServiceError(error, "Failed to fetch quotations");
  }
};

export const getQuotationByIdApi = async (id) => {
  try {
    const response = await API.get(`/quotations/${id}`);
    return response.data;
  } catch (error) {
    handleServiceError(error, "Failed to fetch quotation details");
  }
};

export const updateQuotationApi = async (id, data) => {
  try {
    const response = await API.put(`/quotations/${id}`, data);
    return response.data;
  } catch (error) {
    handleServiceError(error, "Failed to update quotation");
  }
};

export const deleteQuotationApi = async (id) => {
  try {
    const response = await API.delete(`/quotations/${id}`);
    return response.data;
  } catch (error) {
    handleServiceError(error, "Failed to delete quotation");
  }
};

export const convertQuotationApi = async (id, data = {}) => {
  try {
    const response = await API.post(`/quotations/${id}/convert`, data);
    return response.data;
  } catch (error) {
    handleServiceError(error, "Failed to convert quotation");
  }
};
