import User from "../models/User.js";
import crypto from "crypto"; // Bawaan Node.js untuk random string
import { welcomeUserTemplate } from "../utils/emailTemplates.js";
import sendEmail from "../utils/sendEmail.js";
import sharp from "sharp";
import path from "path"; // <--- INI WAJIB ADA
import fs from "fs"; // <--- INI WAJIB ADA
import { fileURLToPath } from "url"; // <--- INI WAJIB ADA

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    // 1. Ambil Query Parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const role = req.query.role || ""; // Filter by Role

    // 2. Build Query
    const query = {
      $or: [
        { name: { $regex: search, $options: "i" } }, // Case insensitive
        { email: { $regex: search, $options: "i" } },
      ],
    };

    if (role) {
      query.role = role;
    }

    // 3. Hitung Total Data (untuk Pagination)
    const totalUsers = await User.countDocuments(query);

    // 4. Ambil Data
    const users = await User.find(query)
      .select("-password") // Jangan kirim password
      .sort({ createdAt: -1 }) // Urutkan terbaru
      .skip((page - 1) * limit)
      .limit(limit);

    // 5. Response Lengkap
    res.status(200).json({
      users,
      pagination: {
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    res.status(500);
    throw new Error("Gagal mengambil data user");
  }
};

// @desc    Create new user by Admin
// @route   POST /api/users
export const createUserByAdmin = async (req, res) => {
  try {
    const { name, email, role, companyName } = req.body;

    if (!name || !email) {
      res.status(400);
      throw new Error("Nama dan Email wajib diisi");
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error("User sudah terdaftar");
    }

    // 1. Generate Random Password
    const tempPassword = crypto.randomBytes(4).toString("hex"); // cth: a1b2c3d4

    // 2. Create User dengan status First Login = TRUE
    const user = await User.create({
      name,
      email,
      password: tempPassword,
      role: role || "client",
      companyName: companyName || "",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s/g, "")}`,
      isFirstLogin: true, // <-- Tandai ini login pertama
    });

    if (user) {
      // 3. Siapkan Email
      const loginUrl = `${process.env.CLIENT_URL}/login`;
      const emailContent = welcomeUserTemplate(user.name, user.email, tempPassword, loginUrl);

      // 4. Kirim Email
      try {
        await sendEmail({
          email: user.email,
          subject: "Selamat Datang di Insekta - Detail Akun Anda",
          message: emailContent,
        });

        console.log(`📧 Email terkirim ke ${user.email}`);
      } catch (emailError) {
        console.error("Gagal kirim email:", emailError);
        // Jangan throw error, user tetap berhasil dibuat, tapi admin harus tahu
      }

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isFirstLogin: user.isFirstLogin,
        message: "User dibuat & email notifikasi dikirim.",
      });
    } else {
      res.status(400);
      throw new Error("Data user invalid");
    }
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
  }
};

// @desc    Update User Profile (Termasuk Ganti Pass & Upload Avatar)
// @route   PUT /api/users/profile
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // 1. Update Nama & Email
      user.name = req.body.name || user.name;
      // Validasi email unik jika diganti
      if (req.body.email && req.body.email !== user.email) {
        const emailExists = await User.findOne({ email: req.body.email });
        if (emailExists) {
          res.status(400);
          throw new Error("Email sudah digunakan user lain");
        }
        user.email = req.body.email;
      }

      // 2. Update Avatar (Jika ada file upload)
      if (req.file) {
        // Hapus avatar lama jika bukan default/link luar
        if (user.avatar && user.avatar.startsWith("/uploads")) {
          const oldPath = path.join(__dirname, "../public", user.avatar);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }

        // Simpan yang baru
        const filename = `user-${user._id}-${Date.now()}.jpeg`;
        const outputPath = path.join(__dirname, "../public/uploads/icons", filename);

        // Pastikan folder ada (sama seperti feature)
        if (!fs.existsSync(path.join(__dirname, "../public/uploads/icons"))) {
          fs.mkdirSync(path.join(__dirname, "../public/uploads/icons"), { recursive: true });
        }

        await sharp(req.file.buffer)
          .resize(200, 200) // Resize kotak
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(outputPath);

        user.avatar = `/uploads/icons/${filename}`;
      }

      // 3. Ganti Password (Dengan Validasi Old Password)
      if (req.body.password) {
        // Jika ini BUKAN first login (user biasa ganti pass), WAJIB cek password lama
        if (!user.isFirstLogin) {
          if (!req.body.oldPassword) {
            res.status(400);
            throw new Error("Masukkan password lama untuk keamanan.");
          }
          // Cek match
          const isMatch = await user.matchPassword(req.body.oldPassword);
          if (!isMatch) {
            res.status(401);
            throw new Error("Password lama salah!");
          }
        }

        // Jika lolos (atau user first login), set password baru
        user.password = req.body.password;
        user.isFirstLogin = false;
      }

      const updatedUser = await user.save();

      res.status(200).json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        companyName: updatedUser.companyName,
        isFirstLogin: updatedUser.isFirstLogin,
      });
    } else {
      res.status(404);
      throw new Error("User tidak ditemukan");
    }
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
  }
};

// @desc    Update User Data By Admin (Ganti Role/Status)
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUserByAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.role = req.body.role || user.role;
      user.companyName = req.body.companyName || user.companyName;

      // Admin juga bisa mengaktifkan/nonaktifkan user
      if (req.body.isActive !== undefined) {
        user.isActive = req.body.isActive;
      }

      const updatedUser = await user.save();
      res.status(200).json({ message: "User updated", user: updatedUser });
    } else {
      res.status(404);
      throw new Error("User tidak ditemukan");
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      if (user.role === "admin") {
        res.status(400);
        throw new Error("Admin utama tidak bisa dihapus sembarangan");
      }
      await User.deleteOne({ _id: user._id });
      res.status(200).json({ message: "User berhasil dihapus" });
    } else {
      res.status(404);
      throw new Error("User tidak ditemukan");
    }
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
  }
};
