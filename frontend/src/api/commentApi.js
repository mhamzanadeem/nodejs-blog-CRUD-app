import api from './axiosConfig';

export const getComments = (blogId) => api.get(`/blogs/${blogId}/comments`);
export const addComment = (blogId, data) => api.post(`/blogs/${blogId}/comments`, data);
export const deleteComment = (id) => api.delete(`/comments/${id}`);
export const replyToComment = (blogId, commentId, data) => api.post(`/blogs/${blogId}/comments/${commentId}/reply`, data);
