import API from "../api/axiosInstance";
import getApiErrorMessage from "../utils/getApiErrorMessage";

const handleSettingsServiceError = (error, fallbackMessage) => {
  const message = getApiErrorMessage(error, fallbackMessage);
  const apiError = new Error(message);

  apiError.status = error?.response?.status;
  apiError.code = error?.response?.data?.error?.code;

  throw apiError;
};

export const getCompanySettings = async () => {
  try {
    const response = await API.get("/settings/company");
    return response.data;
  } catch (error) {
    handleSettingsServiceError(error, "Unable to fetch company settings");
  }
};

export const updateCompanySettings = async (payload) => {
  try {
    const response = await API.patch("/settings/company", payload);
    return response.data;
  } catch (error) {
    handleSettingsServiceError(error, "Unable to update company settings");
  }
};

export const getBankSettings = async () => {
  try {
    const response = await API.get("/settings/bank");
    return response.data;
  } catch (error) {
    handleSettingsServiceError(error, "Unable to fetch bank settings");
  }
};

export const updateBankSettings = async (payload) => {
  try {
    const response = await API.patch("/settings/bank", payload);
    return response.data;
  } catch (error) {
    handleSettingsServiceError(error, "Unable to update bank settings");
  }
};

export const getSecuritySettings = async () => {
  try {
    const response = await API.get("/settings/security");
    return response.data;
  } catch (error) {
    handleSettingsServiceError(error, "Unable to fetch security settings");
  }
};

export const updateSecuritySettings = async (payload) => {
  try {
    const response = await API.patch("/settings/security", payload);
    return response.data;
  } catch (error) {
    handleSettingsServiceError(error, "Unable to update security settings");
  }
};
