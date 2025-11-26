import api from "./api";

const chartService = {
  // Ambil list chart (Pagination)
  getCharts: async (params) => {
    const response = await api.get("/charts", { params });
    return response.data;
  },
  updateChart: async (id, data) => {
    const response = await api.put(`/charts/${id}`, data);
    return response.data;
  },
  // Preview Data dari GSheet
  previewData: async (url) => {
    const response = await api.post("/charts/preview", { url });
    return response.data;
  },
  createChart: async (data) => {
    const response = await api.post("/charts", data);
    return response.data;
  },
  deleteChart: async (id) => {
    const response = await api.delete(`/charts/${id}`);
    return response.data;
  },
};

export default chartService;
