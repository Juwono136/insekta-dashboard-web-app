import { useEffect } from "react";
import { RiLoader2Line } from "react-icons/ri";

const PageLoader = () => {
  // Kunci scroll body saat loader muncul
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-sm transition-all duration-300">
      <div className="relative flex items-center justify-center">
        {/* Animasi Pinggiran */}
        <div className="absolute w-24 h-24 border-4 border-blue-500 rounded-full animate-ping opacity-20"></div>
        <div className="absolute w-20 h-20 border-4 border-t-blue-800 border-r-blue-800 border-b-transparent border-l-transparent rounded-full animate-spin"></div>

        {/* Ikon Tengah */}
        <div className="z-10 animate-pulse">
          <RiLoader2Line className="text-4xl text-blue-800 fill-blue-800/20" />
        </div>
      </div>
      <p className="mt-12 font-semibold text-blue-800 tracking-widest animate-pulse">
        Tunggu sebentar...
      </p>
    </div>
  );
};

export default PageLoader;
