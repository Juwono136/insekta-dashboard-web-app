import express from "express";
import {
  getUsers,
  createUserByAdmin,
  deleteUser,
  updateUserProfile,
  updateUserByAdmin,
  getCompanies,
} from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.route("/").get(protect, admin, getUsers).post(protect, admin, createUserByAdmin);

router.route("/profile").put(protect, upload.single("avatar"), updateUserProfile);

router.get("/companies", protect, admin, getCompanies);

router.route("/:id").put(protect, admin, updateUserByAdmin).delete(protect, admin, deleteUser);

export default router;
