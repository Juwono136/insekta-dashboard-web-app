import { FiX } from "react-icons/fi";
import ChartPreview from "../components/ChartPreview";

const ChartFullModal = ({ isOpen, onClose, chart }) => {
  if (!isOpen || !chart) return null;

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-0 md:p-6">
      {/* RESPONSIVE CONTAINER:
        - Mobile: Full Screen (w-full h-full), sudut kotak (rounded-none).
        - Desktop (md): Ada margin, sudut membulat (rounded-2xl), bayangan besar.
      */}
      <div className="bg-white w-full h-full md:max-w-[90vw] md:h-[90vh] md:rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
        {/* HEADER */}
        <div className="flex justify-between items-center px-4 md:px-6 py-3 md:py-4 bg-white border-b border-gray-100 z-10 shadow-sm shrink-0">
          <div className="flex flex-col min-w-0 pr-4">
            <h3 className="font-bold text-gray-800 text-lg md:text-xl leading-tight truncate">
              {chart.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md">
                {chart.category || "General"}
              </span>
              {/* Optional: Tampilkan info interaktif */}
              <span className="text-[10px] text-gray-400 hidden sm:inline-block">
                *) Mode Interaktif (Bisa di-scroll/zoom)
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-circle btn-sm md:btn-md btn-ghost text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 bg-gray-100 relative w-full h-full overflow-hidden">
          {/* PENTING: Kita gunakan ChartPreview dengan interactive={true} 
              Ini akan memuat IFRAME asli Google Sheets, bukan gambar.
              User bisa melihat tooltip angka detail di sini.
           */}
          <ChartPreview url={chart.embedUrl} title={chart.title} interactive={true} />
        </div>
      </div>
    </div>
  );
};

export default ChartFullModal;
