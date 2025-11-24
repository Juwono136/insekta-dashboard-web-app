import api from "./api";

const userService = {
  // Terima params object
  getUsers: async (params) => {
    // params: { page, limit, search, role }
    const response = await api.get("/users", { params });
    return response.data;
  },
  getCompanies: async () => {
    const response = await api.get("/users/companies");
    return response.data;
  },
  createUser: async (userData) => {
    const response = await api.post("/users", userData);
    return response.data;
  },
  // Update User by Admin (Role/Status)
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

export default userService;
