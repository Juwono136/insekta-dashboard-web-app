import { useEffect, useState, useRef } from "react";
import featureService from "../../services/featureService";
import userService from "../../services/userService";
import { getImageUrl } from "../../utils/imageUrl";
import toast from "react-hot-toast";
import {
  FiTrash2,
  FiEdit3,
  FiPlus,
  FiSearch,
  FiExternalLink,
  FiCheck,
  FiX,
  FiLayers,
  FiAlertTriangle,
  FiInfo,
} from "react-icons/fi";
import Breadcrumbs from "../../components/Breadcrumbs";
import Pagination from "../../components/Pagination";

const FeatureManagement = () => {
  // --- STATE UTAMA (MENU) ---
  const [features, setFeatures] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalData: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", limit: 8, page: 1 });

  // --- STATE MODAL ---
  const [modalType, setModalType] = useState(null);
  const [formData, setFormData] = useState({ title: "", url: "", assignedTo: [] });
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState("");
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- STATE KHUSUS CLIENT LIST (LAZY LOAD & SERVER SEARCH) ---
  const [clientList, setClientList] = useState([]); // Data client yang ditampilkan di modal
  const [clientSearch, setClientSearch] = useState(""); // Keyword pencarian
  const [clientPage, setClientPage] = useState(1); // Halaman saat ini untuk infinite scroll
  const [hasMoreClients, setHasMoreClients] = useState(true); // Cek apakah masih ada data?
  const [isClientLoading, setIsClientLoading] = useState(false);

  // Ref untuk Debounce
  const searchTimeoutRef = useRef(null);

  // --- 1. LOAD DATA FITUR UTAMA ---
  const fetchFeatures = async () => {
    setIsLoading(true);
    try {
      const featRes = await featureService.getAllFeatures(filters);
      setFeatures(featRes.data);
      setPagination(featRes.pagination);
    } catch (error) {
      toast.error("Gagal memuat data fitur");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchFeatures(), 500);
    return () => clearTimeout(timer);
  }, [filters]);

  // --- 2. LOGIC LAZY LOAD CLIENT (PROFESIONAL) ---

  // Fungsi Fetch Client dari Server
  const fetchClients = async (page, search = "", reset = false) => {
    setIsClientLoading(true);
    try {
      const res = await userService.getUsers({
        role: "client",
        page: page,
        limit: 10, // Load 10 user per scroll
        search: search,
      });

      if (reset) {
        setClientList(res.users);
      } else {
        setClientList((prev) => [...prev, ...res.users]); // Append data baru ke bawah
      }

      // Cek apakah masih ada halaman berikutnya
      setHasMoreClients(res.pagination.currentPage < res.pagination.totalPages);
    } catch (error) {
      console.error("Gagal load client", error);
    } finally {
      setIsClientLoading(false);
    }
  };

  // Handle Input Search (Debounce 500ms)
  const handleClientSearchChange = (e) => {
    const value = e.target.value;
    setClientSearch(value);
    setClientPage(1); // Reset ke page 1

    // Clear timeout sebelumnya jika user masih mengetik
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    // Set timeout baru
    searchTimeoutRef.current = setTimeout(() => {
      fetchClients(1, value, true); // Fetch reset=true
    }, 500);
  };

  // Handle Scroll (Infinite Scroll)
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    // Jika scroll sudah mendekati bawah (sisa 10px) dan tidak sedang loading dan masih ada data
    if (scrollHeight - scrollTop <= clientHeight + 10 && !isClientLoading && hasMoreClients) {
      const nextPage = clientPage + 1;
      setClientPage(nextPage);
      fetchClients(nextPage, clientSearch, false); // Fetch append
    }
  };

  // Init Client List saat Modal Dibuka
  useEffect(() => {
    if (modalType === "create" || modalType === "edit") {
      setClientPage(1);
      setClientSearch("");
      fetchClients(1, "", true); // Load awal
    }
  }, [modalType]);

  // --- 3. HANDLERS LAINNYA ---
  const handleFilterChange = (e) =>
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value, page: 1 }));
  const handlePageChange = (newPage) => setFilters((prev) => ({ ...prev, page: newPage }));

  const resetForm = () => {
    setFormData({ title: "", url: "", assignedTo: [] });
    setIconFile(null);
    setIconPreview("");
    setSelectedFeature(null);
    setModalType(null);
  };

  const openCreateModal = () => {
    resetForm();
    setModalType("create");
  };

  const openEditModal = (feat) => {
    setSelectedFeature(feat);
    setFormData({
      title: feat.title,
      url: feat.url,
      assignedTo: feat.assignedTo.map((u) => u._id),
    });
    setIconPreview(getImageUrl(feat.icon));
    setModalType("edit");
  };

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIconFile(file);
      setIconPreview(URL.createObjectURL(file));
    }
  };

  const toggleUserAssign = (userId) => {
    const current = [...formData.assignedTo];
    if (current.includes(userId)) {
      setFormData({ ...formData, assignedTo: current.filter((id) => id !== userId) });
    } else {
      setFormData({ ...formData, assignedTo: [...current, userId] });
    }
  };

  // Select All (Hanya yang sudah ter-load di list)
  const handleSelectAll = () => {
    const allLoadedIds = clientList.map((u) => u._id);
    const isAllLoadedSelected = allLoadedIds.every((id) => formData.assignedTo.includes(id));

    if (isAllLoadedSelected) {
      // Uncheck yang ada di list saat ini
      setFormData((prev) => ({
        ...prev,
        assignedTo: prev.assignedTo.filter((id) => !allLoadedIds.includes(id)),
      }));
    } else {
      // Check semua yang ada di list saat ini
      const newAssigned = [...new Set([...formData.assignedTo, ...allLoadedIds])];
      setFormData((prev) => ({ ...prev, assignedTo: newAssigned }));
    }
  };

  // --- 4. ACTIONS (SAVE/DELETE) ---
  const executeSave = async () => {
    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("url", formData.url);
      submitData.append("assignedTo", JSON.stringify(formData.assignedTo));
      if (iconFile) submitData.append("icon", iconFile);

      if (selectedFeature) {
        await featureService.updateFeature(selectedFeature._id, submitData);
        toast.success("Menu berhasil diupdate");
      } else {
        await featureService.createFeature(submitData);
        toast.success("Menu berhasil dibuat");
      }
      resetForm();
      fetchFeatures();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menyimpan");
      setModalType(selectedFeature ? "edit" : "create");
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeDelete = async () => {
    setIsSubmitting(true);
    try {
      await featureService.deleteFeature(selectedFeature._id);
      toast.success("Menu dihapus");
      resetForm();
      fetchFeatures();
    } catch (error) {
      toast.error("Gagal hapus");
      setModalType(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreSubmit = (e) => {
    e.preventDefault();
    if (!selectedFeature && !iconFile) return toast.error("Icon wajib diupload");
    setModalType("confirm-save");
  };

  // --- RENDER UI ---
  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <Breadcrumbs />

      {/* HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Feature Management</h1>
          <p className="text-gray-500 text-sm mt-1">Atur menu dan akses dashboard client.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn bg-blue-800 hover:bg-blue-900 text-white shadow-lg shadow-blue-800/20 gap-2"
        >
          <FiPlus /> Tambah Menu Baru
        </button>
      </div>

      {/* FILTER HALAMAN UTAMA */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <FiSearch className="text-gray-400 group-focus-within:text-blue-800 transition-colors" />
          </div>
          <input
            type="text"
            name="search"
            placeholder="Cari judul menu..."
            className="input input-bordered w-full pl-10 h-10 focus:border-blue-800 text-sm"
            value={filters.search}
            onChange={handleFilterChange}
          />
        </div>
        <div className="text-xs text-gray-500 flex items-center gap-1">
          <FiInfo /> Menampilkan <b>{features.length}</b> dari <b>{pagination.totalData}</b> menu.
        </div>
      </div>

      {/* GRID MENU LIST */}
      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <span className="loading loading-spinner text-blue-800"></span>
        </div>
      ) : features.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <FiLayers className="mx-auto text-4xl text-gray-300 mb-3" />
          <p className="text-gray-500">Belum ada menu fitur dibuat.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feat) => (
            <div
              key={feat._id}
              className="card bg-white shadow-sm border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full"
            >
              <div className="card-body p-5 flex flex-col h-full">
                {/* Icon */}
                <div className="flex justify-between items-start mb-4">
                  <div className="w-16 h-16 bg-linear-to-br from-blue-50 to-white rounded-2xl flex items-center justify-center border border-blue-100 p-2 shadow-inner">
                    <img
                      src={getImageUrl(feat.icon)}
                      alt="icon"
                      className="w-full h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex gap-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(feat)}
                      className="btn btn-square btn-sm btn-ghost text-blue-600 hover:bg-blue-50 tooltip tooltip-left"
                      data-tip="Edit"
                    >
                      <FiEdit3 size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedFeature(feat);
                        setModalType("confirm-delete");
                      }}
                      className="btn btn-square btn-sm btn-ghost text-red-500 hover:bg-red-50 tooltip tooltip-left"
                      data-tip="Hapus"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
                {/* Title */}
                <div className="mb-auto">
                  <h3
                    className="font-bold text-blue-900 text-lg leading-snug mb-2 capitalize line-clamp-2"
                    title={feat.title}
                  >
                    {feat.title}
                  </h3>
                  <a
                    href={feat.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 flex items-center gap-1 hover:underline mb-4 truncate bg-blue-50 px-2 py-1 rounded w-fit max-w-full"
                  >
                    <FiExternalLink size={10} /> Buka Link
                  </a>
                </div>
                {/* Assigned Info */}
                <div className="pt-4 mt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                    <span className="font-semibold uppercase tracking-wider text-[10px] text-gray-400">
                      Akses Client
                    </span>
                    <span className="bg-gray-100 px-2.5 py-1 rounded-full font-medium text-gray-600">
                      {feat.assignedTo.length} User
                    </span>
                  </div>
                  <div className="flex -space-x-2 overflow-hidden pl-1">
                    {feat.assignedTo.slice(0, 5).map((u) => (
                      <div
                        key={u._id}
                        className="avatar placeholder border-2 border-white rounded-full ring-1 ring-gray-100 tooltip tooltip-top"
                        data-tip={u.name}
                      >
                        <div className="bg-blue-100 rounded-full border-blue-900 border-2 text-blue-800 w-7 h-7 text-[10px]">
                          <img src={getImageUrl(u.avatar) || u.avatar} alt="image-profile" />
                        </div>
                      </div>
                    ))}
                    {feat.assignedTo.length > 5 && (
                      <div className="avatar placeholder border-2 border-white rounded-full ring-1 ring-gray-100">
                        <div className="bg-gray-800 text-white w-7 h-7 text-[9px]">
                          +{feat.assignedTo.length - 5}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center mt-8">
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {/* --- MODAL CREATE / EDIT --- */}
      {(modalType === "create" || modalType === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                {modalType === "create" ? "Tambah Menu Baru" : "Edit Menu Fitur"}
              </h3>
              <button
                onClick={resetForm}
                className="btn btn-sm btn-circle btn-ghost text-gray-400 hover:text-gray-600"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form id="featureForm" onSubmit={handlePreSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-control">
                    <label className="label font-semibold text-gray-700 text-sm">
                      Judul Menu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full focus:border-blue-800"
                      placeholder="Contoh: Laporan Bulanan"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label font-semibold text-gray-700 text-sm">
                      Link URL / GDrive <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      className="input input-bordered w-full focus:border-blue-800"
                      placeholder="https://..."
                      required
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label font-semibold text-gray-700 text-sm">Ikon Menu</label>
                  <div className="flex items-center gap-4 border rounded-xl p-3 bg-gray-50 border-gray-200">
                    <div className="w-16 h-16 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-sm shrink-0">
                      {iconPreview ? (
                        <img
                          src={iconPreview}
                          alt="prev"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <FiLayers className="text-gray-300 text-2xl" />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        className="file-input file-input-bordered file-input-sm w-full mb-1"
                        accept="image/*"
                        onChange={handleIconChange}
                      />
                      <p className="text-[10px] text-gray-500">
                        Format: PNG/JPG. Disarankan icon transparan.
                      </p>
                    </div>
                  </div>
                </div>

                {/* SECTION AKSES CLIENT (IMPROVED: LAZY LOAD + SERVER SEARCH) */}
                <div className="form-control">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-2 gap-2">
                    <label className="label font-semibold text-gray-700 text-sm py-0">
                      Akses Client
                    </label>

                    {/* Input Search Client (FIX ICON Z-INDEX) */}
                    <div className="relative w-full sm:w-64 group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-20">
                        <FiSearch className="text-gray-400 text-xs group-focus-within:text-blue-800 transition-colors" />
                      </div>
                      <input
                        type="text"
                        placeholder="Cari nama client..."
                        className="input input-bordered input-sm w-full pl-9 text-xs rounded-lg focus:border-blue-800"
                        value={clientSearch}
                        onChange={handleClientSearchChange}
                      />
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col h-60">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                      <label className="flex items-center gap-2 cursor-pointer hover:text-blue-800 transition-colors">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-xs checkbox-primary rounded"
                          onChange={handleSelectAll}
                          // Checked jika semua client yg TAMPIL sudah terpilih
                          checked={
                            clientList.length > 0 &&
                            clientList.every((u) => formData.assignedTo.includes(u._id))
                          }
                        />
                        <span className="text-xs font-bold text-gray-600 select-none">
                          Pilih Tampil
                        </span>
                      </label>
                      <span className="text-[10px] text-gray-400">
                        Dipilih: {formData.assignedTo.length} Client
                      </span>
                    </div>

                    {/* List Scrollable dengan Infinite Scroll */}
                    <div
                      className="flex-1 overflow-y-auto p-2 bg-white custom-scrollbar"
                      onScroll={handleScroll} // Trigger Lazy Load
                    >
                      {clientList.length === 0 && !isClientLoading ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xs">
                          <FiSearch className="mb-1 text-lg" /> Client tidak ditemukan.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {clientList.map((u) => (
                            <label
                              key={u._id}
                              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all border ${
                                formData.assignedTo.includes(u._id)
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-transparent hover:bg-gray-50"
                              }`}
                            >
                              <input
                                type="checkbox"
                                className="checkbox checkbox-primary checkbox-xs rounded"
                                checked={formData.assignedTo.includes(u._id)}
                                onChange={() => toggleUserAssign(u._id)}
                              />
                              <div className="flex items-center gap-2 overflow-hidden w-full">
                                <div className="avatar placeholder w-6 h-6 shrink-0">
                                  <div className="bg-blue-200 text-blue-800 rounded-full w-full text-[10px]">
                                    <img
                                      src={getImageUrl(u.avatar) || u.avatar}
                                      alt="image-profile"
                                    />
                                  </div>
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-xs font-medium text-gray-700 truncate">
                                    {u.name}
                                  </span>
                                  <span className="text-[10px] text-gray-400 truncate">
                                    {u.email}
                                  </span>
                                </div>
                              </div>
                            </label>
                          ))}
                          {/* Loader saat Fetch Next Page */}
                          {isClientLoading && (
                            <div className="col-span-full py-2 text-center">
                              <span className="loading loading-spinner loading-xs text-blue-800"></span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex gap-3 justify-end">
              <button onClick={resetForm} className="btn btn-ghost text-gray-500">
                Batal
              </button>
              <button
                form="featureForm"
                type="submit"
                className="btn bg-blue-800 hover:bg-blue-900 text-white px-8 shadow-lg shadow-blue-800/20"
              >
                {modalType === "create" ? "Lanjut Simpan" : "Lanjut Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {(modalType === "confirm-save" || modalType === "confirm-delete") && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 transform scale-100 transition-all">
            <div className="text-center">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  modalType === "confirm-delete"
                    ? "bg-red-100 text-red-500"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {modalType === "confirm-delete" ? (
                  <FiAlertTriangle size={32} />
                ) : (
                  <FiCheck size={32} />
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {modalType === "confirm-delete" ? "Hapus Menu?" : "Konfirmasi Simpan?"}
              </h3>
              <p className="text-gray-500 text-sm mb-6 px-4">
                {modalType === "confirm-delete"
                  ? `Menu "${selectedFeature?.title}" akan dihapus permanen.`
                  : "Pastikan data menu dan akses client sudah benar."}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() =>
                    modalType === "confirm-delete"
                      ? resetForm()
                      : setModalType(selectedFeature ? "edit" : "create")
                  }
                  className="btn btn-ghost flex-1 hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  onClick={modalType === "confirm-delete" ? executeDelete : executeSave}
                  className={`btn flex-1 border-none text-white ${
                    modalType === "confirm-delete"
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-blue-800 hover:bg-blue-900"
                  }`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    "Ya, Lanjutkan"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeatureManagement;
