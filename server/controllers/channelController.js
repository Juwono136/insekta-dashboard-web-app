import Channel from "../models/Channel.js";

// @desc Get All Channels
export const getChannels = async (req, res) => {
  try {
    const { search, page = 1, limit = 9 } = req.query;
    const query = {};

    // Filter Search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Client hanya lihat yang aktif
    if (req.user && req.user.role !== "admin") {
      query.isActive = true;
    }

    const total = await Channel.countDocuments(query);
    const channels = await Channel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      data: channels,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create Channel
export const createChannel = async (req, res) => {
  try {
    const { title, description, url, isActive } = req.body;
    if (!title || !url) return res.status(400).json({ message: "Judul dan URL wajib diisi." });

    const channel = await Channel.create({
      title,
      description,
      url,
      isActive,
      createdBy: req.user._id,
    });
    res.status(201).json(channel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update Channel
export const updateChannel = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);
    if (!channel) return res.status(404).json({ message: "Kanal tidak ditemukan" });

    channel.title = req.body.title || channel.title;
    channel.description = req.body.description || channel.description;
    channel.url = req.body.url || channel.url;
    if (req.body.isActive !== undefined) channel.isActive = req.body.isActive;

    const updated = await channel.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete Channel
export const deleteChannel = async (req, res) => {
  try {
    await Channel.deleteOne({ _id: req.params.id });
    res.json({ message: "Kanal dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
