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
import StudentLiveClasses from "./pages/students/StudentLiveclass";
import StudentRecordings from "./pages/students/StudentRecordings";
import Notifications from "./pages/students/Notifications";
import InstructorLayout from "./layoutes/instructorLayoutes/InstructorLayout";
import InstructorDashboard from "./pages/instructors/InstructorDashboard";
import InstructorManageRecordings from "./pages/instructors/InstructorManageRecordings";
import InstructorMyStudents from "./pages/instructors/InstructorMystudent";
import MyCourses from "./pages/instructors/MyCourses";
import InstructorRecordingsList from "./pages/instructors/instructorRecordingList";
import InstructorLiveClassesList from "./pages/instructors/instructorLiveclasslist";
import InstructorManageLiveClasses from "./pages/instructors/instructorManageLiveclass";
import InstructorModulesList from "./pages/instructors/InstructorModulesList";
import InstructorManageModules from "./pages/instructors/InstructorManageModules";
import AdminLayout from "./layoutes/adminLayoutes/AdminLayout";
import AdminDashboard from "./pages/admin/Admindashboard";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminInstructors from "./pages/admin/AdminInstructors";
import AdminInstructorDetail from "./pages/admin/AdminInstructorDetails";
import AdminManageRecordings from "./pages/admin/AdminManageRecording";
import AdminManageLiveClasses from "./pages/admin/AdminManageLiveclass";
import UsersList from "./pages/admin/UsersList";
import AdminPaymentList from "./pages/admin/AdminPaymentList";
import InstructorManageAttachments from "./pages/instructors/InstructorManageAttachments";
import CourseDetail from "./pages/CourseDetails";
import ActivateAccount from "./pages/ActivateAccount";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import StudentCertificates from "./pages/students/studentCertificates";
import StudentCertificateView from "./pages/students/StudentCertificateView";
import CertificateVerification from "./pages/students/CertificateVerification";
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="courses" element={<Courses />} />
          <Route path="courses/:id" element={<CourseDetail />} />
        </Route>
        {/* Student */}
        <Route path="/student" element={<StudentLayout />}>
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="my-courses" element={<StudentMyCourses />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="live-classes" element={<StudentLiveClasses />} />
          <Route path="recordings/:courseId" element={<StudentRecordings />} />
          <Route path="certificates" element={<StudentCertificates />} />
          <Route path="certificates/:id" element={<StudentCertificateView />} />
        </Route>
        {/* Instructor */}
        <Route path="/instructor" element={<InstructorLayout />}>
          <Route path="dashboard" element={<InstructorDashboard />} />
          <Route
            path="courses/:courseId/recordings"
            element={<InstructorManageRecordings />}
          />
          <Route path="my-students" element={<InstructorMyStudents />} />
          <Route path="my-courses" element={<MyCourses />} />
          <Route
            path="/instructor/recordings"
            element={<InstructorRecordingsList />}
          />
          <Route
            path="courses/:courseId/live-classes"
            element={<InstructorManageLiveClasses />}
          />
          <Route path="live-classes" element={<InstructorLiveClassesList />} />
          <Route path="modules" element={<InstructorModulesList />} />
          <Route
            path="courses/:courseId/modules"
            element={<InstructorManageModules />}
          />
          <Route
            path="modules/:moduleId/attachments"
            element={<InstructorManageAttachments />}
          />
        </Route>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="instructors" element={<AdminInstructors />} />
          <Route path="users" element={<UsersList />} />
          <Route path="instructors/:id" element={<AdminInstructorDetail />} />
          <Route path="payments" element={<AdminPaymentList />} />
          <Route
            path="courses/:courseId/recordings"
            element={<AdminManageRecordings />}
          />
          <Route
            path="courses/:courseId/live-classes"
            element={<AdminManageLiveClasses />}
          />
        </Route>
        {/* Auth pages rendered standalone, without the public Navbar/Footer */}
        <Route
          path="/verify-certificate/:verificationCode"
          element={<CertificateVerification />}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/activate-account" element={<ActivateAccount />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
};
export default App;
