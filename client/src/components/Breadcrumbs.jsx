import { Link, useLocation } from "react-router-dom";

// assets
import { FiHome } from "react-icons/fi";

const Breadcrumbs = () => {
  const location = useLocation();

  const pathnames = location.pathname.split("/").filter((x) => x && x !== "admin");

  const routeNames = {
    dashboard: "Dashboard",
    users: "Manajemen User",
    features: "Manajemen Fitur",
    charts: "Data Grafik",
    profile: "Profile Saya",
    "kanal-insekta": "Kanal Insekta",
  };

  return (
    <div className="text-sm breadcrumbs p-0 text-gray-500 mb-6">
      <ul>
        <li>
          <Link to="/" className="flex items-center gap-1 hover:text-blue-800">
            <FiHome /> Home
          </Link>
        </li>
        {pathnames.map((value, index) => {
          const name = routeNames[value] || value;
          const isLast = index === pathnames.length - 1;

          return (
            <li key={index}>
              {isLast ? (
                <span className="font-semibold text-[#093050] capitalize">{name}</span>
              ) : (
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
