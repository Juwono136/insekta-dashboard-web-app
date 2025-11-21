import jwt from "jsonwebtoken";

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "30d", // Token berlaku 30 hari
  });

  // Simpan token di HTTP-Only Cookie (Lebih aman dari XSS Attack)
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development", // Gunakan https di production
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 hari dalam milidetik
  });
};

export default generateToken;
