import { useState, useEffect, useRef } from "react";
import {
  FiX,
  FiUsers,
  FiUploadCloud,
  FiAlertCircle,
  FiChevronDown,
  FiMapPin,
  FiUser,
} from "react-icons/fi";
import { getImageUrl } from "../../utils/imageUrl";

const TeamModal = ({ isOpen, type, onClose, onSubmit, initialData, areaList }) => {
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    role: "Teknisi",
    phone: "",
    area: "",
    outlets: "",
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [formError, setFormError] = useState(null);

  // Smart Input State
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const areaInputRef = useRef(null);

  // Init Data (Reset atau Load Edit)
  useEffect(() => {
    if (isOpen) {
      setFormError(null);
      setShowAreaDropdown(false);
      if (initialData && type === "edit") {
        setFormData({
          name: initialData.name,
          role: initialData.role,
          phone: initialData.phone,
          area: initialData.area,
          outlets: initialData.outlets,
        });
        setPhotoPreview(getImageUrl(initialData.photo));
        setPhotoFile(null);
      } else {
        setFormData({ name: "", role: "Teknisi", phone: "", area: "", outlets: "" });
        setPhotoPreview("");
        setPhotoFile(null);
      }
    }
  }, [isOpen, initialData, type]);

  // Handle Click Outside Dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (areaInputRef.current && !areaInputRef.current.contains(e.target))
        setShowAreaDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Validation Logic
  const validateForm = () => {
    setFormError(null);
    if (
      !formData.name.trim() ||
      !formData.role ||
      !formData.phone.trim() ||
      !formData.area.trim()
    ) {
      setFormError("Nama, Jabatan, No HP, dan Area wajib diisi.");
      return false;
    }
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;
    if (!phoneRegex.test(formData.phone)) {
      setFormError("Nomor HP tidak valid.");
      return false;
    }
    // Tidak ada pengecekan photoFile lagi
    return true;
  };

  // Handlers
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) return alert("Maksimal 1 MB.");
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setFormError(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSubmit(formData, photoFile); // Kirim data bersih ke parent
  };

  if (!isOpen) return null;

  const filteredAreas = areaList.filter((a) =>
    a.toLowerCase().includes(formData.area.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
          <h3 className="text-lg font-bold text-gray-800">
            {type === "create" ? "Tambah Anggota Tim" : "Edit Data Tim"}
          </h3>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost text-gray-400 hover:text-gray-600"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <form
          id="teamForm"
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto custom-scrollbar"
        >
          {formError && (
            <div className="mb-6 bg-red-50 border border-red-100 p-3 rounded-lg flex items-start gap-3 animate-shake">
              <FiAlertCircle className="text-red-500 mt-0.5 shrink-0" size={18} />
              <p className="text-xs text-red-600 mt-0.5 font-medium">{formError}</p>
            </div>
          )}

          <div className="flex flex-col md:flex-row">
            {/* Foto */}
            <div className="flex flex-col items-center space-y-3 md:w-1/3">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-100 relative group">
                {photoPreview ? (
                  <img src={photoPreview} className="w-full h-full object-cover" alt="preview" />
                ) : (
                  // TAMPILAN IKON JIKA KOSONG
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                    <FiUser size={48} />
                    <span className="text-[10px] mt-1 font-medium">No Photo</span>
                  </div>
                )}
                {/* Overlay Upload */}
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white font-medium text-xs backdrop-blur-[1px]">
                  <FiUploadCloud size={20} className="mb-1 mr-1" />{" "}
                  {photoPreview ? "Ganti" : "Upload"}
                  <input
                    type="file"
                    className="hidden"
                    onChange={handlePhotoChange}
                    accept="image/png, image/jpeg, image/jpg"
                  />
                </label>
              </div>
              <p className="text-[10px] text-gray-400 text-center">
                Foto Opsional.
                <br />
                JPG/PNG Max 1MB.
              </p>
            </div>

            {/* Inputs */}
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label text-xs font-bold text-gray-600">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full focus:border-blue-600"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="form-control">
                  <label className="label text-xs font-bold text-gray-600">
                    Jabatan <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="select select-bordered w-full focus:border-blue-600"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option>Teknisi</option>
                    <option>Supervisor</option>
                    <option>Admin</option>
                    <option>Manager</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label text-xs font-bold text-gray-600">
                    No WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full focus:border-blue-600"
                    required
                    placeholder="0812..."
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "") })
                    }
                  />
                </div>

                {/* Smart Area Input */}
                <div className="form-control relative" ref={areaInputRef}>
                  <label className="label text-xs font-bold text-gray-600">
                    Area Kerja <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      className="input input-bordered w-full pr-8 focus:border-blue-600"
                      placeholder="Pilih / Ketik..."
                      required
                      value={formData.area}
                      onChange={(e) => {
                        setFormData({ ...formData, area: e.target.value });
                        setShowAreaDropdown(true);
                      }}
                      onFocus={() => setShowAreaDropdown(true)}
                    />
                    <FiChevronDown className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
                  </div>
                  {showAreaDropdown && filteredAreas.length > 0 && (
                    <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-1 max-h-40 overflow-y-auto animate-fade-in-up">
                      {filteredAreas.map((area, idx) => (
                        <li
                          key={idx}
                          className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer flex items-center gap-2"
                          onClick={() => {
                            setFormData({ ...formData, area: area });
                            setShowAreaDropdown(false);
                          }}
                        >
                          <FiMapPin size={12} className="text-gray-400" /> {area}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="form-control flex gap-1 flex-col">
                <label className="label text-xs font-bold text-gray-600">List Outlet</label>
                <textarea
                  className="textarea textarea-bordered w-full h-20 focus:border-blue-600 text-sm leading-relaxed"
                  placeholder="Contoh: Outlet A, Outlet B (Pisahkan dengan koma)"
                  value={formData.outlets}
                  onChange={(e) => setFormData({ ...formData, outlets: e.target.value })}
                ></textarea>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
          <button onClick={onClose} className="btn btn-ghost text-gray-500 hover:bg-gray-200">
            Batal
          </button>
          <button
            form="teamForm"
            type="submit"
            className="btn bg-blue-800 hover:bg-blue-900 text-white px-6 shadow-md border-none"
          >
            Simpan Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamModal;
