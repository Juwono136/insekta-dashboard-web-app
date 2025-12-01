import { useState, useEffect } from "react";

// assets
import { FiX, FiMonitor, FiLink, FiType, FiInfo } from "react-icons/fi";

const ChannelModal = ({ isOpen, onClose, onSubmit, initialData, isSubmitting }) => {
  const [formData, setFormData] = useState({ title: "", description: "", url: "", isActive: true });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          title: initialData.title,
          description: initialData.description || "",
          url: initialData.url,
          isActive: initialData.isActive,
        });
      } else {
        setFormData({ title: "", description: "", url: "", isActive: true });
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FiMonitor className="text-blue-700" />
            {initialData ? "Edit Kanal Website" : "Tambah Kanal Baru"}
          </h3>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="btn btn-sm btn-circle btn-ghost text-gray-400"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Form */}
        <form id="channelForm" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="form-control">
            <label className="label text-xs font-bold text-gray-500">Judul Website</label>
            <div className="relative">
              <FiType className="absolute z-10 left-3 top-3 text-gray-400" />
              <input
                type="text"
                className="input input-bordered w-full pl-10 focus:border-blue-600"
                required
                placeholder="Contoh: Dashboard Monitoring CCTV"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label text-xs font-bold text-gray-500">Link URL (HTTPS)</label>
            <div className="relative">
              <FiLink className="absolute z-10 left-3 top-3 text-gray-400" />
              <input
                type="url"
                className="input input-bordered w-full pl-10 focus:border-blue-600"
                required
                placeholder="https://example.com"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              />
            </div>
            <label className="label">
              <span className="label-text-alt text-gray-400 text-[10px] flex items-center gap-1">
                <FiInfo size={10} /> Pastikan website mengizinkan embedding (iframe).
              </span>
            </label>
          </div>

          <div className="form-control flex flex-col gap-1">
            <label className="label text-xs font-bold text-gray-500">Deskripsi Singkat</label>
            <textarea
              className="textarea textarea-bordered h-24 w-full focus:border-blue-600"
              placeholder="Jelaskan fungsi website ini..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>

          <div className="form-control">
            <label className="label cursor-pointer justify-between border border-gray-200 p-3 rounded-lg hover:bg-gray-50">
              <span className="label-text font-bold text-sm text-gray-600">Status Aktif</span>
              <input
                type="checkbox"
                className="toggle toggle-success toggle-sm"
                checked={formData.isActive}
                onChange={() => setFormData({ ...formData, isActive: !formData.isActive })}
              />
            </label>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
          <button onClick={onClose} disabled={isSubmitting} className="btn btn-ghost text-gray-500">
            Batal
          </button>
          <button
            form="channelForm"
            type="submit"
            disabled={isSubmitting}
            className="btn bg-[#093050] hover:bg-blue-900 text-white px-6"
          >
            {isSubmitting ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              "Simpan Data"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChannelModal;
