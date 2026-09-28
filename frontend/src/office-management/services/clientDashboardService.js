import API from "../api/axiosInstance";
import getApiErrorMessage from "../utils/getApiErrorMessage";

export const getClientDashboardSummary = async () => {
  try {
    const response = await API.get("/dashboard/client");
    return response.data;
  } catch (error) {
    const apiError = new Error(
      getApiErrorMessage(error, "Unable to fetch client dashboard summary")
    );
    apiError.status = error?.response?.status;
    apiError.code = error?.response?.data?.error?.code;
    throw apiError;
  }
};
