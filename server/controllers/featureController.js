import Feature from "../models/Feature.js";
import mongoose from "mongoose";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Setup path untuk save file (ES Module fix)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Create New Feature
// @route   POST /api/features
export const createFeature = async (req, res) => {
  try {
    const { title, assignedTo, defaultType, defaultUrl, defaultSubMenus } = req.body;

    // 1. Validasi Input Global
    if (!title) {
      return res.status(400).json({ message: "Judul menu wajib diisi" });
    }

    // 2. Validasi File Icon (Wajib Ada untuk Create)
    if (!req.file) {
      return res.status(400).json({ message: "Icon wajib diupload (PNG/JPG/WEBP)" });
    }

    // 3. Parsing Data JSON (karena dikirim via FormData)
    let assignedParsed = [];
    if (assignedTo) {
      try {
        assignedParsed = JSON.parse(assignedTo);
      } catch (e) {
        return res.status(400).json({ message: "Format data akses client invalid" });
      }
    } else {
      return res.status(400).json({ message: "Harus memilih minimal satu client" });
    }

    let defaultSubMenusParsed = [];
    if (defaultSubMenus) {
      try {
        defaultSubMenusParsed = JSON.parse(defaultSubMenus);
      } catch (e) {
        defaultSubMenusParsed = [];
      }
    }

    // 4. IMAGE PROCESSING (Local Storage)
    const filename = `icon-${Date.now()}-${Math.round(Math.random() * 1e9)}.png`;
    const uploadDir = path.join(__dirname, "../public/uploads/icons");

    // Pastikan folder ada
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const outputPath = path.join(uploadDir, filename);

    // Resize & Save
    await sharp(req.file.buffer)
      .resize(200, 200, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .toFormat("png")
      .toFile(outputPath);

    // 5. Simpan ke Database
    const feature = await Feature.create({
      title,
      icon: `/uploads/icons/${filename}`, // Path lokal

      // Simpan Default Config
      defaultType: defaultType || "single",
      defaultUrl: defaultType === "single" ? defaultUrl : "",
      defaultSubMenus: defaultType === "folder" ? defaultSubMenusParsed : [],

      // Simpan User Specific Config
      assignedTo: assignedParsed,

      createdBy: req.user._id,
    });

    res.status(201).json(feature);
  } catch (error) {
    console.error("Error create feature:", error);
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// @desc    Update Feature
// @route   PUT /api/features/:id
export const updateFeature = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, assignedTo, defaultType, defaultUrl, defaultSubMenus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "ID Invalid" });
    }

    const feature = await Feature.findById(id);
    if (!feature) return res.status(404).json({ message: "Fitur tidak ditemukan" });

    // 1. Update Judul
    if (title) feature.title = title;

    // 2. Update Default Config
    if (defaultType) feature.defaultType = defaultType;

    if (feature.defaultType === "single") {
      if (defaultUrl !== undefined) feature.defaultUrl = defaultUrl;
      feature.defaultSubMenus = [];
    } else {
      feature.defaultUrl = "";
      if (defaultSubMenus) {
        try {
          feature.defaultSubMenus = JSON.parse(defaultSubMenus);
        } catch (e) {
          feature.defaultSubMenus = [];
        }
      }
    }

    // 3. Update Konfigurasi User
    if (assignedTo) {
      try {
        feature.assignedTo = JSON.parse(assignedTo);
      } catch (e) {
        return res.status(400).json({ message: "Format data konfigurasi invalid" });
      }
    }

    // 4. Update Icon (Jika ada file baru diupload)
    if (req.file) {
      // Hapus icon lama fisik
      if (feature.icon) {
        const oldPath = path.join(__dirname, "../public", feature.icon);
        if (fs.existsSync(oldPath)) {
          try {
            fs.unlinkSync(oldPath);
          } catch (err) {
            console.error("Gagal hapus icon lama:", err);
          }
        }
      }

      // Simpan icon baru
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
    console.error("Error update feature:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get All Features (Admin - Support Filter & Pagination)
// @route   GET /api/features/admin
export const getAllFeatures = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const company = req.query.company || "";

    const query = {
      title: { $regex: search, $options: "i" },
    };

    // Filter by Company (Cari di dalam array assignedTo)
    if (company) {
      query["assignedTo.companyName"] = company;
    }

    const totalFeatures = await Feature.countDocuments(query);
    const features = await Feature.find(query)
      // [PENTING] Populate user detail di dalam array assignedTo agar namanya muncul
      .populate("assignedTo.user", "name email avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

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

// @desc    Get My Features (Client Dashboard Logic)
// @route   GET /api/features/my-features
export const getMyFeatures = async (req, res) => {
  try {
    // 1. Cari semua fitur dimana User ID ini ada di dalam array assignedTo
    const features = await Feature.find({
      "assignedTo.user": req.user._id,
    });

    // 2. Map/Transform data (Pilih antara Default vs Custom)
    const myFeatures = features
      .map((f) => {
        // Cari config spesifik milik user yang sedang login
        const myConfig = f.assignedTo.find(
          (item) => item.user.toString() === req.user._id.toString()
        );

        if (!myConfig) return null;

        // LOGIKA FALLBACK:
        // Jika isCustom = true, gunakan config user.
        // Jika isCustom = false, gunakan config default (global).

        const finalType = myConfig.isCustom ? myConfig.type : f.defaultType;
        const finalUrl = myConfig.isCustom ? myConfig.url : f.defaultUrl;
        const finalSubMenus = myConfig.isCustom ? myConfig.subMenus : f.defaultSubMenus;

        return {
          _id: f._id,
          title: f.title,
          icon: f.icon,
          // Return hasil final yang sudah dipilih
          type: finalType,
          url: finalUrl,
          subMenus: finalSubMenus,
        };
      })
      .filter(Boolean); // Hapus null jika ada

    res.status(200).json(myFeatures);
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

    // Hapus file icon fisik
    if (feature.icon) {
      const filePath = path.join(__dirname, "../public", feature.icon);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error("Gagal hapus file icon:", err);
        }
      }
    }

    await Feature.deleteOne({ _id: id });
    res.status(200).json({ message: "Fitur berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
