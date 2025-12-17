import axiosInstance from '../api/axiosConfig';

export const authService = {
  /**
   * Sign up a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} name - User name
   * @returns {Promise} Response with token and user data
   */
  signup: async (email, password, name) => {
    const response = await axiosInstance.post('/auth/signup', {
      email,
      password,
      name
    });
    return response.data;
  },

  /**
   * Login an existing user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} Response with token and user data
   */
  login: async (email, password) => {
    const response = await axiosInstance.post('/auth/login', {
      email,
      password
    });
    return response.data;
  },

  /**
   * Get current logged-in user details
   * @returns {Promise} Response with user data
   */
  getMe: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },

  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};