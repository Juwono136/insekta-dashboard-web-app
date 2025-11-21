import axios from "axios";

// Buat instance axios
const api = axios.create({
  baseURL: "/api", // Alamat Backend
  withCredentials: true, // Wajib true agar cookie token dikirim/diterima
});

export default api;
