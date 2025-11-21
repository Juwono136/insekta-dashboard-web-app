import api from "./api";

const featureService = {
  // Client (Tetap sama)
  getMyFeatures: async () => {
    const response = await api.get("/features/my-features");
    return response.data;
  },

  // Admin: Get All with Params
  getAllFeatures: async (params) => {
    // params: { page, limit, search }
    const response = await api.get("/features/admin", { params });
    return response.data;
  },

  createFeature: async (formData) => {
    const response = await api.post("/features", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  updateFeature: async (id, formData) => {
    const response = await api.put(`/features/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  deleteFeature: async (id) => {
    const response = await api.delete(`/features/${id}`);
    return response.data;
  },
};

export default featureService;
