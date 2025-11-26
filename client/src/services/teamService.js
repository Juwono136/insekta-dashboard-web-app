import api from "./api";

const teamService = {
  getTeams: async (params) => {
    const response = await api.get("/teams", { params });
    return response.data;
  },
  getAreas: async () => {
    const response = await api.get("/teams/areas");
    return response.data;
  },
  createTeam: async (formData) => {
    const response = await api.post("/teams", formData);
    return response.data;
  },
  updateTeam: async (id, formData) => {
    const response = await api.put(`/teams/${id}`, formData);
    return response.data;
  },
  deleteTeam: async (id) => {
    const response = await api.delete(`/teams/${id}`);
    return response.data;
  },
};

export default teamService;
