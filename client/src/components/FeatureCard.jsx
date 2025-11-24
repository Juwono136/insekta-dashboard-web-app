import { useMemo } from "react";
import {
  FiEdit3,
  FiTrash2,
  FiExternalLink,
  FiCornerDownRight,
  FiUser,
  FiBriefcase,
} from "react-icons/fi";
import { getImageUrl } from "../utils/imageUrl";

const FeatureCard = ({ feature, onEdit, onDelete }) => {
  // Helper: Validasi URL agar tidak lari ke localhost
  const getValidUrl = (url) => {
    if (!url) return "#";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return `https://${url}`;
  };

  // [PERBAIKAN UTAMA DI SINI]
  // Grouping Logic dengan Fallback (Default vs Custom)
  const groupedAccess = useMemo(() => {
    const groups = {};
    if (feature.assignedTo && Array.isArray(feature.assignedTo)) {
      feature.assignedTo.forEach((item) => {
        const userName = item.user?.name || "User Terhapus";
        const company = item.companyName || "Tanpa Perusahaan";

        // LOGIKA PENENTUAN KONTEN (PENTING!)
        // Cek apakah item ini 'isCustom'?
        // Jika IYA: Pakai item.type dan item.url
        // Jika TIDAK: Pakai feature.defaultType dan feature.defaultUrl

        const isCustom = item.isCustom;

        const finalType = isCustom ? item.type : feature.defaultType;
        const finalUrl = isCustom ? item.url : feature.defaultUrl;
        const finalSubMenus = isCustom ? item.subMenus : feature.defaultSubMenus;

        if (!groups[company]) groups[company] = [];

        groups[company].push({
          userName,
          isCustom, // Kita simpan status ini untuk label UI (opsional)
          type: finalType,
          url: finalUrl,
          subMenus: finalSubMenus,
        });
      });
    }
    return groups;
  }, [feature]); // Dependency ke seluruh object feature agar update jika default berubah

  return (
    <div className="card bg-white shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300 h-full flex flex-col overflow-hidden group">
      {/* HEADER */}
      <div className="p-5 border-b border-gray-100 bg-linear-to-br from-white to-gray-50 relative">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-gray-100 p-2 shadow-md">
              <img
                src={getImageUrl(feature.icon)}
                alt="icon"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg line-clamp-1" title={feature.title}>
                {feature.title}
              </h3>
              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                Total Akses: {feature.assignedTo?.length || 0} Client
              </span>
            </div>
          </div>

          <div className="flex gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => onEdit(feature)}
              className="btn btn-square btn-xs btn-ghost text-blue-600 hover:bg-blue-50"
              title="Edit"
            >
              <FiEdit3 />
            </button>
            <button
              onClick={() => onDelete(feature)}
              className="btn btn-square btn-xs btn-ghost text-red-500 hover:bg-red-50"
              title="Hapus"
            >
              <FiTrash2 />
            </button>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 p-0 overflow-y-auto custom-scrollbar bg-gray-50/30 max-h-[300px]">
        {Object.keys(groupedAccess).length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-xs italic">
            Belum ada konfigurasi user.
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100">
            {Object.entries(groupedAccess).map(([company, users], idx) => (
              <div key={idx} className="p-4 hover:bg-white transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <FiBriefcase className="text-blue-600" size={12} />
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                    {company}
                  </span>
                </div>

                <div className="space-y-3 pl-2 border-l-2 border-blue-100 ml-1.5">
                  {users.map((u, userIdx) => (
                    <div key={userIdx} className="relative">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <FiUser className="text-gray-400" size={10} />
                          <span className="text-xs font-semibold text-gray-800">{u.userName}</span>
                          {/* Indikator Default vs Custom */}
                          <span
                            className={`text-[9px] px-1 rounded ${
                              u.isCustom
                                ? "bg-orange-100 text-orange-600"
                                : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            {u.isCustom ? "Custom" : "Default"}
                          </span>
                        </div>
                        <span
                          className={`badge badge-xs border-none text-white ${
                            u.type === "folder" ? "bg-orange-400" : "bg-blue-400"
                          }`}
                        >
                          {u.type === "folder" ? "Folder" : "Link"}
                        </span>
                      </div>

                      <div className="pl-4">
                        {u.type === "single" ? (
                          <a
                            href={getValidUrl(u.url)}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-[10px] text-blue-500 hover:underline break-all"
                          >
                            <FiExternalLink size={10} className="shrink-0" />
                            {u.url || <span className="text-gray-400 italic">Link Kosong</span>}
                          </a>
                        ) : (
                          <div className="bg-gray-100 rounded p-2 space-y-1">
                            {u.subMenus &&
                              u.subMenus.map((sub, subIdx) => (
                                <div
                                  key={subIdx}
                                  className="flex items-start gap-1.5 text-[10px] text-gray-600"
                                >
                                  <FiCornerDownRight
                                    className="mt-0.5 text-gray-400 shrink-0"
                                    size={10}
                                  />
                                  <div>
                                    <span className="font-bold block text-gray-700">
                                      {sub.title}
                                    </span>
                                    <a
                                      href={getValidUrl(sub.url)}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-blue-400 hover:underline truncate block max-w-[180px]"
                                    >
                                      {sub.url}
                                    </a>
                                  </div>
                                </div>
                              ))}
                            {(!u.subMenus || u.subMenus.length === 0) && (
                              <span className="text-[10px] text-red-400 italic">Folder Kosong</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeatureCard;
