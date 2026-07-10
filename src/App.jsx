import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./layoutes/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Courses from "./pages/Courses";

import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/students/StudentDashboard";
import StudentLayout from "./layoutes/studentLayoutes/StudentLayout";
import StudentMyCourses from "./pages/students/StudentMyCourses";
import StudentLiveClasses from "./pages/students/Studentliveclass";
import StudentRecordings from "./pages/students/StudentRecordings";
import Notifications from "./pages/students/Notifications";
import InstructorLayout from "./layoutes/instructorLayoutes/InstructorLayout";
import InstructorDashboard from "./pages/instructors/InstructorDashboard";
import InstructorManageRecordings from "./pages/instructors/InstructorManageRecordings";
import InstructorMyStudents from "./pages/instructors/InstructorMystudent";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="courses" element={<Courses />} />
        </Route>

        {/* Student */}
        <Route path="/student" element={<StudentLayout />}>
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="my-courses" element={<StudentMyCourses />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="live-classes" element={<StudentLiveClasses />} />
          <Route path="recordings/:courseId" element={<StudentRecordings />} />
        </Route>

        {/* Instructor */}
        <Route path="/instructor" element={<InstructorLayout />}>
          <Route path="dashboard" element={<InstructorDashboard />} />
          <Route
            path="courses/:courseId/recordings"
            element={<InstructorManageRecordings />}
          />
          <Route path="my-students" element={<InstructorMyStudents />} />
        </Route>

        {/* Auth pages rendered standalone, without the public Navbar/Footer */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
};

export default App;
