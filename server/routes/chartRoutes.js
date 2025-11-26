import express from "express";
import {
  createChart,
  getCharts,
  deleteChart,
  updateChart,
} from "../controllers/chartController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getCharts).post(protect, admin, createChart);

router.route("/:id").put(protect, admin, updateChart).delete(protect, admin, deleteChart);

export default router;
