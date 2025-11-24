import { useState, useEffect } from "react"; // Tambah useEffect
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import authService from "../services/authService";
import { useNavigate, Link } from "react-router-dom";
import { FiLogOut, FiUser, FiGrid, FiCalendar, FiAlertCircle } from "react-icons/fi";
import { HiMenuAlt2 } from "react-icons/hi";
import toast from "react-hot-toast";
import LogoInsekta from "../assets/logo-insekta.webp";
import { getImageUrl } from "../utils/imageUrl";

const Navbar = ({ toggleSidebar, role }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // State untuk Modal Logout
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // State untuk Tanggal/Waktu Realtime
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000); // Update tiap menit
    return () => clearInterval(timer);
  }, []);

  // Format Tanggal: "Kamis, 20 Nov 2025"
  const formatDate = (date) => {
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // FUNGSI BARU: Menutup dropdown secara paksa setelah klik
  const closeDropdown = () => {
    const elem = document.activeElement;
    if (elem) {
      elem?.blur(); // Hilangkan fokus agar dropdown tertutup
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      dispatch(logout());
      navigate("/login");
      toast.success("Berhasil logout");
    } catch (error) {
      console.error(error);
      toast.error("Gagal logout");
    } finally {
      setIsLogoutModalOpen(false);
    }
  };

  return (
    <>
      <div className="navbar bg-white h-16 px-4 sticky top-0 z-20 border-b border-gray-200 shadow-sm flex items-center justify-between transition-all">
        {/* KIRI: Hamburger & Logo */}
        <div className="flex items-center gap-4">
          {role === "admin" && (
            <button
              onClick={toggleSidebar}
              className="btn btn-square btn-ghost btn-sm lg:hidden text-gray-600 hover:bg-blue-50 hover:text-blue-800"
            >
              <HiMenuAlt2 size={32} />
            </button>
          )}

          {role === "client" && (
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <img src={LogoInsekta} alt="logo-insekta" className="h-8" />
            </Link>
          )}
        </div>

        {/* TENGAH: Informasi Tambahan (Tanggal & Notif) - Hidden di Mobile */}
        <div className="hidden md:flex flex-1 justify-end px-8 items-center gap-6 border-r border-gray-200 mr-6">
          {/* Tanggal */}
          <div className="flex items-center gap-2 text-gray-500 text-sm font-medium bg-gray-50 px-3 py-1.5 rounded-full">
            <FiCalendar className="text-blue-800" />
            <span>{formatDate(currentDate)}</span>
          </div>

          {/* Notifikasi Dummy */}
        </div>

        {/* KANAN: User Profile */}
        <div className="flex items-center gap-3">
          <div className="text-right sm:block">
            <p className="text-xs font-bold text-gray-800 leading-tight">{userInfo?.name}</p>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
              {userInfo?.role}
            </p>
          </div>

          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar placeholder ring-2 ring-transparent hover:ring-blue-200 transition-all"
            >
              <div className="w-10 h-10 rounded-full border-2 border-blue-800 bg-blue-800/10 text-blue-800 overflow-hidden">
                {userInfo?.avatar ? (
                  <img
                    alt="Profile"
                    src={getImageUrl(userInfo.avatar)}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-lg font-bold">{userInfo?.name?.charAt(0)}</span>
                )}
              </div>
            </div>

            <ul
              tabIndex={0}
              className="mt-3 z-1 p-2 shadow-xl menu menu-sm dropdown-content bg-white rounded-xl w-56 border border-gray-100"
            >
              <li className="menu-title px-4 py-2 text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-50 mb-2">
                Akun Saya
              </li>

              <li>
                <Link
                  to={role === "admin" ? "/admin/profile" : "/profile"}
                  onClick={closeDropdown}
                  className="py-3 px-4 text-gray-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg font-medium"
                >
                  <FiUser className="w-4 h-4" /> Edit Profile
                </Link>
              </li>

              {role === "client" && !userInfo.isFirstLogin && (
                <li>
                  <Link
                    to="/dashboard"
                    onClick={closeDropdown}
                    className="py-3 px-4 text-gray-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg font-medium"
                  >
                    <FiGrid className="w-4 h-4" /> Dashboard Menu
                  </Link>
                </li>
              )}

              <div className="h-px bg-gray-100 my-1"></div>
              <li>
                {/* Ubah tombol logout jadi trigger modal */}
                <button
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="py-3 px-4 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg font-medium"
                >
                  <FiLogOut className="w-4 h-4" /> Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* MODAL LOGOUT CONFIRMATION */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiAlertCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Konfirmasi Logout</h3>
              <p className="text-gray-500 text-sm mb-6">
                Apakah Anda yakin ingin keluar dari aplikasi?
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="btn btn-ghost flex-1 hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  onClick={handleLogout}
                  className="btn bg-red-500 hover:bg-red-600 text-white border-none flex-1"
                >
                  Ya, Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
