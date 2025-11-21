import api from "./api";

// Service ini membungkus semua endpoint Auth
const authService = {
  // 1. Login
  login: async (credentials) => {
    // credentials = { email, password }
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  // 2. Forgot Password
  forgotPassword: async (email) => {
    const response = await api.post("/auth/forgotpassword", { email });
    return response.data;
  },

  // 3. Logout
  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  // 4. Reset Password (Untuk nanti)
  resetPassword: async (token, password) => {
    const response = await api.put(`/auth/resetpassword/${token}`, { password });
    return response.data;
  },
};

export default authService;
