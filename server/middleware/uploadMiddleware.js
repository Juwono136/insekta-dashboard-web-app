import multer from "multer";
import path from "path";

// 1. Simpan di Memory (Buffer), bukan langsung ke Disk
const storage = multer.memoryStorage();

// 2. Filter File (Hanya Gambar)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Format file tidak didukung! Hanya JPG, JPEG, PNG, WEBP."));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit buffer 5MB (agar aman sebelum compress)
  fileFilter,
});

export default upload;
