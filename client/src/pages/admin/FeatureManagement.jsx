import { useEffect, useState } from "react";
import toast from "react-hot-toast";

// assets
import { FiPlus, FiSearch, FiLayers, FiAlertTriangle, FiFilter } from "react-icons/fi";

// components
import Breadcrumbs from "../../components/Breadcrumbs";
import Pagination from "../../components/Pagination";
import FeatureCard from "../../components/FeatureCard";
import FeatureModal from "../../components/FeatureModal";

// features
import featureService from "../../services/featureService";
import userService from "../../services/userService";

const FeatureManagement = () => {
  const [features, setFeatures] = useState([]);
  const [companyList, setCompanyList] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalData: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: "",
    company: "",
    limit: 8,
    page: 1,
  });

  const [modalType, setModalType] = useState(null); // 'create', 'edit', 'confirm-delete'
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [featRes, compRes] = await Promise.all([
        featureService.getAllFeatures(filters),
        userService.getCompanies(),
      ]);

      setFeatures(featRes.data);
      setPagination(featRes.pagination);
      setCompanyList(compRes);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data fitur");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchData(), 500);
    return () => clearTimeout(timer);
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleSave = async (payload, iconFile) => {
    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append("title", payload.title);
      submitData.append("assignedTo", payload.assignedTo);
      submitData.append("defaultType", payload.defaultType);
      submitData.append("defaultUrl", payload.defaultUrl);
      submitData.append("defaultSubMenus", payload.defaultSubMenus);

      if (iconFile) {
        submitData.append("icon", iconFile);
      }

      if (modalType === "edit") {
        await featureService.updateFeature(selectedFeature._id, submitData);
        toast.success("Menu berhasil diperbarui");
      } else {
        await featureService.createFeature(submitData);
        toast.success("Menu berhasil dibuat");
      }

      setModalType(null);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Gagal menyimpan data");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await featureService.deleteFeature(selectedFeature._id);
      toast.success("Menu berhasil dihapus");
      setModalType(null);
      fetchData();
    } catch (error) {
      toast.error("Gagal menghapus menu");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <Breadcrumbs />

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Feature Management</h1>
          <p className="text-gray-500 text-sm mt-1">
            Kelola menu dashboard dan akses spesifik per client.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedFeature(null);
            setModalType("create");
          }}
          className="btn bg-[#093050] hover:bg-blue-900 text-white shadow-lg gap-2"
        >
          <FiPlus /> Tambah Menu Client
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search Input */}
        <div className="relative w-full md:w-80 group">
          <FiSearch className="absolute left-3 top-3.5 text-gray-400 z-10" />
          <input
            type="text"
            name="search"
            placeholder="Cari judul menu..."
            className="input input-bordered w-full pl-10 text-sm focus:border-blue-800"
            value={filters.search}
            onChange={handleFilterChange}
          />
        </div>

        {/* Filter & Info */}
        <div className="flex gap-3 w-full md:w-auto items-center">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <FiFilter className="text-gray-400" />
            <select
              name="company"
              className="select select-bordered select-sm w-full md:w-48 text-xs focus:border-blue-800"
              value={filters.company}
              onChange={handleFilterChange}
            >
              <option value="">Semua Perusahaan</option>
              {companyList.map((comp, idx) => (
                <option key={idx} value={comp}>
                  {comp}
                </option>
              ))}
            </select>
          </div>
          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
            Total: <b>{pagination.totalData}</b> Menu
          </span>
        </div>
      </div>

      {/* CONTENT GRID */}
      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <span className="loading loading-spinner text-blue-800"></span>
        </div>
      ) : features.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <FiLayers size={32} />
          </div>
          <h3 className="text-sm text-gray-400">Menu atau fitur tidak ada.</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feat) => (
            <FeatureCard
              key={feat._id}
              feature={feat}
              onEdit={(f) => {
                setSelectedFeature(f);
                setModalType("edit");
              }}
              onDelete={(f) => {
                setSelectedFeature(f);
                setModalType("confirm-delete");
              }}
            />
          ))}
        </div>
      )}

      {/* PAGINATION */}
      <div className="flex justify-center mt-8">
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      <FeatureModal
        type={modalType === "create" ? "create" : "edit"}
        isOpen={modalType === "create" || modalType === "edit"}
        onClose={() => setModalType(null)}
        onSubmit={handleSave}
        initialData={selectedFeature}
        companyList={companyList}
        isSubmitting={isSubmitting}
      />

      {modalType === "confirm-delete" && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center transform scale-100 transition-all">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
              <FiAlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Hapus Menu?</h3>
            <p className="text-gray-500 text-sm mb-6 px-2">
              Menu <b>"{selectedFeature?.title}"</b> akan dihapus secara permanen dan tidak bisa
              diakses lagi oleh client.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setModalType(null)}
                className="btn btn-ghost flex-1 hover:bg-gray-100"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="btn bg-red-500 hover:bg-red-600 text-white flex-1 border-none shadow-md"
                disabled={isSubmitting}
              >
                {isSubmitting ? <span className="loading loading-spinner"></span> : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeatureManagement;
