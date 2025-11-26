import { useEffect, useState, useMemo } from "react";
import teamService from "../../services/teamService";
import PageLoader from "../../components/PageLoader";
import { FiMapPin, FiCheckCircle, FiUser } from "react-icons/fi";
import { FaWhatsapp, FaUsers } from "react-icons/fa";
import { getImageUrl } from "../../utils/imageUrl";
import Breadcrumbs from "../../components/Breadcrumbs";

const TimInsekta = () => {
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ambil semua data (limit besar) untuk ditampilkan di satu halaman
        const res = await teamService.getTeams({ limit: 100 });
        setTeams(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Grouping Data by Area
  const groupedTeams = useMemo(() => {
    const groups = {};
    teams.forEach((team) => {
      const area = team.area || "Lainnya";
      if (!groups[area]) groups[area] = [];
      groups[area].push(team);
    });
    return Object.keys(groups)
      .sort()
      .reduce((obj, key) => {
        obj[key] = groups[key];
        return obj;
      }, {});
  }, [teams]);

  if (isLoading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <Breadcrumbs />

        <div className="flex items-center gap-3 mb-8 px-1">
          <div className="p-3 bg-green-100 text-green-600 rounded-xl shadow-sm">
            <FaUsers size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Tim Insekta</h2>
            <p className="text-xs md:text-sm text-gray-500">
              Tim Service Pengendalian Hama PT Insekta Fokustama.
            </p>
          </div>
        </div>

        {Object.keys(groupedTeams).length === 0 ? (
          <div className="text-center py-20 text-gray-400">Belum ada data tim.</div>
        ) : (
          <div className="space-y-10">
            {Object.entries(groupedTeams).map(([area, members]) => (
              <section key={area} className="animate-fade-in-up">
                {/* Section Header */}
                <div className="flex items-center gap-2 mb-4 ml-1">
                  <FiMapPin className="text-red-500" />
                  <h3 className="text-lg font-bold text-gray-700 uppercase tracking-wider">
                    Area: <span className="text-blue-800">{area}</span>
                  </h3>
                </div>

                {/* Grid Card (Design mirip ID Card) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {members.map((member) => (
                    <div
                      key={member._id}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group"
                    >
                      <div className="p-5 flex items-start gap-4">
                        {/* Foto Profil */}
                        <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-md border-2 border-white shrink-0 bg-gray-100 flex items-center justify-center">
                          {member.photo ? (
                            <img
                              src={getImageUrl(member.photo)}
                              alt={member.name}
                              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <FiUser className="text-gray-400 text-4xl" />
                          )}
                        </div>

                        {/* Info Utama */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-800 text-lg truncate">
                            {member.name}
                          </h4>
                          <span className="inline-block bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded mb-2 uppercase tracking-wide">
                            {member.role}
                          </span>

                          {/* Tombol WA */}
                          <a
                            href={`https://wa.me/${member.phone
                              .replace(/^0/, "62")
                              .replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-700 hover:underline"
                          >
                            <FaWhatsapp className="text-lg" /> {member.phone}
                          </a>
                        </div>
                      </div>

                      {/* List Outlet (Footer Card) */}
                      <div className="bg-gray-50 px-5 py-3 border-t border-gray-100">
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1 flex items-center gap-1">
                          <FiCheckCircle size={10} /> Outlet yang ditangani:
                        </p>
                        <p
                          className="text-xs text-gray-600 leading-relaxed line-clamp-2"
                          title={member.outlets}
                        >
                          {member.outlets || "-"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimInsekta;
