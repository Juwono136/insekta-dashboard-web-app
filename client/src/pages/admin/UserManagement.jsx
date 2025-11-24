import { useEffect, useState } from "react";
import userService from "../../services/userService";
import toast from "react-hot-toast";
import { FiPlus, FiSearch, FiFilter, FiInfo, FiTrash2, FiCheckCircle } from "react-icons/fi";
import Breadcrumbs from "../../components/Breadcrumbs";
import Pagination from "../../components/Pagination";

// Import Komponen Modular
import UserTable from "../../components/UserTable";
import UserModal from "../../components/UserModal";

const UserManagement = () => {
  // --- STATE ---
  const [users, setUsers] = useState([]);
  const [companyList, setCompanyList] = useState([]); // List Perusahaan
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalUsers: 0 });
  const [filters, setFilters] = useState({ search: "", role: "", limit: 5, page: 1 });
  const [isLoading, setIsLoading] = useState(true);

  // Modal Controls
  const [modalType, setModalType] = useState(null); // 'create' | 'edit' | 'confirm-create' | 'confirm-update' | 'confirm-delete'
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState(null); // Data sementara dari modal
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- FETCH DATA ---
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await userService.getUsers(filters);
      setUsers(res.users);
      setPagination(res.pagination);
    } catch (error) {
      toast.error("Gagal load data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const data = await userService.getCompanies();
      setCompanyList(data);
    } catch (error) {
      // Silent error agar tidak mengganggu UX
      console.error("Gagal load perusahaan");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchData(), 500);
    return () => clearTimeout(timer);
  }, [filters]);

  useEffect(() => {
    fetchCompanies();
  }, []);

  // --- HANDLERS ---
  // Menerima data dari UserModal, lalu buka Konfirmasi
  const handleFormSubmit = (data) => {
    setFormData(data);
    setModalType(modalType === "create" ? "confirm-create" : "confirm-update");
  };

  // Eksekusi ke Backend (Setelah Konfirmasi)
  const executeSave = async () => {
    setIsSubmitting(true);
    try {
      if (modalType === "confirm-create") {
        await userService.createUser(formData);
        toast.success("User berhasil dibuat!");
      } else {
        await userService.updateUser(selectedUser._id, formData);
        toast.success("User berhasil diupdate!");
      }
      setModalType(null);
      fetchData();
      fetchCompanies(); // Refresh list perusahaan
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menyimpan");
      // Kembali ke form jika gagal
      setModalType(modalType === "confirm-create" ? "create" : "edit");
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeDelete = async () => {
    setIsSubmitting(true);
    try {
      await userService.deleteUser(selectedUser._id);
      toast.success("User dihapus");
      setModalType(null);
      fetchData();
    } catch (error) {
      toast.error("Gagal hapus");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <Breadcrumbs />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-500 text-sm mt-1">
            Kelola akses pengguna, role, dan status akun.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedUser(null);
            setFormData(null);
            setModalType("create");
          }}
          className="btn bg-blue-800 hover:bg-blue-900 text-white shadow-lg gap-2"
        >
          <FiPlus /> Tambah User
        </button>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-72 group">
          <FiSearch className="absolute left-3 top-3.5 text-gray-400 z-10" />
          <input
            type="text"
            placeholder="Cari nama / email..."
            className="input input-bordered w-full pl-10 h-10 text-sm"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-400" />
            <select
              className="select select-bordered select-sm w-32 text-xs"
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })}
            >
              <option value="">Semua Role</option>
              <option value="admin">Admin</option>
              <option value="client">Client</option>
            </select>
          </div>
          <select
            className="select select-bordered select-sm w-24 text-xs"
            value={filters.limit}
            onChange={(e) => setFilters({ ...filters, limit: e.target.value, page: 1 })}
          >
            <option value="5">5 Baris</option>
            <option value="10">10 Baris</option>
            <option value="25">25 Baris</option>
          </select>
        </div>
      </div>

      <div className="text-xs text-gray-500 px-1 flex items-center gap-1">
        <FiInfo /> Total: <b>{pagination.totalUsers}</b> user.
      </div>

      {/* TABEL USER (MODULAR) */}
      {isLoading ? (
        <div className="h-64 flex justify-center items-center">
          <span className="loading loading-spinner text-blue-800"></span>
        </div>
      ) : (
        <UserTable
          users={users}
          pagination={pagination}
          filters={filters}
          onEdit={(user) => {
            setSelectedUser(user);
            setFormData(user);
            setModalType("edit");
          }}
          onDelete={(user) => {
            setSelectedUser(user);
            setModalType("confirm-delete");
          }}
        />
      )}

      <div className="p-4 border-t border-gray-200">
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={(p) => setFilters({ ...filters, page: p })}
        />
      </div>

      {/* MODAL FORM (MODULAR) */}
      <UserModal
        type={modalType === "create" ? "create" : "edit"}
        isOpen={modalType === "create" || modalType === "edit"}
        onClose={() => setModalType(null)}
        onSubmit={handleFormSubmit}
        initialData={formData} // Kirim data existing untuk edit
        companyList={companyList} // Kirim list perusahaan untuk combobox
      />

      {/* MODAL KONFIRMASI (Reusable Logic) */}
      {modalType?.startsWith("confirm") && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                modalType === "confirm-delete"
                  ? "bg-red-100 text-red-500"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {modalType === "confirm-delete" ? (
                <FiTrash2 size={32} />
              ) : (
                <FiCheckCircle size={32} />
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {modalType === "confirm-delete" ? "Hapus User?" : "Konfirmasi Simpan?"}
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              {modalType === "confirm-delete"
                ? `Yakin hapus ${selectedUser?.name}?`
                : "Pastikan data sudah benar."}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() =>
                  setModalType(
                    modalType === "confirm-create"
                      ? "create"
                      : modalType === "confirm-update"
                      ? "edit"
                      : null
                  )
                }
                className="btn btn-ghost flex-1"
              >
                Batal
              </button>
              <button
                onClick={modalType === "confirm-delete" ? executeDelete : executeSave}
                className={`btn flex-1 text-white ${
                  modalType === "confirm-delete" ? "bg-red-500" : "bg-blue-800"
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? <span className="loading loading-spinner"></span> : "Ya, Lanjutkan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
