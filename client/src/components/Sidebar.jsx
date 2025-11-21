import { Link, useLocation } from "react-router-dom";
import { FiGrid, FiUsers, FiUser, FiLayers, FiPieChart, FiX } from "react-icons/fi";
import { IoIosArrowBack } from "react-icons/io";
import clsx from "clsx";
import LogoInsekta from "../assets/logo-insekta.webp";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();

  // Fungsi helper: Tutup sidebar hanya jika di mode mobile
  const handleMobileMenuClick = () => {
    if (window.innerWidth < 1024) {
      // 1024px adalah breakpoint 'lg' di Tailwind
      toggleSidebar();
    }
  };

  const menus = [
    { title: "Dashboard", path: "/admin/dashboard", icon: <FiGrid /> },
    { title: "User Management", path: "/admin/users", icon: <FiUsers /> },
    { title: "Feature Management", path: "/admin/features", icon: <FiLayers /> },
    { title: "Edit Profile", path: "/admin/profile", icon: <FiUser /> },
    { title: "Data Grafik", path: "/admin/charts", icon: <FiPieChart /> },
  ];

  return (
    <>
      {/* 1. Overlay Gelap (Hanya Mobile) */}
      <div
        className={clsx(
          "fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity duration-300",
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        )}
        onClick={toggleSidebar}
      ></div>

      {/* 2. Container Sidebar */}
      <aside
        className={clsx(
          "fixed lg:static inset-y-0 left-0 z-30 w-64 bg-blue-900 text-white transition-transform duration-300 ease-in-out flex flex-col shadow-xl",
          // LOGIKA PENTING:
          // Jika Mobile: Cek isOpen (muncul/hilang).
          // Jika Desktop (lg): SELALU MUNCUL (lg:translate-x-0)
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between p-5 md:p-8 bg-blue-900/30 border-b border-blue-700/30">
          <a
            href="/admin/dashboard"
            className="flex items-center gap-2 md:gap-4 font-bold text-xl tracking-wider"
          >
            <img src={LogoInsekta} alt="logo-insekta" className="h-8 md:h-10" />
            <span className="text-xs bg-green-600 px-2 py-1 rounded text-white">Admin</span>
          </a>
          {/* Tombol Close (Mobile Only) */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden btn btn-square btn-ghost bg-blue-800 rounded-md btn-sm text-gray-100 hover:bg-blue-700"
          >
            <IoIosArrowBack size={24} />
          </button>
        </div>

        {/* Menu List */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {menus.map((menu, index) => {
            const isActive = location.pathname === menu.path;
            return (
              <Link
                key={index}
                to={menu.path}
                onClick={handleMobileMenuClick} // <-- PENTING: Tutup sidebar saat klik menu
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                  isActive
                    ? "bg-indigo-500 text-white shadow-lg shadow-blue-500/20 translate-x-1"
                    : "text-blue-100 hover:bg-blue-700/50 hover:text-white hover:translate-x-1"
                )}
              >
                <span
                  className={clsx(
                    "text-xl transition-transform group-hover:scale-110",
                    isActive ? "text-white" : "text-blue-300"
                  )}
                >
                  {menu.icon}
                </span>
                <span className="font-medium text-sm tracking-wide">{menu.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 bg-blue-900/30 border-t border-blue-700/30">
          <p className="text-xs text-center text-blue-300/80">
            &copy; {new Date().getFullYear()} Insekta - Pest & Termite Control
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
