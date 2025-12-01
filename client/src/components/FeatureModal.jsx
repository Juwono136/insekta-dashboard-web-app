import { useState, useEffect } from "react";
import toast from "react-hot-toast";

// assets
import { FiPlus, FiEdit3, FiX } from "react-icons/fi";

// components
import GlobalInfoForm from "./feature-forms/GlobalInfoForm";
import ClientAccessPanel from "./feature-forms/ClientAccessPanel";
import ConfirmationAlert from "./feature-forms/ConfirmationAlert";

// features
import userService from "../services/userService";
import { getImageUrl } from "../utils/imageUrl";

const FeatureModal = ({ type, isOpen, onClose, onSubmit, initialData, isSubmitting }) => {
  const [title, setTitle] = useState("");
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState("");

  const [defaultConfig, setDefaultConfig] = useState({ type: "single", url: "", subMenus: [] });

  const [userConfigs, setUserConfigs] = useState({});

  const [allClients, setAllClients] = useState([]);

  const [confirmState, setConfirmState] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const fetchClients = async () => {
        try {
          const res = await userService.getUsers({ role: "client", limit: 1000 });
          setAllClients(res.users);
        } catch (e) {
          console.error(e);
        }
      };
      fetchClients();

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
            if (!item.user) return;

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
        setTitle("");
        setIconFile(null);
        setIconPreview("");
        setDefaultConfig({ type: "single", url: "", subMenus: [] });
        setUserConfigs({});
      }
    }
  }, [initialData, isOpen]);

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) return toast.error("Format harus PNG, JPG, WEBP.");
      if (file.size > 2 * 1024 * 1024) return toast.error("Maksimal 2MB.");

      setIconFile(file);
      setIconPreview(URL.createObjectURL(file));
    }
  };

  const toggleUser = (user) => {
    setUserConfigs((prev) => {
      const newConfigs = { ...prev };
      if (newConfigs[user._id]) {
        delete newConfigs[user._id];
      } else {
        newConfigs[user._id] = {
          isCustom: false,
          companyName: user.companyName,
          type: "single",
          url: "",
          subMenus: [],
        };
      }
      return newConfigs;
    });
  };

  const updateUserConfig = (userId, newConfig) => {
    setUserConfigs((prev) => ({ ...prev, [userId]: { ...prev[userId], ...newConfig } }));
  };

  const requestUncheckAll = (usersInCompany) => {
    setConfirmState({ type: "uncheckAll", data: usersInCompany });
  };

  const requestDeleteSubMenu = (userId, subMenuIndex) => {
    setConfirmState({ type: "deleteSub", data: { userId, subMenuIndex } });
  };

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const userIds = Object.keys(userConfigs);

    if (!title) return toast.error("Judul menu wajib diisi.");
    if (userIds.length === 0) return toast.error("Pilih minimal satu client.");

    for (let uid of userIds) {
      const conf = userConfigs[uid];
      if (conf.isCustom) {
        if (conf.type === "single" && !conf.url)
          return toast.error(`URL Custom untuk client ID ${uid} masih kosong!`);
        if (conf.type === "folder" && conf.subMenus.length === 0)
          return toast.error(`Folder Custom untuk client ID ${uid} kosong!`);
      }
    }

    const assignedToArray = userIds.map((uid) => ({
      user: uid,
      ...userConfigs[uid],
    }));

    const payload = {
      title,
      defaultType: defaultConfig.type,
      defaultUrl: defaultConfig.url,
      defaultSubMenus: JSON.stringify(defaultConfig.subMenus),
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
            disabled={isSubmitting}
            className="btn btn-sm btn-circle btn-ghost text-gray-400 hover:text-gray-600"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Form Body*/}
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
          <button onClick={onClose} disabled={isSubmitting} className="btn btn-ghost text-gray-500">
            Batal
          </button>
          <button
            form="featureForm"
            type="submit"
            disabled={isSubmitting}
            className="btn bg-[#093050] hover:bg-blue-900 text-white px-8 shadow-lg"
          >
            {isSubmitting ? <span className="loading loading-spinner loading-xs"></span> : "Simpan"}
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
