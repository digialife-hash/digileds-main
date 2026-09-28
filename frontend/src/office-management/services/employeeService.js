import API from "../api/axiosInstance";
import getApiErrorMessage from "../utils/getApiErrorMessage";

const handleEmployeeServiceError = (error, fallbackMessage) => {
  const message = getApiErrorMessage(error, fallbackMessage);
  const apiError = new Error(message);

  apiError.status = error?.response?.status;
  apiError.code = error?.response?.data?.error?.code;

  throw apiError;
};

export const getEmployees = async (params = {}) => {
  try {
    const response = await API.get("/employees", { params });
    return response.data;
  } catch (error) {
    handleEmployeeServiceError(error, "Unable to fetch employees");
  }
};

export const getEmployeeById = async (id) => {
  try {
    const response = await API.get(`/employees/${id}`);
    return response.data;
  } catch (error) {
    handleEmployeeServiceError(error, "Unable to fetch employee");
  }
};

export const createEmployee = async (payload) => {
  try {
    const response = await API.post("/employees", payload);
    return response.data;
  } catch (error) {
    handleEmployeeServiceError(error, "Unable to create employee");
  }
};

export const uploadEmployeeDocument = async (formData) => {
  try {
    const response = await API.post("/documentEmp/upload", formData,);
    // console.log("uploadEmployeeDocument response:", response.data);
    return response.data;
  } catch (error) {
    handleEmployeeServiceError(error, "Unable to upload employee document");
  }
}

export const getEmployeeDocuments = async () => {
  try {
    const response = await API.get("/documentEmp");
    return response.data;
  }catch(error){
    handleEmployeeServiceError(error, "Unable to fetch employee documents");
  }
}

export const deleteEmployeeDocument = async (id) => {
  const response = await API.delete(`/documentEmp/${id}`);
  return response.data;
};


export const updateEmployee = async (id, payload) => {
  try {
    const response = await API.patch(`/employees/${id}`, payload);
    return response.data;
  } catch (error) {
    handleEmployeeServiceError(error, "Unable to update employee");
  }
};

export const deleteEmployee = async (id) => {
  try {
    const response = await API.delete(`/employees/${id}`);
    return response.data;
  } catch (error) {
    handleEmployeeServiceError(error, "Unable to delete employee");
  }
};
