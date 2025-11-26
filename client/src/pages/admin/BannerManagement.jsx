import { useEffect, useState } from "react";
import bannerService from "../../services/bannerService";
import toast from "react-hot-toast";
import { FiPlus, FiLayers, FiAlertTriangle } from "react-icons/fi";
import Breadcrumbs from "../../components/Breadcrumbs";
import Pagination from "../../components/Pagination";

// Import Modular Components
import BannerFilter from "../../components/banner/BannerFilter";
import BannerCard from "../../components/banner/BannerCard";
import BannerModal from "../../components/banner/BannerModal";

const BannerManagement = () => {
  // Data State
  const [banners, setBanners] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalData: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Filter State
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    status: "all",
    page: 1,
    limit: 6,
  });

  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  // --- DELETE MODAL STATE (PERBAIKAN DISINI) ---
  const [deleteId, setDeleteId] = useState(null); // Menyimpan ID banner yang akan dihapus
  const [isDeleting, setIsDeleting] = useState(false); // Loading state saat menghapus

  // Fetch Data
  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      const res = await bannerService.getBanners(filters);
      setBanners(res.data);
      setPagination(res.pagination);
    } catch (error) {
      toast.error("Gagal memuat banner");
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce Search & Filter Effect
  useEffect(() => {
    const timer = setTimeout(() => fetchBanners(), 500);
    return () => clearTimeout(timer);
  }, [filters]);

  // Handlers Simpan
  const handleSave = async (formData) => {
    try {
      if (editData) {
        await bannerService.updateBanner(editData._id, formData);
        toast.success("Banner diperbarui");
      } else {
        await bannerService.createBanner(formData);
        toast.success("Banner berhasil dibuat");
      }
      setIsModalOpen(false);
      setEditData(null);
      fetchBanners();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menyimpan");
    }
  };

  // --- LOGIC HAPUS BARU (TANPA ALERT BROWSER) ---

  // 1. Trigger: Saat tombol tong sampah di klik
  const openDeleteConfirm = (id) => {
    setDeleteId(id); // Simpan ID dan otomatis buka modal karena deleteId tidak null
  };

  // 2. Action: Saat tombol "Ya, Hapus" di modal diklik
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await bannerService.deleteBanner(deleteId);
      toast.success("Banner berhasil dihapus");
      setDeleteId(null); // Tutup modal
      fetchBanners(); // Refresh data
    } catch (error) {
      toast.error("Gagal menghapus data");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <Breadcrumbs />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Banner & Informasi</h1>
          <p className="text-gray-500 text-sm mt-1">
            Kelola pengumuman yang muncul di dashboard client.
          </p>
        </div>
        <button
          onClick={() => {
            setEditData(null);
            setIsModalOpen(true);
          }}
          className="btn bg-blue-800 hover:bg-blue-900 text-white gap-2 shadow-lg w-full md:w-auto"
        >
          <FiPlus /> Buat Banner
        </button>
      </div>

      {/* FILTER BAR */}
      <BannerFilter filters={filters} setFilters={setFilters} />

      {/* CONTENT GRID */}
      {isLoading ? (
        <div className="h-64 flex justify-center items-center">
          <span className="loading loading-spinner text-blue-800"></span>
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
          <FiLayers className="mx-auto text-4xl text-gray-300 mb-3" />
          <p className="text-gray-500">Banner tidak ada/tidak ditemukan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <BannerCard
              key={banner._id}
              banner={banner}
              onEdit={(b) => {
                setEditData(b);
                setIsModalOpen(true);
              }}
              // PERBAIKAN: Panggil fungsi buka modal, bukan window.confirm
              onDelete={(id) => openDeleteConfirm(id)}
            />
          ))}
        </div>
      )}

      {/* PAGINATION */}
      <div className="flex justify-center mt-8">
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={(p) => setFilters({ ...filters, page: p })}
        />
      </div>

      {/* MODAL FORM (Create/Edit) */}
      <BannerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
        initialData={editData}
      />

      {/* --- MODAL KONFIRMASI HAPUS (PROFESIONAL UI) --- */}
      {deleteId && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center transform scale-100 transition-all">
            {/* Icon Warning Besar */}
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 ring-4 ring-red-50">
              <FiAlertTriangle size={32} />
            </div>

            {/* Teks Konfirmasi */}
            <h3 className="text-xl font-bold text-gray-800 mb-2">Hapus Banner?</h3>
            <p className="text-sm text-gray-500 mb-6 px-4 leading-relaxed">
              Banner ini akan dihapus secara permanen dan tidak akan muncul lagi di dashboard
              client.
            </p>

            {/* Tombol Aksi */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteId(null)}
                className="btn btn-ghost flex-1 hover:bg-gray-100 text-gray-600 font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="btn bg-red-600 hover:bg-red-700 text-white flex-1 border-none shadow-md flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  "Ya, Hapus"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerManagement;
