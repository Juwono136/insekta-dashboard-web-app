import { useState, useEffect, useRef } from "react";
import bannerService from "../services/bannerService";
import { FiGift, FiAlertCircle, FiArrowRight, FiExternalLink } from "react-icons/fi";
import { BsMegaphone } from "react-icons/bs";
import BannerDetailModal from "./banner/BannerDetailModal"; // Import Modal Baru

const PromotionSlider = () => {
  const [banners, setBanners] = useState([]);
  const sliderRef = useRef(null);

  // Modal State
  const [selectedBanner, setSelectedBanner] = useState(null);

  // Dragging State
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  // State untuk membedakan Klik vs Drag
  const [dragDistance, setDragDistance] = useState(0);

  // 1. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await bannerService.getBanners({ limit: 10 });
        const bannersArray = Array.isArray(res) ? res : res.data || [];
        setBanners(bannersArray.filter((b) => b.isActive));
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  // 2. Auto Scroll
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isHovering && !isDown && !selectedBanner && sliderRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
        const firstCard = sliderRef.current.children[0];
        const scrollAmount = firstCard ? firstCard.offsetWidth + 24 : 350;

        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          sliderRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isHovering, isDown, banners, selectedBanner]);

  // 3. Drag Handlers
  const handleMouseDown = (e) => {
    setIsDown(true);
    setIsHovering(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
    setDragDistance(0); // Reset jarak drag
  };

  const handleMouseLeave = () => {
    setIsDown(false);
    setIsHovering(false);
  };

  const handleMouseUp = () => {
    setIsDown(false);
    setTimeout(() => setIsHovering(false), 2000);
  };

  const handleMouseMove = (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    sliderRef.current.scrollLeft = scrollLeft - walk;
    setDragDistance(Math.abs(walk)); // Hitung jarak geser
  };

  // Handler Klik Kartu (Hanya jika tidak sedang di-drag jauh)
  const handleCardClick = (banner) => {
    if (dragDistance < 5) {
      // Jika geseran kurang dari 5px, dianggap KLIK
      setSelectedBanner(banner);
    }
  };

  // Style Helper
  const getStyle = (type) => {
    if (type === "promo")
      return {
        bg: "bg-gradient-to-r from-purple-600 to-pink-500",
        icon: <FiGift size={28} />,
        label: "Promo",
      };
    if (type === "warning")
      return {
        bg: "bg-gradient-to-r from-orange-500 to-yellow-400",
        icon: <FiAlertCircle size={28} />,
        label: "Penting",
      };
    return {
      bg: "bg-gradient-to-r from-blue-500 to-cyan-400",
      icon: <BsMegaphone size={28} />,
      label: "Info",
    };
  };

  if (banners.length === 0) return null;

  return (
    <div className="my-8 animate-fade-in group">
      {/* CSS HACK: HIDE SCROLLBAR TAPI TETAP BISA SCROLL */}
      <style>{`
          .hide-scroll::-webkit-scrollbar { display: none; }
          .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
       `}</style>

      {/* Header */}
      <div className="flex items-center gap-2 mb-5 px-1">
        <div className="w-1.5 h-8 bg-orange-500 rounded-full"></div>
        <div>
          <h3 className="font-bold text-gray-800 text-xl leading-none">Info & Promo</h3>
          <p className="text-xs text-gray-500 mt-1">Update terbaru seputar insekta.</p>
        </div>
      </div>

      {/* Slider Container */}
      <div
        ref={sliderRef}
        className={`flex gap-6 overflow-x-auto pb-4 pt-2 px-2 hide-scroll select-none ${
          isDown ? "cursor-grabbing" : "cursor-grab"
        }`}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={() => setIsHovering(true)}
        onTouchEnd={() => setTimeout(() => setIsHovering(false), 2000)}
      >
        {banners.map((banner) => {
          const style = getStyle(banner.type);

          return (
            <div
              key={banner._id}
              onClick={() => handleCardClick(banner)}
              className={`
                      shrink-0 
                      w-[80vw] md:w-[calc(50%-12px)] 
                      h-max 
                      rounded-3xl shadow-xl shadow-gray-200/50 
                      text-white p-6 relative overflow-hidden 
                      transition-transform duration-300 hover:-translate-y-1 
                      ${style.bg}
                   `}
            >
              {/* Dekorasi */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-12 -mt-12 blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-black opacity-5 rounded-full -ml-10 -mb-10 blur-2xl pointer-events-none"></div>

              {/* Konten */}
              <div className="relative z-10 flex gap-2 flex-col h-full justify-between pointer-events-none">
                {/* Header Kartu */}
                <div className="flex justify-between items-start">
                  <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl shadow-inner">
                    {style.icon}
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest opacity-80 bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm shadow-sm">
                    {style.label}
                  </span>
                </div>

                {/* Body Kartu */}
                <div>
                  <h3 className="font-bold text-xl md:text-2xl leading-tight mb-2 line-clamp-1 drop-shadow-sm tracking-tight">
                    {banner.title}
                  </h3>

                  {/* Deskripsi dengan Line Clamp */}
                  <p className="text-sm opacity-95 leading-relaxed line-clamp-3 text-blue-50 font-medium">
                    {banner.content}
                  </p>

                  <div className="flex my-2">
                    {banner.linkUrl && (
                      <a
                        href={banner.linkUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()} // PENTING: Agar tidak trigger modal
                        className="pointer-events-auto flex items-center gap-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 px-3 py-1 rounded-full text-[10px] font-bold transition-colors shadow-sm"
                      >
                        Buka Link <FiExternalLink />
                      </a>
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-1 text-xs font-bold tracking-wide opacity-80">
                    Klik Untuk Selengkapnya <FiArrowRight />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Detail */}
      <BannerDetailModal
        isOpen={!!selectedBanner}
        onClose={() => setSelectedBanner(null)}
        banner={selectedBanner}
        style={selectedBanner ? getStyle(selectedBanner.type) : {}}
      />
    </div>
  );
};

export default PromotionSlider;
