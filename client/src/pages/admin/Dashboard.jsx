import { useEffect, useState, useMemo } from "react";
import { FiUsers, FiLayers, FiActivity, FiBarChart2 } from "react-icons/fi";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";

import userService from "../../services/userService";
import featureService from "../../services/featureService";
import chartService from "../../services/chartService";

import DashboardSkeleton from "../../components/DashboardSkeleton";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatCard from "../../components/dashboard/StatCard";
import DashboardCharts from "../../components/dashboard/DashboardCharts";
import RecentActivityTable from "../../components/dashboard/RecentActivityTable";

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [features, setFeatures] = useState([]);
  const [totalFeatures, setTotalFeatures] = useState(0);
  const [filterDate, setFilterDate] = useState("year"); // 'week', 'month', 'year'
  const [totalCharts, setTotalCharts] = useState(0);

  // --- 1. LOAD DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, featRes, chartsRes] = await Promise.all([
          userService.getUsers({ limit: 1000 }),
          featureService.getAllFeatures({ limit: 5 }),
          chartService.getCharts({ limit: 1 }),
        ]);
        setUsers(userRes.users);
        setFeatures(featRes.data);
        setTotalFeatures(featRes.pagination?.totalData || 0);
        setTotalCharts(chartsRes.pagination.totalData);
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
      <DashboardHeader
        setFilterDate={setFilterDate}
        filterDate={filterDate}
        generateReport={generateReport}
      />

      {/* STATS CARDS (Tetap Sama) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total User"
          value={stats.totalUsers}
          icon={<FiUsers size={24} />}
          color="text-blue-600 bg-blue-50"
        />
        <StatCard
          title="Client Aktif"
          value={stats.activeClients}
          icon={<FiActivity size={24} />}
          color="text-green-600 bg-green-50"
        />
        <StatCard
          title="Total Fitur"
          value={totalFeatures}
          icon={<FiLayers size={24} />}
          color="text-orange-600 bg-orange-50"
        />
        <StatCard
          title="Jumlah Grafik"
          value={totalCharts}
          icon={<FiBarChart2 size={24} />}
          color="text-purple-600 bg-purple-50"
        />
      </div>

      {/* CHARTS SECTION */}
      <DashboardCharts
        chartData={chartData}
        pieData={pieData}
        filterDate={filterDate}
        stats={stats}
      />

      {/* RECENT ACTIVITY TABLE (Tetap sama) */}
      <RecentActivityTable features={features} />
    </div>
  );
};

export default AdminDashboard;
