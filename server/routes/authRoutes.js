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
router.post("/register", registerUser);
router.post("/logout", logoutUser);
router.post("/forgotpassword", forgotPassword);

router.put("/resetpassword/:resetToken", resetPassword);

export default router;
