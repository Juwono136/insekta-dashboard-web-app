import Banner from "../models/Banner.js";
import { saveImage, deleteImage } from "../utils/imageProcessor.js";

// @desc    Get All Banners (Support Search, Filter, Pagination)
export const getBanners = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const search = req.query.search || "";
    const type = req.query.type || "";
    const status = req.query.status || ""; // 'active' or 'inactive'

    // Build Query
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    if (type && type !== "all") {
      query.type = type;
    }

    if (status && status !== "all") {
      query.isActive = status === "active";
    }

    if (req.user && req.user.role !== "admin") {
      query.isActive = true;
    }

    const totalData = await Banner.countDocuments(query);
    const banners = await Banner.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      data: banners,
      pagination: {
        totalData,
        totalPages: Math.ceil(totalData / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create Banner
export const createBanner = async (req, res) => {
  let imagePath = "";
  try {
    const { title, content, type, linkUrl } = req.body;

    // Validasi Lengkap
    if (!title || !content)
      return res.status(400).json({ message: "Judul dan Deskripsi wajib diisi." });
    if (!req.file) return res.status(400).json({ message: "Gambar banner wajib diupload." });

    // Simpan Gambar (Resize 800px, JPEG)
    imagePath = await saveImage(req.file.buffer, "banners", 800, { format: "jpeg", fit: "cover" });

    const banner = await Banner.create({
      title,
      content,
      type: type || "info",
      linkUrl,
      image: imagePath,
      createdBy: req.user._id,
    });

    res.status(201).json(banner);
  } catch (error) {
    if (imagePath) deleteImage(imagePath);
    res.status(500).json({ message: error.message });
  }
};

// @desc Update Banner
export const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner tidak ditemukan" });

    // Update Field Text
    banner.title = req.body.title || banner.title;
    banner.content = req.body.content || banner.content;
    banner.type = req.body.type || banner.type;
    banner.linkUrl = req.body.linkUrl || banner.linkUrl;

    if (req.body.isActive !== undefined) banner.isActive = JSON.parse(req.body.isActive);

    // Update Gambar (Jika ada)
    if (req.file) {
      if (banner.image) deleteImage(banner.image);
      banner.image = await saveImage(req.file.buffer, "banners", 800, {
        format: "jpeg",
        fit: "cover",
      });
    }

    const updated = await banner.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner tidak ditemukan" });

    if (banner.image) deleteImage(banner.image);

    await Banner.deleteOne({ _id: req.params.id });
    res.json({ message: "Banner dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
