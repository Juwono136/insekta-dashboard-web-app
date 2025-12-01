import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRoute = ({ allowedRoles }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  if (userInfo.isFirstLogin) {
    const profilePath = userInfo.role === "admin" ? "/admin/profile" : "/profile";

    if (location.pathname !== profilePath) {
      return <Navigate to={`${profilePath}?alert=change-password`} replace />;
    }
  }

  if (allowedRoles && !allowedRoles.includes(userInfo.role)) {
    return <Navigate to={userInfo.role === "admin" ? "/admin/dashboard" : "/dashboard"} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
