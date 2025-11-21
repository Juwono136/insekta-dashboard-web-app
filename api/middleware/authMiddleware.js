import jwt from "jsonwebtoken";
import User from "../models/User.js";

// 1. Middleware untuk memproteksi route (Harus Login)
const protect = async (req, res, next) => {
  let token;

  // Token dikirim via Cookie 'jwt'
  token = req.cookies.jwt;

  if (token) {
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Ambil data user dari ID di token, tapi jangan bawa passwordnya
      req.user = await User.findById(decoded.userId).select("-password");

      next(); // Lanjut ke controller berikutnya
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  } else {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
};

// 2. Middleware khusus Admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403); // 403 Forbidden
    throw new Error("Not authorized as an admin");
  }
};

export { protect, admin };
