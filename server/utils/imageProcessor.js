import sharp from "sharp";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Memproses buffer gambar, resize, compress, dan simpan ke disk.
 * @param {Buffer} fileBuffer - Buffer dari req.file.buffer
 * @param {String} folderName - Nama folder tujuan (misal: 'teams', 'features')
 * @param {Number} width - Lebar resize
 * @param {Object} options - Opsi tambahan { format: 'jpeg'|'png'|'webp', fit: 'cover'|'contain' }
 * @returns {String} - URL path relatif untuk disimpan di database
 */
export const saveImage = async (fileBuffer, folderName, width = 500, options = {}) => {
  try {
    // 1. Setup Default Options
    const format = options.format || "jpeg"; // Default jpeg jika tidak diset
    const fit = options.fit || "cover"; // Default cover (potong kotak)

    // 2. Tentukan Ekstensi File
    let ext = format;
    if (format === "jpeg") ext = "jpg";

    // 3. Buat nama file unik
    const filename = `${folderName}-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;

    // 4. Pastikan folder tujuan ada
    const uploadDir = path.join(__dirname, `../public/uploads/${folderName}`);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 5. Path lengkap fisik
    const fullPath = path.join(uploadDir, filename);

    // 6. Inisialisasi Sharp
    let pipeline = sharp(fileBuffer).resize(width, width, {
      fit: fit,
      // Jika 'contain', background transparan (untuk PNG/WebP) atau putih (untuk JPEG)
      background:
        format === "jpeg" ? { r: 255, g: 255, b: 255, alpha: 1 } : { r: 0, g: 0, b: 0, alpha: 0 },
      position: "center",
    });

    // 7. Konfigurasi Format Output
    if (format === "png") {
      // PNG: Lossless, support transparan
      pipeline = pipeline.png({ quality: 80, compressionLevel: 8 });
    } else if (format === "webp") {
      // WebP: Modern, support transparan, ukuran kecil
      pipeline = pipeline.webp({ quality: 80 });
    } else {
      // JPEG: Default untuk foto orang (Team/User)
      pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true });
    }

    // 8. Simpan File
    await pipeline.toFile(fullPath);

    // 9. Kembalikan URL publik
    return `/uploads/${folderName}/${filename}`;
  } catch (error) {
    throw new Error(`Gagal memproses gambar: ${error.message}`);
  }
};

// Helper untuk menghapus file (Cleanup)
export const deleteImage = (relativePath) => {
  if (!relativePath) return;
  try {
    const fullPath = path.join(__dirname, "../public", relativePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (error) {
    console.error("Gagal hapus file:", error.message);
  }
};
