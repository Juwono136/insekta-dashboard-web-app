import express from "express";
import {
  createChart,
  getCharts,
  deleteChart,
  previewSheetData,
} from "../controllers/chartController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, admin, getCharts).post(protect, admin, createChart);

router.post("/preview", protect, admin, previewSheetData);

router.route("/:id").delete(protect, admin, deleteChart);

export default router;
