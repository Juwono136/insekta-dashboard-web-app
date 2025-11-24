import { useState, useRef, useEffect } from "react";
import { FiPlus, FiEdit3, FiX, FiChevronDown, FiBriefcase, FiChevronUp } from "react-icons/fi";

const UserModal = ({ type, isOpen, onClose, onSubmit, initialData, companyList = [] }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "client",
    companyName: "",
    isActive: true,
  });

  // State Combobox
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const companyInputRef = useRef(null);

  // Load initial data
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ name: "", email: "", role: "client", companyName: "", isActive: true });
    }
  }, [initialData, isOpen]);

  // Handle klik luar dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (companyInputRef.current && !companyInputRef.current.contains(event.target)) {
        setShowCompanyDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const filteredCompanies = companyList.filter((comp) =>
    comp.toLowerCase().includes((formData.companyName || "").toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      {/* Tambahkan overflow-visible agar dropdown tidak terpotong jika ingin keluar batas (opsional, tapi aman dengan logic Upwards) */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            {type === "create" ? (
              <FiPlus className="text-blue-800" />
            ) : (
              <FiEdit3 className="text-orange-500" />
            )}
            {type === "create" ? "Tambah User Baru" : "Edit Data User"}
          </h3>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost text-gray-400 hover:text-gray-600"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Form Body - Tambahkan pb-20 agar ada ruang nafas di bawah */}
        <form
          id="userForm"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(formData);
          }}
          className="space-y-4 overflow-y-auto px-1 pb-4 custom-scrollbar"
        >
          <div className="form-control">
            <label className="label font-semibold text-gray-700 text-sm">
              Nama Lengkap {type === "create" && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              className="input input-bordered w-full focus:border-blue-800"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={type === "edit"}
            />
          </div>

          <div className="form-control">
            <label className="label font-semibold text-gray-700 text-sm">
              Email {type === "create" && <span className="text-red-500">*</span>}
            </label>
            <input
              type="email"
              className="input input-bordered w-full disabled:bg-gray-100 disabled:text-gray-500"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={type === "edit"}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label font-semibold text-gray-700 text-sm">Role</label>
              <select
                className="select select-bordered w-full"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="client">Client</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* --- COMBOBOX PERUSAHAAN (FIXED: OPEN UPWARDS) --- */}
            <div className="form-control relative" ref={companyInputRef}>
              <label className="label font-semibold text-gray-700 text-sm">
                Perusahaan {formData.role === "client" && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="input input-bordered w-full focus:border-blue-800 pr-8"
                  placeholder={formData.role === "client" ? "Pilih / Ketik..." : "Opsional"}
                  value={formData.companyName}
                  onChange={(e) => {
                    setFormData({ ...formData, companyName: e.target.value });
                    setShowCompanyDropdown(true);
                  }}
                  onFocus={() => setShowCompanyDropdown(true)}
                  required={formData.role === "client"}
                />
                {/* Icon panah berubah arah jika dropdown terbuka */}
                {showCompanyDropdown ? (
                  <FiChevronUp className="absolute right-3 top-3.5 text-blue-600 pointer-events-none" />
                ) : (
                  <FiChevronDown className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
                )}
              </div>

              {/* DROPDOWN LIST - UPWARDS */}
              {/* Class 'bottom-full' dan 'mb-1' membuatnya muncul DI ATAS input */}
              {showCompanyDropdown && filteredCompanies.length > 0 && (
                <ul className="absolute bottom-full mb-1 left-0 z-50 w-full bg-white border border-gray-200 rounded-lg shadow-2xl max-h-48 overflow-y-auto animate-fade-in-up origin-bottom">
                  {filteredCompanies.map((comp, idx) => (
                    <li
                      key={idx}
                      className="px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-800 cursor-pointer flex items-center gap-2 border-b border-gray-50 last:border-none"
                      onClick={() => {
                        setFormData({ ...formData, companyName: comp });
                        setShowCompanyDropdown(false);
                      }}
                    >
                      <FiBriefcase className="text-gray-400" size={14} />
                      <span className="font-medium">{comp}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* ------------------------------------------------ */}
          </div>

          {type === "edit" && (
            <div className="form-control bg-gray-50 p-3 rounded-lg border border-gray-100 mt-2">
              <label className="label cursor-pointer justify-between">
                <span className="label-text font-semibold text-gray-700 text-sm">
                  Status Akun Aktif?
                </span>
                <input
                  type="checkbox"
                  className="toggle toggle-success"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              </label>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex gap-3 pt-4 border-t border-gray-100 mt-auto">
          <button onClick={onClose} className="btn btn-ghost flex-1">
            Batal
          </button>
          <button
            form="userForm"
            type="submit"
            className="btn bg-blue-800 hover:bg-blue-900 text-white flex-1 shadow-lg"
          >
            Lanjut
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
