import express from "express";
import {
  createFeature,
  getAllFeatures,
  getMyFeatures,
  updateFeature,
  deleteFeature,
} from "../controllers/featureController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Routes
router.get("/my-features", protect, getMyFeatures);

router
  .route("/")
  // Tambahkan middleware 'upload.single' sebelum controller
  .post(protect, admin, upload.single("icon"), createFeature);

router.route("/admin").get(protect, admin, getAllFeatures);

router
  .route("/:id")
  .put(protect, admin, upload.single("icon"), updateFeature)
  .delete(protect, admin, deleteFeature);

export default router;
