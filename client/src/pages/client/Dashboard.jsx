import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// assets
import { FiLayers } from "react-icons/fi";

// components
import DashboardHeader from "./DashboardHeader";
import FilePreviewModal from "./FilePreviewModal";
import FeatureGrid from "./FeatureGrid";
import PromotionSlider from "../../components/PromotionSlider";
import PageLoader from "../../components/PageLoader";
import FeatureFilterBar from "../../components/FeatureFilterBar";
import ScrollToTop from "../../components/ScrollToTop";

// features
import featureService from "../../services/featureService";
import { isPreviewable } from "../../utils/urlHelper";

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [features, setFeatures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc' or 'desc'

  // State Modal Preview
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    const fetchMyFeatures = async () => {
      try {
        const data = await featureService.getMyFeatures();
        setFeatures(data);
      } catch (error) {
        console.error("Gagal load menu", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyFeatures();
  }, []);

  const handleMenuClick = (feature) => {
    if (feature.type === "folder") {
      navigate(`/dashboard/folder/${feature._id}`, { state: { feature } });
    } else {
      if (isPreviewable(feature.url)) {
        setPreviewData({ title: feature.title, url: feature.url });
      } else {
        window.open(feature.url, "_blank");
      }
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 animate-fade-in">
      <ScrollToTop />
      <div className="max-w-6xl mx-auto px-4 pt-0">
        <DashboardHeader />

        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
            <FiLayers size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">Menu Dashboard</h2>
            <p className="text-xs text-gray-500">Akses fitur yang tersedia untuk Anda</p>
          </div>
        </div>

        <FeatureFilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />

        {features.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <FiLayers size={32} />
            </div>
            <h3 className="font-bold text-gray-600">Belum ada menu aktif</h3>
            <p className="text-gray-400 text-sm">Silakan hubungi admin.</p>
          </div>
        ) : (
          <FeatureGrid
            features={features}
            searchQuery={searchQuery}
            sortOrder={sortOrder}
            onMenuClick={handleMenuClick}
          />
        )}

        <PromotionSlider />
      </div>

      <FilePreviewModal
        isOpen={!!previewData}
        onClose={() => setPreviewData(null)}
        title={previewData?.title}
        url={previewData?.url}
      />
    </div>
  );
};

export default ClientDashboard;
