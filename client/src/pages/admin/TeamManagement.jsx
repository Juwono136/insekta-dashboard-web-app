import { useEffect, useState } from "react";
import teamService from "../../services/teamService";
import toast from "react-hot-toast";
import { FiPlus, FiSearch, FiUsers, FiAlertTriangle } from "react-icons/fi";
import Breadcrumbs from "../../components/Breadcrumbs";

// Import Modular Components
import TeamTable from "../../components/team/TeamTable";
import TeamModal from "../../components/team/TeamModal";

const TeamManagement = () => {
  // --- STATE ---
  const [teams, setTeams] = useState([]);
  const [areaList, setAreaList] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal State
  const [modalType, setModalType] = useState(null); // 'create' | 'edit' | 'delete'
  const [selectedTeam, setSelectedTeam] = useState(null);

  // --- FETCH DATA ---
  const fetchTeams = async () => {
    setIsLoading(true);
    try {
      const res = await teamService.getTeams({ search, page: pagination.currentPage, limit: 8 });
      setTeams(res.data);
      setPagination({
        ...pagination,
        totalPages: res.pagination.totalPages,
        total: res.pagination.total,
      });
    } catch (error) {
      toast.error("Gagal load data tim");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAreas = async () => {
    try {
      const data = await teamService.getAreas();
      setAreaList(data);
    } catch (e) {
      console.error("Gagal area");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchTeams(), 500);
    return () => clearTimeout(timer);
  }, [search, pagination.currentPage]);

  useEffect(() => {
    fetchAreas();
  }, []);

  // --- ACTION HANDLERS ---

  // Menangani Save (Create/Edit) dari Modal
  const handleSave = async (formDataRaw, photoFile) => {
    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.keys(formDataRaw).forEach((key) => data.append(key, formDataRaw[key]));
      if (photoFile) data.append("photo", photoFile);

      if (modalType === "edit") {
        await teamService.updateTeam(selectedTeam._id, data);
        toast.success("Data tim diperbarui");
      } else {
        await teamService.createTeam(data);
        toast.success("Anggota tim ditambahkan");
      }
      setModalType(null);
      fetchTeams();
      fetchAreas();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menyimpan");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Menangani Delete
  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await teamService.deleteTeam(selectedTeam._id);
      toast.success("Dihapus");
      setModalType(null);
      fetchTeams();
    } catch (error) {
      toast.error("Gagal hapus");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <Breadcrumbs />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Team Management</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola teknisi, area kerja, dan data outlet.</p>
        </div>
        <button
          onClick={() => {
            setSelectedTeam(null);
            setModalType("create");
          }}
          className="btn bg-blue-800 hover:bg-blue-900 text-white gap-2 shadow-lg w-full md:w-auto"
        >
          <FiPlus /> Tambah Anggota
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-80 group">
          <FiSearch className="absolute z-10 left-3 top-3.5 text-gray-400 group-focus-within:text-blue-600" />
          <input
            type="text"
            placeholder="Cari nama atau area..."
            className="input input-bordered w-full pl-10 text-sm focus:border-blue-600"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 w-full md:w-auto justify-end">
          <FiUsers /> Total: <span className="font-bold text-gray-800">{pagination.total}</span>{" "}
          Anggota
        </div>
      </div>

      {/* Table Component */}
      {isLoading ? (
        <div className="h-64 flex justify-center items-center">
          <span className="loading loading-spinner text-blue-800"></span>
        </div>
      ) : (
        <TeamTable
          teams={teams}
          pagination={pagination}
          onPageChange={(p) => setPagination({ ...pagination, currentPage: p })}
          onEdit={(team) => {
            setSelectedTeam(team);
            setModalType("edit");
          }}
          onDelete={(team) => {
            setSelectedTeam(team);
            setModalType("delete");
          }}
        />
      )}

      {/* Modal Form Component */}
      <TeamModal
        isOpen={modalType === "create" || modalType === "edit"}
        type={modalType === "create" ? "create" : "edit"}
        onClose={() => setModalType(null)}
        onSubmit={handleSave}
        initialData={selectedTeam}
        areaList={areaList}
      />

      {/* Delete Confirmation (Simple Inline Modal) */}
      {modalType === "delete" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
              <FiAlertTriangle size={32} />
            </div>
            <h3 className="font-bold text-xl text-gray-800 mb-2">Hapus Anggota?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Data {selectedTeam?.name} akan dihapus permanen.
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
                disabled={isSubmitting}
                className="btn bg-red-500 hover:bg-red-600 text-white flex-1 border-none shadow-md"
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

export default TeamManagement;
