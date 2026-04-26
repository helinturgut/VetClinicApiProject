import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const authService = {
  login: async (email, password) => {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, { email, password });
    return response.data;
  },

  register: async ({ fullName, email, password }) => {
    const response = await axios.post(`${BASE_URL}/api/auth/register`, { fullName, email, password });
    return response.data;
  },

  refresh: async (token, refreshToken) => {
    const response = await axios.post(`${BASE_URL}/api/auth/refresh`, { token, refreshToken });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await axios.post(`${BASE_URL}/api/auth/forgot-password`, { email });
    return response.data;
  },

  resetPassword: async (email, token, newPassword) => {
    const response = await axios.post(`${BASE_URL}/api/auth/reset-password`, { email, token, newPassword });
    return response.data;
  },
};

export default authService;
