// import logo from './logo.svg';
import './App.css';
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CourseDashboard from "./components/CourseDashboard";
import StudentList from "./components/StudentList";
import StudentProfileB from "./components/StudentProfileB";
import Home from "./components/Home";
import PowerBI from "./components/powerbi";

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
          <Route path="/itcs125/dashboard" element={<CourseDashboard />} />
          <Route path="/itcs125/student-list" element={<StudentList />} />
          <Route path="/itlg201/dashboard" element={<CourseDashboard />} />
          <Route path="/itlg201/student-list" element={<StudentList />} />
          <Route path="/student-profile-b" element={<StudentProfileB />} />
        </Routes>
      </div>
    </Router>
  );
  // );
}

export default App;
