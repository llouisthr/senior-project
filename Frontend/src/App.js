import React, { useState } from "react"; // Add useState import here
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CourseDashboard from "./components/CourseDashboard";
import CDtest from "./components/CDtest";
import StudentList from "./components/StudentList";
import StudentProfile from "./components/StudentProfile";
import AtRiskSettingTest from "./components/atrisksettingtest";
import Home from "./components/Home";
import Login from "./components/login";

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
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/course/:course/:section/:semester/dashboard" element={<CDtest criteria={criteria} />}  />
                  <Route path="/course/:course/:section/:semester/student-list" element={<StudentList criteria={criteria}/>}    />
                  <Route path="/:course/at-risk-setting" element={<AtRiskSettingTest onSaveCriteria={setCriteria} />}           />
                  <Route path="/student-profile-b" element={<StudentProfile />} />
              </Routes>
          </div>
      </Router>
  );
}

export default App;
