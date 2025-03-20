// import logo from './logo.svg';
import './App.css';
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CourseDashboard from "./components/CourseDashboard";
import CourseDashboardITCS125 from "./components/CourseDashboardITCS125";
import CourseDashboardITLG201 from "./components/CourseDashboardITLG201";
import StudentList from "./components/StudentList";
import StudentListITCS125 from "./components/StudentListITCS125";
import StudentListITLG201 from "./components/StudentListITLG201";
import StudentProfileB from "./components/StudentProfileB";
import Home from "./components/Home";
import PowerBI from "./components/powerbi";
import StudentInfo from "./components/StudentInfo";

function App() {
  // return (
  // <div className="App">
  //   <header className="App-header">
  //     <img src={logo} className="App-logo" alt="logo" />
  //     <p>
  //       Edit <code>src/App.js</code> and save to reload.
  //     </p>
  //     <a
  //       className="App-link"
  //       href="https://reactjs.org"
  //       target="_blank"
  //       rel="noopener noreferrer"
  //     >
  //       Learn React
  //     </a>
  //   </header>
  // </div>
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/powerbi" element={<PowerBI />} />
          <Route path="/itcs209/dashboard" element={<CourseDashboard />} />
          <Route path="/itcs209/student-list" element={<StudentList />} />
          <Route path="/itcs125/dashboard" element={<CourseDashboardITCS125 />} />
          <Route path="/itcs125/student-list" element={<StudentListITCS125 />} />
          <Route path="/itlg201/dashboard" element={<CourseDashboardITLG201 />} />
          <Route path="/itlg201/student-list" element={<StudentListITLG201 />} />
          <Route path="/student-profile-b" element={<StudentProfileB />} />
          <Route path='/studentinfo' element={<StudentInfo />} />
        </Routes>
      </div>
    </Router>
  );
  // );
}

export default App;
