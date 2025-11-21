import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FiUsers,
  FiLayers,
  FiActivity,
  FiBarChart2,
  FiCalendar,
  FiDownload,
  FiArrowUp,
  FiClock,
} from "react-icons/fi";
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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";
import { getImageUrl } from "../../utils/imageUrl";

import userService from "../../services/userService";
import featureService from "../../services/featureService";
import DashboardSkeleton from "../../components/DashboardSkeleton";

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [features, setFeatures] = useState([]);
  const [totalFeatures, setTotalFeatures] = useState(0);
  const [filterDate, setFilterDate] = useState("year"); // 'week', 'month', 'year'

  // --- 1. LOAD DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, featRes] = await Promise.all([
          userService.getUsers({ limit: 1000 }),
          featureService.getAllFeatures({ limit: 5 }),
        ]);
        setUsers(userRes.users);
        setFeatures(featRes.data);
        setTotalFeatures(featRes.pagination?.totalData || 0);
      } catch (error) {
        console.error("Gagal load dashboard", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- 2. DATA PROCESSING (STATS) ---
  const stats = useMemo(() => {
    const clients = users.filter((u) => u.role === "client");
    const activeClients = clients.filter((u) => u.isActive).length;
    return {
      totalUsers: users.length,
      totalClients: clients.length,
      activeClients,
    };
  }, [users]);

  // --- 3. DATA PROCESSING (CHART UTAMA - USER FRIENDLY) ---
  const chartData = useMemo(() => {
    const now = new Date();
    let data = [];

    // Helper: Format tanggal lokal Indonesia
    const formatDate = (dateStr, formatType) => {
      const date = new Date(dateStr);
      if (formatType === "day") return date.toLocaleDateString("id-ID", { weekday: "short" }); // Sen, Sel
      if (formatType === "date")
        return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" }); // 20 Jan
      return date.toLocaleDateString("id-ID", { month: "short" }); // Jan, Feb
    };

    let filteredUsers = [];

    if (filterDate === "week") {
      // Logic: 7 Hari Terakhir
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      filteredUsers = users.filter((u) => new Date(u.createdAt) >= sevenDaysAgo);

      // Group by Hari (Senin, Selasa...)
      const grouped = filteredUsers.reduce((acc, user) => {
        const day = formatDate(user.createdAt, "day");
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, {});
      // Mapping agar urutan hari benar (Opsional, simplified for now)
      data = Object.keys(grouped).map((k) => ({ name: k, users: grouped[k] }));
    } else if (filterDate === "month") {
      // Logic: Bulan Ini (Per Tanggal)
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      filteredUsers = users.filter((u) => new Date(u.createdAt) >= firstDay);

      const grouped = filteredUsers.reduce((acc, user) => {
        const date = formatDate(user.createdAt, "date");
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});
      data = Object.keys(grouped).map((k) => ({ name: k, users: grouped[k] }));
    } else {
      // Logic: Tahun Ini (Per Bulan)
      const firstDayYear = new Date(now.getFullYear(), 0, 1);
      filteredUsers = users.filter((u) => new Date(u.createdAt) >= firstDayYear);

      const grouped = filteredUsers.reduce((acc, user) => {
        const month = formatDate(user.createdAt, "month");
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {});

      // Pastikan urutan bulan (Jan-Des) jika data kosong di bulan tertentu
      const monthsOrder = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Mei",
        "Jun",
        "Jul",
        "Agu",
        "Sep",
        "Okt",
        "Nov",
        "Des",
      ];
      data = monthsOrder.map((m) => ({ name: m, users: grouped[m] || 0 }));
    }

    return data;
  }, [users, filterDate]);

  // --- 4. DATA PIE CHART ---
  const pieData = useMemo(() => {
    const active = users.filter((u) => u.isActive).length;
    const inactive = users.length - active;
    return [
      { name: "Aktif", value: active, color: "#16a34a" },
      { name: "Non-Aktif", value: inactive, color: "#dc2626" },
    ];
  }, [users]);

  // --- 5. GENERATE PDF REPORT ---
  const generateReport = () => {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(0, 86, 179); // Biru Insekta
    doc.rect(0, 0, 210, 20, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text("Laporan Ringkasan Dashboard Insekta", 14, 13);

    // Tanggal Cetak
    doc.setTextColor(100);
    doc.setFontSize(10);
    doc.text(`Dicetak pada: ${new Date().toLocaleString("id-ID")}`, 14, 30);

    // Statistik Utama
    doc.setTextColor(0);
    doc.setFontSize(12);
    doc.text("Ringkasan Statistik:", 14, 40);

    const statsData = [
      ["Total User Terdaftar", stats.totalUsers],
      ["Client Aktif", stats.activeClients],
      ["Total Fitur Menu", totalFeatures],
    ];

    // PERBAIKAN 1: Gunakan autoTable(doc, options)
    autoTable(doc, {
      startY: 45,
      head: [["Metrik", "Jumlah"]],
      body: statsData,
      theme: "grid",
      headStyles: { fillColor: [255, 153, 0] }, // Orange
    });

    // Tabel Aktivitas Menu
    // doc.lastAutoTable.finalY mengambil posisi Y terakhir dari tabel sebelumnya
    doc.text("Aktivitas Menu Terbaru:", 14, doc.lastAutoTable.finalY + 15);

    const menuData = features.map((f) => [
      f.title,
      new Date(f.createdAt).toLocaleDateString("id-ID"),
      f.assignedTo.length + " User",
    ]);

    // PERBAIKAN 2: Gunakan autoTable(doc, options)
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [["Nama Menu", "Tanggal Dibuat", "Akses Client"]],
      body: menuData,
      theme: "striped",
      headStyles: { fillColor: [0, 86, 179] },
    });

    // Footer
    doc.setFontSize(8);
    doc.text("© Insekta Pest & Termite Control - Internal Report", 14, 280);

    doc.save(`Insekta_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success("Laporan berhasil didownload!");
  };

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
          <p className="text-gray-500 text-sm mt-1">
            Pantau performa dan aktivitas aplikasi Insekta.
          </p>
        </div>

        <div className="flex gap-3">
          {/* FILTER DATE (IMPROVED UI) */}
          <div className="relative">
            <div className="absolute z-30 inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
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

      {/* STATS CARDS (Tetap Sama) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total User"
          value={stats.totalUsers}
          icon={<FiUsers size={24} />}
          color="text-blue-600 bg-blue-50"
          trend="+12%"
        />
        <StatCard
          title="Client Aktif"
          value={stats.activeClients}
          icon={<FiActivity size={24} />}
          color="text-green-600 bg-green-50"
          trend="+5%"
        />
        <StatCard
          title="Total Fitur"
          value={totalFeatures}
          icon={<FiLayers size={24} />}
          color="text-orange-600 bg-orange-50"
          trend="New"
        />
        <StatCard
          title="Laporan Grafik"
          value="Data"
          icon={<FiBarChart2 size={24} />}
          color="text-purple-600 bg-purple-50"
          trend="Stable"
        />
      </div>

      {/* CHARTS SECTION */}
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
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                  />
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

      {/* RECENT ACTIVITY TABLE (Tetap sama) */}
      <div className="card bg-white shadow-sm border border-gray-200 overflow-hidden">
        <div className="card-body p-0">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-700 text-lg">Aktivitas Menu Terbaru</h3>
            <Link to="/admin/features" className="text-sm btn btn-ghost bg-blue-100 text-blue-600">
              Lihat Semua
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="pl-6">Nama Fitur</th>
                  <th>Tanggal Dibuat</th>
                  <th>Akses Client</th>
                  <th className="pr-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {features.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-gray-400">
                      Belum ada data fitur
                    </td>
                  </tr>
                ) : (
                  features.map((feat) => (
                    <tr
                      key={feat._id}
                      className="hover:bg-blue-50/30 transition-colors border-b border-gray-50 last:border-none"
                    >
                      <td className="pl-6 py-4 font-medium text-gray-700 flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
                          <img src={getImageUrl(feat.icon)} alt="image-icon" />
                        </div>
                        {feat.title}
                      </td>
                      <td className="text-gray-500">
                        <div className="flex items-center gap-1">
                          <FiClock size={12} />
                          {new Date(feat.createdAt).toLocaleDateString("id-ID")}
                        </div>
                      </td>
                      <td>
                        <div className="avatar-group -space-x-2">
                          {feat.assignedTo.slice(0, 3).map((u) => (
                            <div key={u._id} className="avatar border-2 border-blue-900 w-6 h-6">
                              <div className="bg-gray-200 text-gray-600 text-[10px]">
                                <img src={getImageUrl(u.avatar) || u.avatar} alt="image-profile" />
                              </div>
                            </div>
                          ))}
                          {feat.assignedTo.length > 3 && (
                            <div className="avatar placeholder border border-white w-6 h-6">
                              <div className="bg-gray-800 text-white text-[8px]">
                                +{feat.assignedTo.length - 3}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="pr-6 text-right">
                        <span className="badge badge-sm badge-success bg-green-100 text-green-700 border-none">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, trend }) => (
  <div className="card bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all">
    <div className="card-body p-6 flex flex-row items-center justify-between">
      <div>
        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">{title}</h3>
        <div className="flex items-end gap-2 mt-2">
          <p className="text-3xl font-bold text-gray-800 leading-none">{value}</p>
          {trend && (
            <span className="text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded flex items-center">
              <FiArrowUp size={10} /> {trend}
            </span>
          )}
        </div>
      </div>
      <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
    </div>
  </div>
);

export default AdminDashboard;
