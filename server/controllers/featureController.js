import Feature from "../models/Feature.js";
import mongoose from "mongoose";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Setup path untuk save file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Create New Feature (Wajib: Title, URL, Icon)
// @route   POST /api/features
export const createFeature = async (req, res) => {
  try {
    const { title, url, assignedTo, parentId } = req.body;

    // 1. Validasi Input Teks
    if (!title || !url) {
      return res.status(400).json({ message: "Judul dan URL Google Drive wajib diisi" });
    }

    // 2. Validasi File Icon (Wajib Ada)
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Icon wajib diupload dalam format file gambar (PNG, JPG, atau WEBP)" });
    }

    // 3. Proses Validasi ID User (assignedTo) - parsing dari JSON string jika perlu
    let assignedUsers = [];
    if (assignedTo) {
      // Jika dikirim via Form-Data, array kadang terbaca sebagai string, jadi perlu diparse
      assignedUsers = Array.isArray(assignedTo) ? assignedTo : JSON.parse(assignedTo);

      const isValidIds = assignedUsers.every((id) => mongoose.Types.ObjectId.isValid(id));
      if (!isValidIds) {
        return res.status(400).json({ message: "Terdapat ID User yang tidak valid" });
      }
    }

    // 4. IMAGE PROCESSING (Sharp)
    // Nama file unik: icon-timestamp-random.png
    const filename = `icon-${Date.now()}-${Math.round(Math.random() * 1e9)}.png`;
    const outputPath = path.join(__dirname, "../public/uploads/icons", filename);

    // Pastikan folder ada
    if (!fs.existsSync(path.join(__dirname, "../public/uploads/icons"))) {
      fs.mkdirSync(path.join(__dirname, "../public/uploads/icons"), { recursive: true });
    }

    // Resize gambar ke 200x200 pixel (Ukuran aman untuk icon dashboard)
    await sharp(req.file.buffer)
      .resize(200, 200, {
        fit: "contain", // Agar gambar tidak gepeng/terpotong, area kosong jadi transparan
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .toFormat("png")
      .toFile(outputPath);

    // 5. Simpan ke Database
    // Kita simpan URL relatifnya saja
    const feature = await Feature.create({
      title,
      url,
      icon: `/uploads/icons/${filename}`, // Path yang disimpan di DB
      assignedTo: assignedUsers,
      parentId: parentId || null,
    });

    res.status(201).json(feature);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// @desc    Get All Features (With Search & Pagination)
// @route   GET /api/features/admin
// @access  Private/Admin
export const getAllFeatures = async (req, res) => {
  try {
    // 1. Ambil Query Params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; // Default 10 item per halaman
    const search = req.query.search || "";

    // 2. Build Query (Cari berdasarkan Title)
    const query = {
      title: { $regex: search, $options: "i" },
    };

    // 3. Hitung Total
    const totalFeatures = await Feature.countDocuments(query);

    // 4. Ambil Data
    const features = await Feature.find(query)
      .populate("assignedTo", "name email avatar") // Ambil data user detail
      .sort({ createdAt: -1 }) // Terbaru di atas
      .skip((page - 1) * limit)
      .limit(limit);

    // 5. Response Format Standar
    res.status(200).json({
      data: features,
      pagination: {
        totalData: totalFeatures,
        totalPages: Math.ceil(totalFeatures / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get My Features (Client)
// @route   GET /api/features/my-features
// @access  Private/Client
export const getMyFeatures = async (req, res) => {
  try {
    const features = await Feature.find({
      assignedTo: { $in: [req.user._id] },
    });

    res.status(200).json(features);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Feature
// @route   PUT /api/features/:id
export const updateFeature = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).json({ message: "ID Invalid" });

    const feature = await Feature.findById(id);
    if (!feature) return res.status(404).json({ message: "Fitur tidak ditemukan" });

    // Update field teks
    feature.title = req.body.title || feature.title;
    feature.url = req.body.url || feature.url;

    if (req.body.assignedTo) {
      feature.assignedTo = Array.isArray(req.body.assignedTo)
        ? req.body.assignedTo
        : JSON.parse(req.body.assignedTo);
    }

    // Update Icon (Jika ada file baru diupload)
    if (req.file) {
      // 1. Hapus icon lama agar tidak menuhin server
      if (feature.icon) {
        const oldPath = path.join(__dirname, "../public", feature.icon);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      // 2. Proses icon baru
      const filename = `icon-${Date.now()}-${Math.round(Math.random() * 1e9)}.png`;
      const outputPath = path.join(__dirname, "../public/uploads/icons", filename);

      await sharp(req.file.buffer)
        .resize(200, 200, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toFormat("png")
        .toFile(outputPath);

      feature.icon = `/uploads/icons/${filename}`;
    }

    const updatedFeature = await feature.save();
    res.status(200).json(updatedFeature);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete Feature
// @route   DELETE /api/features/:id
export const deleteFeature = async (req, res) => {
  try {
    const { id } = req.params;
    const feature = await Feature.findById(id);
    if (!feature) return res.status(404).json({ message: "Fitur tidak ditemukan" });

    // Hapus file icon fisik di server
    if (feature.icon) {
      const filePath = path.join(__dirname, "../public", feature.icon);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Feature.deleteOne({ _id: id });
    res.status(200).json({ message: "Fitur berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
