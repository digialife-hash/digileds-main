import API from "../api/axiosInstance";
import getApiErrorMessage from "../utils/getApiErrorMessage";

const handleProjectServiceError = (error, fallbackMessage) => {
  const message = getApiErrorMessage(error, fallbackMessage);
  const apiError = new Error(message);

  apiError.status = error?.response?.status;
  apiError.code = error?.response?.data?.error?.code;

  throw apiError;
};

export const getProjects = async (params = {}) => {
  try {
    const response = await API.get("/projects", { params });
    return response.data;
  } catch (error) {
    handleProjectServiceError(error, "Unable to fetch projects");
  }
};

export const createProject = async (payload) => {
  try {
    const response = await API.post("/projects", payload);
    return response.data;
  } catch (error) {
    handleProjectServiceError(error, "Unable to create project");
  }
};

export const getProjectById = async (id) => {
  try {
    const response = await API.get(`/projects/${id}`);
    return response.data;
  } catch (error) {
    handleProjectServiceError(error, "Unable to fetch project");
  }
};

export const updateProject = async (id, payload) => {
  try {
    const response = await API.patch(`/projects/${id}`, payload);
    return response.data;
  } catch (error) {
    handleProjectServiceError(error, "Unable to update project");
  }
};

export const deleteProject = async (id) => {
  try {
    const response = await API.delete(`/projects/${id}`);
    return response.data;
  } catch (error) {
    handleProjectServiceError(error, "Unable to delete project");
  }
};

export const getClientProjects = async (params = {}) => {
  try {
    const response = await API.get("/projects/client/my-projects", { params });
    return response.data;
  } catch (error) {
    handleProjectServiceError(error, "Unable to fetch your projects");
  }
};

export const getClientProjectById = async (id) => {
  try {
    const response = await API.get(`/projects/client/my-projects/${id}`);
    return response.data;
  } catch (error) {
    handleProjectServiceError(error, "Unable to fetch your project");
  }
};

export const getEmployeeProjects = async (params = {}) => {
  try {
    const response = await API.get("/projects/employee/my-projects", { params });
    return response.data;
  } catch (error) {
    handleProjectServiceError(error, "Unable to fetch your projects");
  }
};

export const getEmployeeProjectById = async (id) => {
  try {
    const response = await API.get(`/projects/employee/my-projects/${id}`);
    return response.data;
  } catch (error) {
    handleProjectServiceError(error, "Unable to fetch your project");
  }
};
