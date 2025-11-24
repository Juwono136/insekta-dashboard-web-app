import { useState, useMemo } from "react";
import { FiSearch, FiChevronDown, FiChevronRight, FiBriefcase, FiSettings } from "react-icons/fi";
import ContentConfigForm from "./ContentConfigForm";

const ClientAccessPanel = ({
  allClients,
  userConfigs,
  toggleUser,
  updateUserConfig,
  onRequestUncheckAll, // Trigger konfirmasi uncheck massal
  onRequestDeleteSubMenu, // Trigger konfirmasi hapus link submenu
}) => {
  const [searchClient, setSearchClient] = useState("");
  const [expandedCompanies, setExpandedCompanies] = useState({});

  // Helper: Toggle Custom Mode (Override Default)
  const toggleCustomMode = (userId) => {
    const current = userConfigs[userId];
    updateUserConfig(userId, {
      isCustom: !current.isCustom,
      // Jika mengaktifkan custom, kita reset value-nya agar admin mengisi ulang
      // Jika mematikan custom, value ini akan diabaikan oleh backend (pakai default)
      type: "single",
      url: "",
      subMenus: [],
    });
  };

  // Logic Pengelompokan Client berdasarkan Perusahaan
  const groupedClients = useMemo(() => {
    const groups = {};

    // Filter berdasarkan search text
    const filtered = allClients.filter(
      (u) =>
        u.name.toLowerCase().includes(searchClient.toLowerCase()) ||
        (u.companyName && u.companyName.toLowerCase().includes(searchClient.toLowerCase()))
    );

    // Proses Grouping
    filtered.forEach((user) => {
      const company = user.companyName || "Tanpa Perusahaan";
      if (!groups[company]) groups[company] = [];
      groups[company].push(user);
    });

    return groups;
  }, [allClients, searchClient]);

  return (
    <div className="w-full lg:w-1/2 flex flex-col h-full bg-white">
      {/* 1. Search Header */}
      <div className="p-3 border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="relative">
          <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            className="input input-sm input-bordered w-full pl-9 rounded-full focus:border-blue-500"
            placeholder="Cari Perusahaan atau Nama Client..."
            value={searchClient}
            onChange={(e) => setSearchClient(e.target.value)}
          />
        </div>
      </div>

      {/* 2. Tree View List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {Object.keys(groupedClients).length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xs opacity-60">
            <FiSearch size={24} className="mb-2" /> Tidak ada data client yang cocok.
          </div>
        ) : (
          Object.entries(groupedClients).map(([company, users]) => {
            // Cek status seleksi grup
            const selectedCount = users.filter((u) => userConfigs[u._id]).length;
            const isAllSelected = users.length > 0 && selectedCount === users.length;

            // Auto expand jika sedang mencari sesuatu
            const isExpanded = expandedCompanies[company] || searchClient.length > 0;

            return (
              <div
                key={company}
                className="border border-gray-200 rounded-lg overflow-hidden shadow-sm"
              >
                {/* A. Header Perusahaan (Parent) */}
                <div
                  className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                    isExpanded ? "bg-blue-50" : "bg-gray-50 hover:bg-gray-100"
                  }`}
                  onClick={() =>
                    setExpandedCompanies((prev) => ({ ...prev, [company]: !prev[company] }))
                  }
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <FiChevronDown className="text-gray-500" />
                    ) : (
                      <FiChevronRight className="text-gray-500" />
                    )}
                    <FiBriefcase className="text-blue-600" size={14} />
                    <span className="font-bold text-gray-700 text-sm">{company}</span>
                    <span className="badge badge-xs badge-ghost text-gray-500">{users.length}</span>
                  </div>

                  <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    {selectedCount > 0 && (
                      <span className="text-[10px] text-blue-600 font-semibold">
                        {selectedCount} Dipilih
                      </span>
                    )}

                    {/* Tombol Pilih Semua / Batal Semua */}
                    <button
                      type="button"
                      className={`btn btn-xs ${
                        isAllSelected ? "btn-error btn-outline" : "btn-primary btn-outline"
                      }`}
                      onClick={() => {
                        if (isAllSelected) {
                          // Gunakan callback requestUncheckAll untuk memicu konfirmasi di parent
                          onRequestUncheckAll(users);
                        } else {
                          // Langsung pilih semua (aman)
                          users.forEach((u) => {
                            if (!userConfigs[u._id]) toggleUser(u);
                          });
                        }
                      }}
                    >
                      {isAllSelected ? "Batal Semua" : "Pilih Semua"}
                    </button>
                  </div>
                </div>

                {/* B. List User (Children) */}
                {isExpanded && (
                  <div className="divide-y divide-gray-100 border-t border-gray-100 bg-white">
                    {users.map((u) => {
                      const config = userConfigs[u._id]; // Mengambil config user ini (jika ada)
                      const isSelected = !!config; // User ini dicentang?
                      const isCustom = config?.isCustom; // User ini pakai mode custom?

                      return (
                        <div
                          key={u._id}
                          className={`p-3 transition-all ${isSelected ? "bg-blue-50/20" : ""}`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Checkbox User Utama */}
                            <input
                              type="checkbox"
                              className="checkbox checkbox-sm checkbox-primary mt-1 rounded"
                              checked={isSelected}
                              onChange={() => toggleUser(u)}
                            />

                            <div className="flex-1 min-w-0">
                              {/* Baris Info User & Toggle Custom */}
                              <div className="flex justify-between items-start">
                                <div
                                  className="flex items-center gap-2 mb-1 cursor-pointer"
                                  onClick={() => toggleUser(u)}
                                >
                                  <div className="avatar placeholder w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-[10px] flex items-center justify-center font-bold">
                                    {u.avatar ? (
                                      <img src={u.avatar} alt="av" className="rounded-full" />
                                    ) : (
                                      u.name.charAt(0)
                                    )}
                                  </div>
                                  <div className="flex flex-col">
                                    <span
                                      className={`text-sm font-medium leading-tight ${
                                        isSelected ? "text-blue-700" : "text-gray-600"
                                      }`}
                                    >
                                      {u.name}
                                    </span>
                                    <span className="text-[10px] text-gray-400 truncate">
                                      {u.email}
                                    </span>
                                  </div>
                                </div>

                                {/* Toggle Custom Mode (Hanya muncul jika user dicentang) */}
                                {isSelected && (
                                  <label className="label cursor-pointer gap-2 py-0">
                                    <span
                                      className={`text-[10px] font-bold ${
                                        isCustom ? "text-orange-600" : "text-gray-400"
                                      }`}
                                    >
                                      {isCustom ? "Custom" : "Default"}
                                    </span>
                                    <input
                                      type="checkbox"
                                      className="toggle toggle-xs toggle-warning"
                                      checked={!!isCustom}
                                      onChange={() => toggleCustomMode(u._id)}
                                    />
                                  </label>
                                )}
                              </div>

                              {/* Area Konfigurasi Konten */}
                              {isSelected && (
                                <div className="mt-2 animate-fade-in">
                                  {isCustom ? (
                                    // Tampilkan Form Config Custom (Komponen Modular)
                                    <ContentConfigForm
                                      config={config}
                                      onChange={(newConf) => updateUserConfig(u._id, newConf)}
                                      onDeleteSubMenuRequest={(subIdx) =>
                                        onRequestDeleteSubMenu(u._id, subIdx)
                                      }
                                    />
                                  ) : (
                                    // Tampilkan Info Inherit Default
                                    <div className="ml-8 p-2 text-[10px] text-gray-500 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-2">
                                      <FiSettings className="text-gray-400" />
                                      Menggunakan konfigurasi konten <b>General (Default)</b>.
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
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
  );
};

export default ClientAccessPanel;
