import API from "../api/axiosInstance";
import getApiErrorMessage from "../utils/getApiErrorMessage";

const handleInvoiceServiceError = (error, fallbackMessage) => {
  const message = getApiErrorMessage(error, fallbackMessage);
  const apiError = new Error(message);

  apiError.status = error?.response?.status;
  apiError.code = error?.response?.data?.error?.code;

  throw apiError;
};

export const getInvoices = async (params = {}) => {
  try {
    const response = await API.get("/invoices", { params });
    console.log(response)
    return response.data;
  } catch (error) {
    handleInvoiceServiceError(error, "Unable to fetch invoices");
  }
};

export const createInvoice = async (payload) => {
  try {
    console.log(payload);
    const response = await API.post("/invoices", payload);
    return response.data;
  } catch (error) {
    handleInvoiceServiceError(error, "Unable to generate invoice");
  }
};

export const updateInvoice = async (id, payload) => {
  try {
    console.log(payload,":",id);
    const response = await API.patch(`/invoices/${id}`, payload);
    return response.data;
  } catch (error) {
    handleInvoiceServiceError(error, "Unable to update invoice");
  }
};

export const deleteInvoice = async (id) => {
  try {
    const response = await API.delete(`/invoices/${id}`);
    return response.data;
  } catch (error) {
    handleInvoiceServiceError(error, "Unable to delete invoice");
  }
};

export const getMyInvoices = async (params = {}) => {
  try {
    // console.log("param",params);
    const response = await API.get("/invoices/client/my-invoices", { params });
    console.log("data",response.data);
    return response.data;
  } catch (error) {
    handleInvoiceServiceError(error, "Unable to fetch payment status");
  }
};

export const getMyEmployeeBills = async (params = {}) => {
  try {
    const response = await API.get("/invoices/employee/my-bills", { params });
    return response.data;
  } catch (error) {
    handleInvoiceServiceError(error, "Unable to fetch assigned bills");
  }
};

export const getMyEmployeeInvoiceOptions = async () => {
  try {
    const response = await API.get("/invoices/employee/options");
    return response.data;
  } catch (error) {
    handleInvoiceServiceError(error, "Unable to fetch invoice options");
  }
};
