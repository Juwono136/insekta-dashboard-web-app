import { useEffect, useState } from "react";
import userService from "../../services/userService";
import toast from "react-hot-toast";
import {
  FiTrash2,
  FiPlus,
  FiSearch,
  FiMail,
  FiEdit3,
  FiFilter,
  FiCheckCircle,
  FiX,
  FiInfo,
} from "react-icons/fi";
import Breadcrumbs from "../../components/Breadcrumbs";
import Pagination from "../../components/Pagination";
import { getImageUrl } from "../../utils/imageUrl";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalUsers: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: "",
    role: "",
    limit: 5, // Default 5
    page: 1,
  });

  const [modalType, setModalType] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "client",
    companyName: "",
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await userService.getUsers(filters);
      setUsers(res.users);
      setPagination(res.pagination);
    } catch (error) {
      toast.error("Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", role: "client", companyName: "", isActive: true });
    setSelectedUser(null);
    setModalType(null);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      companyName: user.companyName || "",
      isActive: user.isActive,
    });
    setModalType("edit");
  };

  const executeDelete = async () => {
    try {
      await userService.deleteUser(selectedUser._id);
      toast.success("User dihapus");
      fetchUsers();
    } catch (error) {
      toast.error("Gagal hapus");
    } finally {
      resetForm();
    }
  };

  const executeSave = async () => {
    setIsSubmitting(true);
    try {
      if (modalType === "confirm-create") {
        await userService.createUser(formData);
        toast.success("User baru ditambahkan");
      } else if (modalType === "confirm-update") {
        await userService.updateUser(selectedUser._id, formData);
        toast.success("Data user diperbarui");
      }
      fetchUsers();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menyimpan");
      setModalType(modalType === "confirm-create" ? "create" : "edit");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreSubmit = (e) => {
    e.preventDefault();
    setModalType(modalType === "create" ? "confirm-create" : "confirm-update");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Breadcrumbs />

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-left">
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-500 text-sm mt-1">
            Kelola akses pengguna, role, dan status akun.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setModalType("create");
          }}
          className="btn bg-blue-800 hover:bg-blue-900 text-white shadow-lg shadow-blue-800/20 gap-2"
        >
          <FiPlus /> Tambah User
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-4">
        {/* Baris Filter */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-72 group">
            {/* PERBAIKAN 1: Icon Search Z-Index */}
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
              <FiSearch className="text-gray-400 group-focus-within:text-blue-800 transition-colors" />
            </div>
            <input
              type="text"
              name="search"
              placeholder="Cari nama / email..."
              className="input input-bordered w-full pl-10 h-10 focus:border-blue-800 text-sm"
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <FiFilter className="text-gray-400" />
              <select
                name="role"
                className="select select-bordered select-sm w-32 text-xs"
                value={filters.role}
                onChange={handleFilterChange}
              >
                <option value="">Semua Role</option>
                <option value="admin">Admin</option>
                <option value="client">Client</option>
              </select>
            </div>

            <select
              name="limit"
              className="select select-bordered select-sm w-24 text-xs"
              value={filters.limit}
              onChange={handleFilterChange}
            >
              {/* PERBAIKAN 5: Opsi 1 Baris untuk Testing */}
              <option value="1">1 Baris (Test)</option>
              <option value="5">5 Baris</option>
              <option value="10">10 Baris</option>
              <option value="20">20 Baris</option>
            </select>
          </div>
        </div>

        {/* PERBAIKAN 3: Informasi Jumlah Data */}
        <div className="text-xs text-gray-500 px-1 flex items-center gap-1">
          <FiInfo /> Menampilkan <span className="font-bold text-gray-700">{users.length}</span>{" "}
          dari total <span className="font-bold text-gray-700">{pagination.totalUsers}</span> user.
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <span className="loading loading-spinner text-blue-800"></span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider font-semibold">
                <tr>
                  {/* PERBAIKAN 3: Kolom No */}
                  <th className="w-12 text-center">No</th>
                  <th className="py-4 pl-4">User Info</th>
                  <th>Role & Perusahaan</th>
                  <th>Status</th>
                  <th>Tanggal Gabung</th>
                  <th className="text-right pr-6">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-gray-400">
                      Data tidak ditemukan
                    </td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                    <tr key={user._id} className="hover:bg-blue-50/50 transition-colors">
                      {/* PERBAIKAN 3: Hitung Nomor Urut */}
                      <td className="text-center text-gray-400 font-mono text-xs">
                        {(pagination.currentPage - 1) * filters.limit + index + 1}
                      </td>
                      <td className="pl-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="avatar placeholder">
                            <div className="bg-blue-100 text-blue-800 rounded-full w-10 h-10 ring-2 ring-white shadow-sm">
                              {user.avatar && user.avatar.startsWith("/") ? (
                                <img
                                  src={getImageUrl(user.avatar)}
                                  alt="image-profile"
                                  className="object-cover"
                                />
                              ) : (
                                <img src={user.avatar} alt="avatar" />
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="font-bold text-gray-800">{user.name}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <FiMail size={10} /> {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-col gap-1">
                          <span
                            className={`badge ${
                              user.role === "admin" ? "badge-primary" : "badge-warning text-white"
                            } badge-sm uppercase font-bold border-none shadow-sm w-fit`}
                          >
                            {user.role}
                          </span>
                          {user.companyName && (
                            <span className="text-xs text-gray-500">{user.companyName}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        {user.isFirstLogin ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-semibold border border-orange-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>{" "}
                            New
                          </span>
                        ) : !user.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 text-red-600 text-xs font-semibold border border-red-100">
                            Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-600 text-xs font-semibold border border-green-100">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="text-gray-500 font-medium">
                        {new Date(user.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="text-right pr-6">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="btn btn-square btn-sm btn-ghost text-blue-600 hover:bg-blue-50 tooltip tooltip-left"
                            data-tip="Edit User"
                          >
                            <FiEdit3 />
                          </button>
                          {user.role !== "admin" && (
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setModalType("confirm-delete");
                              }}
                              className="btn btn-square btn-sm btn-ghost text-red-500 hover:bg-red-50 tooltip tooltip-left"
                              data-tip="Hapus User"
                            >
                              <FiTrash2 />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t border-gray-200">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* FORM MODAL (Create / Edit) */}
      {(modalType === "create" || modalType === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                {modalType === "create" ? (
                  <FiPlus className="text-blue-800" />
                ) : (
                  <FiEdit3 className="text-orange-500" />
                )}
                {modalType === "create" ? "Tambah User Baru" : "Edit Data User"}
              </h3>
              <button
                onClick={resetForm}
                className="btn btn-sm btn-circle btn-ghost text-gray-400 hover:text-gray-600"
              >
                <FiX size={20} />
              </button>
            </div>

            <form
              id="userForm"
              onSubmit={handlePreSubmit}
              className="space-y-4 overflow-y-auto px-1"
            >
              <div className="form-control">
                <label className="label font-semibold text-gray-700 text-sm">
                  Nama Lengkap {modalType === "create" && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  className={`input input-bordered w-full ${
                    modalType === "edit"
                      ? "bg-gray-100 cursor-not-allowed"
                      : "focus:border-blue-800"
                  }`}
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  // PERBAIKAN 4: Disable Nama saat Edit
                  disabled={modalType === "edit"}
                />
                {modalType === "edit" && (
                  <span className="text-[10px] text-gray-400 mt-1">
                    Nama hanya bisa diubah oleh user sendiri.
                  </span>
                )}
              </div>

              <div className="form-control">
                <label className="label font-semibold text-gray-700 text-sm">
                  Email {modalType === "create" && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="email"
                  className={`input input-bordered w-full text-gray-500 ${
                    modalType === "create" ? "" : "bg-gray-100 cursor-not-allowed"
                  }`}
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={modalType === "edit"}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pb-4">
                <div className="form-control">
                  <label className="label font-semibold text-gray-700 text-sm">Role</label>
                  <select
                    className="select select-bordered w-full"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="client">Client</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label font-semibold text-gray-700 text-sm">Perusahaan</label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="Opsional"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  />
                </div>
              </div>

              {modalType === "edit" && (
                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-3">
                    <span className="label-text font-semibold text-gray-700 text-sm">
                      Status Akun:
                    </span>
                    <input
                      type="checkbox"
                      className="toggle toggle-success"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    <span
                      className={`text-sm font-bold ${
                        formData.isActive ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {formData.isActive ? "Aktif" : "Suspended"}
                    </span>
                  </label>
                </div>
              )}
            </form>

            <div className="flex gap-3 pt-6 mt-2">
              <button onClick={resetForm} className="btn btn-ghost flex-1">
                Batal
              </button>
              <button
                form="userForm"
                type="submit"
                className="btn bg-blue-800 hover:bg-blue-900 text-white flex-1 shadow-lg shadow-blue-800/20"
              >
                Lanjut
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL (Sama seperti sebelumnya) */}
      {(modalType === "confirm-delete" ||
        modalType === "confirm-create" ||
        modalType === "confirm-update") && (
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
                  <FiTrash2 size={32} />
                ) : (
                  <FiCheckCircle size={32} />
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {modalType === "confirm-delete" ? "Hapus User?" : "Konfirmasi Simpan?"}
              </h3>
              <p className="text-gray-500 text-sm mb-6 px-4">
                {modalType === "confirm-delete"
                  ? `Anda yakin ingin menghapus user ${selectedUser?.name}?`
                  : "Pastikan data yang Anda masukkan sudah benar."}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() =>
                    modalType.includes("delete")
                      ? resetForm()
                      : setModalType(modalType === "confirm-create" ? "create" : "edit")
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

export default UserManagement;
