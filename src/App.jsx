import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./layoutes/Layout";
import Home from "./pages/Home";
<<<<<<< HEAD
import Login from "./pages/Login";
import About from "./pages/About";
import Courses from "./pages/Courses";
 
=======
import Register from "./pages/Register";
>>>>>>> aed10666d892e201c416a8257473c52dca562b57

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
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
