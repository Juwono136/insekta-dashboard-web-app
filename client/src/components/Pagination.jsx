import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-end gap-2 mt-4">
      <span className="text-xs text-gray-500 mr-2">
        Hal. {currentPage} dari {totalPages}
      </span>
      <div className="join">
        <button
          className="join-item btn btn-sm btn-outline bg-white"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <FiChevronLeft />
        </button>
        {/* Tampilkan Page Number Sederhana */}
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            className={`join-item btn btn-sm ${
              currentPage === i + 1
                ? "btn-active bg-blue-800 text-white border-blue-800"
                : "bg-white"
            }`}
            onClick={() => onPageChange(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        <button
          className="join-item btn btn-sm btn-outline bg-white"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
