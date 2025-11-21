import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const AdminLayout = () => {
  // State untuk Mobile Sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar (Kiri) */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Main Content Wrapper (Kanan) */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Navbar (Atas) */}
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} role="admin" />

        {/* Content Area (Scrollable) */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 lg:p-6">
          <Outlet /> {/* Halaman Dashboard/User/Features akan muncul di sini */}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
