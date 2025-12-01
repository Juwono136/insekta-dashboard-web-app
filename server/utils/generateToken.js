import jwt from "jsonwebtoken";

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1d", // Token berlaku 1 hari
  });

  // Simpan token di HTTP-Only Cookie (Lebih aman dari XSS Attack)
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development", // Gunakan https di production
    sameSite: "strict",
    maxAge: 1 * 24 * 60 * 60 * 1000, // 1 hari dalam milidetik
  });
};

export default generateToken;
