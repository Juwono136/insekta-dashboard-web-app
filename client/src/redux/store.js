import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    // Nanti kita tambah featureSlice atau chartSlice di sini
  },
  devTools: true,
});

export default store;
