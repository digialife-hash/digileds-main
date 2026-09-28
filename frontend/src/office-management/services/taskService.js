import API from "../api/axiosInstance";
import getApiErrorMessage from "../utils/getApiErrorMessage";

const handleTaskServiceError = (error, fallbackMessage) => {
  const message = getApiErrorMessage(error, fallbackMessage);
  const apiError = new Error(message);

  apiError.status = error?.response?.status;
  apiError.code = error?.response?.data?.error?.code;

  throw apiError;
};

export const getTasks = async (params = {}) => {
  try {
    const response = await API.get("/tasks", { params });
    return response.data;
  } catch (error) {
    handleTaskServiceError(error, "Unable to fetch tasks");
  }
};

export const createTask = async (payload) => {
  try {
    const response = await API.post("/tasks", payload);
    return response.data;
  } catch (error) {
    handleTaskServiceError(error, "Unable to create task");
  }
};

export const getTaskById = async (id) => {
  try {
    const response = await API.get(`/tasks/${id}`);
    return response.data;
  } catch (error) {
    handleTaskServiceError(error, "Unable to fetch task");
  }
};

export const updateTask = async (id, payload) => {
  try {
    const response = await API.patch(`/tasks/${id}`, payload);
    return response.data;
  } catch (error) {
    handleTaskServiceError(error, "Unable to update task");
  }
};

export const deleteTask = async (id) => {
  try {
    const response = await API.delete(`/tasks/${id}`);
    return response.data;
  } catch (error) {
    handleTaskServiceError(error, "Unable to delete task");
  }
};

export const getMyTasks = async (params = {}) => {
  try {
    const response = await API.get("/tasks/my-tasks", { params });
    return response.data;
  } catch (error) {
    handleTaskServiceError(error, "Unable to fetch assigned tasks");
  }
};

export const getMyTaskById = async (id) => {
  try {
    const response = await API.get(`/tasks/my-tasks/${id}`);
    return response.data;
  } catch (error) {
    handleTaskServiceError(error, "Unable to fetch assigned task");
  }
};

export const updateMyTaskStatus = async (id, payload) => {
  try {
    const response = await API.patch(`/tasks/my-tasks/${id}/status`, payload);
    return response.data;
  } catch (error) {
    handleTaskServiceError(error, "Unable to update task status");
  }
};

export const addMyTaskProgressUpdate = async (id, payload) => {
  try {
    const response = await API.post(`/tasks/my-tasks/${id}/progress`, payload);
    return response.data;
  } catch (error) {
    handleTaskServiceError(error, "Unable to add task progress update");
  }
};

export const addMyTaskComment = async (id, payload) => {
  try {
    const response = await API.post(`/tasks/my-tasks/${id}/comments`, payload);
    return response.data;
  } catch (error) {
    handleTaskServiceError(error, "Unable to add task comment");
  }
};

export const addTaskComment = async (id, payload) => {
  try {
    const response = await API.post(`/tasks/${id}/comments`, payload);
    return response.data;
  } catch (error) {
    handleTaskServiceError(error, "Unable to add task comment");
  }
};

export const uploadTaskDocuments = async (taskId, formData) => {
  try {
    const response = await API.post(`/tasks/${taskId}/documents/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    handleTaskServiceError(error, "Unable to upload task document(s)");
  }
};

export const getTaskDocuments = async (taskId) => {
  try {
    const response = await API.get(`/tasks/${taskId}/documents`);
    return response.data;
  } catch (error) {
    handleTaskServiceError(error, "Unable to fetch task documents");
  }
};

export const updateTaskDocument = async (docId, formData) => {
  try {
    const isFormData = formData instanceof FormData;
    const response = await API.put(`/documents/${docId}`, formData, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
    });
    return response.data;
  } catch (error) {
    handleTaskServiceError(error, "Unable to update document");
  }
};

export const deleteTaskDocument = async (docId) => {
  try {
    const response = await API.delete(`/documents/${docId}`);
    return response.data;
  } catch (error) {
    handleTaskServiceError(error, "Unable to delete document");
  }
};

export const downloadTaskDocument = async (docId, originalName) => {
  try {
    const response = await API.get(`/documents/${docId}/download`, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", originalName || "document");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    handleTaskServiceError(error, "Unable to download document");
  }
};

export const getTaskTimeline = async (taskId) => {
  try {
    const response = await API.get(`/tasks/${taskId}/timeline`);
    return response.data;
  } catch (error) {
    handleTaskServiceError(error, "Unable to fetch task timeline");
  }
};

