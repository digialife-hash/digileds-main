import API from "../api/axiosInstance";

export const getProfileApi = async () => {
  const response = await API.get("/partner-profile");
  return response.data;
};

export const updatePersonalDetailsApi = async (details) => {
  const response = await API.put("/partner-profile/personal", details);
  return response.data;
};

export const updateContactDetailsApi = async (details) => {
  const response = await API.put("/partner-profile/contact", details);
  return response.data;
};

export const updateBankDetailsApi = async (details) => {
  const response = await API.put("/partner-profile/bank", details);
  return response.data;
};

export const uploadProfilePictureApi = async (formData) => {
  const response = await API.post("/partner-profile/picture", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const changePasswordApi = async (passwords) => {
  const response = await API.put("/partner-profile/change-password", passwords);
  return response.data;
};
