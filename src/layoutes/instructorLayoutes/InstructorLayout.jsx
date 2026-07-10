import React from "react";
import Sidebar from "../../components/Sidebar";
import InstructorNavbar from "../../components/instructor/InstructorNavbar";
import { Outlet } from "react-router-dom";
import Footer from "../../components/Footer";
import { useState } from "react";

const InstructorLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar
        role="instructor"
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <InstructorNavbar onMenuClick={() => setMobileSidebarOpen(true)} />

        <main className="flex-1 p-6">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default InstructorLayout;
