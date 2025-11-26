import { useMemo, useState } from "react";
import { FiBarChart2 } from "react-icons/fi";

const ChartPreview = ({ url, title, interactive = true, refreshKey = 0 }) => {
  const [imgError, setImgError] = useState(false);

  // --- SMART URL GENERATOR ---
  const { displayUrl, isImageMode } = useMemo(() => {
    if (!url) return { displayUrl: "", isImageMode: false };

    try {
      let newUrl = url;
      // Bersihkan parameter lama
      newUrl = newUrl
        .replace("&widget=true", "")
        .replace("&headers=false", "")
        .replace("&chrome=false", "");

      // [PENTING] TIMESTAMP CACHE BUSTER
      // Ini yang membuat gambar SELALU UPDATE sesuai data terbaru di Sheet
      const separator = newUrl.includes("?") ? "&" : "?";
      const timestamp = `update=${refreshKey || Date.now()}`;

      // MODE GRID (THUMBNAIL) -> Paksa jadi GAMBAR
      if (!interactive) {
        if (newUrl.includes("format=interactive")) {
          newUrl = newUrl.replace("format=interactive", "format=image");
        } else if (!newUrl.includes("format=")) {
          newUrl = `${newUrl}${separator}format=image`;
        }

        return {
          // URL Gambar + Timestamp (Agar tidak dicache browser)
          displayUrl: `${newUrl}&${timestamp}`,
          isImageMode: true,
        };
      }

      // MODE INTERACTIVE (MODAL) -> Paksa jadi IFRAME
      else {
        if (newUrl.includes("format=image")) {
          newUrl = newUrl.replace("format=image", "format=interactive");
        }
        return {
          displayUrl: `${newUrl}${separator}${timestamp}&widget=true&headers=false&chrome=false`,
          isImageMode: false,
        };
      }
    } catch (e) {
      return { displayUrl: url, isImageMode: !interactive };
    }
  }, [url, interactive, refreshKey]);

  if (!url) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200">
        <FiBarChart2 size={32} className="mb-2 opacity-50 text-blue-500" />
        <p className="text-xs font-medium text-gray-400">
          Chart/Grafik dari embed code akan muncul disini
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white overflow-hidden relative flex items-center justify-center">
      {isImageMode && !imgError ? (
        // TAMPILAN GAMBAR (RESPONSIF TOTAL)
        // object-contain membuat gambar mengecil pas sesuai kotak kartu tanpa terpotong
        <img
          src={displayUrl}
          alt={title}
          className="w-full h-full object-contain p-1"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        // TAMPILAN IFRAME (Fallback / Full Screen)
        <iframe
          key={displayUrl} // Key berubah = Iframe reload
          src={displayUrl}
          title={title}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-popups"
          loading="lazy"
        />
      )}

      {/* Overlay agar kartu bisa diklik di grid */}
      {!interactive && <div className="absolute inset-0 z-10 bg-transparent cursor-pointer"></div>}
    </div>
  );
};

export default ChartPreview;
