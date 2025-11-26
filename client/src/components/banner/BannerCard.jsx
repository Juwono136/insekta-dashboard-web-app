import { FiEdit2, FiTrash2, FiCheckCircle, FiXCircle, FiGift, FiAlertCircle } from "react-icons/fi";
import { BsMegaphone } from "react-icons/bs";

const BannerCard = ({ banner, onEdit, onDelete }) => {
  // Helper Style (Konsisten dengan Client Dashboard)
  const getStyle = (type) => {
    if (type === "promo")
      return {
        bg: "bg-gradient-to-r from-purple-600 to-pink-500",
        icon: <FiGift />,
        label: "Promo",
      };
    if (type === "warning")
      return {
        bg: "bg-gradient-to-r from-orange-500 to-yellow-400",
        icon: <FiAlertCircle />,
        label: "Penting",
      };
    return {
      bg: "bg-gradient-to-r from-blue-500 to-cyan-400",
      icon: <BsMegaphone />,
      label: "Info",
    };
  };

  const style = getStyle(banner.type);

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full">
      {/* HEADER: Visual Preview (Miniatur Banner Client) */}
      <div className={`h-24 ${style.bg} p-4 text-white relative overflow-hidden`}>
        {/* Dekorasi Background */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-white opacity-10 rounded-full -mr-5 -mt-5"></div>
        <div className="absolute bottom-0 left-0 w-10 h-10 bg-black opacity-5 rounded-full -ml-2 -mb-2"></div>

        <div className="relative z-10 flex justify-between items-start">
          <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">{style.icon}</div>
          {/* Status Badge */}
          <div
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 ${
              banner.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
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
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
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
