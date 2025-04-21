import React, { useState } from "react"; // Add useState import here
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/CDashboard";
import StudentList from "./components/StudentList";
import StdOverview from "./components/StudentProfileOverview";
import StdCurrent from "./components/StudentProfileCurrentCourse";
import Home from "./components/Home";
import Login from "./components/login";
import Layout from "./components/Layout"

function App() {
  const [criteria, setCriteria] = useState({
      severeAttendance: "",
      severeScore: "",
      slightlyAttendance: "",
      slightlyScore: "",
  });

  return (
    <Router>
    <div className="app">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/course/:course/:section/:semester/dashboard" element={<Dashboard criteria={criteria} />} />
          <Route path="/course/:courseId/student-list" element={<StudentList criteria={criteria} />} />
          <Route path="/student-profile/:studentId/:courseId/overview" element={<StdOverview />} />
          <Route path="/student-profile/:studentId/:courseId/current-course" element={<StdCurrent />} />
        </Route>
      </Routes>
    </div>
  </Router>
);
};

export default App;