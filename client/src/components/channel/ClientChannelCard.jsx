import { FiGlobe, FiMaximize2 } from "react-icons/fi";

const ClientChannelCard = ({ channel, onClick }) => {
  return (
    <div
      onClick={() => onClick(channel)}
      className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full relative"
    >
      {/* Browser Header Mockup */}
      <div className="bg-gray-100 px-4 py-2 flex items-center gap-2 border-b border-gray-200">
        <div className="flex gap-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
        </div>
        <div className="flex-1 bg-white rounded-md px-3 py-0.5 text-[10px] text-gray-400 truncate text-center border border-gray-200 mx-2 shadow-sm font-mono">
          {new URL(channel.url).hostname}
        </div>
      </div>

      {/* Live Preview Area */}
      <div className="relative h-48 overflow-hidden border-b border-gray-100">
        {/* Iframe Scaled */}
        <iframe
          src={channel.url}
          className="w-[200%] h-[200%] scale-50 origin-top-left border-none pointer-events-none opacity-90 group-hover:opacity-100 transition-all group-hover:grayscale-0"
          title="preview"
          tabIndex="-1"
        />

        {/* Hover Overlay Effect */}
        <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/10 transition-colors flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2 text-xs font-bold text-blue-800">
            <FiMaximize2 /> Buka Kanal
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-lg text-gray-800 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
            {channel.title}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {channel.description || "Klik untuk melihat detail dan pratinjau penuh."}
          </p>
        </div>

        <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-blue-500 transition-colors">
          <FiGlobe /> Website Portal
        </div>
      </div>
    </div>
  );
};

export default ClientChannelCard;
