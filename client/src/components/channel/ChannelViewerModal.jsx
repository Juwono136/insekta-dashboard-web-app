import { FiX, FiExternalLink, FiGlobe, FiAlertCircle } from "react-icons/fi";

const ChannelViewerModal = ({ channel, onClose }) => {
  if (!channel) return null;

  return (
    <div className="fixed inset-0 z-100 bg-gray-900/95 backdrop-blur-sm flex flex-col animate-fade-in">
      {/* 1. Toolbar Atas (Dark Mode) */}
      <div className="bg-gray-900 text-white px-4 md:px-6 py-3 flex justify-between items-center shadow-2xl shrink-0 border-b border-gray-800">
        <div className="flex items-center gap-4 overflow-hidden">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="btn btn-circle btn-sm btn-ghost hover:bg-white/10 text-white transition-colors"
          >
            <FiX size={20} />
          </button>

          {/* Info Web */}
          <div className="border-l border-gray-700 pl-4">
            <h3 className="font-bold text-base md:text-lg truncate">{channel.title}</h3>
            <a
              href={channel.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-gray-400 truncate flex items-center gap-1.5 hover:text-blue-400 transition-colors"
            >
              <FiGlobe size={12} /> {channel.url}
            </a>
          </div>
        </div>

        {/* Action Button */}
        <a
          href={channel.url}
          target="_blank"
          rel="noreferrer"
          className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white border-none gap-2 hidden sm:flex shadow-lg shadow-blue-900/50"
        >
          Buka di Browser <FiExternalLink />
        </a>
      </div>

      {/* 2. Iframe Container */}
      <div className="flex-1 relative bg-white w-full h-full overflow-hidden">
        {/* Loading / Fallback Layer (Di belakang iframe) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-0">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 bg-gray-200 rounded-full mb-3"></div>
            <div className="h-4 bg-gray-200 w-48 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 w-32 rounded"></div>
          </div>

          {/* Pesan jika iframe diblokir */}
          <div className="mt-8 text-center max-w-md px-6 py-4 bg-white border border-gray-200 rounded-xl shadow-sm">
            <FiAlertCircle className="mx-auto text-yellow-500 text-2xl mb-2" />
            <p className="text-sm font-bold text-gray-700">Tidak bisa memuat pratinjau?</p>
            <p className="text-xs text-gray-500 mt-1 mb-3">
              Beberapa website (seperti Google/Facebook) memblokir akses dari dalam aplikasi.
            </p>
            <a
              href={channel.url}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline btn-sm btn-block"
            >
              Buka Langsung di Tab Baru
            </a>
          </div>
        </div>

        {/* Actual Iframe (Di depan fallback) */}
        <iframe
          src={channel.url}
          title={channel.title}
          className="relative w-full h-full border-none z-10 bg-white" // bg-white agar menutupi fallback saat loading selesai
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default ChannelViewerModal;
