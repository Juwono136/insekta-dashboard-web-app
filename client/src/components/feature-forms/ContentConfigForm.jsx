import { FiX } from "react-icons/fi";

const ContentConfigForm = ({ config, onChange, onDeleteSubMenuRequest }) => {
  return (
    <div className="mt-2 p-3 bg-blue-50/50 border border-blue-100 rounded-lg animate-fade-in">
      {/* Switcher Type */}
      <div className="flex gap-4 mb-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            className="radio radio-primary radio-xs"
            checked={config.type === "single"}
            onChange={() => onChange({ ...config, type: "single", subMenus: [] })}
          />
          <span className="text-xs font-medium text-gray-700">Single Link</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            className="radio radio-primary radio-xs"
            checked={config.type === "folder"}
            onChange={() => onChange({ ...config, type: "folder", url: "" })}
          />
          <span className="text-xs font-medium text-gray-700">Folder Menu</span>
        </label>
      </div>

      {/* Input Logic */}
      {config.type === "single" ? (
        <input
          type="url"
          className="input input-bordered input-xs w-full bg-white focus:border-blue-500"
          placeholder="https://..."
          value={config.url || ""}
          onChange={(e) => onChange({ ...config, url: e.target.value })}
        />
      ) : (
        <div className="space-y-2">
          {config.subMenus?.map((sub, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <input
                type="text"
                className="input input-bordered input-xs w-1/3 bg-white"
                placeholder="Judul"
                value={sub.title}
                onChange={(e) => {
                  const newSubs = [...config.subMenus];
                  newSubs[idx].title = e.target.value;
                  onChange({ ...config, subMenus: newSubs });
                }}
              />
              <input
                type="url"
                className="input input-bordered input-xs flex-1 bg-white"
                placeholder="Link..."
                value={sub.url}
                onChange={(e) => {
                  const newSubs = [...config.subMenus];
                  newSubs[idx].url = e.target.value;
                  onChange({ ...config, subMenus: newSubs });
                }}
              />

              {/* TRIGGER KONFIRMASI HAPUS */}
              <button
                type="button"
                onClick={() => onDeleteSubMenuRequest(idx)} // Panggil fungsi parent
                className="text-red-400 hover:text-red-600 transition-colors"
              >
                <FiX />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              onChange({
                ...config,
                subMenus: [...(config.subMenus || []), { title: "", url: "" }],
              })
            }
            className="btn btn-xs btn-ghost text-blue-600 gap-1 hover:bg-blue-100"
          >
            + Tambah Submenu
          </button>
        </div>
      )}
    </div>
  );
};

export default ContentConfigForm;
