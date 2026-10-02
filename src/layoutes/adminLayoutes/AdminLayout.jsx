import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { Outlet, useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import AdminNavbar from "../../components/admin/AdminNavbar";

const AdminLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();

  // Restrict the entire /admin section to authenticated ADMIN users.
  // Non-admin or unauthenticated visitors are redirected to /login.
  useEffect(() => {
    const token = localStorage.getItem("token");
    let user;

    try {
      user = JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      user = null;
    }

    if (!token || user?.role !== "ADMIN") {
      navigate("/login", { replace: true });
      return;
    }

    setCheckingAuth(false);
  }, [navigate]);

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar onMenuClick={() => setMobileSidebarOpen(true)} />

        <main className="flex-1 p-6">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default AdminLayout;