import { FiMail, FiEdit3, FiTrash2, FiBriefcase } from "react-icons/fi";
import { getImageUrl } from "../utils/imageUrl";

const UserTable = ({ users, pagination, filters, onEdit, onDelete }) => {
  if (users.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center text-gray-400">
        Data tidak ditemukan
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider font-semibold">
            <tr>
              <th className="w-12 text-center">No</th>
              <th className="py-4 pl-4">User Info</th>
              <th>Role & Perusahaan</th>
              <th>Status</th>
              <th>Tanggal Gabung</th>
              <th className="text-right pr-6">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100">
            {users.map((user, index) => (
              <tr key={user._id} className="hover:bg-blue-50/50 transition-colors">
                <td className="text-center text-gray-400 font-mono text-xs">
                  {(pagination.currentPage - 1) * filters.limit + index + 1}
                </td>
                <td className="pl-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="avatar placeholder">
                      <div className="bg-blue-100 text-blue-800 rounded-full w-10 h-10 ring-2 ring-white shadow-sm">
                        <img
                          src={getImageUrl(user.avatar) || user.avatar}
                          alt="av"
                          className="object-cover"
                        />
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
                      <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                        <FiBriefcase size={10} /> {user.companyName}
                      </span>
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
                      onClick={() => onEdit(user)}
                      className="btn btn-square btn-sm btn-ghost text-blue-600 hover:bg-blue-50 tooltip tooltip-left"
                      data-tip="Edit User"
                    >
                      <FiEdit3 />
                    </button>
                    {user.role !== "admin" && (
                      <button
                        onClick={() => onDelete(user)}
                        className="btn btn-square btn-sm btn-ghost text-red-500 hover:bg-red-50 tooltip tooltip-left"
                        data-tip="Hapus User"
                      >
                        <FiTrash2 />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;
