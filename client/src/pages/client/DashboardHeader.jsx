import { useSelector } from "react-redux";

// assets
import { FiBriefcase } from "react-icons/fi";
import KartunInsekta from "../../assets/kartun-tim-insekta.webp";

const DashboardHeader = () => {
  const { userInfo } = useSelector((state) => state.auth);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 19) return "Selamat Sore";
    return "Selamat Malam";
  };

  return (
    <div className="relative w-full bg-linear-to-r from-[#093050] to-blue-800 rounded-2xl shadow-xl mb-4 overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-20 w-40 h-40 bg-blue-400 opacity-10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-6 md:p-8 md:min-h-72">
        <div className="w-full md:w-2/3 space-y-2 text-center md:text-left z-20">
          <div className="inline-block px-3 py-1 bg-white/10 border border-white/20 backdrop-blur-sm rounded-full text-[#feba12] text-[10px] font-bold tracking-widest uppercase mb-2">
            Insekta - Pest & Termite Control
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">
            {getGreeting()},{" "}
            <span className="text-[#feba12]">{userInfo?.name?.split(" ")[0]}!</span>
          </h1>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-4 text-blue-100 text-sm md:text-lg mt-1">
            <span className="flex items-center gap-1.5 bg-blue-600/30 px-2 py-1 rounded-md">
              <FiBriefcase className="text-[#feba12]" />
              {userInfo?.companyName || "Client Area"}
            </span>
          </div>

          <p className="text-sm text-blue-50 opacity-80 leading-relaxed max-w-lg pt-2 md:block">
            Dashboard Pengendalian Hama PT Insekta Fokustama
          </p>
        </div>

        <div className="hidden md:flex relative md:mt-6 md:absolute md:bottom-0 md:right-6 pointer-events-none">
          <img
            src={KartunInsekta}
            alt="Insekta Mascot"
            className="w-60 h-60 md:w-96 md:h-96 object-contain object-bottom drop-shadow-2xl filter brightness-110"
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
