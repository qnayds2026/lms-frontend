import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./layoutes/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Courses from "./pages/Courses";

import Login from "./pages/Login";
import Register from "./pages/Register";


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="courses" element={<Courses />} />
        </Route>

        {/* Auth pages rendered standalone, without the public Navbar/Footer */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
};

export default App;
