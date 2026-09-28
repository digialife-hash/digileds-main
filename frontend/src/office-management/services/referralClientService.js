import API from "../api/axiosInstance";

export const createReferralApi = async (formData) => {
  const response = await API.post("/referrals", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getReferralsApi = async (params = {}) => {
  const response = await API.get("/referrals", { params });
  return response.data;
};

export const getReferralByIdApi = async (id) => {
  const response = await API.get(`/referrals/${id}`);
  return response.data;
};

export const updateReferralApi = async (id, data) => {
  const response = await API.put(`/referrals/${id}`, data);
  return response.data;
};

export const deleteReferralApi = async (id) => {
  const response = await API.delete(`/referrals/${id}`);
  return response.data;
};

export const updateReferralStatusApi = async (id, statusData) => {
  const response = await API.put(`/referrals/${id}/status`, statusData);
  return response.data;
};

export const assignEmployeeApi = async (id, assignData) => {
  const response = await API.put(`/referrals/${id}/assign`, assignData);
  return response.data;
};

export const uploadAttachmentsApi = async (id, formData) => {
  const response = await API.post(`/referrals/${id}/attachments`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteAttachmentApi = async (id, attachmentId) => {
  const response = await API.delete(`/referrals/${id}/attachments/${attachmentId}`);
  return response.data;
};

export const addCommentApi = async (id, commentData) => {
  const response = await API.post(`/referrals/${id}/comments`, commentData);
  return response.data;
};

export const updateCommentApi = async (id, commentId, commentData) => {
  const response = await API.put(`/referrals/${id}/comments/${commentId}`, commentData);
  return response.data;
};

export const deleteCommentApi = async (id, commentId) => {
  const response = await API.delete(`/referrals/${id}/comments/${commentId}`);
  return response.data;
};

export const addInternalNoteApi = async (id, noteData) => {
  const response = await API.post(`/referrals/${id}/internal-notes`, noteData);
  return response.data;
};

export const updateInternalNoteApi = async (id, noteId, noteData) => {
  const response = await API.put(`/referrals/${id}/internal-notes/${noteId}`, noteData);
  return response.data;
};

export const deleteInternalNoteApi = async (id, noteId) => {
  const response = await API.delete(`/referrals/${id}/internal-notes/${noteId}`);
  return response.data;
};

export const getReferralTimelineApi = async (id) => {
  const response = await API.get(`/referrals/${id}/timeline`);
  return response.data;
};

export const getReferralAnalyticsApi = async () => {
  const response = await API.get("/referrals/dashboard/analytics");
  return response.data;
};

export const exportReferralsApi = async (params = {}) => {
  const response = await API.get("/referrals/export", {
    params,
    responseType: params.format === "json" ? "json" : "blob",
  });
  return response;
};
