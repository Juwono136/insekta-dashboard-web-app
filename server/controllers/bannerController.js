import Banner from "../models/Banner.js";

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

    // 1. Search (Title or Content)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    // 2. Filter Type
    if (type && type !== "all") {
      query.type = type;
    }

    // 3. Filter Status
    if (status && status !== "all") {
      query.isActive = status === "active";
    }

    // Client Access Check (Jika bukan admin, paksa active only)
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

// ... (Fungsi create, update, delete tetap sama, pastikan updateBanner menerima isActive)
export const createBanner = async (req, res) => {
  // ... (kode create sama)
  try {
    const banner = await Banner.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(banner);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(banner);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    await Banner.deleteOne({ _id: req.params.id });
    res.json({ message: "Dihapus" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
