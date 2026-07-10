import React from "react";
import InstructorNavbar from "../../components/instructor/InstructorNavbar";
import { Outlet } from "react-router-dom";
import Footer from "../../components/Footer";

const InstructorLayout = () => {
  return (
    <div>
      <InstructorNavbar />
      <Outlet />
      <Footer />
    </div>
  );
};

export default InstructorLayout;
