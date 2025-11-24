import express from "express";
import multer from "multer";
import {
  getUsers,
  createUserByAdmin,
  deleteUser,
  updateUserProfile,
  updateUserByAdmin,
  getCompanies,
} from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Max 2MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Hanya file gambar yang diperbolehkan!"), false);
  },
});

// Route Global untuk /api/users
// protect = harus login
// admin = harus role admin

router.route("/").get(protect, admin, getUsers).post(protect, admin, createUserByAdmin);

router.route("/profile").put(protect, upload.single("avatar"), updateUserProfile);

router.get("/companies", protect, admin, getCompanies);

router.route("/:id").put(protect, admin, updateUserByAdmin).delete(protect, admin, deleteUser);

export default router;
