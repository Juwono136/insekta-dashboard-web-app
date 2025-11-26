import { useState, useEffect } from "react";
import { FiTag, FiType, FiCode, FiLayout, FiAlertTriangle, FiHelpCircle } from "react-icons/fi";
import ChartPreview from "../../components/ChartPreview";

const ChartForm = ({ onSubmit, isSubmitting, initialData, onCancel }) => {
  const [formData, setFormData] = useState({ title: "", embedUrl: "", category: "" });
  const [previewUrl, setPreviewUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const quickCategories = ["General", "Sales", "Marketing", "Finance", "HR", "Operations"];

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        embedUrl: initialData.embedUrl,
        category: initialData.category || "General",
      });
      setPreviewUrl(initialData.embedUrl);
    }
  }, [initialData]);

  // --- SECURITY & VALIDATION LOGIC ---
  const validateAndExtractUrl = (input) => {
    setErrorMsg("");

    // 1. Cek apakah kosong
    if (!input || input.trim() === "") {
      setPreviewUrl("");
      return "";
    }

    let urlToTest = input;

    // 2. Jika user paste full iframe tag, ekstrak src-nya
    const srcMatch = input.match(/src="([^"]+)"/);
    if (srcMatch && srcMatch[1]) {
      urlToTest = srcMatch[1];
    }

    // 3. SECURITY CHECK: Whitelist Domain
    // Hanya izinkan domain google.com (docs, sheets, drive)
    // Regex ini memastikan protokol https dan domain google
    const googleDomainRegex = /^https:\/\/(docs|drive|sheets)\.google\.com\//;

    if (!googleDomainRegex.test(urlToTest)) {
      setErrorMsg("Link tidak aman! Hanya menerima link dari Google Sheets/Docs.");
      setPreviewUrl("");
      return "";
    }

    // 4. Sanitasi Tambahan (XSS Prevention sederhana)
    // Pastikan tidak ada karakter mencurigakan di URL (biasanya URL google bersih)
    if (
      urlToTest.includes("javascript:") ||
      urlToTest.includes("vbscript:") ||
      urlToTest.includes("<script>")
    ) {
      setErrorMsg("Terdeteksi script berbahaya!");
      setPreviewUrl("");
      return "";
    }

    return urlToTest;
  };

  const handleUrlChange = (e) => {
    const val = e.target.value;
    setFormData({ ...formData, embedUrl: val });

    const validUrl = validateAndExtractUrl(val);
    if (validUrl) {
      setPreviewUrl(validUrl);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (errorMsg || !previewUrl) return;

    // Kirim data bersih
    onSubmit({ ...formData, embedUrl: previewUrl });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in pb-10">
      {/* KOLOM KIRI: FORM */}
      <div className="lg:col-span-4 space-y-6">
        <div className="card bg-white shadow-sm border border-gray-200">
          <div className="card-body p-6">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2 text-lg">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                <FiLayout />
              </div>
              {initialData ? "Edit Data Grafik" : "Konfigurasi Grafik"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Judul */}
              <div className="form-control">
                <label className="label font-bold text-xs text-gray-500 capitalize tracking-wide">
                  Judul Grafik <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 z-10 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FiType />
                  </div>
                  <input
                    type="text"
                    className="input input-bordered w-full pl-10 focus:border-blue-600 text-sm"
                    placeholder="Contoh: Laporan Penjualan Q1"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
              </div>

              {/* Kategori (Support Kalimat Panjang) */}
              <div className="form-control">
                <label className="label font-bold text-xs text-gray-500 capitalize tracking-wide">
                  Kategori / Periode <span className="text-red-500">*</span>
                </label>
                <div className="relative mb-3">
                  <div className="absolute inset-y-0 z-10 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FiTag />
                  </div>
                  <input
                    type="text"
                    className="input input-bordered w-full pl-10 focus:border-blue-600 text-sm"
                    placeholder="Cth: Laporan Tahunan 2024..."
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickCategories.map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setFormData({ ...formData, category: cat })}
                      className={`badge badge-md cursor-pointer transition-all ${
                        formData.category === cat
                          ? "badge-primary"
                          : "badge-ghost border-gray-200 text-gray-500"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Embed URL dengan Error State */}
              <div className="form-control">
                <label className="label font-bold text-xs text-gray-500 capitalize tracking-wide">
                  Embed Code (Google Sheets) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute top-3 z-10 left-3 pointer-events-none text-gray-400">
                    <FiCode />
                  </div>
                  <textarea
                    className={`textarea textarea-bordered w-full h-32 pl-10 text-xs font-mono focus:ring-1 transition-all leading-relaxed ${
                      errorMsg
                        ? "textarea-error focus:border-red-500 focus:ring-red-500"
                        : "focus:border-blue-600 focus:ring-blue-600"
                    }`}
                    placeholder="Paste kode <iframe> di sini..."
                    required
                    value={formData.embedUrl}
                    onChange={handleUrlChange}
                  ></textarea>
                </div>
                {errorMsg ? (
                  <div className="flex items-center gap-1 text-red-500 text-xs mt-2 font-medium animate-pulse">
                    <FiAlertTriangle /> {errorMsg}
                  </div>
                ) : (
                  <div className="bg-blue-50/50 p-4 mt-4 rounded-xl border border-blue-100 text-blue-800">
                    <p className="font-bold flex items-center gap-2 text-xs mb-2">
                      <FiHelpCircle /> Panduan Singkat:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-xs text-blue-700/80">
                      <li>Buka Google Sheet, Klik titik tiga pada Grafik.</li>
                      <li>
                        Pilih <b>Publish chart</b> (Publikasikan bagan/chart).
                      </li>
                      <li>
                        Pilih tab <b>Embed</b> (Sematkan) Klik Publish.
                      </li>
                      <li>Salin kode HTML yang muncul ke kolom di atas.</li>
                    </ol>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                {initialData && (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="btn btn-ghost flex-1 text-gray-500"
                  >
                    Batal
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!previewUrl || !!errorMsg || isSubmitting}
                  className="btn bg-blue-800 hover:bg-blue-900 text-white flex-1 shadow-lg border-none"
                >
                  {isSubmitting ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : initialData ? (
                    "Update"
                  ) : (
                    "Simpan"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* KOLOM KANAN: LIVE PREVIEW */}
      <div className="lg:col-span-8 flex flex-col h-full">
        <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden h-[500px] lg:h-auto">
          <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 flex justify-between items-center">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="text-xs text-gray-500 font-mono">
              {previewUrl ? "Preview Mode" : "Waiting input..."}
            </div>
          </div>
          <div className="flex-1 bg-gray-50 p-4 relative">
            <ChartPreview url={previewUrl} title="Live Preview" interactive={true} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartForm;
