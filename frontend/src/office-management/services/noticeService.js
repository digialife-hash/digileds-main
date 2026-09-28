import API from "../api/axiosInstance";
import getApiErrorMessage from "../utils/getApiErrorMessage";

const handleServiceError = (error, fallbackMessage) => {
  const message = getApiErrorMessage(error, fallbackMessage);
  const apiError = new Error(message);
  apiError.status = error?.response?.status;
  apiError.code = error?.response?.data?.error?.code;
  throw apiError;
};

// ANNOUNCEMENTS
export const createAnnouncementApi = async (data) => {
  try {
    const response = await API.post("/announcements", data);
    return response.data;
  } catch (error) {
    handleServiceError(error, "Failed to publish announcement");
  }
};

export const getAllAnnouncementsApi = async (params = {}) => {
  try {
    const response = await API.get("/announcements", { params });
    return response.data;
  } catch (error) {
    handleServiceError(error, "Failed to fetch announcements");
  }
};

export const updateAnnouncementApi = async (id, data) => {
  try {
    const response = await API.put(`/announcements/${id}`, data);
    return response.data;
  } catch (error) {
    handleServiceError(error, "Failed to update announcement");
  }
};

export const deleteAnnouncementApi = async (id) => {
  try {
    const response = await API.delete(`/announcements/${id}`);
    return response.data;
  } catch (error) {
    handleServiceError(error, "Failed to delete announcement");
  }
};

// MEETINGS
export const createMeetingApi = async (data) => {
  try {
    const response = await API.post("/meetings", data);
    return response.data;
  } catch (error) {
    handleServiceError(error, "Failed to schedule meeting");
  }
};

export const getAllMeetingsApi = async (params = {}) => {
  try {
    const response = await API.get("/meetings", { params });
    return response.data;
  } catch (error) {
    handleServiceError(error, "Failed to fetch meetings");
  }
};

export const updateMeetingApi = async (id, data) => {
  try {
    const response = await API.put(`/meetings/${id}`, data);
    return response.data;
  } catch (error) {
    handleServiceError(error, "Failed to update meeting");
  }
};

export const deleteMeetingApi = async (id) => {
  try {
    const response = await API.delete(`/meetings/${id}`);
    return response.data;
  } catch (error) {
    handleServiceError(error, "Failed to delete meeting");
  }
};
