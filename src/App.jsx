import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./layoutes/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import About from "./pages/About";
import Courses from "./pages/Courses";
 

const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
           <Route path="about" element={<About />} />
           <Route path="courses"element={<Courses/>}/>
          </Route>
        </Routes>
      </Router>
    </>
  );
};

export default App;
