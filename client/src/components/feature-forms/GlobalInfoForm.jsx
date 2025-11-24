import { FiLayers, FiInfo, FiUploadCloud } from "react-icons/fi";
import ContentConfigForm from "./ContentConfigForm"; // Re-use komponen ini

const GlobalInfoForm = ({
  title,
  setTitle,
  iconPreview,
  handleIconChange,
  defaultConfig,
  setDefaultConfig, // Props baru
}) => {
  return (
    <div className="w-full lg:w-1/2 p-6 border-r border-gray-100 overflow-y-auto space-y-6 bg-gray-50/30">
      {/* Input Judul */}
      <div>
        <label className="label font-bold text-gray-700 text-sm">Judul Menu Global</label>
        <input
          type="text"
          className="input input-bordered w-full bg-white focus:border-blue-500"
          placeholder="Contoh: Laporan Keuangan"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <p className="text-[10px] text-gray-400 mt-1">
          Judul ini akan tampil sama untuk semua client.
        </p>
      </div>

      {/* Input Icon */}
      <div>
        <label className="label font-bold text-gray-700 text-sm">Ikon Menu</label>
        <div className="flex flex-col gap-3 border rounded-xl p-4 bg-white border-gray-200 border-dashed">
          <div className="flex items-center justify-center">
            <div className="w-24 h-24 bg-gray-50 rounded-lg flex items-center justify-center shadow-inner overflow-hidden border border-gray-100">
              {iconPreview ? (
                <img src={iconPreview} alt="prev" className="w-full h-full object-contain" />
              ) : (
                <FiLayers className="text-gray-300 text-4xl" />
              )}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-xs mb-1">
              <FiInfo /> Ketentuan File:
            </div>
            <ul className="text-[10px] text-gray-600 list-disc list-inside space-y-0.5">
              <li>
                Format: <b>PNG (Transparan), JPG, WEBP</b>
              </li>
              <li>
                Ukuran Maks File: <b>2 MB</b>
              </li>
              <li>
                Dimensi Maksimal: <b>Persegi ukuran maksimal 512x512 px</b>
              </li>
            </ul>
          </div>

          <div className="w-full">
            <label className="btn btn-sm btn-outline btn-block border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400">
              <FiUploadCloud /> Pilih Gambar
              <input
                type="file"
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleIconChange}
              />
            </label>
          </div>
        </div>
      </div>

      {/* [BARU] DEFAULT CONFIGURATION */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="badge badge-primary badge-sm">General</span>
          <label className="label font-bold text-gray-700 text-sm p-0">Konten Default</label>
        </div>
        <p className="text-[10px] text-gray-400 mb-3">
          Konfigurasi ini akan dipakai semua client, kecuali di-custom.
        </p>

        {/* Re-use ContentConfigForm untuk Default */}
        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <ContentConfigForm
            config={defaultConfig}
            onChange={setDefaultConfig}
            onDeleteSubMenuRequest={(idx) => {
              const newSubs = [...defaultConfig.subMenus];
              newSubs.splice(idx, 1);
              setDefaultConfig({ ...defaultConfig, subMenus: newSubs });
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default GlobalInfoForm;
