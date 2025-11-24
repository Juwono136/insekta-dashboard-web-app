import { FiX, FiExternalLink, FiCornerDownRight } from "react-icons/fi";
import { getImageUrl } from "../../utils/imageUrl";

const FolderModal = ({ isOpen, onClose, feature }) => {
  if (!isOpen || !feature) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
        {/* Header Modal: Icon & Title */}
        <div className="bg-gray-50 p-6 text-center border-b border-gray-100 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 btn btn-sm btn-circle btn-ghost text-gray-400 hover:bg-gray-200"
          >
            <FiX size={20} />
          </button>

          <div className="w-20 h-20 bg-white rounded-2xl shadow-md mx-auto flex items-center justify-center mb-4 p-3">
            <img
              src={getImageUrl(feature.icon)}
              alt={feature.title}
              className="w-full h-full object-contain"
            />
          </div>
          <h3 className="text-xl font-bold text-gray-800">{feature.title}</h3>
          <p className="text-xs text-gray-500 mt-1">Pilih menu yang ingin diakses</p>
        </div>

        {/* List Submenu */}
        <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {feature.subMenus && feature.subMenus.length > 0 ? (
            <div className="grid gap-3">
              {feature.subMenus.map((sub, idx) => (
                <a
                  key={idx}
                  href={sub.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <FiCornerDownRight size={18} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-700 text-sm group-hover:text-blue-800">
                      {sub.title}
                    </h4>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      Buka Tautan <FiExternalLink size={8} />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm italic">
              Folder ini belum memiliki konten.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FolderModal;
