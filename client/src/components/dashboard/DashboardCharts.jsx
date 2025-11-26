import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const DashboardCharts = ({ chartData, pieData, filterDate, stats }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* AREA CHART: USER GROWTH */}
      <div className="lg:col-span-2 card bg-white shadow-sm border border-gray-200">
        <div className="card-body p-6">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h3 className="font-bold text-gray-700 text-lg">Tren Pertumbuhan Client</h3>
              <p className="text-xs text-gray-400 mt-1">
                {filterDate === "year"
                  ? "Data akumulasi per bulan tahun ini"
                  : filterDate === "month"
                  ? "Data pendaftaran user bulan ini"
                  : "Aktivitas 7 hari terakhir"}
              </p>
            </div>
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded font-medium uppercase">
              {filterDate} View
            </span>
          </div>

          {/* FIX: Container Chart dengan min-width-0 dan Height Explicit */}
          <div className="h-72 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0056b3" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0056b3" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  dy={10}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                  cursor={{ stroke: "#0056b3", strokeWidth: 1, strokeDasharray: "4 4" }}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#0056b3"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorUsers)"
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* PIE CHART: STATUS USER */}
      <div className="card bg-white shadow-sm border border-gray-200">
        <div className="card-body p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-700 text-lg">Status Akun</h3>
            <p className="text-xs text-gray-400 mt-1">Rasio user aktif vs non-aktif</p>
          </div>

          {/* FIX: Relative Position untuk Center Text */}
          <div className="h-64 w-full relative min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "8px" }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Text Overlay */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -mt-4 text-center pointer-events-none">
              <span className="text-3xl font-bold text-gray-800 block">{stats.totalUsers}</span>
              <span className="text-xs text-gray-400 uppercase tracking-wider">Total User</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
