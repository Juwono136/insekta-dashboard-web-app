// assets
import {
  FiEdit2,
  FiTrash2,
  FiExternalLink,
  FiGlobe,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";

const ChannelCard = ({ channel, onEdit, onDelete }) => {
  return (
    <div className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full">
      <div className="bg-gray-100 border-b border-gray-200 px-3 py-2 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400 border border-red-500"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 border border-yellow-500"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-400 border border-green-500"></div>
        </div>
        <div className="flex-1 bg-white rounded flex items-center px-2 py-0.5 border border-gray-200 shadow-sm">
          <FiGlobe className="text-gray-400 mr-2" size={10} />
          <span className="text-[10px] text-gray-500 truncate w-32">{channel.url}</span>
        </div>
      </div>

      <div className="relative h-40 bg-gray-50 overflow-hidden border-b border-gray-100 group-hover:bg-gray-100 transition-colors">
        {/* Iframe di-scale agar muat website desktop ke kotak kecil */}
        <iframe
          src={channel.url}
          title={channel.title}
          className="w-[200%] h-[200%] scale-50 origin-top-left border-none pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity"
          tabIndex="-1"
        />
        {/* Overlay Transparan (Agar iframe tidak bisa diklik/interaksi di admin) */}
        <div className="absolute inset-0 bg-transparent z-10"></div>

        {/* Status Badge Overlay */}
        <div className="absolute top-2 right-2 z-20">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 shadow-sm border ${
              channel.isActive
                ? "bg-green-100 text-green-700 border-green-200"
                : "bg-gray-100 text-gray-500 border-gray-200"
            }`}
          >
            {channel.isActive ? <FiCheckCircle size={10} /> : <FiXCircle size={10} />}
            {channel.isActive ? "Aktif" : "Draft"}
          </span>
        </div>
      </div>

      {/* Info & Actions */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-gray-800 text-sm line-clamp-1 mb-1" title={channel.title}>
            {channel.title}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {channel.description || "Tidak ada deskripsi tambahan."}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end gap-2">
          <a
            href={channel.url}
            target="_blank"
            rel="noreferrer"
            className="btn btn-sm btn-square btn-ghost text-gray-400 hover:text-blue-600 tooltip"
            data-tip="Buka Tab Baru"
          >
            <FiExternalLink />
          </a>
          <button
            onClick={() => onEdit(channel)}
            className="btn btn-sm btn-square btn-ghost text-blue-600 hover:bg-blue-50 tooltip"
            data-tip="Edit"
          >
            <FiEdit2 />
          </button>
          <button
            onClick={() => onDelete(channel._id)}
            className="btn btn-sm btn-square btn-ghost text-red-500 hover:bg-red-50 tooltip"
            data-tip="Hapus"
          >
            <FiTrash2 />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChannelCard;
