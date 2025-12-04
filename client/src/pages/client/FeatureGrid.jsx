import { useState, useEffect, useRef, useMemo } from "react";
import FeatureCard from "../client/FeatureCard"; // Gunakan komponen kartu yang sudah ada
import { FiGrid } from "react-icons/fi";

const ITEMS_PER_PAGE = 8; // Tampilkan 8 menu per batch

const FeatureGrid = ({ features, searchQuery, sortOrder, onMenuClick }) => {
  const [displayedItems, setDisplayedItems] = useState(ITEMS_PER_PAGE);
  const observerTarget = useRef(null);

  // 1. Filter & Sort Logic
  const filteredData = useMemo(() => {
    let data = [...features];

    // Filter Search
    if (searchQuery) {
      data = data.filter((f) => f.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // Sorting
    data.sort((a, b) => {
      return sortOrder === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
    });

    return data;
  }, [features, searchQuery, sortOrder]);

  // 2. Data yang ditampilkan (Chunked)
  const currentData = filteredData.slice(0, displayedItems);
  const hasMore = displayedItems < filteredData.length;

  // 3. Lazy Load Effect (Intersection Observer)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          // Tambah item saat user scroll ke bawah
          setTimeout(() => {
            setDisplayedItems((prev) => prev + ITEMS_PER_PAGE);
          }, 500); // Delay sedikit untuk efek loading yang halus
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current);
    };
  }, [hasMore]);

  // Reset pagination saat search berubah
  useEffect(() => {
    setDisplayedItems(ITEMS_PER_PAGE);
  }, [searchQuery, sortOrder]);

  // --- RENDER ---

  if (filteredData.length === 0) {
    return (
      <div className="text-center py-10 bg-white rounded-2xl border-2 border-dashed border-gray-100">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
          <FiGrid className="text-gray-300 text-2xl" />
        </div>
        <p className="text-gray-500 text-sm">Menu "{searchQuery}" tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 animate-fade-in">
        {currentData.map((feature) => (
          <FeatureCard key={feature._id} feature={feature} onClick={onMenuClick} />
        ))}
      </div>

      {/* Target Loading & Spinner */}
      {hasMore && (
        <div ref={observerTarget} className="py-6 flex justify-center w-full">
          <div className="flex items-center gap-2 text-xs text-gray-400 font-medium bg-gray-50 px-4 py-2 rounded-full">
            <span className="loading loading-dots loading-xs text-blue-500"></span>
            Memuat menu lainnya...
          </div>
        </div>
      )}

      {/* End of List Indicator (Opsional) */}
      {!hasMore && filteredData.length > ITEMS_PER_PAGE && (
        <div className="text-center py-6 text-[10px] text-gray-300 uppercase tracking-widest font-bold">
          Semua menu sudah ditampilkan
        </div>
      )}
    </>
  );
};

export default FeatureGrid;
