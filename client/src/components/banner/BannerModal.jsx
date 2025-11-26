import { useState, useEffect } from "react";
import { FiX, FiGift, FiAlertCircle, FiInfo, FiLink } from "react-icons/fi";
import { BsMegaphone } from "react-icons/bs";

const BannerModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  // Tambahkan linkUrl di state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "info",
    linkUrl: "",
    isActive: true,
  });

  // LIMITER CONFIG
  const MAX_TITLE = 50;
  const MAX_CONTENT = 500;

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData); // Pastikan initialData dari backend sudah include linkUrl
      } else {
        setFormData({ title: "", content: "", type: "info", linkUrl: "", isActive: true });
      }
    }
  }, [isOpen, initialData]);

  // Helper Preview Style (Sama)
  const getPreviewStyle = () => {
    if (formData.type === "promo")
      return {
        bg: "bg-gradient-to-r from-purple-600 to-pink-500",
        icon: <FiGift size={24} />,
        label: "Promo",
      };
    if (formData.type === "warning")
      return {
        bg: "bg-gradient-to-r from-orange-500 to-yellow-400",
        icon: <FiAlertCircle size={24} />,
        label: "Penting",
      };
    return {
      bg: "bg-gradient-to-r from-blue-500 to-cyan-400",
      icon: <BsMegaphone size={24} />,
      label: "Info",
    };
  };
  const previewStyle = getPreviewStyle();

  // Validasi URL Sederhana
  const isValidUrl = (string) => {
    if (!string) return true; // Boleh kosong
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validasi Tambahan sebelum submit
    if (formData.linkUrl && !isValidUrl(formData.linkUrl)) {
      return alert("Link URL tidak valid! Pastikan menggunakan http:// atau https://");
    }

    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            {initialData ? (
              <FiEdit2 className="text-blue-600" />
            ) : (
              <FiPlus className="text-blue-600" />
            )}
            {initialData ? "Edit Banner" : "Buat Banner Baru"}
          </h3>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost text-gray-400 hover:text-gray-600"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row h-full overflow-hidden">
          {/* KOLOM KIRI: FORM INPUT */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar border-r border-gray-100">
            <form id="bannerForm" onSubmit={handleSubmit} className="space-y-5">
              {/* Judul */}
              <div className="form-control">
                <div className="flex justify-between">
                  <label className="label font-bold text-xs text-gray-500">Judul Banner</label>
                  <span
                    className={`text-[10px] mt-2 ${
                      formData.title.length >= MAX_TITLE ? "text-red-500" : "text-gray-400"
                    }`}
                  >
                    {formData.title.length}/{MAX_TITLE}
                  </span>
                </div>
                <input
                  type="text"
                  className="input input-bordered w-full focus:border-blue-600"
                  required
                  placeholder="Contoh: Promo Diskon 50%"
                  maxLength={MAX_TITLE}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              {/* Grid: Tipe & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label font-bold text-xs text-gray-500">Tipe Informasi</label>
                  <select
                    className="select select-bordered w-full"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="info">Info Umum (Biru)</option>
                    <option value="promo">Promosi (Ungu)</option>
                    <option value="warning">Peringatan (Kuning)</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label font-bold text-xs text-gray-500">Status Tayang</label>
                  <div
                    className="flex items-center gap-3 p-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                  >
                    <input
                      type="checkbox"
                      className="toggle toggle-success toggle-sm"
                      checked={formData.isActive}
                      readOnly
                    />
                    <span
                      className={`text-sm font-medium ${
                        formData.isActive ? "text-green-600" : "text-gray-400"
                      }`}
                    >
                      {formData.isActive ? "Aktif" : "Draft"}
                    </span>
                  </div>
                </div>
              </div>

              {/* [BARU] INPUT LINK URL */}
              <div className="form-control">
                <label className="label font-bold text-xs text-gray-500">
                  Link Tautan (Opsional)
                </label>
                <div className="relative">
                  <FiLink className="absolute z-10 left-3 top-3.5 text-gray-400 pointer-events-none" />
                  <input
                    type="url"
                    className={`input input-bordered w-full pl-9 focus:border-blue-600 ${
                      formData.linkUrl && !isValidUrl(formData.linkUrl) ? "input-error" : ""
                    }`}
                    placeholder="https://wa.me/628... atau https://google.com"
                    value={formData.linkUrl}
                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  />
                </div>
                <label className="label">
                  <span className="label-text-alt text-gray-400 text-[10px]">
                    Wajib menggunakan awalan <b>https://</b> atau <b>http://</b>
                  </span>
                </label>
              </div>

              {/* Konten */}
              <div className="form-control">
                <label className="label font-bold text-xs text-gray-500">
                  Konten / Deskripsi Singkat
                </label>
                <div className="flex flex-col">
                  <textarea
                    className="textarea textarea-bordered h-28 w-full focus:border-blue-600 leading-relaxed resize-none"
                    required
                    placeholder="Tulis deskripsi dari banner disini..."
                    maxLength={MAX_CONTENT}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  ></textarea>
                  <span
                    className={`text-[10px] mt-2 ${
                      formData.content.length >= MAX_CONTENT ? "text-red-500" : "text-gray-400"
                    }`}
                  >
                    {formData.content.length}/{MAX_CONTENT} Karakter
                  </span>
                </div>
              </div>
            </form>
          </div>

          {/* KOLOM KANAN: LIVE PREVIEW */}
          <div className="lg:w-[380px] bg-gray-50 p-6 flex flex-col justify-center items-center border-t lg:border-t-0">
            <div className="mb-2 flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider">
              <FiInfo /> Simulasi Tampilan di Client
            </div>

            {/* Kartu Preview */}
            <div
              className={`w-full rounded-2xl shadow-xl text-white p-6 relative overflow-hidden transition-all duration-500 ${
                previewStyle.bg
              } ${!formData.isActive && "opacity-50 grayscale filter"}`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-black opacity-5 rounded-full -ml-5 -mb-5 blur-xl"></div>

              <div className="relative z-10 flex flex-col h-full gap-4 min-h-[140px]">
                <div className="flex justify-between items-start">
                  <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg w-fit shadow-sm">
                    {previewStyle.icon}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 bg-black/20 px-2 py-0.5 rounded-full">
                    {previewStyle.label}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-snug mb-2 wrap-break-word line-clamp-2">
                    {formData.title || "Judul Banner"}
                  </h3>
                  <p className="text-xs opacity-90 leading-relaxed wrap-break-word line-clamp-3">
                    {formData.content ||
                      "Isi konten banner akan muncul di sini. Pastikan kalimatnya singkat, padat, dan menarik."}
                  </p>
                </div>
              </div>

              {!formData.isActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[2px] z-20">
                  <span className="bg-white text-gray-800 px-4 py-1.5 rounded-full text-xs font-bold shadow-lg border border-gray-200">
                    MODE DRAFT
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
          <button onClick={onClose} className="btn btn-ghost text-gray-500 hover:bg-gray-200">
            Batal
          </button>
          <button
            form="bannerForm"
            type="submit"
            className="btn bg-blue-800 hover:bg-blue-900 text-white px-8 shadow-lg border-none"
          >
            {initialData ? "Simpan Perubahan" : "Buat Banner"}
          </button>
        </div>
      </div>
    </div>
  );
};

import { FiEdit2, FiPlus } from "react-icons/fi"; // Import tambahan untuk icon header
export default BannerModal;
