import API from "../api/axiosInstance";
import getApiErrorMessage from "../utils/getApiErrorMessage";

const handleTeamServiceError = (error, fallbackMessage) => {
  const message = getApiErrorMessage(error, fallbackMessage);
  const apiError = new Error(message);

  apiError.status = error?.response?.status;
  apiError.code = error?.response?.data?.error?.code;

  throw apiError;
};

export const getTeams = async (params = {}) => {
  try {
    const response = await API.get("/teams", { params });
    return response.data;
  } catch (error) {
    handleTeamServiceError(error, "Unable to fetch teams");
  }
};

export const createTeam = async (payload) => {
  try {
    const response = await API.post("/teams", payload);
    return response.data;
  } catch (error) {
    handleTeamServiceError(error, "Unable to create team");
  }
};

export const getTeamById = async (id) => {
  try {
    const response = await API.get(`/teams/${id}`);
    return response.data;
  } catch (error) {
    handleTeamServiceError(error, "Unable to fetch team");
  }
};

export const updateTeam = async (id, payload) => {
  try {
    const response = await API.patch(`/teams/${id}`, payload);
    return response.data;
  } catch (error) {
    handleTeamServiceError(error, "Unable to update team");
  }
};

export const deleteTeam = async (id) => {
  try {
    const response = await API.delete(`/teams/${id}`);
    return response.data;
  } catch (error) {
    handleTeamServiceError(error, "Unable to delete team");
  }
};

export const addMembersToTeam = async (id, payload) => {
  try {
    const response = await API.patch(`/teams/${id}/members/add`, payload);
    return response.data;
  } catch (error) {
    handleTeamServiceError(error, "Unable to add team members");
  }
};

export const removeMembersFromTeam = async (id, payload) => {
  try {
    const response = await API.patch(`/teams/${id}/members/remove`, payload);
    return response.data;
  } catch (error) {
    handleTeamServiceError(error, "Unable to remove team members");
  }
};

export const assignProjectsToTeam = async (id, payload) => {
  try {
    const response = await API.patch(`/teams/${id}/projects/assign`, payload);
    return response.data;
  } catch (error) {
    handleTeamServiceError(error, "Unable to assign team projects");
  }
};

export const removeProjectsFromTeam = async (id, payload) => {
  try {
    const response = await API.patch(`/teams/${id}/projects/remove`, payload);
    return response.data;
  } catch (error) {
    handleTeamServiceError(error, "Unable to remove team projects");
  }
};
