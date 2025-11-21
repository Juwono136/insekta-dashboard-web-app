import crypto from "crypto";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";
import { resetPasswordTemplate } from "../utils/emailTemplates.js";

// Helper: Validasi format email sederhana
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

// @desc    Login user / set token
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validasi: Pastikan input tidak kosong
    if (!email || !password) {
      return res.status(400).json({ message: "Email dan password wajib diisi" });
    }

    // 2. Validasi: Format email
    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Format email tidak valid" });
    }

    // 3. Cari user berdasarkan email (termasuk cek password hash nanti)
    const user = await User.findOne({ email });

    // 4. Cek apakah user ditemukan
    if (!user) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    // 5. Cek Password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    // 6. Cek Status Akun (PENTING: Security agar user yang dibanned tidak bisa login)
    if (user.isActive === false) {
      return res.status(403).json({
        message: "Akun Anda telah dinonaktifkan. Hubungi Admin.",
      });
    }

    // 7. Generate Token & Kirim Response
    generateToken(res, user._id);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      companyName: user.companyName || "",
      isFirstLogin: user.isFirstLogin,
    });
  } catch (error) {
    console.error(`Error di loginUser: ${error.message}`);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

// @desc    Register User (Untuk Admin Awal / Testing)
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Validasi Input Kosong
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Mohon lengkapi semua data" });
    }

    // 2. Validasi Format Email
    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Format email tidak valid" });
    }

    // 3. Validasi Kekuatan Password
    if (password.length < 6) {
      return res.status(400).json({ message: "Password minimal 6 karakter" });
    }

    // 4. Cek Duplikasi User
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ message: "User dengan email ini sudah ada" });
    }

    // 5. Generate Avatar Random (Dicebear)
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s/g, "")}`;

    // 6. Create User
    const user = await User.create({
      name,
      email,
      password, // Akan di-hash otomatis oleh middleware di Model
      role: role || "client",
      avatar,
    });

    // 7. Response Sukses
    if (user) {
      generateToken(res, user._id);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      });
    } else {
      res.status(400).json({ message: "Data user tidak valid" });
    }
  } catch (error) {
    console.error(`Error di registerUser: ${error.message}`);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

// @desc    Forgot Password (Kirim email reset)
// @route   POST /api/auth/forgotpassword
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Email tidak terdaftar" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Gunakan Template Modular
    const message = resetPasswordTemplate(resetUrl);

    console.log("Reset URL (Copy ini untuk test):", resetUrl);

    try {
      await sendEmail({
        email: user.email,
        subject: "Reset Password Token - Insekta",
        message, // HTML Template
      });

      res.status(200).json({ success: true, data: "Email reset password telah dikirim" });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({ message: "Email tidak bisa dikirim" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password (Set password baru)
// @route   PUT /api/auth/resetpassword/:resetToken
export const resetPassword = async (req, res) => {
  try {
    // 1. Ambil token dari URL & Hash untuk dicocokkan dengan DB
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resetToken)
      .digest("hex");

    // 2. Cari user dengan token valid & waktu belum expired
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }, // $gt = Greater Than (Waktu sekarang)
    });

    if (!user) {
      return res.status(400).json({ message: "Token tidak valid atau sudah kedaluwarsa" });
    }

    // 3. Set password baru
    user.password = req.body.password; // Akan di-hash otomatis oleh Model pre('save')

    // 4. Bersihkan field token
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password berhasil diperbarui. Silakan login." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
export const logoutUser = (req, res) => {
  try {
    // Hapus cookie JWT
    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    res.status(200).json({ message: "Logout berhasil" });
  } catch (error) {
    res.status(500).json({ message: "Gagal melakukan logout" });
  }
};
