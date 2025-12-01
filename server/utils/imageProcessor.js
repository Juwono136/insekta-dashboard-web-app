import sharp from "sharp";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Memproses buffer dengan Sharp lalu upload ke Cloudinary.
 * @param {Buffer} fileBuffer - Buffer dari req.file.buffer
 * @param {String} folderName - Nama folder di Cloudinary (misal: 'insekta/teams')
 * @param {Number} width - Lebar resize
 * @param {Object} options - Opsi tambahan { format: 'jpeg'|'png' }
 * @returns {String} - URL Secure HTTPS dari Cloudinary
 */
export const saveImage = async (fileBuffer, folderName, width = 500, options = {}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const format = options.format || "jpeg";
      const fit = options.fit || "cover";

      let pipeline = sharp(fileBuffer).resize(width, width, {
        fit: fit,
        background:
          format === "jpeg" ? { r: 255, g: 255, b: 255, alpha: 1 } : { r: 0, g: 0, b: 0, alpha: 0 },
        position: "center",
      });

      if (format === "png") {
        pipeline = pipeline.png({ quality: 80, compressionLevel: 8 });
      } else {
        pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true });
      }

      const processedBuffer = await pipeline.toBuffer();

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `insekta_app/${folderName}`, // Folder tujuan di Cloudinary
          resource_type: "image",
          // public_id opsional, jika tidak diisi Cloudinary generate acak
          public_id: `${folderName}-${Date.now()}`,
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary Upload Error:", error);
            return reject(error);
          }
          resolve(result.secure_url);
        }
      );

      // Akhiri stream dengan mengirimkan buffer
      uploadStream.end(processedBuffer);
    } catch (error) {
      reject(new Error(`Gagal memproses gambar: ${error.message}`));
    }
  });
};

/**
 * Menghapus file dari Cloudinary berdasarkan URL
 * @param {String} imageUrl - URL lengkap gambar dari database
 */
export const deleteImage = async (imageUrl) => {
  if (!imageUrl) return;

  try {
    const regex = /\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/;
    const match = imageUrl.match(regex);

    if (match && match[1]) {
      const publicId = match[1];
      await cloudinary.uploader.destroy(publicId);
      console.log(`Berhasil hapus gambar Cloudinary: ${publicId}`);
    }
  } catch (error) {
    console.error("Gagal hapus file Cloudinary:", error.message);
  }
};
