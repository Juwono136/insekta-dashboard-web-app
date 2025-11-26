import { useState } from "react";
import { FiEdit2, FiTrash2, FiMaximize2, FiPieChart, FiRefreshCw } from "react-icons/fi";
import ChartPreview from "../../components/ChartPreview";

const ChartGrid = ({ charts, onEdit, onDelete, onViewFull }) => {
  // State ini menyimpan waktu terakhir refresh untuk setiap chart
  const [refreshState, setRefreshState] = useState({});

  // Ketika tombol refresh diklik, kita update timestamp untuk chart tersebut
  const handleRefresh = (chartId) => {
    setRefreshState((prev) => ({
      ...prev,
      [chartId]: Date.now(),
    }));
  };

  if (charts.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
          <FiPieChart size={32} />
        </div>
        <h3 className="text-lg font-bold text-gray-800">Belum ada data grafik</h3>
        <p className="text-gray-500 text-sm mt-1">Silakan buat grafik baru.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in pb-10">
      {charts.map((chart) => (
        <div
          key={chart._id}
          className="card bg-white shadow-sm border p-3 border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group overflow-hidden"
        >
          {/* HEADER */}
          <div className="p-2 border-b border-gray-100 flex justify-between items-start bg-white z-10 min-h-[70px]">
            <div className="min-w-0 flex gap-2 flex-col justify-center">
              <h3
                className="font-bold text-blue-900 capitalize text-sm md:text-lg leading-tight truncate"
                title={chart.title}
              >
                {chart.title}
              </h3>

              <span
                className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1 bg-blue-50 px-2 py-0.5 rounded-md w-fit max-w-full truncate"
                title={chart.category}
              >
                {chart.category || "General"}
              </span>
            </div>

            {/* ACTION MENU */}
            <div className="flex gap-1 bg-white pl-2">
              {/* TOMBOL REFRESH DATA */}
              <button
                onClick={() => handleRefresh(chart._id)}
                className="btn btn-square btn-sm btn-ghost text-green-600 hover:bg-green-50"
                title="Refresh Data Terbaru dari Google Sheet"
              >
                <FiRefreshCw size={16} />
              </button>

              <button
                onClick={() => onEdit(chart)}
                className="btn btn-square btn-sm btn-ghost text-blue-600 hover:bg-blue-50"
                title="Edit"
              >
                <FiEdit2 size={16} />
              </button>
              <button
                onClick={() => onDelete(chart._id)}
                className="btn btn-square btn-sm btn-ghost text-red-500 hover:bg-red-50"
                title="Hapus"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          </div>

          {/* CHART AREA (Mode Gambar) */}
          {/* h-[300px] memastikan area chart konsisten tingginya */}
          <div className="w-full h-full bg-white relative flex items-center justify-center p-2">
            <div className="w-full h-full relative">
              <ChartPreview
                url={chart.embedUrl}
                title={chart.title}
                interactive={false} // Mode Gambar (Responsif & Rapi)
                refreshKey={refreshState[chart._id]} // Trigger update gambar
              />
            </div>

            {/* Overlay Button View Full */}
            <div
              className="absolute inset-0 bg-black/10 group-hover:bg-black/40 rounded-md backdrop-blur-[1px] transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer z-20"
              onClick={() => onViewFull(chart)}
            >
              <button className="btn bg-white text-gray-900 border-none hover:bg-blue-50 shadow-xl gap-2 transform scale-95 group-hover:scale-100 transition-transform font-bold btn-sm px-6 rounded-full">
                <FiMaximize2 size={16} /> Perbesar
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChartGrid;
