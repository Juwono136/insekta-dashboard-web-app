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

router.post("/excel-preview", protect, admin, upload.single("file"), parseExcel);

router.route("/charts").post(protect, admin, saveChart).get(protect, admin, getAllCharts);

router.route("/charts/:id").delete(protect, admin, deleteChart);

export default router;
