import API from "../api/axiosInstance";
import getApiErrorMessage from "../utils/getApiErrorMessage";

const handleAttendanceServiceError = (error, fallbackMessage) => {
  const message = getApiErrorMessage(error, fallbackMessage);
  const apiError = new Error(message);

  apiError.status = error?.response?.status;
  apiError.code = error?.response?.data?.error?.code;

  throw apiError;
};

export const employeeCheckIn = async (data = {}) => {
  try {
    const response = await API.post("/attendance/check-in", data);
    return response.data;
  } catch (error) {
    handleAttendanceServiceError(error, "Unable to check in");
  }
};

export const employeeCheckOut = async (data = {}) => {
  try {
    const response = await API.post("/attendance/check-out", data);
    return response.data;
  } catch (error) {
    handleAttendanceServiceError(error, "Unable to check out");
  }
};

export const getMyAttendanceHistory = async (params = {}) => {
  try {
    const response = await API.get("/attendance/my-history", { params });
    return response.data;
  } catch (error) {
    handleAttendanceServiceError(error, "Unable to fetch attendance history");
  }
};

export const getTodayAttendance = async () => {
  try {
    const response = await API.get("/attendance/my-today");
    return response.data;
  } catch (error) {
    handleAttendanceServiceError(error, "Unable to fetch today's attendance");
  }
};

export const getAllAttendance = async (params = {}) => {
  try {
    const response = await API.get("/attendance", { params });
    return response.data;
  } catch (error) {
    handleAttendanceServiceError(error, "Unable to fetch attendance records");
  }
};

export const getAttendanceByEmployee = async (employeeId, params = {}) => {
  try {
    const response = await API.get(`/attendance/employee/${employeeId}`, {
      params,
    });
    return response.data;
  } catch (error) {
    handleAttendanceServiceError(
      error,
      "Unable to fetch employee attendance records"
    );
  }
};

export const getAttendanceByDate = async (params = {}) => {
  try {
    const response = await API.get("/attendance/date", { params });
    return response.data;
  } catch (error) {
    handleAttendanceServiceError(error, "Unable to fetch attendance by date");
  }
};

export const getAttendanceSettings = async () => {
  try {
    const response = await API.get("/attendance/settings");
    return response.data;
  } catch (error) {
    handleAttendanceServiceError(error, "Unable to fetch settings");
  }
};

export const updateAttendanceSettings = async (data) => {
  try {
    const response = await API.put("/attendance/settings", data);
    return response.data;
  } catch (error) {
    handleAttendanceServiceError(error, "Unable to update settings");
  }
};

export const getHolidays = async () => {
  try {
    const response = await API.get("/attendance/holidays");
    return response.data;
  } catch (error) {
    handleAttendanceServiceError(error, "Unable to fetch holidays");
  }
};

export const createHoliday = async (data) => {
  try {
    const response = await API.post("/attendance/holidays", data);
    return response.data;
  } catch (error) {
    handleAttendanceServiceError(error, "Unable to create holiday");
  }
};

export const updateHoliday = async (id, data) => {
  try {
    const response = await API.put(`/attendance/holidays/${id}`, data);
    return response.data;
  } catch (error) {
    handleAttendanceServiceError(error, "Unable to update holiday");
  }
};

export const deleteHoliday = async (id) => {
  try {
    const response = await API.delete(`/attendance/holidays/${id}`);
    return response.data;
  } catch (error) {
    handleAttendanceServiceError(error, "Unable to delete holiday");
  }
};

export const updateAttendanceRemarks = async (id, data) => {
  try {
    const response = await API.put(`/attendance/remarks/${id}`, data);
    return response.data;
  } catch (error) {
    handleAttendanceServiceError(error, "Unable to update remarks");
  }
};

export const getMonthlyAttendanceSummary = async (params = {}) => {
  try {
    const response = await API.get("/attendance/monthly-summary", { params });
    return response.data;
  } catch (error) {
    handleAttendanceServiceError(error, "Unable to fetch monthly summary");
  }
};

export const getAttendanceCalendar = async (params = {}) => {
  try {
    const response = await API.get("/attendance/calendar", { params });
    return response.data;
  } catch (error) {
    handleAttendanceServiceError(error, "Unable to fetch calendar");
  }
};

export const getAttendanceAnalytics = async () => {
  try {
    const response = await API.get("/attendance/analytics");
    return response.data;
  } catch (error) {
    handleAttendanceServiceError(error, "Unable to fetch analytics");
  }
};

export const upsertAttendance = async (data) => {
  try {
    const response = await API.post("/attendance/upsert", data);
    return response.data;
  } catch (error) {
    handleAttendanceServiceError(error, "Unable to save attendance details");
  }
};
