import { FiEdit2, FiTrash2, FiCheckCircle, FiXCircle, FiGift, FiAlertCircle } from "react-icons/fi";
import { BsMegaphone } from "react-icons/bs";
import { getImageUrl } from "../../utils/imageUrl";

const BannerCard = ({ banner, onEdit, onDelete }) => {
  // Helper Style (Hanya untuk Ikon & Label, background diambil dari gambar)
  const getStyle = (type) => {
    if (type === "promo")
      return {
        icon: <FiGift />,
        label: "Promo",
      };
    if (type === "warning")
      return {
        icon: <FiAlertCircle />,
        label: "Penting",
      };
    return {
      icon: <BsMegaphone />,
      label: "Info",
    };
  };

  const style = getStyle(banner.type);

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full">
      {/* HEADER: Image Preview */}
      <div className="h-32 relative overflow-hidden bg-gray-100">
        {/* Gambar Banner */}
        <img
          src={getImageUrl(banner.image)}
          alt={banner.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            e.target.style.display = "none"; // Sembunyikan jika error
            e.target.nextSibling.style.display = "none"; // Sembunyikan overlay
          }}
        />

        {/* Gradient Overlay (Agar badge putih terbaca) */}
        <div className="absolute inset-0 bg-linear-to-b from-black/70 via-transparent to-black/10 pointer-events-none"></div>

        {/* Floating Badges */}
        <div className="absolute top-0 left-0 w-full p-3 flex justify-between items-start z-10">
          {/* Tipe Icon */}
          <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-md text-white border border-white/20 shadow-sm">
            {style.icon}
          </div>

          {/* Status Badge */}
          <div
            className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 shadow-sm backdrop-blur-md border ${
              banner.isActive
                ? "bg-green-500/80 text-white border-green-400"
                : "bg-gray-600/80 text-white border-gray-500"
            }`}
          >
            {banner.isActive ? <FiCheckCircle size={10} /> : <FiXCircle size={10} />}
            {banner.isActive ? "Tayang" : "Draft"}
          </div>
        </div>
      </div>

      {/* BODY: Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex-1">
          <h3
            className="font-bold text-gray-800 text-lg leading-tight mb-2 line-clamp-1"
            title={banner.title}
          >
            {banner.title}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{banner.content}</p>
        </div>

        {/* FOOTER: Actions */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider bg-gray-50 px-2 py-1 rounded">
            {style.label}
          </span>

          <div className="flex gap-2">
            <button
              onClick={() => onEdit(banner)}
              className="btn btn-sm btn-square btn-ghost text-blue-600 hover:bg-blue-50 tooltip"
              data-tip="Edit"
            >
              <FiEdit2 size={16} />
            </button>
            <button
              onClick={() => onDelete(banner._id)}
              className="btn btn-sm btn-square btn-ghost text-red-500 hover:bg-red-50 tooltip"
              data-tip="Hapus"
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerCard;
