import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import chartService from "../../services/chartService";

// Thunk untuk Fetch Data
export const fetchCharts = createAsyncThunk("charts/getAll", async (_, thunkAPI) => {
  try {
    // Kita ambil limit besar agar semua kategori terload untuk halaman Trend
    return await chartService.getCharts({ limit: 100 });
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

const chartSlice = createSlice({
  name: "charts",
  initialState: {
    charts: [], // Menyimpan data chart
    isLoading: false,
    isError: false,
    message: "",
  },
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCharts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCharts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.charts = action.payload.data; // Simpan array chart
      })
      .addCase(fetchCharts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = chartSlice.actions;
export default chartSlice.reducer;
