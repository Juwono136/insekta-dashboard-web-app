import express from "express";
import multer from "multer";
import {
  parseExcel,
  saveChart,
  getAllCharts,
  deleteChart,
} from "../controllers/uploadController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Setup Multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 1. Route Parse Excel (Preview)
router.post("/excel-preview", protect, admin, upload.single("file"), parseExcel);

// 2. Route Manajemen Chart
router
  .route("/charts")
  .post(protect, admin, saveChart) // Simpan hasil excel ke DB
  .get(protect, admin, getAllCharts); // Ambil semua chart

router.route("/charts/:id").delete(protect, admin, deleteChart); // Hapus chart

export default router;
