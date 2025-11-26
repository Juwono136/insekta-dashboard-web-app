import Team from "../models/Team.js";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- HELPER FUNCTIONS ---

// 1. Hapus file fisik dengan aman
const safeDeleteFile = (relativePath) => {
  if (!relativePath) return;
  try {
    const fullPath = path.join(__dirname, "../public", relativePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (err) {
    console.error(`Gagal menghapus file ${relativePath}:`, err.message);
  }
};

// 2. Validasi Format Nomor HP Indonesia (08xx, 628xx, +628xx)
const isValidPhone = (phone) => {
  const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;
  return phoneRegex.test(phone);
};

// --- CONTROLLERS ---

// @desc    Get All Teams
export const getTeams = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { area: { $regex: search, $options: "i" } },
        { role: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Team.countDocuments(query);
    const teams = await Team.find(query)
      .sort({ area: 1, name: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      data: teams,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

// @desc    Get All Areas
export const getAreas = async (req, res) => {
  try {
    const areas = await Team.distinct("area");
    const cleanList = areas.filter((a) => a && a.trim() !== "").sort();
    res.json(cleanList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create Team Member
export const createTeam = async (req, res) => {
  let uploadedPhotoPath = ""; // Default kosong

  try {
    const { name, role, phone, area, outlets } = req.body;

    // 1. Validasi Input Wajib (HAPUS CHECK REQ.FILE)
    if (!name || !role || !phone || !area) {
      return res.status(400).json({ message: "Nama, Jabatan, No HP, dan Area wajib diisi." });
    }

    // 2. Validasi Nomor HP
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: "Format Nomor HP tidak valid." });
    }

    // 3. Proses Upload Foto (Hanya jika ada file)
    if (req.file) {
      const filename = `team-${Date.now()}-${Math.round(Math.random() * 1e9)}.jpeg`;
      const uploadDir = path.join(__dirname, "../public/uploads/teams");

      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      const fullPath = path.join(uploadDir, filename);

      await sharp(req.file.buffer)
        .resize(400, 400, { fit: "cover", position: "top" })
        .jpeg({ quality: 80, mozjpeg: true })
        .toFile(fullPath);

      uploadedPhotoPath = `/uploads/teams/${filename}`;
    }

    // 4. Simpan ke DB (Photo bisa string kosong)
    const team = await Team.create({
      name,
      role,
      phone,
      area,
      outlets,
      photo: uploadedPhotoPath, // Bisa string kosong
      createdBy: req.user._id,
    });

    res.status(201).json(team);
  } catch (error) {
    if (uploadedPhotoPath) safeDeleteFile(uploadedPhotoPath);
    console.error("Error createTeam:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Team Member
export const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, phone, area, outlets } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "ID Anggota tidak valid." });
    }

    const team = await Team.findById(id);
    if (!team) return res.status(404).json({ message: "Data tidak ditemukan." });

    // Validasi Phone jika diubah
    if (phone && !isValidPhone(phone)) {
      return res.status(400).json({ message: "Format Nomor HP tidak valid." });
    }

    // Update Fields
    team.name = name || team.name;
    team.role = role || team.role;
    team.phone = phone || team.phone;
    team.area = area || team.area;
    team.outlets = outlets || team.outlets;

    // Update Foto (Opsional saat Edit)
    if (req.file) {
      // Hapus foto lama
      if (team.photo) safeDeleteFile(team.photo);

      // Simpan foto baru
      const filename = `team-${Date.now()}.jpeg`;
      const uploadDir = path.join(__dirname, "../public/uploads/teams");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      const fullPath = path.join(uploadDir, filename);
      await sharp(req.file.buffer)
        .resize(400, 400, { fit: "cover", position: "top" })
        .jpeg({ quality: 80, mozjpeg: true })
        .toFile(fullPath);

      team.photo = `/uploads/teams/${filename}`;
    }

    const updatedTeam = await team.save();
    res.json(updatedTeam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete Team Member
export const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: "Data tidak ditemukan." });

    if (team.photo) safeDeleteFile(team.photo);

    await Team.deleteOne({ _id: req.params.id });
    res.json({ message: "Berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
