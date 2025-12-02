import User from "../models/User.js";
import crypto from "crypto"; // Bawaan Node.js untuk random string
import { welcomeUserTemplate } from "../utils/emailTemplates.js";
import sendEmail from "../utils/sendEmail.js";
import { saveImage, deleteImage } from "../utils/imageProcessor.js";

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const role = req.query.role || ""; // Filter by Role

    const query = {
      $or: [
        { name: { $regex: search, $options: "i" } }, // Case insensitive
        { email: { $regex: search, $options: "i" } },
      ],
    };

    if (role) {
      query.role = role;
    }

    const totalUsers = await User.countDocuments(query);

    const users = await User.find(query)
      .select("-password") // Jangan kirim password
      .sort({ createdAt: -1 }) // Urutkan terbaru
      .skip((page - 1) * limit)
      .limit(limit);

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

// Ambil daftar nama perusahaan unik
// @route GET /api/users/companies
export const getCompanies = async (req, res) => {
  try {
    // Ambil semua value 'companyName' yang unik, khusus role client, dan tidak kosong
    const companies = await User.find({ role: "client" }).distinct("companyName");
    // Filter agar tidak ada yang null/string kosong
    const cleanList = companies.filter((c) => c && c.trim() !== "").sort();
    res.json(cleanList);
  } catch (error) {
    res.status(500).json({ message: error.message });
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

    // Jika role client, companyName WAJIB
    if (role === "client" && !companyName) {
      res.status(400);
      throw new Error("Nama Perusahaan wajib diisi untuk Client");
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error("User sudah terdaftar");
    }

    const tempPassword = crypto.randomBytes(4).toString("hex"); // cth: a1b2c3d4

    const user = await User.create({
      name,
      email,
      password: tempPassword,
      role: role || "client",
      companyName: companyName || "",
      avatar: "https://res.cloudinary.com/dz8dtz5ki/image/upload/v1764597116/user_bsdswt.png",
      isFirstLogin: true,
    });

    if (user) {
      const loginUrl = `${process.env.CLIENT_URL}/login`;
      const emailContent = welcomeUserTemplate(user.name, user.email, tempPassword, loginUrl);

      try {
        await sendEmail({
          email: user.email,
          subject: "Selamat Datang di Insekta - Detail Akun Anda",
          message: emailContent,
        });

        console.log(`📧 Email terkirim ke ${user.email}`);
      } catch (emailError) {
        console.error("Gagal kirim email:", emailError);
      }

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
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

      if (req.file) {
        // Hapus avatar lama jika bukan default/link luar
        if (user.avatar && user.avatar.startsWith("/uploads")) {
          deleteImage(user.avatar);
        }

        user.avatar = await saveImage(req.file.buffer, "users", 400, {
          format: "jpeg",
          fit: "cover",
        });
      }

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

      if (user.avatar) deleteImage(user.avatar);
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
