import API from "../api/axiosInstance";

export const getFAQsApi = async (params = {}) => {
  const response = await API.get("/support/faqs", { params });
  return response.data;
};

export const createFAQApi = async (faqData) => {
  const response = await API.post("/support/faqs", faqData);
  return response.data;
};

export const getSupportTicketsApi = async (params = {}) => {
  const response = await API.get("/support/tickets", { params });
  return response.data;
};

export const getTicketByIdApi = async (id) => {
  const response = await API.get(`/support/tickets/${id}`);
  return response.data;
};

export const createTicketApi = async (formData) => {
  const response = await API.post("/support/tickets", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const replyTicketApi = async (id, formData) => {
  const response = await API.post(`/support/tickets/${id}/reply`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const closeTicketApi = async (id) => {
  const response = await API.put(`/support/tickets/${id}/close`);
  return response.data;
};

export const submitFeedbackApi = async (feedbackData) => {
  const response = await API.post("/support/feedback", feedbackData);
  return response.data;
};

export const getFeedbacksApi = async () => {
  const response = await API.get("/support/feedbacks");
  return response.data;
};
