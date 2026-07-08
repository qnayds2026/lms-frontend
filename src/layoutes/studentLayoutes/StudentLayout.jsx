import React from "react";
import { Outlet } from "react-router-dom";
import StudentNavbar from "../../components/student/StudentNavbar";
import Footer from "../../components/Footer";

const StudentLayout = () => {
  return (
    <div>
      <StudentNavbar />
      <Outlet />
      <Footer />
    </div>
  );
};

export default StudentLayout;
