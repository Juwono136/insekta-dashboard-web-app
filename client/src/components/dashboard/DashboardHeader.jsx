import { FiCalendar, FiDownload } from "react-icons/fi";

const DashboardHeader = ({ setFilterDate, filterDate, generateReport }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm mt-1">
          Pantau performa dan aktivitas aplikasi Insekta.
        </p>
      </div>

      <div className="flex gap-3">
        {/* FILTER DATE (IMPROVED UI) */}
        <div className="relative">
          <div className="absolute z-10 inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FiCalendar className="text-gray-500" />
          </div>
          <select
            className="select select-bordered select-sm pl-10 pr-8 bg-white border-gray-300 text-gray-700 focus:border-blue-800 focus:ring-1 focus:ring-blue-800"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          >
            <option value="week">7 Hari Terakhir</option>
            <option value="month">Bulan Ini</option>
            <option value="year">Tahun Ini</option>
          </select>
        </div>

        {/* REPORT BUTTON */}
        <button
          onClick={generateReport}
          className="btn btn-sm bg-blue-800 hover:bg-blue-900 text-white border-none gap-2 shadow-md transition-transform active:scale-95"
        >
          <FiDownload /> Download Report
        </button>
      </div>
    </div>
  );
};

export default DashboardHeader;
