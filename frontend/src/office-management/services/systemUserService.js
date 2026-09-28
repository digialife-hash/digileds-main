import API from "../api/axiosInstance";

export const getSystemUsers = async () => (await API.get("/system-users")).data;
export const createSystemUser = async (payload) => (await API.post("/system-users", payload)).data;
export const updateSystemUser = async (id, payload) => (await API.patch(`/system-users/${id}`, payload)).data;
export const deleteSystemUser = async (id) => (await API.delete(`/system-users/${id}`)).data;
