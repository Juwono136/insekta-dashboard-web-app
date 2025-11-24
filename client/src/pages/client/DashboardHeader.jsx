import { useSelector } from "react-redux";
import { FiClock, FiBriefcase, FiActivity } from "react-icons/fi";

const DashboardHeader = () => {
  const { userInfo } = useSelector((state) => state.auth);

  // Logic Sapaan Waktu
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 19) return "Selamat Sore";
    return "Selamat Malam";
  };

  // Format Tanggal Indo
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-linear-to-r from-blue-900 to-blue-700 rounded-2xl p-4 text-white shadow-lg mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
      {/* Dekorasi background tetap sama */}

      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center md:items-start p-4">
        <div className="max-w-2xl space-y-3 text-center md:text-left">
          <div className="inline-block px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full text-orange-300 text-[10px] lg:text-xs font-bold tracking-wider uppercase mb-1">
            Insekta - Pest & Termite Control
          </div>
          {/* Font size responsive: text-2xl di mobile */}
          <div className="my-2 flex flex-col gap-2">
            <h1 className="text-2xl md:text-3xl font-bold text-orange-300">
              {getGreeting()}, {userInfo?.name?.split(" ")[0]}!
            </h1>
            <p className="text-blue-300 text-xs font-medium mb-1 flex justify-center md:justify-start items-center gap-2 md:hidden">
              <FiClock /> {today}
            </p>
            <p className="opacity-80 text-lg flex justify-center md:justify-start items-center gap-2">
              <FiBriefcase /> {userInfo?.companyName || "Client Area"}
            </p>
          </div>

          <p className="text-sm md:text-base capitalize text-gray-200 opacity-80">
            Dashboard Pengendalian Hama PT Insekta Fokustama
          </p>
        </div>

        <div className="hidden md:block transform hover:scale-105 transition-transform duration-500">
          <div className="w-32 h-32 lg:w-48 lg:h-48 bg-linear-to-br from-blue-400 to-blue-600 rounded-2xl shadow-2xl border border-white/20 flex items-center justify-center rotate-6 hover:rotate-0 transition-all">
            <FiActivity className="text-6xl lg:text-8xl text-white drop-shadow-md" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
