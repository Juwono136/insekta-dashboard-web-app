import { FiX, FiExternalLink, FiFileText } from "react-icons/fi";
import { getEmbedUrl } from "../../utils/urlHelper";

const FilePreviewModal = ({ isOpen, onClose, title, url }) => {
  if (!isOpen || !url) return null;

  const embedUrl = getEmbedUrl(url);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-white w-full max-w-5xl h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden relative">
        {/* Header Modal */}
        <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-100 z-10">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <FiFileText size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg truncate max-w-xs md:max-w-md">
                {title}
              </h3>
              <p className="text-xs text-gray-500">File Preview</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Tombol Buka Langsung (Action Button) */}
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white border-none gap-2 hidden sm:flex"
            >
              <FiExternalLink /> Buka Link
            </a>
            <button
              onClick={onClose}
              className="btn btn-sm btn-circle btn-ghost text-gray-500 hover:bg-gray-100"
            >
              <FiX size={22} />
            </button>
          </div>
        </div>

        {/* Iframe Area */}
        <div className="flex-1 bg-gray-100 relative">
          {/* Loading Placeholder (di belakang iframe) */}
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <span className="loading loading-spinner loading-lg"></span>
          </div>

          <iframe
            src={embedUrl}
            className="w-full h-full relative z-10"
            title="File Preview"
            allow="autoplay"
          ></iframe>
        </div>

        {/* Footer (Mobile Only Link) */}
        <div className="p-4 bg-white border-t border-gray-100 sm:hidden text-center">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 font-semibold text-sm hover:underline flex items-center justify-center gap-2"
          >
            <FiExternalLink /> Buka File di Tab Baru
          </a>
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;
