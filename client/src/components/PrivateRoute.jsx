import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRoute = ({ allowedRoles }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const location = useLocation();

  // 1. Belum Login
  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  // 2. Logic First Login (Security Check)
  // Jika user statusnya First Login DAN dia mencoba akses halaman selain Profile
  // Maka paksa dia tetap di /profile atau /admin/profile
  if (userInfo.isFirstLogin) {
    // Tentukan path profile berdasarkan role
    const profilePath = userInfo.role === "admin" ? "/admin/profile" : "/profile";

    // Jika URL sekarang BUKAN profile path, redirect ke profile
    if (location.pathname !== profilePath) {
      return <Navigate to={`${profilePath}?alert=change-password`} replace />;
    }
  }

  // 3. Role Check
  if (allowedRoles && !allowedRoles.includes(userInfo.role)) {
    return <Navigate to={userInfo.role === "admin" ? "/admin/dashboard" : "/dashboard"} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
