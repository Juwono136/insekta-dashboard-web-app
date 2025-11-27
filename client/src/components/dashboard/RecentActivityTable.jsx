import { Link } from "react-router-dom";
import { getImageUrl } from "../../utils/imageUrl";
import { FiClock } from "react-icons/fi";

const RecentActivityTable = ({ features }) => {
  return (
    <div className="card bg-white shadow-sm border border-gray-200 overflow-hidden">
      <div className="card-body p-0">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-700 text-base md:text-lg">Aktivitas Menu Terbaru</h3>
          <Link to="/admin/features" className="text-xs btn btn-ghost bg-blue-100 text-blue-600">
            Lihat Semua
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="pl-6">Nama Fitur</th>
                <th>Tanggal Dibuat</th>
                <th>Akses Client</th>
                <th className="pr-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {features.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-gray-400">
                    Belum ada data fitur
                  </td>
                </tr>
              ) : (
                features.map((feat) => (
                  <tr
                    key={feat._id}
                    className="hover:bg-blue-50/30 transition-colors border-b border-gray-50 last:border-none"
                  >
                    <td className="pl-6 py-4 font-medium text-gray-700 flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
                        <img src={getImageUrl(feat.icon)} alt="image-icon" />
                      </div>
                      {feat.title}
                    </td>
                    <td className="text-gray-500">
                      <div className="flex items-center gap-1">
                        <FiClock size={12} />
                        {new Date(feat.createdAt).toLocaleDateString("id-ID")}
                      </div>
                    </td>
                    <td>
                      <div className="avatar-group -space-x-2">
                        {feat.assignedTo.slice(0, 3).map((u) => (
                          <div key={u._id} className="avatar border-2 border-blue-900 w-6 h-6">
                            <div className="bg-gray-200 text-gray-600 text-[10px]">
                              <img
                                src={getImageUrl(u.user?.avatar) || u.user?.avatar}
                                alt="image-profile"
                              />
                            </div>
                          </div>
                        ))}
                        {feat.assignedTo.length > 3 && (
                          <div className="avatar placeholder border border-white w-6 h-6">
                            <div className="bg-gray-800 text-white text-[8px]">
                              +{feat.assignedTo.length - 3}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="pr-6 text-right">
                      <span className="badge badge-sm badge-success bg-green-100 text-green-700 border-none">
                        Active
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RecentActivityTable;
