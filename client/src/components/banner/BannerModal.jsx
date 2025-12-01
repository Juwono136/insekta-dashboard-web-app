import { useState, useEffect } from "react";

// assets
import {
  FiX,
  FiUploadCloud,
  FiLink,
  FiImage,
  FiInfo,
  FiExternalLink,
  FiGift,
  FiAlertCircle,
} from "react-icons/fi";
import { BsMegaphone } from "react-icons/bs";

// features
import { getImageUrl } from "../../utils/imageUrl";

const BannerModal = ({ isOpen, onClose, onSubmit, initialData, isSubmitting }) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "info",
    linkUrl: "",
    isActive: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Config Limit
  const MAX_TITLE = 50;
  const MAX_CONTENT = 500;

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          title: initialData.title,
          content: initialData.content || "",
          type: initialData.type || "info",
          linkUrl: initialData.linkUrl || "",
          isActive: initialData.isActive,
        });
        setImagePreview(getImageUrl(initialData.image));
        setImageFile(null);
      } else {
        setFormData({ title: "", content: "", type: "info", linkUrl: "", isActive: true });
        setImagePreview("");
        setImageFile(null);
      }
      setErrorMsg("");
    }
  }, [isOpen, initialData]);

  const getTypeBadge = (type) => {
    if (type === "promo") return { label: "PROMO", color: "bg-purple-600", icon: <FiGift /> };
    if (type === "warning")
      return { label: "PENTING", color: "bg-orange-600", icon: <FiAlertCircle /> };
    return { label: "INFO", color: "bg-blue-600", icon: <BsMegaphone /> };
  };
  const badgeStyle = getTypeBadge(formData.type);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type))
        return setErrorMsg("Hanya JPG/PNG.");
      if (file.size > 2 * 1024 * 1024) return setErrorMsg("Max 2MB.");

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setErrorMsg("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return setErrorMsg("Judul dan Konten wajib diisi.");
    if (!initialData && !imageFile) return setErrorMsg("Gambar wajib diupload.");

    const submitData = new FormData();
    submitData.append("title", formData.title);
    submitData.append("content", formData.content);
    submitData.append("type", formData.type);
    submitData.append("linkUrl", formData.linkUrl);
    submitData.append("isActive", formData.isActive);
    if (imageFile) submitData.append("image", imageFile);

    onSubmit(submitData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
          <h3 className="text-lg font-bold text-gray-800">
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
          {/* KIRI: FORM INPUT */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar border-r border-gray-100 space-y-4">
            <form id="bannerForm" onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-bold flex gap-2">
                  <FiInfo /> {errorMsg}
                </div>
              )}

              {/* Upload Gambar */}
              <div className="form-control">
                <label className="label font-bold text-xs text-gray-500">
                  Gambar Background <span className="text-red-500">*</span>
                </label>
                <div className="relative w-full h-32 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors overflow-hidden group cursor-pointer">
                  {imagePreview ? (
                    <>
                      <img
                        src={imagePreview}
                        className="w-full h-full object-cover opacity-80"
                        alt="Preview"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                        <span className="text-white text-xs font-bold flex items-center gap-2">
                          <FiUploadCloud /> Ganti Gambar
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <FiImage size={24} className="mb-1" />{" "}
                      <span className="text-[10px]">Upload JPG/PNG (Max 2MB)</span>
                    </div>
                  )}
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                </div>
              </div>

              {/* Judul */}
              <div className="form-control">
                <div className="flex justify-between">
                  <label className="label font-bold text-xs text-gray-500">Judul</label>
                  <span className="text-[10px] text-gray-400 mt-2">
                    {formData.title.length}/{MAX_TITLE}
                  </span>
                </div>
                <input
                  type="text"
                  className="input input-sm input-bordered w-full"
                  maxLength={MAX_TITLE}
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Judul Banner..."
                />
              </div>

              {/* Grid Tipe & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label font-bold text-xs text-gray-500">Tipe</label>
                  <select
                    className="select select-sm select-bordered w-full"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="info">Info Umum (Biru)</option>
                    <option value="promo">Promosi (Ungu)</option>
                    <option value="warning">Peringatan (Orange)</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label font-bold text-xs text-gray-500">Status</label>
                  <div
                    className="flex items-center gap-2 border rounded-lg p-1.5 px-3 cursor-pointer"
                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                  >
                    <input
                      type="checkbox"
                      className="toggle toggle-success toggle-sm"
                      checked={formData.isActive}
                      readOnly
                    />
                    <span className="text-xs font-medium">
                      {formData.isActive ? "Tayang" : "Draft"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Konten */}
              <div className="form-control">
                <div className="flex justify-between">
                  <label className="label font-bold text-xs text-gray-500">Deskripsi Singkat</label>
                  <span className="text-[10px] text-gray-400 mt-2">
                    {formData.content.length}/{MAX_CONTENT}
                  </span>
                </div>
                <textarea
                  className="textarea textarea-bordered h-24 w-full text-sm resize-none"
                  maxLength={MAX_CONTENT}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Deskripsi banner..."
                ></textarea>
              </div>

              {/* Link URL */}
              <div className="form-control">
                <label className="label font-bold text-xs text-gray-500">Link URL (Opsional)</label>
                <div className="relative">
                  <FiLink className="absolute z-10 left-3 top-2.5 text-gray-400" size={14} />
                  <input
                    type="url"
                    className="input input-sm input-bordered w-full pl-9"
                    placeholder="https://..."
                    value={formData.linkUrl}
                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  />
                </div>
              </div>
            </form>
          </div>

          {/* KANAN: LIVE PREVIEW */}
          <div className="lg:w-[450px] bg-gray-50 p-6 flex flex-col justify-center items-center border-t lg:border-t-0">
            <div className="mb-4 flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider">
              <FiInfo /> Simulasi Tampilan Client
            </div>

            {/* KARTU PREVIEW */}
            <div
              className={`w-full aspect-video rounded-3xl shadow-xl relative overflow-hidden group transition-all duration-500 ${
                !formData.isActive && "opacity-50 grayscale"
              }`}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  className="absolute inset-0 w-full h-full object-cover"
                  alt="Preview"
                />
              ) : (
                <div className="absolute inset-0 bg-gray-300 flex items-center justify-center text-gray-500">
                  <span className="text-xs font-medium">No Image</span>
                </div>
              )}

              <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/40 to-transparent"></div>

              <div className="relative z-10 flex flex-col justify-between h-full p-6 text-white">
                {/* Badge Tipe */}
                <div className="flex justify-start">
                  <span
                    className={`${badgeStyle.color} text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1.5`}
                  >
                    {badgeStyle.icon} {badgeStyle.label}
                  </span>
                </div>

                {/* Teks & Action */}
                <div>
                  <h3 className="font-bold text-xl leading-tight mb-2 line-clamp-2 drop-shadow-md">
                    {formData.title || "Judul Banner..."}
                  </h3>
                  <p className="text-xs opacity-90 leading-relaxed line-clamp-2 mb-3 text-gray-200">
                    {formData.content ||
                      "Deskripsi singkat banner akan muncul di sini untuk memberikan konteks kepada pengguna."}
                  </p>

                  {/* Tombol Link (Jika ada) */}
                  {formData.linkUrl ? (
                    <div className="inline-flex items-center gap-2 bg-white text-gray-900 px-4 py-1.5 rounded-full text-[10px] font-bold shadow-lg w-fit">
                      Buka Link <FiExternalLink />
                    </div>
                  ) : (
                    <div className="opacity-50 text-[9px] uppercase font-bold tracking-widest mt-2">
                      Info Insekta
                    </div>
                  )}
                </div>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-4 text-center">
              Preview ini mendekati tampilan asli di dashboard client.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="btn btn-ghost text-gray-500 hover:bg-gray-200"
          >
            Batal
          </button>

          <button
            form="bannerForm"
            type="submit"
            disabled={isSubmitting}
            className="btn bg-[#093050] hover:bg-blue-900 text-white px-8 shadow-lg border-none flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Menyimpan...
              </>
            ) : initialData ? (
              "Simpan Perubahan"
            ) : (
              "Buat Banner"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BannerModal;
