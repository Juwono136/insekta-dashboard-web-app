import api from "./api";

const channelService = {
  getChannels: async (params) => {
    const response = await api.get("/channels", { params });
    return response.data;
  },
  createChannel: async (data) => {
    const response = await api.post("/channels", data);
    return response.data;
  },
  updateChannel: async (id, data) => {
    const response = await api.put(`/channels/${id}`, data);
    return response.data;
  },
  deleteChannel: async (id) => {
    const response = await api.delete(`/channels/${id}`);
    return response.data;
  },
};

export default channelService;
