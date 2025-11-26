import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiHome } from "react-icons/fi";
import { getImageUrl } from "../../utils/imageUrl";
import { isPreviewable } from "../../utils/urlHelper";
import FeatureCard from "./FeatureCard";
import FilePreviewModal from "./FilePreviewModal";
import DashboardHeader from "./DashboardHeader";

const FolderView = () => {
  const { state } = useLocation(); // Ambil data folder dari navigasi
  const navigate = useNavigate();
  const [feature, setFeature] = useState(null);

  // State Modal Preview
  const [previewData, setPreviewData] = useState(null); // { title, url }

  useEffect(() => {
    if (!state?.feature) {
      navigate("/dashboard"); // Redirect jika akses langsung tanpa state
    } else {
      setFeature(state.feature);
    }
  }, [state, navigate]);

  // Handler Klik Item Submenu
  const handleSubItemClick = (subItem) => {
    // [PERBAIKAN DISINI]
    // Cek apakah URL bisa dipreview (File Google)
    if (isPreviewable(subItem.url)) {
      setPreviewData({ title: subItem.title, url: subItem.url });
    } else {
      // Jika Folder Google / Link Luar -> Tab Baru
      window.open(subItem.url, "_blank");
    }
  };

  if (!feature) return null;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 animate-fade-in">
      <div className="max-w-6xl mx-auto px-4 pt-0">
        <DashboardHeader />

        {/* Breadcrumbs / Navigation Header */}
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-circle btn-sm bg-white border border-gray-200 shadow-sm hover:bg-gray-100 text-gray-600"
          >
            <FiArrowLeft size={18} />
          </button>

          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <FiHome size={10} /> Home <span className="opacity-50">/</span> {feature.title}
          </div>
        </div>

        <div className="flex flex-col mb-4">
          <h2 className="text-sm md:text-base font-semibold text-gray-800 flex items-center gap-2">
            <img
              src={getImageUrl(feature.icon)}
              className="w-6 h-6 object-contain bg-gray-100 p-0.5 border border-gray-300 rounded-md"
              alt="icon"
            />
            {feature.title}
          </h2>
        </div>

        {/* CONTENT GRID */}
        {!feature.subMenus || feature.subMenus.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-400 text-sm">Folder ini kosong.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {feature.subMenus.map((sub, idx) => (
              // Kita reuse FeatureCard tapi kita sesuaikan props-nya agar tampilan konsisten
              // Karena FeatureCard butuh prop 'feature', kita construct object dummy
              <FeatureCard
                key={idx}
                feature={{
                  title: sub.title,
                  icon: feature.icon, // Gunakan icon folder induk (atau icon generic file)
                  type: "single", // Submenu selalu dianggap single item di view ini
                  url: sub.url,
                }}
                onClick={() => handleSubItemClick(sub)}
              />
            ))}
          </div>
        )}
      </div>

      {/* MODAL PREVIEW */}
      <FilePreviewModal
        isOpen={!!previewData}
        onClose={() => setPreviewData(null)}
        title={previewData?.title}
        url={previewData?.url}
      />
    </div>
  );
};

export default FolderView;
