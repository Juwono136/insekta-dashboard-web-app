import Chart from "../models/Chart.js";
import axios from "axios";
import Papa from "papaparse";

// Helper: Convert Google Sheet URL to CSV Export URL (Support GID/Sheet ID)
const convertToCsvUrl = (url) => {
  try {
    const idMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    const docId = idMatch ? idMatch[1] : null;

    // Coba cari GID (Sheet ID) di URL
    let gid = "0";
    const gidMatch = url.match(/[#&?]gid=([0-9]+)/);
    if (gidMatch) {
      gid = gidMatch[1];
    }

    if (docId) {
      return `https://docs.google.com/spreadsheets/d/${docId}/export?format=csv&gid=${gid}`;
    }
    return url;
  } catch (e) {
    return url;
  }
};

// @desc    Get Live Data from Google Sheet (Proxy)
export const previewSheetData = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ message: "URL wajib diisi" });

    const csvUrl = convertToCsvUrl(url);
    // console.log("Fetching CSV from:", csvUrl);

    const response = await axios.get(csvUrl);

    const parsed = Papa.parse(response.data, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });

    if (parsed.data.length === 0) {
      return res.status(400).json({ message: "Sheet kosong" });
    }

    res.json({
      data: parsed.data,
      headers: parsed.meta.fields || Object.keys(parsed.data[0]),
    });
  } catch (error) {
    console.error("Gsheet Error:", error.message);
    res.status(500).json({
      message:
        'Gagal mengambil data. Pastikan Link Google Sheet bersifat "Public" (Anyone with the link).',
    });
  }
};

// @desc    Create New Chart Config
// @route   POST /api/charts
export const createChart = async (req, res) => {
  try {
    // --- PERBAIKAN DI SINI ---
    // Tambahkan 'config' ke dalam destructuring req.body
    const { title, type, sheetUrl, description, config } = req.body;

    const newChart = await Chart.create({
      title,
      type,
      sheetUrl,
      description,
      config, // <-- Masukkan config ke database
      createdBy: req.user._id,
    });
    res.status(201).json(newChart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get All Charts (Pagination & Search)
// @route   GET /api/charts
export const getCharts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const search = req.query.search || "";

    const query = { title: { $regex: search, $options: "i" } };
    const totalData = await Chart.countDocuments(query);

    const charts = await Chart.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      data: charts,
      pagination: { totalData, totalPages: Math.ceil(totalData / limit), currentPage: page, limit },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete Chart
// @route   DELETE /api/charts/:id
export const deleteChart = async (req, res) => {
  try {
    await Chart.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "Chart dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
