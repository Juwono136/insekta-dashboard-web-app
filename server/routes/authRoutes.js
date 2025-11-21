import express from "express";
import {
  loginUser,
  registerUser,
  logoutUser,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser); // Kita pakai ini dulu untuk bikin akun Admin pertama
router.post("/logout", logoutUser);
router.post("/forgotpassword", forgotPassword); // User kirim email

router.put("/resetpassword/:resetToken", resetPassword); // User kirim password baru + token

export default router;
