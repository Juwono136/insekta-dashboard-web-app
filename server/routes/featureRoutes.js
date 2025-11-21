import express from "express";
import multer from "multer"; // Import Multer
import {
  createFeature,
  getAllFeatures,
  getMyFeatures,
  updateFeature,
  deleteFeature,
} from "../controllers/featureController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// KONFIGURASI MULTER (Simpan di Memory dulu agar bisa di-resize oleh Sharp)
const storage = multer.memoryStorage();

// Filter File (Hanya Gambar)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Bukan file gambar! Silakan upload JPG, PNG, atau WEBP."), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // Max 2MB
});

// Routes
router.get("/my-features", protect, getMyFeatures);

router
  .route("/")
  // Tambahkan middleware 'upload.single' sebelum controller
  .post(protect, admin, upload.single("icon"), createFeature);

router.route("/admin").get(protect, admin, getAllFeatures);

router
  .route("/:id")
  // Update juga butuh upload jika ingin ganti icon
  .put(protect, admin, upload.single("icon"), updateFeature)
  .delete(protect, admin, deleteFeature);

export default router;
