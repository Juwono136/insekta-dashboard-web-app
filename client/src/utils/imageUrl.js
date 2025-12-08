export const getImageUrl = (path) => {
  // if (!path) return "";

  if (!path || path === "") {
    return "https://res.cloudinary.com/dz8dtz5ki/image/upload/v1765175906/profile_vs245w.png";
  }

  // Jika path sudah berupa link lengkap (misal dari Google/Dicebear), biarkan
  if (path.startsWith("http") || path.startsWith("https")) {
    return path;
  }

  // Pastikan path diawali dengan slash '/'
  // Contoh: "uploads/icons/file.jpg" menjadi "/uploads/icons/file.jpg"
  return path.startsWith("/") ? path : `/${path}`;
};
