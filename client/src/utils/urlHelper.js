export const isGoogleDriveUrl = (url) => {
  if (!url) return false;
  return url.includes("drive.google.com") || url.includes("docs.google.com");
};

export const isDriveFolder = (url) => {
  if (!url) return false;
  return url.includes("/drive/folders/") || url.includes("/folderview");
};

// [UPDATE] Helper untuk memastikan hanya FILE yang dianggap bisa dipreview
export const isPreviewable = (url) => {
  return isGoogleDriveUrl(url) && !isDriveFolder(url);
};

export const getEmbedUrl = (url) => {
  if (!url) return "";

  // Jika folder, kembalikan URL asli (karena tidak akan di-embed)
  if (isDriveFolder(url)) return url;

  let embedUrl = url;

  if (url.includes("/view")) {
    embedUrl = url.replace("/view", "/preview");
  } else if (url.includes("/edit")) {
    embedUrl = url.replace("/edit", "/preview");
  } else if (!url.includes("/preview")) {
    if (url.endsWith("/")) {
      embedUrl = `${url}preview`;
    } else {
      embedUrl = `${url}/preview`;
    }
  }

  return embedUrl;
};
