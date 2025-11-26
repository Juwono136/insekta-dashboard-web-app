import { FiSearch, FiFilter, FiGrid, FiCheckCircle, FiXCircle, FiTag } from "react-icons/fi";

const BannerFilter = ({ filters, setFilters }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* SEARCH BAR (Full Width on Mobile, Flexible on Desktop) */}
        <div className="relative w-full md:flex-1 max-w-md group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400 z-10 group-focus-within:text-blue-600" />
          </div>
          <input
            type="text"
            placeholder="Cari judul atau konten banner..."
            className="input input-bordered w-full pl-10 text-sm focus:border-blue-600 transition-all"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
          />
        </div>

        {/* FILTER GROUP (Scrollable horizontally on small screens) */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Filter Label (Desktop Only) */}
          <div className="hidden md:flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider mr-2">
            <FiFilter /> Filter:
          </div>

          {/* Filter Type */}
          <div className="relative flex-1 md:flex-none min-w-[140px]">
            <FiTag
              className="absolute left-3 z-10 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              size={14}
            />
            <select
              className="select select-bordered select-sm w-full pl-9 text-xs"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
            >
              <option value="all">Semua Tipe</option>
              <option value="promo">Promo</option>
              <option value="info">Info</option>
              <option value="warning">Penting</option>
            </select>
          </div>

          {/* Filter Status */}
          <div className="relative flex-1 md:flex-none min-w-[140px]">
            {filters.status === "active" ? (
              <FiCheckCircle
                className="absolute z-10 left-3 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none"
                size={14}
              />
            ) : filters.status === "inactive" ? (
              <FiXCircle
                className="absolute z-10 left-3 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none"
                size={14}
              />
            ) : (
              <FiGrid
                className="absolute z-10 left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                size={14}
              />
            )}

            <select
              className="select select-bordered select-sm w-full pl-9 text-xs"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif/Tayang</option>
              <option value="inactive">Draft</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerFilter;
