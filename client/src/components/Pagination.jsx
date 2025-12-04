import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  // Logic untuk Desktop: Menentukan angka mana yang muncul (1 ... 4 5 6 ... 20)
  const getPageNumbers = () => {
    const pages = [];
    const delta = 1; // Jumlah halaman di kiri/kanan halaman aktif

    if (totalPages <= 7) {
      // Jika total halaman sedikit, tampilkan semua
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Selalu tampilkan halaman 1
      pages.push(1);

      // Tambahkan "..." jika jauh dari awal
      if (currentPage - delta > 2) {
        pages.push("...");
      }

      // Halaman di sekitar current page
      let start = Math.max(2, currentPage - delta);
      let end = Math.min(totalPages - 1, currentPage + delta);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Tambahkan "..." jika jauh dari akhir
      if (currentPage + delta < totalPages - 1) {
        pages.push("...");
      }

      // Selalu tampilkan halaman terakhir
      if (totalPages > 1) pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="w-full flex flex-col items-center gap-4 mt-8 animate-fade-in">
      {/* --- TAMPILAN MOBILE (Layar Kecil) --- */}
      <div className="flex sm:hidden justify-between items-center w-full bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="btn btn-sm btn-ghost text-gray-500 disabled:bg-transparent"
        >
          <FiChevronLeft /> Prev
        </button>

        <span className="text-xs font-medium text-gray-600">
          Hal <span className="text-blue-600 font-bold">{currentPage}</span> / {totalPages}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="btn btn-sm btn-ghost text-gray-500 disabled:bg-transparent"
        >
          Next <FiChevronRight />
        </button>
      </div>

      {/* --- TAMPILAN DESKTOP/TABLET (Layar Besar) --- */}
      <div className="hidden sm:flex flex-col sm:flex-row items-center justify-between w-full gap-4">
        {/* Info Text */}
        <div className="text-xs text-gray-500 order-2 sm:order-1">
          Menampilkan halaman <span className="font-bold text-gray-800">{currentPage}</span> dari{" "}
          <span className="font-bold text-gray-800">{totalPages}</span>
        </div>

        {/* Numbered Buttons */}
        <div className="flex items-center gap-1 order-1 sm:order-2 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm">
          {/* Tombol Prev */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="btn btn-xs btn-square btn-ghost text-gray-500 hover:text-blue-600 disabled:opacity-30"
          >
            <FiChevronLeft size={14} />
          </button>

          {/* Angka Halaman */}
          {getPageNumbers().map((page, index) =>
            page === "..." ? (
              <span key={`dots-${index}`} className="px-2 text-xs text-gray-300 select-none">
                •••
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`btn btn-xs w-7 h-7 rounded-md font-medium transition-all ${
                  currentPage === page
                    ? "bg-[#093050] text-white shadow-md shadow-blue-100 border-none"
                    : "bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                }`}
              >
                {page}
              </button>
            )
          )}

          {/* Tombol Next */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="btn btn-xs btn-square btn-ghost text-gray-500 hover:text-blue-600 disabled:opacity-30"
          >
            <FiChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
