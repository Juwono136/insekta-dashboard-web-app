import Team from "../models/Team.js";
import { saveImage, deleteImage } from "../utils/imageProcessor.js";
import mongoose from "mongoose";

// Validasi Format Nomor HP Indonesia (08xx, 628xx, +628xx)
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

    // [LOGIC BARU] Filter berdasarkan Role
    // Jika ADMIN: Bisa lihat semua (bisa filter by search)
    // Jika CLIENT: Hanya lihat tim yang assignedClients-nya mengandung ID saya
    if (req.user.role !== "admin") {
      query.assignedClients = req.user._id;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { area: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Team.countDocuments(query);
    const teams = await Team.find(query)
      .populate("assignedClients", "name companyName") // Populate info client untuk Admin
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
  let uploadedPhotoPath = "";

  try {
    const { name, role, phone, area, outlets, assignedClients } = req.body;

    // 1. Validasi Input Wajib (HAPUS CHECK REQ.FILE)
    if (!name || !role || !phone || !area) {
      return res.status(400).json({ message: "Nama, Jabatan, No HP, dan Area wajib diisi." });
    }

    // 2. Validasi Nomor HP
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: "Format Nomor HP tidak valid." });
    }

    let clientsArray = [];
    if (assignedClients) {
      try {
        clientsArray = JSON.parse(assignedClients);
      } catch (e) {
        return res.status(400).json({ message: "Format data client tidak valid." });
      }
    }

    // 3. Proses Upload Foto (Hanya jika ada file)
    if (req.file) {
      uploadedPhotoPath = await saveImage(req.file.buffer, "teams", 400, {
        format: "jpeg",
        fit: "cover",
      });
    }

    // 4. Simpan ke DB (Photo bisa string kosong)
    const team = await Team.create({
      name,
      role,
      phone,
      area,
      outlets,
      photo: uploadedPhotoPath,
      assignedClients: clientsArray,
      createdBy: req.user._id,
    });

    res.status(201).json(team);
  } catch (error) {
    if (uploadedPhotoPath) deleteImage(uploadedPhotoPath);
    console.error("Error createTeam:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Team Member
export const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, phone, area, outlets, assignedClients } = req.body;

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

    // Update Clients
    if (assignedClients) {
      try {
        team.assignedClients = JSON.parse(assignedClients);
      } catch (e) {
        console.error("Parse Error", e);
      }
    }

    // Update Foto (Opsional saat Edit)
    if (req.file) {
      // Hapus foto lama
      if (team.photo) deleteImage(team.photo);

      team.photo = await saveImage(req.file.buffer, "teams", 400, { format: "jpeg", fit: "cover" });
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

    if (team.photo) deleteImage(team.photo);

    await Team.deleteOne({ _id: req.params.id });
    res.json({ message: "Berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
