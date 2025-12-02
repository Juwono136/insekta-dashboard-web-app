import { useState, useEffect, useRef } from "react";
import bannerService from "../services/bannerService";
import { FiExternalLink, FiGift, FiAlertCircle, FiInfo } from "react-icons/fi";
import { BsMegaphone } from "react-icons/bs";
import { getImageUrl } from "../utils/imageUrl";
import BannerDetailModal from "../components/banner/BannerDetailModal";

const PromotionSlider = () => {
  const [banners, setBanners] = useState([]);
  const sliderRef = useRef(null);

  // State Modal
  const [selectedBanner, setSelectedBanner] = useState(null);

  // State Dragging
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // State Deteksi Klik (Agar tidak bentrok dengan drag)
  const [dragDistance, setDragDistance] = useState(0);

  // 1. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await bannerService.getBanners({ limit: 50 });
        const data = Array.isArray(res) ? res : res.data || [];
        setBanners(data.filter((b) => b.isActive));
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  // Helper Badge Style
  const getBadgeStyle = (type) => {
    if (type === "promo") return { bg: "bg-purple-600", icon: <FiGift />, label: "PROMO" };
    if (type === "warning")
      return { bg: "bg-orange-500", icon: <FiAlertCircle />, label: "PENTING" };
    return { bg: "bg-blue-600", icon: <BsMegaphone />, label: "INFO" };
  };

  // 2. Auto Scroll Logic (Berhenti jika ada modal terbuka)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isHovering && !isDown && !selectedBanner && sliderRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
        const firstCard = sliderRef.current.children[0];
        const scrollAmount = firstCard ? firstCard.offsetWidth + 24 : 350;
        if (scrollLeft + clientWidth >= scrollWidth - 10)
          sliderRef.current.scrollTo({ left: 0, behavior: "smooth" });
        else sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isHovering, isDown, banners, selectedBanner]);

  // 3. Drag Handlers
  const handleMouseDown = (e) => {
    setIsDown(true);
    setIsHovering(true);
    setDragDistance(0);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
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
    setDragDistance(Math.abs(walk));
  };

  const handleCardClick = (banner) => {
    if (dragDistance < 5) {
      setSelectedBanner(banner);
    }
  };

  if (banners.length === 0) return null;

  return (
    <div className="my-6 animate-fade-in group">
      <style>{`.hide-scroll::-webkit-scrollbar { display: none; } .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }`}</style>

      <div className="flex items-center gap-2 mb-5 px-1">
        <div className="w-1.5 h-8 bg-blue-600 rounded-full"></div>
        <div>
          <h3 className="font-bold text-gray-800 text-xl leading-none">Info & Promo</h3>
          <p className="text-xs text-gray-500 mt-1">Update terbaru tentang Insekta untuk Anda</p>
        </div>
      </div>

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
          const badge = getBadgeStyle(banner.type);
          return (
            <div
              key={banner._id}
              onClick={() => handleCardClick(banner)} // EVENT KLIK PEMBUKA MODAL
              className="shrink-0 w-[80vw] md:w-[calc(50%-12px)] h-64 md:h-72 rounded-3xl shadow-lg relative overflow-hidden group/card bg-gray-200 transition-transform duration-300 hover:-translate-y-1 active:scale-95"
            >
              {/* Background Image */}
              <img
                src={getImageUrl(banner.image)}
                alt={banner.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/40 to-transparent"></div>

              {/* Konten Text */}
              <div className="relative z-10 flex flex-col h-full justify-between p-6 md:p-8 text-white">
                {/* Badge Tipe */}
                <div className="flex justify-between items-start">
                  <span
                    className={`${badge.bg} text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md backdrop-blur-sm bg-opacity-90`}
                  >
                    {badge.icon} {badge.label}
                  </span>

                  {/* Indikator Klik */}
                  <div className="bg-white/20 p-1.5 rounded-full backdrop-blur-md opacity-0 group-hover/card:opacity-100 transition-opacity">
                    <FiInfo size={14} />
                  </div>
                </div>

                {/* Judul & Deskripsi */}
                <div>
                  <h3 className="font-bold text-xl md:text-2xl leading-tight mb-2 line-clamp-2 drop-shadow-lg tracking-tight">
                    {banner.title}
                  </h3>

                  <p className="text-xs md:text-sm text-gray-200 opacity-90 line-clamp-2 mb-4 leading-relaxed font-medium">
                    {banner.content}
                  </p>

                  {/* Tombol Link (Opsional) */}
                  {banner.linkUrl ? (
                    <a
                      href={banner.linkUrl}
                      target="_blank"
                      rel="noreferrer"
                      // Stop Propagation agar tidak membuka modal jika klik tombol ini
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-2 bg-white text-gray-900 px-5 py-2 rounded-full text-xs font-bold transition-all hover:scale-105 shadow-lg hover:bg-gray-100"
                    >
                      Lihat Detail <FiExternalLink />
                    </a>
                  ) : (
                    <div className="mt-2 w-fit flex items-center gap-2 opacity-60 text-[10px] uppercase font-bold tracking-widest border border-white/30 px-3 py-1 rounded-full">
                      Baca Selengkapnya
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* RENDER MODAL */}
      <BannerDetailModal
        isOpen={!!selectedBanner}
        onClose={() => setSelectedBanner(null)}
        banner={selectedBanner}
      />
    </div>
  );
};

export default PromotionSlider;
