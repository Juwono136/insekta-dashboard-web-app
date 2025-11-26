import { FiEdit2, FiTrash2, FiPhone, FiMapPin, FiBriefcase, FiUsers, FiUser } from "react-icons/fi";
import { getImageUrl } from "../../utils/imageUrl";
import Pagination from "../../components/Pagination";

const TeamTable = ({ teams, pagination, onPageChange, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider font-semibold">
            <tr>
              <th className="py-4 pl-6">Profil & Kontak</th>
              <th>Area Kerja</th>
              <th>Outlet</th>
              <th className="text-right pr-6">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100">
            {teams.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan="4" className="text-center py-16 text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <FiUsers size={32} className="opacity-30" />
                    <p>Data tim tidak ada.</p>
                  </div>
                </td>
              </tr>
            ) : (
              // Data Row
              teams.map((team) => (
                <tr key={team._id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="pl-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="w-10 h-10 rounded-full ring-1 ring-gray-200 bg-gray-100 flex items-center justify-center">
                          {team.photo ? (
                            <img
                              src={getImageUrl(team.photo)}
                              alt={team.name}
                              className="object-cover"
                            />
                          ) : (
                            <FiUser className="text-gray-400" />
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-gray-800">{team.name}</div>
                        <div className="flex gap-1.5 md:gap-2 flex-col md:flex-row justify-center md:items-center">
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <FiBriefcase size={10} /> {team.role}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <FiPhone size={10} /> {team.phone}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                      <FiMapPin size={10} /> {team.area}
                    </span>
                  </td>
                  <td className="max-w-xs">
                    <p className="text-xs text-gray-600 truncate" title={team.outlets}>
                      {team.outlets || (
                        <span className="text-gray-400 italic">Tidak ada outlet</span>
                      )}
                    </p>
                  </td>
                  <td className="text-right pr-6">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onEdit(team)}
                        className="btn btn-square btn-sm btn-ghost text-blue-600 hover:bg-blue-50 tooltip tooltip-left"
                        data-tip="Edit"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => onDelete(team)}
                        className="btn btn-square btn-sm btn-ghost text-red-500 hover:bg-red-50 tooltip tooltip-left"
                        data-tip="Hapus"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {teams.length > 0 && (
        <div className="p-4 border-t border-gray-100">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default TeamTable;
