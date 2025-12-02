import api from "./api";

// Service ini membungkus semua endpoint Auth
const authService = {
  login: async (credentials) => {
    // credentials = { email, password }
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post("/auth/forgotpassword", { email });
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await api.put(`/auth/resetpassword/${token}`, { password });
    return response.data;
  },
};

export default authService;
