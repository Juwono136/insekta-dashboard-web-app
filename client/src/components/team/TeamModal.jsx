import { useState, useEffect, useRef } from "react";
import {
  FiX,
  FiUploadCloud,
  FiAlertCircle,
  FiChevronDown,
  FiUsers,
  FiBriefcase,
  FiSearch,
  FiSquare,
  FiCheckSquare,
  FiMinusSquare,
  FiMapPin,
  FiChevronRight,
} from "react-icons/fi";
import { getImageUrl } from "../../utils/imageUrl";
import userService from "../../services/userService";
import { useMemo } from "react";

const TeamModal = ({ isOpen, type, onClose, onSubmit, initialData, areaList }) => {
  // --- FORM STATE ---
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

  // --- CLIENT ACCESS STATE ---
  const [allClients, setAllClients] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);
  const [clientSearch, setClientSearch] = useState("");

  // [BARU] State untuk Toggle Dropdown Perusahaan
  const [expandedGroups, setExpandedGroups] = useState({});

  // --- UI STATE ---
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const areaInputRef = useRef(null);

  // 1. Fetch Clients
  useEffect(() => {
    if (isOpen) {
      const loadClients = async () => {
        try {
          const res = await userService.getUsers({ role: "client", limit: 1000 });
          setAllClients(res.users);
        } catch (e) {
          console.error(e);
        }
      };
      loadClients();
    }
  }, [isOpen]);

  // 2. Init Data
  useEffect(() => {
    if (isOpen) {
      setFormError(null);
      if (initialData && type === "edit") {
        setFormData({
          name: initialData.name,
          role: initialData.role,
          phone: initialData.phone,
          area: initialData.area,
          outlets: initialData.outlets,
        });
        setPhotoPreview(initialData.photo ? getImageUrl(initialData.photo) : "");
        setPhotoFile(null);

        const currentIds =
          initialData.assignedClients?.map((c) => (typeof c === "object" ? c._id : c)) || [];
        setSelectedClients(currentIds);
      } else {
        setFormData({ name: "", role: "Teknisi", phone: "", area: "", outlets: "" });
        setPhotoPreview("");
        setPhotoFile(null);
        setSelectedClients([]);
      }
      // Reset expanded state saat modal dibuka
      setExpandedGroups({});
    }
  }, [isOpen, initialData, type]);

  // --- LOGIC GROUPING ---
  const groupedClients = useMemo(() => {
    const groups = {};
    const filtered = allClients.filter(
      (c) =>
        c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
        (c.companyName && c.companyName.toLowerCase().includes(clientSearch.toLowerCase()))
    );

    filtered.forEach((client) => {
      const company = client.companyName || "Tanpa Perusahaan";
      if (!groups[company]) groups[company] = [];
      groups[company].push(client);
    });

    return Object.keys(groups)
      .sort()
      .reduce((obj, key) => {
        obj[key] = groups[key];
        return obj;
      }, {});
  }, [allClients, clientSearch]);

  // [BARU] Auto Expand saat Search
  useEffect(() => {
    if (clientSearch) {
      // Buka semua grup yang ada isinya jika sedang mencari
      const allKeys = Object.keys(groupedClients).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {});
      setExpandedGroups(allKeys);
    }
  }, [clientSearch, groupedClients]);

  // Toggle Single Client
  const handleClientToggle = (clientId) => {
    setSelectedClients((prev) =>
      prev.includes(clientId) ? prev.filter((id) => id !== clientId) : [...prev, clientId]
    );
  };

  // Toggle Group Selection (Checklist)
  const handleGroupCheck = (clientsInGroup) => {
    const groupIds = clientsInGroup.map((c) => c._id);
    const allSelected = groupIds.every((id) => selectedClients.includes(id));

    if (allSelected) {
      setSelectedClients((prev) => prev.filter((id) => !groupIds.includes(id)));
    } else {
      const newIds = groupIds.filter((id) => !selectedClients.includes(id));
      setSelectedClients((prev) => [...prev, ...newIds]);
    }
  };

  // [BARU] Toggle Group Expansion (Dropdown)
  const toggleExpand = (company) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [company]: !prev[company],
    }));
  };

  // --- VALIDATION & SUBMIT ---
  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.name.trim() ||
      !formData.role ||
      !formData.phone.trim() ||
      !formData.area.trim()
    ) {
      setFormError("Data wajib belum lengkap.");
      return;
    }

    // Regex Phone
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;
    if (!phoneRegex.test(formData.phone)) {
      setFormError("Nomor HP tidak valid. Gunakan format 08xx atau 628xx.");
      return;
    }

    if (selectedClients.length === 0) {
      setFormError("Pilih minimal satu client.");
      return;
    }

    onSubmit(formData, photoFile, selectedClients);
  };

  // Click Outside Area Dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (areaInputRef.current && !areaInputRef.current.contains(e.target))
        setShowAreaDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) return alert("Maksimal 1 MB.");
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  if (!isOpen) return null;

  const filteredAreas = areaList.filter((a) =>
    a.toLowerCase().includes(formData.area.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[95vh]">
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

        <div className="flex flex-col lg:flex-row h-full overflow-hidden">
          {/* KOLOM KIRI: Form Input */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar border-r border-gray-100">
            <form id="teamForm" onSubmit={handleSubmit} className="space-y-5">
              {/* Error Alert */}
              {formError && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-lg text-xs font-medium flex items-center gap-2 animate-shake">
                  <FiAlertCircle size={16} className="shrink-0" /> {formError}
                </div>
              )}

              {/* Foto Profile */}
              <div className="flex items-center gap-5">
                <div className="relative group w-20 h-20 shrink-0">
                  <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden border-2 border-gray-200 shadow-inner flex items-center justify-center">
                    {photoPreview ? (
                      <img src={photoPreview} className="w-full h-full object-cover" />
                    ) : (
                      <FiUsers className="text-gray-300" size={32} />
                    )}
                  </div>
                  <label className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer rounded-full transition-opacity backdrop-blur-[1px]">
                    <FiUploadCloud className="text-white" />
                    <input
                      type="file"
                      className="hidden"
                      onChange={handlePhotoChange}
                      accept="image/*"
                    />
                  </label>
                </div>
                <div className="flex-1">
                  <label className="label text-xs font-bold text-gray-500">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="input input-sm input-bordered w-full focus:border-blue-600"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Foto opsional. Maks 1MB dan format JPG/JPEG.
                  </p>
                </div>
              </div>

              {/* Inputs Lain (Role, Phone, Area, Outlet) - Sama Persis */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label text-xs font-bold text-gray-500">
                    Jabatan <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="select select-sm select-bordered w-full focus:border-blue-600"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option>Teknisi</option>
                    <option>Supervisor</option>
                    <option>Admin</option>
                    <option>Manager</option>
                  </select>
                </div>
                <div>
                  <label className="label text-xs font-bold text-gray-500">
                    No WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="input input-sm input-bordered w-full focus:border-blue-600"
                    required
                    placeholder="08... atau 628..."
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value.replace(/[^0-9+]/g, "") })
                    }
                  />
                </div>
              </div>

              <div className="form-control relative" ref={areaInputRef}>
                <label className="label text-xs font-bold text-gray-500">
                  Label Area (Grouping) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="input input-sm input-bordered w-full pr-8 focus:border-blue-600"
                    placeholder="Pilih atau ketik baru..."
                    required
                    value={formData.area}
                    onChange={(e) => {
                      setFormData({ ...formData, area: e.target.value });
                      setShowAreaDropdown(true);
                    }}
                    onFocus={() => setShowAreaDropdown(true)}
                  />
                  <FiChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
                </div>
                {showAreaDropdown && filteredAreas.length > 0 && (
                  <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-1 max-h-36 overflow-y-auto animate-fade-in-up">
                    {filteredAreas.map((area, idx) => (
                      <li
                        key={idx}
                        className="px-4 py-2 text-xs hover:bg-blue-50 cursor-pointer flex items-center gap-2 text-gray-600"
                        onClick={() => {
                          setFormData({ ...formData, area });
                          setShowAreaDropdown(false);
                        }}
                      >
                        <FiMapPin size={10} className="text-gray-400" /> {area}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <label className="label text-xs font-bold text-gray-500">
                  List Outlet (Pisahkan dengan koma)
                </label>
                <textarea
                  className="textarea textarea-bordered h-20 w-full text-xs focus:border-blue-600 leading-relaxed"
                  placeholder="Contoh: Outlet A, Outlet B (Pisahkan koma)"
                  value={formData.outlets}
                  onChange={(e) => setFormData({ ...formData, outlets: e.target.value })}
                ></textarea>
              </div>
            </form>
          </div>

          {/* KOLOM KANAN: Akses Client (Grouped with Dropdown) */}
          <div className="lg:w-80 bg-gray-50 flex flex-col h-full overflow-hidden border-t lg:border-t-0">
            {/* Header Kanan */}
            <div className="p-4 bg-white border-b border-gray-100 shadow-sm z-10">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <FiBriefcase className="text-blue-600" /> Pilih Client
                </h4>
                <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                  {selectedClients.length} Dipilih
                </span>
              </div>
              <div className="relative">
                <FiSearch className="absolute z-10 left-3 top-2.5 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder="Cari client..."
                  className="input input-sm input-bordered w-full pl-9 text-xs bg-white"
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                />
              </div>
            </div>

            {/* List Group (Tree View Style) */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
              {Object.keys(groupedClients).length === 0 ? (
                <div className="text-center py-10">
                  <FiUsers className="mx-auto text-gray-300 text-3xl mb-2" />
                  <p className="text-xs text-gray-400">Data tidak ditemukan.</p>
                </div>
              ) : (
                Object.entries(groupedClients).map(([company, users]) => {
                  // Hitung status seleksi
                  const groupIds = users.map((u) => u._id);
                  const selectedCount = groupIds.filter((id) =>
                    selectedClients.includes(id)
                  ).length;
                  const isAllSelected = selectedCount === groupIds.length;
                  const isPartial = selectedCount > 0 && !isAllSelected;
                  const isExpanded = expandedGroups[company];

                  return (
                    <div
                      key={company}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm transition-all duration-300"
                    >
                      {/* Group Header (Klik Text -> Expand, Klik Checkbox -> Select All) */}
                      <div className="flex items-center px-3 py-2.5 bg-gray-50/50 hover:bg-gray-100 transition-colors select-none">
                        {/* Toggle Expand Icon */}
                        <button
                          onClick={() => toggleExpand(company)}
                          className="mr-2 text-gray-400 hover:text-gray-600 focus:outline-none transition-transform duration-200"
                          style={{ transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)" }}
                        >
                          <FiChevronRight size={16} />
                        </button>

                        {/* Checkbox Group */}
                        <div
                          className={`text-lg cursor-pointer mr-2 ${
                            isAllSelected
                              ? "text-blue-600"
                              : isPartial
                              ? "text-blue-400"
                              : "text-gray-300"
                          }`}
                          onClick={() => handleGroupCheck(users)}
                        >
                          {isAllSelected ? (
                            <FiCheckSquare />
                          ) : isPartial ? (
                            <FiMinusSquare />
                          ) : (
                            <FiSquare />
                          )}
                        </div>

                        {/* Company Name (Click to Expand) */}
                        <div
                          className="flex-1 cursor-pointer min-w-0"
                          onClick={() => toggleExpand(company)}
                        >
                          <p className="text-xs font-bold text-gray-700 truncate">{company}</p>
                          <p className="text-[9px] text-gray-400">
                            {selectedCount}/{users.length} Akses
                          </p>
                        </div>
                      </div>

                      {/* Client List (Dropdown Animation) */}
                      {isExpanded && (
                        <div className="border-t border-gray-100 bg-white animate-fade-in-down origin-top">
                          {users.map((user) => {
                            const isSelected = selectedClients.includes(user._id);
                            return (
                              <div
                                key={user._id}
                                onClick={() => handleClientToggle(user._id)}
                                className={`flex items-center gap-3 px-3 py-2 pl-10 cursor-pointer border-b border-gray-50 last:border-none transition-colors ${
                                  isSelected ? "bg-blue-50/50" : "hover:bg-gray-50"
                                }`}
                              >
                                <div
                                  className={`text-base ${
                                    isSelected ? "text-blue-600" : "text-gray-200"
                                  }`}
                                >
                                  {isSelected ? <FiCheckSquare /> : <FiSquare />}
                                </div>
                                <span
                                  className={`text-xs truncate ${
                                    isSelected ? "font-bold text-blue-800" : "text-gray-600"
                                  }`}
                                >
                                  {user.name}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white rounded-b-2xl flex justify-end gap-3">
          <button onClick={onClose} className="btn btn-ghost text-gray-500">
            Batal
          </button>
          <button
            form="teamForm"
            type="submit"
            className="btn bg-blue-800 hover:bg-blue-900 text-white px-6 shadow-lg"
          >
            Simpan Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamModal;
