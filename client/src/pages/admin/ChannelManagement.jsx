import { useEffect, useState } from "react";
import toast from "react-hot-toast";

// assets
import { FiPlus, FiSearch, FiMonitor, FiAlertTriangle } from "react-icons/fi";

// components
import Breadcrumbs from "../../components/Breadcrumbs";
import Pagination from "../../components/Pagination";
import ChannelCard from "../../components/channel/ChannelCard";
import ChannelModal from "../../components/channel/ChannelModal";

// features
import channelService from "../../services/channelService";

const ChannelManagement = () => {
  const [channels, setChannels] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchChannels = async () => {
    setIsLoading(true);
    try {
      const res = await channelService.getChannels({
        search,
        page: pagination.currentPage,
        limit: 6,
      });
      setChannels(res.data);
      setPagination(res.pagination);
    } catch (error) {
      toast.error("Gagal memuat kanal");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchChannels(), 500);
    return () => clearTimeout(timer);
  }, [search, pagination.currentPage]);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editData) await channelService.updateChannel(editData._id, formData);
      else await channelService.createChannel(formData);

      toast.success("Berhasil disimpan");
      setIsModalOpen(false);
      setEditData(null);
      fetchChannels();
    } catch (err) {
      toast.error("Gagal menyimpan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await channelService.deleteChannel(deleteId);
      toast.success("Kanal berhasil dihapus");
      setDeleteId(null);
      fetchChannels();
    } catch (e) {
      toast.error("Gagal menghapus kanal");
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteModal = (id) => {
    setDeleteId(id);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <Breadcrumbs />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Kanal Insekta</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola portal website dan dashboard Insekta.</p>
        </div>
        <button
          onClick={() => {
            setEditData(null);
            setIsModalOpen(true);
          }}
          className="btn bg-[#093050] hover:bg-blue-900 text-white gap-2 shadow-lg w-full md:w-auto"
        >
          <FiPlus /> Tambah Kanal
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative max-w-md">
          <FiSearch className="absolute z-10 left-3 top-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama kanal..."
            className="input input-bordered w-full pl-10 focus:border-blue-600"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Content Grid */}
      {isLoading ? (
        <div className="h-64 flex justify-center items-center">
          <span className="loading loading-spinner text-blue-800"></span>
        </div>
      ) : channels.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
          <FiMonitor className="mx-auto text-4xl text-gray-300 mb-3" />
          <p className="text-gray-500">Tidak ada kanal ditemukan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {channels.map((channel) => (
            <ChannelCard
              key={channel._id}
              channel={channel}
              onEdit={(c) => {
                setEditData(c);
                setIsModalOpen(true);
              }}
              onDelete={() => openDeleteModal(channel._id)}
            />
          ))}
        </div>
      )}

      <div className="flex justify-center mt-8">
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={(p) => setPagination({ ...pagination, currentPage: p })}
        />
      </div>

      <ChannelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editData}
        isSubmitting={isSubmitting}
      />

      {deleteId && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center transform scale-100 transition-all">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 ring-4 ring-red-50">
              <FiAlertTriangle size={32} />
            </div>

            {/* Teks Konfirmasi */}
            <h3 className="text-xl font-bold text-gray-800 mb-2">Hapus Kanal?</h3>
            <p className="text-sm text-gray-500 mb-6 px-4 leading-relaxed">
              Data kanal ini akan dihapus secara permanen dari sistem.
            </p>

            {/* Tombol Aksi */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteId(null)}
                className="btn btn-ghost flex-1 hover:bg-gray-100 text-gray-600 font-medium"
                disabled={isDeleting}
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

export default ChannelManagement;
