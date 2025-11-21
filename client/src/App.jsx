import { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./App.css";

// Pages
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import AdminLayout from "./layouts/AdminLayout";
import PageLoader from "./components/PageLoader";
import AdminCharts from "./pages/admin/Charts";
import NotFound from "./pages/NotFound";
import UserProfile from "./pages/UserProfile";
import ClientDashboard from "./pages/client/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";
import UserManagement from "./pages/admin/UserManagement";
import FeatureManagement from "./pages/admin/FeatureManagement";

// Layout Wrapper Client
const ClientLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-50 font-sans">
    <Navbar role="client" />
    <main className="container mx-auto px-4 py-8 lg:px-8 max-w-7xl">{children}</main>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" reverseOrder={false} />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* PUBLIC */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/" element={<Login />} />

          {/* --- ADMIN ROUTES --- */}
          <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/features" element={<FeatureManagement />} />
              <Route path="/admin/charts" element={<AdminCharts />} />
              <Route path="/admin/profile" element={<UserProfile />} />
            </Route>
          </Route>

          {/* --- CLIENT ROUTES --- */}
          <Route element={<PrivateRoute allowedRoles={["client"]} />}>
            {/* Gunakan Route wrapper manual untuk Layout Client */}
            <Route
              path="/dashboard"
              element={
                <ClientLayout>
                  <ClientDashboard />
                </ClientLayout>
              }
            />
            <Route
              path="/profile"
              element={
                <ClientLayout>
                  <UserProfile />
                </ClientLayout>
              }
            />
          </Route>

          {/* --- 404 PAGE (Taruh paling bawah) --- */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
