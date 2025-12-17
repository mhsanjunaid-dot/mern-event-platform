import axiosInstance from '../api/axiosConfig';

export const authService = {
  signup: async (email, password, name) => {
    const response = await axiosInstance.post('/auth/signup', {
      email,
      password,
      name
    });
    return response.data;
  },

  login: async (email, password) => {
    const response = await axiosInstance.post('/auth/login', {
      email,
      password
    });
    return response.data;
  },

  getMe: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  }
};