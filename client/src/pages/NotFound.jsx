import { Link } from "react-router-dom";
import { FiAlertTriangle, FiHome } from "react-icons/fi";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-6">
        <FiAlertTriangle className="text-5xl text-orange-500" />
      </div>
      <h1 className="text-6xl font-bold text-blue-900 mb-2">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Halaman Tidak Ditemukan</h2>
      <p className="text-gray-500 max-w-md mb-8">
        Maaf, sepertinya Anda tersesat. Halaman yang Anda cari tidak tersedia atau URL salah.
      </p>
      <Link to="/login" className="btn bg-blue-800 hover:bg-blue-900 text-white border-none px-8">
        <FiHome className="mr-2" /> Kembali ke Beranda
      </Link>
    </div>
  );
};

export default NotFound;
