import { useState, useEffect } from "react";
import { FiPlus, FiEdit3, FiX } from "react-icons/fi";
import { getImageUrl } from "../utils/imageUrl";
import userService from "../services/userService";

// Import Sub-Komponen Modular
import GlobalInfoForm from "./feature-forms/GlobalInfoForm";
import ClientAccessPanel from "./feature-forms/ClientAccessPanel";
import ConfirmationAlert from "./feature-forms/ConfirmationAlert";
import toast from "react-hot-toast";

const FeatureModal = ({ type, isOpen, onClose, onSubmit, initialData }) => {
  const [title, setTitle] = useState("");
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState("");

  // State Konfigurasi Default (General)
  const [defaultConfig, setDefaultConfig] = useState({ type: "single", url: "", subMenus: [] });

  // State Konfigurasi User (Map: userId -> config)
  const [userConfigs, setUserConfigs] = useState({});

  // Data Client
  const [allClients, setAllClients] = useState([]);

  // State Konfirmasi (Safety)
  const [confirmState, setConfirmState] = useState(null);

  // --- INIT DATA ---
  useEffect(() => {
    if (isOpen) {
      // 1. Fetch Data Client
      const fetchClients = async () => {
        try {
          const res = await userService.getUsers({ role: "client", limit: 1000 });
          setAllClients(res.users);
        } catch (e) {
          console.error(e);
        }
      };
      fetchClients();

      // 2. Set Form Data (Edit vs Create)
      if (initialData) {
        setTitle(initialData.title);
        setIconPreview(getImageUrl(initialData.icon));

        // Load Default Config
        setDefaultConfig({
          type: initialData.defaultType || "single",
          url: initialData.defaultUrl || "",
          subMenus: initialData.defaultSubMenus || [],
        });

        // Load User Configs (Convert Array to Object Map)
        const configMap = {};
        if (initialData.assignedTo && Array.isArray(initialData.assignedTo)) {
          initialData.assignedTo.forEach((item) => {
            // [PERBAIKAN BUG CRITICAL DISINI]
            // Cek jika user bernilai null (karena user sudah dihapus di User Management)
            // Jika null, kita skip agar tidak error reading '_id'
            if (!item.user) return;

            // Handle populate user object vs string ID
            const uid = typeof item.user === "object" ? item.user._id : item.user;

            configMap[uid] = {
              isCustom: item.isCustom || false,
              type: item.type || "single",
              url: item.url || "",
              subMenus: item.subMenus || [],
              companyName: item.companyName,
            };
          });
        }
        setUserConfigs(configMap);
      } else {
        // Reset Form (Create Mode)
        setTitle("");
        setIconFile(null);
        setIconPreview("");
        setDefaultConfig({ type: "single", url: "", subMenus: [] });
        setUserConfigs({});
      }
    }
  }, [initialData, isOpen]);

  // --- HANDLERS ---

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) return alert("Format harus PNG, JPG, WEBP.");
      if (file.size > 2 * 1024 * 1024) return alert("Maksimal 2MB.");

      setIconFile(file);
      setIconPreview(URL.createObjectURL(file));
    }
  };

  // Toggle User Checkbox
  const toggleUser = (user) => {
    setUserConfigs((prev) => {
      const newConfigs = { ...prev };
      if (newConfigs[user._id]) {
        // Uncheck: Hapus dari list
        delete newConfigs[user._id];
      } else {
        // Check: Tambah dengan config awal (Default/Inherit)
        newConfigs[user._id] = {
          isCustom: false,
          companyName: user.companyName,
          type: "single",
          url: "",
          subMenus: [], // Dummy value (krn isCustom false)
        };
      }
      return newConfigs;
    });
  };

  // Update Config User Tertentu
  const updateUserConfig = (userId, newConfig) => {
    setUserConfigs((prev) => ({ ...prev, [userId]: { ...prev[userId], ...newConfig } }));
  };

  // --- CONFIRMATION HANDLERS ---

  // Request Batal Semua di satu PT
  const requestUncheckAll = (usersInCompany) => {
    setConfirmState({ type: "uncheckAll", data: usersInCompany });
  };

  // Request Hapus Submenu (Custom User)
  const requestDeleteSubMenu = (userId, subMenuIndex) => {
    setConfirmState({ type: "deleteSub", data: { userId, subMenuIndex } });
  };

  // Eksekusi Konfirmasi
  const executeConfirmation = () => {
    if (confirmState.type === "uncheckAll") {
      const usersToUncheck = confirmState.data;
      usersToUncheck.forEach((u) => {
        if (userConfigs[u._id]) toggleUser(u);
      });
    } else if (confirmState.type === "deleteSub") {
      const { userId, subMenuIndex } = confirmState.data;
      const currentConfig = userConfigs[userId];
      const newSubs = [...currentConfig.subMenus];
      newSubs.splice(subMenuIndex, 1);
      updateUserConfig(userId, { subMenus: newSubs });
    }
    setConfirmState(null);
  };

  // --- SUBMIT FINAL ---
  const handleSubmit = (e) => {
    e.preventDefault();
    const userIds = Object.keys(userConfigs);

    // Validasi Global
    if (!title) return alert("Judul menu wajib diisi.");
    if (userIds.length === 0) return alert("Pilih minimal satu client.");

    // Validasi Custom Config
    for (let uid of userIds) {
      const conf = userConfigs[uid];
      if (conf.isCustom) {
        if (conf.type === "single" && !conf.url)
          return alert(`URL Custom untuk client ID ${uid} masih kosong!`);
        if (conf.type === "folder" && conf.subMenus.length === 0)
          return alert(`Folder Custom untuk client ID ${uid} kosong!`);
      }
    }

    // Construct Payload
    const assignedToArray = userIds.map((uid) => ({
      user: uid,
      ...userConfigs[uid],
    }));

    const payload = {
      title,
      // Kirim Default Configs
      defaultType: defaultConfig.type,
      defaultUrl: defaultConfig.url,
      defaultSubMenus: JSON.stringify(defaultConfig.subMenus),
      // Kirim User Configs
      assignedTo: JSON.stringify(assignedToArray),
    };

    onSubmit(payload, iconFile);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[95vh] relative overflow-hidden">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            {type === "create" ? (
              <FiPlus className="text-blue-800" />
            ) : (
              <FiEdit3 className="text-orange-500" />
            )}
            {type === "create" ? "Tambah Menu Client" : "Edit Menu Client"}
          </h3>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost text-gray-400 hover:text-gray-600"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Form Body (Split View) */}
        <form
          id="featureForm"
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col lg:flex-row overflow-hidden"
        >
          {/* Component Kiri: Global & Default Config */}
          <GlobalInfoForm
            title={title}
            setTitle={setTitle}
            iconPreview={iconPreview}
            handleIconChange={handleIconChange}
            defaultConfig={defaultConfig}
            setDefaultConfig={setDefaultConfig}
          />

          {/* Component Kanan: Tree View Client */}
          <ClientAccessPanel
            allClients={allClients}
            userConfigs={userConfigs}
            toggleUser={toggleUser}
            updateUserConfig={updateUserConfig}
            onRequestUncheckAll={requestUncheckAll}
            onRequestDeleteSubMenu={requestDeleteSubMenu}
          />
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="btn btn-ghost text-gray-500">
            Batal
          </button>
          <button
            form="featureForm"
            type="submit"
            className="btn bg-blue-800 hover:bg-blue-900 text-white px-8 shadow-lg"
          >
            {type === "create" ? "Simpan Menu" : "Simpan Perubahan"}
          </button>
        </div>

        {/* Confirmation Alert (Overlay) */}
        <ConfirmationAlert
          isOpen={!!confirmState}
          title={confirmState?.type === "uncheckAll" ? "Batalkan Semua?" : "Hapus Link?"}
          message={
            confirmState?.type === "uncheckAll"
              ? "Konfigurasi link yang sudah diisi untuk grup perusahaan ini akan hilang."
              : "Link submenu ini akan dihapus."
          }
          onConfirm={executeConfirmation}
          onCancel={() => setConfirmState(null)}
        />
      </div>
    </div>
  );
};

export default FeatureModal;
