import { useState, useEffect, useMemo } from "react";
import chartService from "../../services/chartService";
import toast from "react-hot-toast";
import { FiPlus, FiSearch, FiLayers, FiAlertTriangle } from "react-icons/fi";
import Breadcrumbs from "../../components/Breadcrumbs";
import Pagination from "../../components/Pagination";

// Modular Components
import ChartForm from "./ChartForm";
import ChartGrid from "./ChartGrid";
import ChartFullModal from "../../components/ChartFullModal";

const AdminCharts = () => {
  const [activeTab, setActiveTab] = useState("list"); // 'list' | 'create' | 'edit'

  // Data & Pagination
  const [charts, setCharts] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalData: 0 });

  // State Filters & UI
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Selection
  const [editChartData, setEditChartData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [viewChart, setViewChart] = useState(null);

  // Fetch Data
  const fetchCharts = async () => {
    setIsLoading(true);
    try {
      // Limit besar agar filter kategori frontend berjalan mulus
      const res = await chartService.getCharts({ search, page: 1, limit: 100 });
      setCharts(res.data);
      setPagination(res.pagination);
    } catch (error) {
      toast.error("Gagal load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchCharts(), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Logic Categories
  const categories = useMemo(() => {
    const cats = charts.map((c) => c.category || "General");
    return ["All", ...new Set(cats)].sort();
  }, [charts]);

  // Logic Filter Category
  const filteredCharts = useMemo(() => {
    if (selectedCategory === "All") return charts;
    return charts.filter((c) => (c.category || "General") === selectedCategory);
  }, [charts, selectedCategory]);

  // Handlers
  const handleSave = async (formData) => {
    setIsSubmitting(true);
    try {
      if (activeTab === "edit") {
        await chartService.updateChart(editChartData._id, formData);
        toast.success("Grafik diperbarui");
      } else {
        await chartService.createChart(formData);
        toast.success("Grafik ditambahkan");
      }
      setEditChartData(null);
      setActiveTab("list");
      fetchCharts();
    } catch (error) {
      toast.error("Gagal menyimpan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await chartService.deleteChart(deleteId);
      toast.success("Grafik Dihapus");
      setDeleteId(null);
      fetchCharts();
    } catch (error) {
      toast.error("Gagal hapus");
    }
  };

  return (
    <div className="space-y-2 animate-fade-in pb-10">
      <Breadcrumbs />

      {/* HEADER SECTION */}
      <div className="flex flex-col justify-center items-center md:flex-row md:justify-between md:items-end gap-4 border-b border-gray-100 pb-6">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Data Grafik</h1>
          <p className="text-gray-500 text-sm mt-1">Visualisasi Data Perusahaan secara real-time</p>
        </div>

        <div className="join shadow-sm bg-white rounded-lg p-1 border border-gray-200">
          <button
            className={`join-item btn btn-sm border-none gap-2 ${
              activeTab === "list"
                ? "bg-blue-800 text-white"
                : "bg-transparent text-gray-500 hover:bg-gray-100"
            }`}
            onClick={() => {
              setActiveTab("list");
              setEditChartData(null);
            }}
          >
            <FiLayers /> Koleksi
          </button>
          <button
            className={`join-item btn btn-sm border-none gap-2 ${
              activeTab === "create" || activeTab === "edit"
                ? "bg-blue-800 text-white"
                : "bg-transparent text-gray-500 hover:bg-gray-100"
            }`}
            onClick={() => {
              setActiveTab("create");
              setEditChartData(null);
            }}
          >
            <FiPlus /> {activeTab === "edit" ? "Edit Mode" : "Buat Baru"}
          </button>
        </div>
      </div>

      {/* === MODE LIST === */}
      {activeTab === "list" && (
        <div className="animate-fade-in space-y-6">
          {/* Filter & Category Tabs */}
          <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-2">
            {/* Categories */}
            <div className="flex overflow-x-auto custom-scrollbar w-full md:w-auto p-1 gap-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`btn btn-sm rounded-xl border-none whitespace-nowrap px-4 font-medium ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-transparent text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72 p-1">
              <FiSearch className="absolute z-10 left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari judul grafik..."
                className="input input-sm input-bordered w-full pl-9 rounded-xl focus:border-blue-600"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Grid Content */}
          {isLoading ? (
            <div className="h-64 flex justify-center items-center">
              <span className="loading loading-spinner text-blue-800"></span>
            </div>
          ) : (
            <ChartGrid
              charts={filteredCharts}
              onEdit={(c) => {
                setEditChartData(c);
                setActiveTab("edit");
              }}
              onDelete={setDeleteId}
              onViewFull={setViewChart}
            />
          )}

          {/* Pagination (Fixed) */}
          <div className="flex justify-center mt-8 pt-6 border-t border-gray-100">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={(p) => {}} // Logic pagination frontend/backend
            />
          </div>
        </div>
      )}

      {/* === MODE CREATE / EDIT === */}
      {(activeTab === "create" || activeTab === "edit") && (
        <ChartForm
          onSubmit={handleSave}
          isSubmitting={isSubmitting}
          initialData={editChartData}
          onCancel={() => {
            setActiveTab("list");
            setEditChartData(null);
          }}
        />
      )}

      {/* === MODALS === */}

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
              <FiAlertTriangle size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Hapus Grafik?</h3>
            <p className="text-gray-500 text-sm mb-6">Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteId(null)}
                className="btn btn-ghost flex-1 hover:bg-gray-100"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="btn bg-red-500 hover:bg-red-600 text-white flex-1 border-none shadow-md"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Modal */}
      <ChartFullModal isOpen={!!viewChart} onClose={() => setViewChart(null)} chart={viewChart} />
    </div>
  );
};

export default AdminCharts;
