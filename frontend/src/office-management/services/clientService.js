import API from "../api/axiosInstance";
import getApiErrorMessage from "../utils/getApiErrorMessage";

const handleClientServiceError = (error, fallbackMessage) => {
  const message = getApiErrorMessage(error, fallbackMessage);
  const apiError = new Error(message);

  apiError.status = error?.response?.status;
  apiError.code = error?.response?.data?.error?.code;

  throw apiError;
};

export const changeClientPassword = async (clientId, payload) => {
  console.log(clientId,":",payload)
  const response = await API.put(`/clients/${clientId}/change-password`, payload);
  return response.data;
};


export const getClients = async (params = {}) => {
  try {
    const response = await API.get("/clients", { params });
    return response.data;
  } catch (error) {
    handleClientServiceError(error, "Unable to fetch clients");
  }
};

export const getMyAssignedClients = async (params = {}) => {
  try {
    const response = await API.get("/clients/my-assigned-clients", { params });
    return response.data;
  } catch (error) {
    handleClientServiceError(error, "Unable to fetch assigned clients");
  }
};

export const getClientById = async (id) => {
  try {
    const response = await API.get(`/clients/${id}`);
    return response.data;
  } catch (error) {
    handleClientServiceError(error, "Unable to fetch client");
  }
};

export const uploadClientDocument = async (formData) => {
  try {
    const response = await API.post("/documentClient/upload", formData,);
    // console.log("uploadClientDocument response:", response.data);
    return response.data;
  } catch (error) {
    handleClientServiceError(error, "Unable to upload client document");
  }
}

export const getClientDocuments = async () => {
  try {
    const response = await API.get("/documentClient");
    return response.data;
  }catch(error){
    handleClientServiceError(error, "Unable to fetch client documents");
  }
}

export const deleteClientDocument = async (id) => {
  const response = await API.delete(`/documentClient/${id}`);
  return response.data;
};



export const createClient = async (payload) => {
  try {
    const response = await API.post("/clients", payload);
    return response.data;
  } catch (error) {
    handleClientServiceError(error, "Unable to create client");
  }
};

export const updateClient = async (id, payload) => {
  try {
    const response = await API.patch(`/clients/${id}`, payload);
    return response.data;
  } catch (error) {
    handleClientServiceError(error, "Unable to update client");
  }
};

export const deleteClient = async (id) => {
  try {
    const response = await API.delete(`/clients/${id}`);
    return response.data;
  } catch (error) {
    handleClientServiceError(error, "Unable to delete client");
  }
};
