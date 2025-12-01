import axios from "axios";
import store from "../redux/store.js";
import { logout } from "../redux/slices/authSlice";

const BASE_URL = "/api";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        if (window.location.pathname !== "/login") {
          store.dispatch(logout());
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
