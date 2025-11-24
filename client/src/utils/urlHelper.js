export const isGoogleDriveUrl = (url) => {
  if (!url) return false;
  return url.includes("drive.google.com") || url.includes("docs.google.com");
};

export const getEmbedUrl = (url) => {
  if (!url) return "";

  // Logika replace /view atau /edit menjadi /preview
  let embedUrl = url;

  if (url.includes("/view")) {
    embedUrl = url.replace("/view", "/preview");
  } else if (url.includes("/edit")) {
    embedUrl = url.replace("/edit", "/preview");
  } else if (!url.includes("/preview")) {
    // Jika URL drive biasa tapi belum ada akhiran action
    // Cek apakah diakhiri slash
    if (url.endsWith("/")) {
      embedUrl = `${url}preview`;
    } else {
      embedUrl = `${url}/preview`;
    }
  }

  return embedUrl;
};
