export const getImageUrl = (path) => {
  if (!path) return "";

  if (!path) {
    return "https://res.cloudinary.com/dz8dtz5ki/image/upload/v1764597116/user_bsdswt.png";
  }

  // Jika path sudah berupa link lengkap (misal dari Google/Dicebear), biarkan
  if (path.startsWith("http") || path.startsWith("https")) {
    return path;
  }

  // Pastikan path diawali dengan slash '/'
  // Contoh: "uploads/icons/file.jpg" menjadi "/uploads/icons/file.jpg"
  return path.startsWith("/") ? path : `/${path}`;
};
