import api from './axiosConfig';

export const getBlogs = (params) => api.get('/blogs', { params });
export const getBlog = (id) => api.get(`/blogs/${id}`);
export const createBlog = (data) => api.post('/blogs', data);
export const updateBlog = (id, data) => api.put(`/blogs/${id}`, data);
export const deleteBlog = (id) => api.delete(`/blogs/${id}`);
export const getUserBlogs = () => api.get('/blogs/mine');
