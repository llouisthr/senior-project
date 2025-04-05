// import logo from './logo.svg';
import './App.css';
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CourseDashboard from "./components/CourseDashboard";
import CourseDashboardITCS125 from "./components/coursedashboardtest1";
import CourseDashboardITLG201 from "./components/CourseDashboardITLG201";
import CourseDashboardTest1 from "./components/coursedashboardtest1";
import StudentList from "./components/StudentList";
import StudentListITCS125 from "./components/StudentListITCS125";
import StudentListITLG201 from "./components/StudentListITLG201";
import StudentProfileB from "./components/StudentProfileB";
import Home from "./components/Home";
import PowerBI from "./components/powerbi";
import Login from './components/login';

function App() {

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/powerbi" element={<PowerBI />} />
          <Route path="/:courseId/:section_id/dashboard" element={<CourseDashboardTest1 />} />
          <Route path="/itcs209/student-list" element={<StudentList />} />
          <Route path="/itcs125/dashboard" element={<CourseDashboardTest1 />} />
          <Route path="/itcs125/student-list" element={<StudentListITCS125 />} />
          <Route path="/itlg201/dashboard" element={<CourseDashboardTest1 />} />
          <Route path="/itlg201/student-list" element={<StudentListITLG201 />} />
          <Route path="/student-profile-b" element={<StudentProfileB />} />
        </Routes>
      </div>
    </Router>
  );
  // );
}

export default App;
