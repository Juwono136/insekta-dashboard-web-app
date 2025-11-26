import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import chartReducer from "./slices/chartSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    charts: chartReducer,
    // Nanti kita tambah featureSlice atau chartSlice di sini
  },
  devTools: true,
});

export default store;
