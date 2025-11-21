import { useState, useEffect } from "react";
import chartService from "../../services/chartService";
import toast from "react-hot-toast";
import {
  FiPlus,
  FiTrash2,
  FiSearch,
  FiBarChart2,
  FiLayers,
  FiRefreshCw,
  FiExternalLink,
  FiCheck,
  FiAlertTriangle,
  FiActivity,
  FiList,
  FiSettings,
  FiEye,
} from "react-icons/fi";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import Breadcrumbs from "../../components/Breadcrumbs";
import Pagination from "../../components/Pagination";

// --- 1. DATA CLEANER ---
const cleanData = (rawData) => {
  if (!rawData || rawData.length === 0) return [];
  return rawData.map((row) => {
    const newRow = {};
    Object.keys(row).forEach((key) => {
      const cleanKey = key.replace(/^[\uFEFF\s]+|[\s]+$/g, "").trim();
      let value = row[key];
      if (typeof value === "string") {
        if (/[0-9]/.test(value)) {
          let cleanStr = value.replace(/[^0-9.,-]/g, "");
          if (cleanStr.includes(",") && cleanStr.lastIndexOf(",") > cleanStr.lastIndexOf(".")) {
            cleanStr = cleanStr.replace(/\./g, "").replace(",", ".");
          } else if (
            cleanStr.includes(".") &&
            cleanStr.lastIndexOf(".") > cleanStr.lastIndexOf(",")
          ) {
            cleanStr = cleanStr.replace(/,/g, "");
          } else if (!cleanStr.includes(",") && (cleanStr.match(/\./g) || []).length >= 1) {
            cleanStr = cleanStr.replace(/\./g, "");
          }
          const numberValue = parseFloat(cleanStr);
          newRow[cleanKey] = isNaN(numberValue) ? value : numberValue;
        } else {
          newRow[cleanKey] = value;
        }
      } else {
        newRow[cleanKey] = value;
      }
    });
    return newRow;
  });
};

// --- 2. FORMATTER ---
const formatNumber = (value) => {
  if (typeof value === "number") {
    if (value >= 1000000000) return (value / 1000000000).toFixed(1) + "M";
    if (value >= 1000000) return (value / 1000000).toFixed(1) + "jt";
    if (value >= 1000) return (value / 1000).toFixed(0) + "rb";
    return value.toLocaleString("id-ID");
  }
  return value;
};

// --- 3. CHART RENDERER ---
const ChartRenderer = ({ type, data, config, height = 300 }) => {
  if (!data || data.length === 0)
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-xs">
        Data Kosong
      </div>
    );

  const keys = Object.keys(data[0]);
  // Fallback Logic jika Config kosong
  let xKey = config?.xAxisKey;
  if (!xKey || !keys.includes(xKey)) xKey = keys[0];

  let yKeys = config?.dataKeys;
  // Jika dataKeys kosong atau tidak valid, cari kolom angka otomatis
  if (!yKeys || yKeys.length === 0 || !yKeys.some((k) => keys.includes(k))) {
    const potentialY = keys.filter((k) => k !== xKey && typeof data[0][k] === "number");
    yKeys = potentialY.length > 0 ? potentialY : [keys[1]];
  }

  const finalYKeys = yKeys.filter((k) => k); // Bersihkan undefined

  if (finalYKeys.length === 0)
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-xs">
        Pilih Data (Y)
      </div>
    );

  const colors = ["#0056b3", "#ff9900", "#10b981", "#8b5cf6", "#ef4444"];

  const CommonAxis = () => (
    <>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
      <XAxis
        dataKey={xKey}
        axisLine={false}
        tickLine={false}
        tick={{ fontSize: 10, fill: "#6b7280" }}
        dy={10}
        angle={-45}
        textAnchor="end"
        height={60}
        interval={0}
      />
      <YAxis
        axisLine={false}
        tickLine={false}
        tick={{ fontSize: 10, fill: "#6b7280" }}
        tickFormatter={formatNumber}
      />
      <Tooltip
        contentStyle={{
          borderRadius: "8px",
          border: "none",
          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
        }}
        cursor={{ fill: "#f9fafb" }}
        formatter={(val) => val.toLocaleString("id-ID")}
      />
      <Legend verticalAlign="top" height={36} iconType="circle" />
    </>
  );

  return (
    <div style={{ width: "99%", height: height }}>
      <ResponsiveContainer width="100%" height="100%">
        {type === "pie" ? (
          <PieChart>
            <Pie
              data={data}
              dataKey={finalYKeys[0]}
              nameKey={xKey}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              isAnimationActive={false}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(val) => val.toLocaleString("id-ID")} />
            <Legend verticalAlign="bottom" />
          </PieChart>
        ) : type === "line" ? (
          <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CommonAxis />
            {finalYKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                strokeWidth={3}
                dot={{ r: 3 }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        ) : type === "area" ? (
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <defs>
              {finalYKeys.map((key, index) => (
                <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CommonAxis />
            {finalYKeys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                fill={`url(#grad-${key})`}
                fillOpacity={1}
                isAnimationActive={false}
              />
            ))}
          </AreaChart>
        ) : (
          <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CommonAxis />
            {finalYKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
              />
            ))}
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

// --- 4. MAIN PAGE ---
const AdminCharts = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [charts, setCharts] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalData: 0 });
  const [filters, setFilters] = useState({ search: "", limit: 6, page: 1 });
  const [isLoadingList, setIsLoadingList] = useState(false);

  const [form, setForm] = useState({
    title: "",
    sheetUrl: "",
    type: "bar",
    xAxisKey: "",
    dataKeys: [],
  });
  const [previewData, setPreviewData] = useState([]);
  const [availableColumns, setAvailableColumns] = useState([]);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [chartKey, setChartKey] = useState(0);

  const fetchCharts = async () => {
    setIsLoadingList(true);
    try {
      const res = await chartService.getCharts(filters);
      setCharts(res.data);
      setPagination(res.pagination);
    } catch (error) {
      toast.error("Gagal load chart");
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchCharts(), 500);
    return () => clearTimeout(timer);
  }, [filters]);

  // --- HANDLE PREVIEW (SMART DETECT) ---
  const handlePreview = async () => {
    if (!form.sheetUrl) return toast.error("Masukkan Link Google Sheet");
    setIsPreviewLoading(true);
    setPreviewData([]);
    setAvailableColumns([]);

    try {
      const res = await chartService.previewData(form.sheetUrl);
      const cleaned = cleanData(res.data);
      if (cleaned.length === 0) throw new Error("Data kosong");

      setPreviewData(cleaned);
      const headers = Object.keys(cleaned[0]);
      setAvailableColumns(headers);

      const sampleRow = cleaned[0];
      // Prioritaskan kolom string sebagai X
      const textCols = headers.filter((h) => typeof sampleRow[h] === "string");
      // Prioritaskan kolom number sebagai Y
      const numCols = headers.filter((h) => typeof sampleRow[h] === "number");

      const defaultX = textCols.length > 0 ? textCols[0] : headers[0];
      const defaultY = numCols.length > 0 ? [numCols[0]] : [headers[1] || headers[0]];

      // Set Form State dengan hasil deteksi
      setForm((prev) => ({
        ...prev,
        xAxisKey: defaultX,
        dataKeys: defaultY,
      }));

      setChartKey((p) => p + 1);
      toast.success("Data terhubung!");
    } catch (error) {
      toast.error("Gagal. Pastikan link sheet PUBLIC.");
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // Update Data Keys (Checkbox)
  const toggleDataKey = (key) => {
    setForm((prevForm) => {
      const currentKeys = [...prevForm.dataKeys];
      const newKeys = currentKeys.includes(key)
        ? currentKeys.filter((k) => k !== key)
        : [...currentKeys, key];
      return { ...prevForm, dataKeys: newKeys };
    });
    setChartKey((p) => p + 1);
  };

  const handleSave = async () => {
    if (!form.title || previewData.length === 0) return toast.error("Lengkapi konfigurasi");

    // Validasi Akhir sebelum kirim
    if (!form.xAxisKey || form.dataKeys.length === 0) {
      return toast.error("Pilih minimal 1 kolom untuk Sumbu X dan Sumbu Y");
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: form.title,
        sheetUrl: form.sheetUrl,
        type: form.type,
        // Pastikan object config terbentuk sempurna
        config: {
          xAxisKey: form.xAxisKey,
          dataKeys: form.dataKeys,
        },
      };

      console.log("Sending Payload:", payload); // DEBUG LOG

      await chartService.createChart(payload);
      toast.success("Disimpan!");
      setForm({ title: "", sheetUrl: "", type: "bar", xAxisKey: "", dataKeys: [] });
      setPreviewData([]);
      setActiveTab("list");
      fetchCharts();
    } catch (error) {
      console.error(error);
      toast.error("Gagal menyimpan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await chartService.deleteChart(deleteId);
      toast.success("Dihapus");
      setDeleteId(null);
      fetchCharts();
    } catch (error) {
      toast.error("Gagal hapus");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <Breadcrumbs />

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Data Grafik</h1>
          <p className="text-gray-500 text-sm">Visualisasi data real-time dari Google Sheets.</p>
        </div>
        <div className="join shadow-sm bg-white rounded-lg p-1 border border-gray-200">
          <button
            className={`join-item btn btn-sm border-none ${
              activeTab === "list"
                ? "bg-blue-50 text-blue-800 font-bold"
                : "bg-transparent text-gray-500"
            }`}
            onClick={() => setActiveTab("list")}
          >
            <FiLayers className="mr-2" /> Koleksi
          </button>
          <button
            className={`join-item btn btn-sm border-none ${
              activeTab === "create"
                ? "bg-blue-50 text-blue-800 font-bold"
                : "bg-transparent text-gray-500"
            }`}
            onClick={() => setActiveTab("create")}
          >
            <FiPlus className="mr-2" /> Buat Baru
          </button>
        </div>
      </div>

      {/* LIST TAB */}
      {activeTab === "list" && (
        <div className="animate-fade-in">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex justify-between items-center">
            <div className="relative w-full md:w-80 group">
              <FiSearch className="absolute z-30 left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Cari judul grafik..."
                className="input input-bordered w-full pl-10 h-10 text-sm"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <div className="text-xs text-gray-500">
              Total Grafik: <b>{pagination.totalData}</b>
            </div>
          </div>

          {isLoadingList ? (
            <div className="h-64 flex justify-center items-center">
              <span className="loading loading-spinner text-blue-800"></span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {charts.map((chart) => (
                <ChartCard key={chart._id} chart={chart} onDelete={() => setDeleteId(chart._id)} />
              ))}
              {charts.length === 0 && (
                <div className="col-span-full text-center py-10 text-gray-400 bg-gray-50 rounded-xl">
                  Belum ada grafik.
                </div>
              )}
            </div>
          )}
          <div className="flex justify-center mt-6">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={(p) => setFilters({ ...filters, page: p })}
            />
          </div>
        </div>
      )}

      {/* CREATE TAB */}
      {activeTab === "create" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-in">
          <div className="card bg-white shadow-sm border border-gray-200 h-fit">
            <div className="card-body p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FiActivity /> Konfigurasi
              </h3>
              <div className="form-control mb-3">
                <label className="label text-xs font-bold text-gray-500">Link Google Sheet</label>
                <div className="join w-full">
                  <input
                    type="url"
                    className="input input-bordered join-item w-full text-xs focus:border-blue-800"
                    placeholder="https://docs.google.com/..."
                    value={form.sheetUrl}
                    onChange={(e) => setForm({ ...form, sheetUrl: e.target.value })}
                  />
                  <button
                    onClick={handlePreview}
                    className="btn btn-primary join-item"
                    disabled={isPreviewLoading}
                  >
                    {isPreviewLoading ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      <FiRefreshCw />
                    )}
                  </button>
                </div>
              </div>

              {previewData.length > 0 && (
                <div className="animate-fade-in space-y-4 mt-2 border-t border-dashed border-gray-200 pt-4">
                  <div className="form-control">
                    <label className="label text-xs font-bold text-gray-500">Judul Grafik</label>
                    <input
                      type="text"
                      className="input input-bordered input-sm w-full"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label text-xs font-bold text-gray-500">Tipe Chart</label>
                    <div className="grid grid-cols-4 gap-2">
                      {["bar", "line", "area", "pie"].map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            setForm({ ...form, type });
                            setChartKey((p) => p + 1);
                          }}
                          className={`btn btn-xs capitalize ${
                            form.type === type ? "btn-primary" : "btn-outline"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="form-control">
                    <label className="label text-xs font-bold text-gray-500">
                      Sumbu X (Nama/Label)
                    </label>
                    <select
                      className="select select-bordered select-sm w-full"
                      value={form.xAxisKey}
                      onChange={(e) => {
                        setForm({ ...form, xAxisKey: e.target.value });
                        setChartKey((p) => p + 1);
                      }}
                    >
                      {availableColumns.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-control">
                    <label className="label text-xs font-bold text-gray-500">
                      Sumbu Y (Nilai Data)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableColumns.map((col) => (
                        <label
                          key={col}
                          className={`badge cursor-pointer py-2 ${
                            form.dataKeys.includes(col)
                              ? "badge-primary"
                              : "badge-ghost border-gray-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={form.dataKeys.includes(col)}
                            onChange={() => toggleDataKey(col)}
                          />
                          {form.dataKeys.includes(col) && <FiCheck size={10} className="mr-1" />}{" "}
                          {col}
                        </label>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={isSubmitting}
                    className="btn bg-blue-800 hover:bg-blue-900 text-white w-full mt-2"
                  >
                    Simpan
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="xl:col-span-2 space-y-6">
            <div className="card bg-white shadow-sm border border-gray-200 min-h-[400px]">
              <div className="card-body p-6 relative">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-700 text-lg">Preview</h3>
                  {previewData.length > 0 && (
                    <span className="badge badge-success gap-1 text-white">
                      <FiCheck /> Connected
                    </span>
                  )}
                </div>
                <div className="w-full h-80 bg-gray-50 rounded-xl border border-gray-100 p-4 flex items-center justify-center overflow-hidden">
                  {isPreviewLoading ? (
                    <span className="loading loading-dots loading-lg text-gray-400"></span>
                  ) : previewData.length > 0 ? (
                    <div className="w-full h-full" key={chartKey}>
                      <ChartRenderer
                        type={form.type}
                        data={previewData}
                        config={{ xAxisKey: form.xAxisKey, dataKeys: form.dataKeys }}
                        height={320}
                      />
                    </div>
                  ) : (
                    <div className="text-center text-gray-400">
                      <FiBarChart2 className="text-4xl mx-auto mb-2 opacity-20" />
                      <p>Preview grafik</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full text-center">
            <FiAlertTriangle size={24} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-6">Hapus Grafik?</h3>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setDeleteId(null)} className="btn btn-ghost flex-1">
                Batal
              </button>
              <button onClick={handleDelete} className="btn bg-red-500 text-white flex-1">
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ChartCard = ({ chart, onDelete }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await chartService.previewData(chart.sheetUrl);
        setData(cleanData(res.data));
      } catch (e) {
        console.error("Err");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [chart.sheetUrl]);

  return (
    <div className="card bg-white shadow-sm border border-gray-200 hover:shadow-md transition-all h-96 flex flex-col">
      <div className="p-4 border-b border-gray-100 flex justify-between items-start">
        <div>
          <h3 className="font-bold text-gray-700 line-clamp-1">{chart.title}</h3>
          <span className="text-xs text-blue-500 flex items-center gap-1">
            <FiExternalLink /> Google Sheet
          </span>
        </div>
        <button
          onClick={onDelete}
          className="btn btn-square btn-xs btn-ghost text-red-400 hover:bg-red-50"
        >
          <FiTrash2 />
        </button>
      </div>
      <div className="flex-1 p-4 min-h-0 relative">
        {loading ? (
          <div className="h-full flex justify-center items-center">
            <span className="loading loading-ring text-gray-300"></span>
          </div>
        ) : (
          <div className="absolute inset-4">
            <ChartRenderer type={chart.type} data={data} config={chart.config} height={250} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCharts;
