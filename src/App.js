import React, { useState } from "react"; // Add useState import here
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CourseDashboard from "./components/CourseDashboard";
import CourseDashboardITCS125 from "./components/CourseDashboardITCS125";
import CourseDashboardITLG201 from "./components/CourseDashboardITLG201";
import CourseDashboardTest from "./components/coursedashboardtest";
import StudentListTest from "./components/studentlisttest";
import StudentList from "./components/StudentList";
import StudentListITCS125 from "./components/StudentListITCS125";
import StudentListITLG201 from "./components/StudentListITLG201";
import StudentProfileB from "./components/StudentProfileB";
import StudentProfileBTest from "./components/StudentProfileBtest";
import AtRiskSettingTest from "./components/atrisksettingtest";
import Home from "./components/Home";
import PowerBI from "./components/powerbi";

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
                  <Route path="/powerbi" element={<PowerBI />} />
                  <Route path="/:course/dashboard" element={<CourseDashboardTest criteria={criteria} />} />
                  <Route path="/itcs209/student-list" element={<StudentListTest criteria={criteria}/>} />
                  <Route path="/itcs125/student-list" element={<StudentListTest criteria={criteria}/>} />
                  <Route path="/itlg201/student-list" element={<StudentListTest criteria={criteria}/>} />
                  <Route 
                      path="/:course/at-risk-setting" 
                      element={<AtRiskSettingTest onSaveCriteria={setCriteria} />} 
                  />
                  <Route path="/student-profile-b" element={<StudentProfileBTest />} />
              </Routes>
          </div>
      </Router>
  );
}

export default App;
