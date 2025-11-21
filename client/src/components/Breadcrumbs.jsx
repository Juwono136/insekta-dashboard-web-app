import { Link, useLocation } from "react-router-dom";
import { FiHome } from "react-icons/fi";

const Breadcrumbs = () => {
  const location = useLocation();

  // PERBAIKAN: Filter 'x !== "admin"' agar segment 'admin' tidak dirender
  const pathnames = location.pathname.split("/").filter((x) => x && x !== "admin");

  const routeNames = {
    dashboard: "Dashboard",
    users: "Manajemen User",
    features: "Manajemen Fitur",
    charts: "Data Grafik",
    profile: "Profile Saya",
  };

  return (
    <div className="text-sm breadcrumbs text-gray-500 mb-6">
      <ul>
        <li>
          <Link to="/" className="flex items-center gap-1 hover:text-blue-800">
            <FiHome /> Home
          </Link>
        </li>
        {pathnames.map((value, index) => {
          // Reconstruct URL: Kita perlu hati-hati karena 'admin' kita hapus dari tampilan
          // tapi URL aslinya tetap butuh /admin/...
          // Jadi kita gunakan location.pathname untuk logic active state saja

          const name = routeNames[value] || value;
          const isLast = index === pathnames.length - 1;

          return (
            <li key={index}>
              {isLast ? (
                <span className="font-semibold text-blue-800 capitalize">{name}</span>
              ) : (
                // Kita matikan link untuk parent path agar aman, atau arahkan ke dashboard
                <span className="capitalize text-gray-500">{name}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Breadcrumbs;
