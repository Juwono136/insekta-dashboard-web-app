import { useState, useRef, useEffect } from "react";

const LazyCategorySection = ({ children, title, count }) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Jika elemen masuk viewport, set visible true
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Stop observe setelah visible agar hemat memori
        }
      },
      { rootMargin: "100px" } // Load 100px sebelum elemen muncul (Preload)
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="animate-fade-in-up min-h-[200px]">
      {/* Header Selalu Muncul */}
      <div className="flex items-center gap-3 mb-6 ml-1">
        <span className="h-8 w-1 bg-blue-600 rounded-full"></span>
        <h3 className="text-lg md:text-xl font-bold text-blue-800 uppercase tracking-wide">
          {title}
        </h3>
      </div>

      {/* Konten Chart: Hanya render jika isVisible true */}
      {isVisible ? (
        <div className="transition-opacity duration-700 opacity-100">{children}</div>
      ) : (
        // Skeleton Placeholder saat belum discroll
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(Math.min(count, 3))].map((_, i) => (
            <div key={i} className="h-[300px] bg-gray-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      )}
    </section>
  );
};

export default LazyCategorySection;
