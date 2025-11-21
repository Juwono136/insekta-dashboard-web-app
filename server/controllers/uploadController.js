import xlsx from "xlsx";
import Chart from "../models/Chart.js"; // <-- Import Model Baru
import mongoose from "mongoose";

// @desc    1. Upload Excel & Convert to JSON (Preview Only)
// @route   POST /api/upload/excel-preview
// @access  Private/Admin
export const parseExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Silakan upload file excel" });
    }

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet);

    res.status(200).json({
      success: true,
      data: jsonData,
      message: "File berhasil dibaca. Silakan konfirmasi untuk disimpan.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal memproses file excel" });
  }
};

// @desc    2. Save Chart Data (Setelah Preview OK)
// @route   POST /api/upload/save-chart
// @access  Private/Admin
export const saveChart = async (req, res) => {
  try {
    const { title, type, data } = req.body;

    if (!title || !data) {
      return res.status(400).json({ message: "Judul dan Data wajib ada" });
    }

    const newChart = await Chart.create({
      title,
      type: type || "bar",
      data, // JSON dari hasil parseExcel sebelumnya
      createdBy: req.user._id,
    });

    res.status(201).json(newChart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    3. Get All Charts (Untuk Dashboard Admin)
// @route   GET /api/upload/charts
// @access  Private/Admin
export const getAllCharts = async (req, res) => {
  try {
    const charts = await Chart.find().sort({ createdAt: -1 });
    res.status(200).json(charts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    4. Delete Chart (Permintaan Kamu)
// @route   DELETE /api/upload/charts/:id
// @access  Private/Admin
export const deleteChart = async (req, res) => {
  try {
    const { id } = req.params;

    // Validasi ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "ID Chart tidak valid" });
    }

    const chart = await Chart.findById(id);

    if (!chart) {
      return res.status(404).json({ message: "Chart tidak ditemukan" });
    }

    await Chart.deleteOne({ _id: id });
    res.status(200).json({ message: "Chart berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
