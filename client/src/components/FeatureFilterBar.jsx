import { FiSearch, FiFilter } from "react-icons/fi";

const FeatureFilterBar = ({ searchQuery, setSearchQuery, sortOrder, setSortOrder }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
      {/* Search Input */}
      <div className="relative w-full sm:max-w-xs group">
        <FiSearch className="absolute z-10 left-3 top-2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
        <input
          type="text"
          placeholder="Cari menu..."
          className="input input-sm w-full pl-10 rounded-xl bg-white border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Sort Dropdown */}
      <div className="flex items-center gap-2 w-full z-30 sm:w-auto">
        <div className="dropdown dropdown-end w-full sm:w-auto">
          <label
            tabIndex={0}
            className="btn btn-sm btn-ghost bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 w-full sm:w-auto gap-2 rounded-xl font-normal"
          >
            <FiFilter size={14} />
            <span className="text-xs">Urutkan: {sortOrder === "asc" ? "A - Z" : "Z - A"}</span>
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content z-1 menu p-2 shadow-lg bg-white rounded-xl w-40 mt-1 border border-gray-100"
          >
            <li>
              <a
                onClick={() => setSortOrder("asc")}
                className={sortOrder === "asc" ? "active" : ""}
              >
                Nama (A-Z)
              </a>
            </li>
            <li>
              <a
                onClick={() => setSortOrder("desc")}
                className={sortOrder === "desc" ? "active" : ""}
              >
                Nama (Z-A)
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FeatureFilterBar;
