import { FiX, FiCalendar, FiInfo, FiExternalLink } from "react-icons/fi";

const BannerDetailModal = ({ isOpen, onClose, banner, style }) => {
  if (!isOpen || !banner) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop Blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[85vh]">
        {/* Header Berwarna (Sesuai Tipe Banner) */}
        <div className={`${style.bg} p-6 text-white relative shrink-0`}>
          {/* Dekorasi */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl shadow-inner">
                {style.icon}
              </div>
              <button
                onClick={onClose}
                className="btn btn-sm btn-circle btn-ghost bg-white/20 hover:bg-white/40 text-white border-none"
              >
                <FiX size={20} />
              </button>
            </div>
            <h3 className="font-bold text-2xl leading-tight">{banner.title}</h3>
            <div className="flex items-center gap-2 mt-3 text-blue-50 text-xs font-medium">
              <span className="bg-black/10 px-2 py-1 rounded-md uppercase tracking-wider">
                {style.label}
              </span>
              <span className="flex items-center gap-1">
                <FiCalendar /> {new Date(banner.createdAt).toLocaleDateString("id-ID")}
              </span>
            </div>

            <div className="flex my-2">
              {banner.linkUrl && (
                <a
                  href={banner.linkUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()} // PENTING: Agar tidak trigger modal
                  className="pointer-events-auto flex items-center gap-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 px-3 py-1 rounded-full text-[10px] font-bold transition-colors shadow-sm"
                >
                  Buka Link <FiExternalLink />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Body Content (Scrollable) */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <p className="text-gray-700 text-sm md:text-base leading-relaxed whitespace-pre-line">
            {banner.content}
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 text-center shrink-0">
          <button
            onClick={onClose}
            className="btn btn-block bg-blue-800 hover:bg-blue-900 text-white rounded-xl"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default BannerDetailModal;
