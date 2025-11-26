import Chart from "../models/Chart.js";

// @desc    Create New Chart (Embed)
// @route   POST /api/charts
export const createChart = async (req, res) => {
  try {
    const { title, embedUrl, description, category } = req.body; // Ada category

    if (!title || !embedUrl) {
      return res.status(400).json({ message: "Judul dan Link Embed wajib diisi" });
    }

    // Bersihkan URL
    let cleanUrl = embedUrl;
    const srcMatch = embedUrl.match(/src="([^"]+)"/);
    if (srcMatch) cleanUrl = srcMatch[1];

    const newChart = await Chart.create({
      title,
      embedUrl: cleanUrl,
      category: category || "General", // Default General
      description,
      createdBy: req.user._id,
    });

    res.status(201).json(newChart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateChart = async (req, res) => {
  try {
    const { title, embedUrl, description, category } = req.body;
    const chart = await Chart.findById(req.params.id);

    if (chart) {
      chart.title = title || chart.title;
      chart.category = category || chart.category;
      chart.description = description || chart.description;

      if (embedUrl) {
        let cleanUrl = embedUrl;
        const srcMatch = embedUrl.match(/src="([^"]+)"/);
        if (srcMatch) cleanUrl = srcMatch[1];
        chart.embedUrl = cleanUrl;
      }

      const updatedChart = await chart.save();
      res.json(updatedChart);
    } else {
      res.status(404).json({ message: "Chart tidak ditemukan" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get All Charts
// @route   GET /api/charts
export const getCharts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const search = req.query.search || "";

    const query = { title: { $regex: search, $options: "i" } };
    const totalData = await Chart.countDocuments(query);

    const charts = await Chart.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      data: charts,
      pagination: { totalData, totalPages: Math.ceil(totalData / limit), currentPage: page, limit },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete Chart
export const deleteChart = async (req, res) => {
  try {
    await Chart.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "Chart dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
