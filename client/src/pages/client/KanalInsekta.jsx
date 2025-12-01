import { useEffect, useState } from "react";

// assets
import { FiMonitor } from "react-icons/fi";

// components
import PageLoader from "../../components/PageLoader";
import ClientChannelCard from "../../components/channel/ClientChannelCard";
import ChannelViewerModal from "../../components/channel/ChannelViewerModal";
import Breadcrumbs from "../../components/Breadcrumbs";

// features
import channelService from "../../services/channelService";

const KanalInsekta = () => {
  const [channels, setChannels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await channelService.getChannels({ limit: 50 });
        setChannels(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) return <PageLoader />;

  return (
    <div className="min-h-screen animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 pt-0">
        <Breadcrumbs />

        <div className="flex items-center gap-3 mb-8 px-1">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl shadow-sm">
            <FiMonitor size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Kanal Insekta</h2>
            <p className="text-sm text-gray-500">
              Akses portal informasi dan dashboard monitoring.
            </p>
          </div>
        </div>

        {channels.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiMonitor size={32} className="text-gray-300" />
            </div>
            <h3 className="font-bold text-gray-400">Belum Ada Kanal</h3>
            <p className="text-sm text-gray-300">Hubungi admin untuk menambahkan website.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {channels.map((channel) => (
              <ClientChannelCard key={channel._id} channel={channel} onClick={setSelectedChannel} />
            ))}
          </div>
        )}

        <ChannelViewerModal channel={selectedChannel} onClose={() => setSelectedChannel(null)} />
      </div>
    </div>
  );
};

export default KanalInsekta;
