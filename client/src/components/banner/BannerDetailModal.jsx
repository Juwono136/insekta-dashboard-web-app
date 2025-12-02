import { FiX, FiCalendar, FiExternalLink, FiGift, FiAlertCircle } from "react-icons/fi";
import { BsMegaphone } from "react-icons/bs";
import { getImageUrl } from "../../utils/imageUrl";

const BannerDetailModal = ({ isOpen, onClose, banner }) => {
  if (!isOpen || !banner) return null;

  // Helper Badge untuk di dalam Modal
  const getBadgeIcon = (type) => {
    if (type === "promo") return <FiGift />;
    if (type === "warning") return <FiAlertCircle />;
    return <BsMegaphone />;
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[90vh] animate-scale-up">
        {/* HEADER: GAMBAR FULL */}
        <div className="relative h-48 sm:h-56 shrink-0 bg-gray-200">
          {/* Gambar Background */}
          <img
            src={getImageUrl(banner.image)}
            alt={banner.title}
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent"></div>

          {/* Tombol Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 btn btn-sm btn-circle bg-black/30 hover:bg-black/50 text-white border-none backdrop-blur-md z-20"
          >
            <FiX size={18} />
          </button>

          {/* Judul & Info di atas Gambar */}
          <div className="absolute bottom-0 left-0 w-full p-6 text-white z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-white/20 backdrop-blur-md border border-white/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1.5">
                {getBadgeIcon(banner.type)} {banner.type === "warning" ? "PENTING" : banner.type}
              </span>
              <span className="flex items-center gap-1 text-[10px] opacity-80 font-medium">
                <FiCalendar size={10} />{" "}
                {new Date(banner.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <h3 className="font-bold text-xl sm:text-2xl leading-tight text-shadow-sm">
              {banner.title}
            </h3>
          </div>
        </div>

        {/* BODY: KONTEN */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <p className="text-gray-700 text-sm md:text-base leading-relaxed whitespace-pre-line">
            {banner.content}
          </p>

          {/* Link URL Action di Dalam Modal */}
          {banner.linkUrl && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <a
                href={banner.linkUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-[#093050] hover:bg-blue-800 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-100"
              >
                <FiExternalLink /> Buka Tautan Terkait
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BannerDetailModal;
