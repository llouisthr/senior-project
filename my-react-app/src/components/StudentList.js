import React from 'react';
import { useNavigate } from "react-router-dom"; 
import './StudentList.css'; // Import CSS file

const StudentProfile = () => {
  const navigate = useNavigate(); // Hook for navigation
  const students = [
    { name: 'A', id: 'u6xxxx01', attendance: '14/15', gpa: '3.47' },
    { name: 'B', id: 'u6xxxx02', attendance: '15/15', gpa: '3.72', link: '/student-profile-B' }, // Added link property
    { name: 'C', id: 'u6xxxx03', attendance: '14/15', gpa: '3.80' },
    { name: 'D', id: 'u6xxxx04', attendance: '12/15', gpa: '3.53' },
    { name: 'E', id: 'u6xxxx05', attendance: '15/15', gpa: '3.62' },
    { name: 'F', id: 'u6xxxx06', attendance: '13/15', gpa: '3.25' },
    { name: 'G', id: 'u6xxxx07', attendance: '12/15', gpa: '3.12' },
    { name: 'H', id: 'u6xxxx08', attendance: '13/15', gpa: '2.78' },
  ];

  return (
    <div className="student-profile-container">
      <div className="sidebar">
        <h2>MUICT LEARNING</h2>
        <div>
          <a href="/importdata.html">Import Data</a>
          <div className="menu-heading">Dashboard</div>
          <a onClick={() => navigate("/")} className="clickable-link">
                    Course Overview
                </a>
                <a onClick={() => navigate("/student-list")} className="active">Student Profile</a>
        </div>
        <div className="logout">
        <a href="logout.html">
                    Logout
                </a>
        </div>
      </div>
      <div className="main-content">
        <div className="header">
          <div className="dashboard-title">Dashboard &gt; Student Profile</div>
          <input type="text" placeholder="Search via ID or Name" />
          <select className="dropdown">
            <option>Object Oriented Programming</option>
          </select>
        </div>

        <div className="student-table">
          <h3>Student List</h3>
          <table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Student ID</th>
                <th>Attendance</th>
                <th>Cumu GPA</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>
                    {student.link ? (
                      <a onClick={() => navigate(student.link)}>{student.name}</a>
                    ) : (
                      student.name
                    )}
                  </td>
                  <td>{student.id}</td>
                  <td>{student.attendance}</td>
                  <td>{student.gpa}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;