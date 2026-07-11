import api from './axiosConfig';

export const signup = (data) => api.post('/users/signup', data);
export const signin = (data) => api.post('/users/signin', data);
export const signout = () => api.post('/users/signout');
export const getProfile = () => api.get('/users/profile');
export const updateProfile = (data) => api.put('/users/profile', data);
export const uploadAvatar = (formData) => api.post('/users/avatar', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteAccount = () => api.delete('/users/account');
export const changePassword = (data) => api.put('/users/password', data);
