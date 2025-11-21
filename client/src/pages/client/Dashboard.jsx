import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import featureService from "../../services/featureService";
import PageLoader from "../../components/PageLoader";
import { FiExternalLink, FiBox, FiActivity, FiFileText } from "react-icons/fi";
import { getImageUrl } from "../../utils/imageUrl";
// Kita gunakan ikon React Icons sebagai placeholder "3D" dengan styling shadow/gradient

const ClientDashboard = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [features, setFeatures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const data = await featureService.getMyFeatures();
        setFeatures(data);
      } catch (error) {
        console.error("Gagal load fitur", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeatures();
  }, []);

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-8">
      {/* 1. HERO BANNER (Style Upskill / Insekta) */}
      <div className="relative w-full bg-blue-800 rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl text-white min-h-[220px] lg:min-h-[280px] flex items-center animate-fade-in">
        <div className="absolute inset-0 bg-linear-to-r from-blue-900 via-blue-800 to-blue-600 opacity-95"></div>
        {/* Dekorasi background tetap sama */}

        <div className="relative z-10 container mx-auto px-6 py-8 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3 text-center md:text-left">
            <div className="inline-block px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full text-orange-300 text-[10px] lg:text-xs font-bold tracking-wider uppercase mb-1">
              Professional Pest Control
            </div>
            {/* Font size responsive: text-2xl di mobile */}
            <h1 className="text-2xl md:text-5xl font-bold leading-tight">Selamat Datang,</h1>
            <h1 className="text-xl md:text-3xl font-bold leading-tight text-orange-400">
              {userInfo?.name}
            </h1>
            <p className="text-blue-100 text-sm md:text-base opacity-90 max-w-lg">
              Dashboard ini memudahkan Anda memantau laporan, tren hama, dan dokumen legalitas.
            </p>
          </div>

          <div className="hidden md:block transform hover:scale-105 transition-transform duration-500">
            <div className="w-32 h-32 lg:w-48 lg:h-48 bg-linear-to-br from-blue-400 to-blue-600 rounded-2xl shadow-2xl border border-white/20 flex items-center justify-center rotate-6 hover:rotate-0 transition-all">
              <FiActivity className="text-6xl lg:text-8xl text-white drop-shadow-md" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. GRID MENU SECTION */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-6 px-2 border-l-4 border-orange-500 pl-3">
          Menu Dashboard
        </h2>

        {features.length === 0 ? (
          // State Kosong
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <FiBox size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-600">Belum ada menu tersedia</h3>
            <p className="text-gray-400 text-sm">
              Hubungi Admin Insekta untuk menambahkan akses menu.
            </p>
          </div>
        ) : (
          // Grid Menu
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
            {features.map((feature) => (
              <a
                key={feature._id}
                href={feature.url}
                target="_blank"
                rel="noopener noreferrer"
                // p-4 di mobile, p-6 di desktop
                className="group relative bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-100 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center gap-3 cursor-pointer overflow-hidden h-full"
              >
                <div className="absolute inset-0 bg-linear-to-br from-blue-50 to-white opacity-0 group-hover:opacity-100 transition-opacity"></div>

                {/* Icon Size responsive: w-14 di mobile */}
                <div className="relative w-14 h-14 lg:w-20 lg:h-20 flex items-center justify-center">
                  {feature.icon && feature.icon.includes("/") ? (
                    <img
                      src={getImageUrl(feature.icon)}
                      alt={feature.title}
                      className="w-full h-full object-contain drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
                      <FiFileText className="text-xl lg:text-3xl" />
                    </div>
                  )}
                </div>

                <div className="relative z-10 flex-1 flex items-center justify-center">
                  {/* Text size responsive */}
                  <h3 className="font-bold text-orange-700 text-xs capitalize lg:text-base group-hover:text-orange-800 transition-colors line-clamp-2 leading-tight">
                    {feature.title}
                  </h3>
                </div>

                <div className="absolute top-2 right-2 lg:top-3 lg:right-3 text-gray-300 group-hover:text-orange-500 transition-colors">
                  <FiExternalLink size={12} className="lg:w-4 lg:h-4" />
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Footer Simple */}
      <div className="text-center pt-10 pb-4 text-gray-400 text-xs">
        <p>
          &copy; {new Date().getFullYear()} Insekta - Pest & Termite Control. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default ClientDashboard;
