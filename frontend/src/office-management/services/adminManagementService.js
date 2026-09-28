import API from "../api/axiosInstance";

export const getAdminAccounts = async () => (await API.get("/admin-management")).data;
export const createAdminAccount = async (payload) => (await API.post("/admin-management", payload)).data;
export const updateAdminAccount = async (id, payload) => (await API.patch(`/admin-management/${id}`, payload)).data;
export const deleteAdminAccount = async (id) => (await API.delete(`/admin-management/${id}`)).data;
