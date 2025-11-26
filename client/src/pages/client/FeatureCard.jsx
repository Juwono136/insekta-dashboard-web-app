import { FiFolder, FiExternalLink, FiFileText } from "react-icons/fi";
import { getImageUrl } from "../../utils/imageUrl";
import { isDriveFolder, isPreviewable } from "../../utils/urlHelper";

const FeatureCard = ({ feature, onClick }) => {
  // Tentukan Icon kecil di pojok kanan atas berdasarkan tipe
  const getActionIcon = () => {
    if (feature.type === "folder") return <FiFolder className="text-orange-500" />;

    // Jika Link Folder Google -> Pakai Icon Folder & Warna Biru
    if (isDriveFolder(feature.url)) return <FiFolder className="text-blue-600" />;

    // Jika Link File Google -> Pakai Icon File & Warna Hijau
    if (isPreviewable(feature.url)) return <FiFileText className="text-green-600" />;

    return <FiExternalLink className="text-blue-500" />;
  };

  const getActionText = () => {
    if (feature.type === "folder") return "Buka Menu";
    if (isDriveFolder(feature.url)) return "Buka Folder"; // Teks Khusus Folder
    if (isPreviewable(feature.url)) return "Lihat File";
    return "Buka Link";
  };

  return (
    <div
      onClick={() => onClick(feature)}
      className="card bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full group cursor-pointer relative overflow-hidden"
    >
      {/* Hover Effect */}
      <div className="absolute inset-0 bg-linear-to-br from-blue-50/0 to-blue-50/0 group-hover:from-blue-50/30 group-hover:to-white transition-all duration-500"></div>

      <div className="card-body p-5 flex flex-col items-center text-center relative z-10">
        {/* Badge Count for Folder */}
        {feature.type === "folder" && (
          <span className="absolute top-3 right-3 bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            {feature.subMenus?.length || 0}
          </span>
        )}

        {/* Icon */}
        <div className="w-16 h-16 mb-4 bg-gray-50 rounded-2xl p-3 shadow-inner group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
          <img
            src={getImageUrl(feature.icon)}
            alt={feature.title}
            className="w-full h-full object-contain drop-shadow-sm"
          />
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-700 text-sm group-hover:text-blue-800 transition-colors line-clamp-2 leading-tight min-h-10 flex items-center justify-center">
          {feature.title}
        </h3>

        {/* Action Label */}
        <div className="mt-3 text-[10px] text-gray-400 font-medium flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-full group-hover:bg-white group-hover:shadow-sm transition-all">
          {getActionIcon()}
          <span>{getActionText()}</span>
        </div>
      </div>
    </div>
  );
};

export default FeatureCard;
