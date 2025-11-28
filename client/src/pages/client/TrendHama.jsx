import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiBarChart2, FiTrendingUp, FiAlertCircle } from "react-icons/fi";

// Import Redux Action
import { fetchCharts } from "../../redux/slices/chartSlice"; // Sesuaikan path

// Import Components
import PageLoader from "../../components/PageLoader";
import Breadcrumbs from "../../components/Breadcrumbs";
import LazyCategorySection from "../../components/LazyCategorySection"; // Komponen Baru

// Re-use Component Admin (Chart Preview & Modal)
import ChartPreview from "../../components/ChartPreview";
import ChartFullModal from "../../components/ChartFullModal";

const TrendHama = () => {
  const dispatch = useDispatch();

  // Ambil Data dari Redux Store
  const { charts, isLoading, isError, message } = useSelector((state) => state.charts);

  const [viewChart, setViewChart] = useState(null);

  // Fetch Data via Redux
  useEffect(() => {
    dispatch(fetchCharts());
  }, [dispatch]);

  // Logic Grouping (Memoized)
  const groupedCharts = useMemo(() => {
    const groups = {};
    charts.forEach((chart) => {
      const cat = chart.category || "General";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(chart);
    });
    // Sort Object Keys A-Z
    return Object.keys(groups)
      .sort()
      .reduce((obj, key) => {
        obj[key] = groups[key];
        return obj;
      }, {});
  }, [charts]);

  if (isLoading) return <PageLoader />;

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-4">
        <FiAlertCircle className="text-red-500 text-5xl mb-4" />
        <h3 className="text-xl font-bold text-gray-800">Gagal Memuat Data</h3>
        <p className="text-gray-500 mb-6">{message}</p>
        <button onClick={() => dispatch(fetchCharts())} className="btn btn-primary">
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 animate-fade-in">
      <Breadcrumbs />

      <div className="max-w-7xl mx-auto px-0 pt-0">
        <div className="flex items-center gap-3 mb-10 px-1">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-xl shadow-sm">
            <FiTrendingUp size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Laporan Insekta Terkini</h2>
            <p className="text-sm text-gray-500">
              Laporan terkait visual dan analisa data lapangan.
            </p>
          </div>
        </div>

        {/* CONTENT AREA */}
        {Object.keys(groupedCharts).length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
            <h3 className="text-lg font-bold text-gray-400">Belum ada data grafik tersedia.</h3>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Render Lazy Section per Kategori */}
            {Object.entries(groupedCharts).map(([category, items]) => (
              <LazyCategorySection key={category} title={category} count={items.length}>
                {/* Grid Layout Chart */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {items.map((chart) => (
                    <div
                      key={chart._id}
                      className="card bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer overflow-hidden rounded-2xl"
                      onClick={() => setViewChart(chart)}
                    >
                      {/* Chart Thumbnail (Image Mode - Ringan) */}
                      {/* Container Aspect Video agar proporsional */}
                      <div className="w-full aspect-video bg-gray-50 relative border-b border-gray-50">
                        <div className="absolute inset-0 p-0">
                          <ChartPreview
                            url={chart.embedUrl}
                            title={chart.title}
                            interactive={false} // Mode Gambar
                          />
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="bg-white/90 text-gray-800 px-4 py-2 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm flex items-center gap-2">
                            <FiBarChart2 /> Lihat Detail
                          </span>
                        </div>
                      </div>

                      {/* Card Info */}
                      <div className="p-5">
                        <h4 className="font-bold text-gray-800 text-sm md:text-base line-clamp-2 leading-snug mb-2 group-hover:text-blue-700 transition-colors">
                          {chart.title}
                        </h4>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50 text-[10px] text-gray-400">
                          <span className="font-medium uppercase tracking-wider">
                            Update Terakhir
                          </span>
                          <span className="font-mono">
                            {new Date(chart.updatedAt).toLocaleDateString("id-ID")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </LazyCategorySection>
            ))}
          </div>
        )}
      </div>

      {/* Modal Full Screen (Tetap Interactive Iframe) */}
      <ChartFullModal isOpen={!!viewChart} onClose={() => setViewChart(null)} chart={viewChart} />
    </div>
  );
};

export default TrendHama;
