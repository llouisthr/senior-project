import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import './StudentList.css'; // Import CSS file
import personIcon from "./person.jpg";
import { LogOut } from "lucide-react";
import axios from "axios";

const StudentList = () => {
  const navigate = useNavigate(); // Hook for navigation
  const location = useLocation();
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [expandedSubmenu, setExpandedSubmenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("");
  const [courses, setCourses] = useState([]);
  const [instructorName, setInstructorName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState("ascending");
  const [semesterOption, setSemesterOption] = useState("name");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showFilterBox, setShowFilterBox] = useState(false);
  const [showCriteriaBox, setShowCriteriaBox] = useState(false);

  const [attendanceRange, setAttendanceRange] = useState([0, 10]);
  const [scoreRange, setScoreRange] = useState([0, 50]);

  const [severeAttendance, setSevereAttendance] = useState(5);
  const [severeScore, setSevereScore] = useState(30);
  const [slightlyAttendance, setSlightlyAttendance] = useState(6);
  const [slightlyScore, setSlightlyScore] = useState(35);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("instructorId");
    navigate("/login");
  };

  useEffect(() => {
    const pathParts = location.pathname.split("/").filter(Boolean);
    if (pathParts.length > 1) {
      setSelectedCourse(pathParts[0].toUpperCase());
    }
  }, [location.pathname]);

  const toggleMenu = (menu) => {
    setExpandedMenu(expandedMenu === menu ? null : menu);
  };

  const toggleSubmenu = (course) => {
    setExpandedSubmenu(expandedSubmenu === course ? null : course);
  };

  //Sidebar info fetching
  useEffect(() => {
    const instructorId = localStorage.getItem("instructorId");
    if (!instructorId) {
      navigate("/login");
      return;
    }
  }, [navigate]);

  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedCourse) return;

      try {
        const res = await fetch(`http://localhost:5000/student-list?courseId=${selectedCourse}&section=all&semesterId=202401`);
        const data = await res.json();
        const enriched = data.map((student) => ({
          ...student,
          image: personIcon,
        }));
        setStudents(enriched);
      } catch (err) {
        console.error('Error fetching students:', err);
      }
    };

  fetchStudents();
}, [selectedCourse]);


  const getRiskStatus = (attendance, score) => {
    if (attendance <= severeAttendance && score < severeScore) {
      return "🔴";
    } else if (attendance <= slightlyAttendance || score < slightlyScore) {
      return "🟡";
    }
    return "";
  };

  const filteredStudents = students.filter((student) => {
    const riskStatus = getRiskStatus(student.attendance, student.score);
    if (filter === "red" && riskStatus !== "🔴") return false;
    if (filter === "yellow" && riskStatus !== "🟡") return false;
    if (student.attendance < attendanceRange[0] || student.attendance > attendanceRange[1]) return false;
    if (student.score < scoreRange[0] || student.score > scoreRange[1]) return false;
    return student.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    const valueA = a[sortField];
    const valueB = b[sortField];

    return sortOrder === "asc"
      ? valueA.toString().localeCompare(valueB.toString())
      : valueB.toString().localeCompare(valueA.toString());
  });

  return (
    <div className="student-profile-container">
      <div className="main-content">
        <h3>{selectedCourse ? `${selectedCourse} > Student List` : "Select a Course"}</h3>

        {/* Top Right Search Box */}
        <div className="search-bar">
          <label>Search via Name:</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter student name..."
          />
        </div>
        <div className="risk-filter-container">
          <div className="risk-legend">
            <span>🔴 Severe At-Risk Student (low attendance & score)</span>
            <span>🟡 Slightly At-Risk Student (attendance & score declining)</span>
          </div>

          <div className="filter-section" style={{ display: "flex", flexDirection: "column" }}>
      <button onClick={() => setShowFilterBox(!showFilterBox)}>Filter by Attendance/Score</button>
      {showFilterBox && (
        <div className="filter-box" style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <label>Attendance Range: {attendanceRange[0]} - {attendanceRange[1]}</label>
          <input 
            type="range" 
            min="0" 
            max="9" 
            value={attendanceRange[0]} 
            onChange={(e) => setAttendanceRange([Number(e.target.value), attendanceRange[1]])} 
          />
          <input 
            type="range" 
            min="0" 
            max="9" 
            value={attendanceRange[1]} 
            onChange={(e) => setAttendanceRange([attendanceRange[0], Number(e.target.value)])} 
          />

          <label>Score Range: {scoreRange[0]} - {scoreRange[1]}</label>
          <input 
            type="range" 
            min="0" 
            max="50" 
            value={scoreRange[0]} 
            onChange={(e) => setScoreRange([Number(e.target.value), scoreRange[1]])} 
          />
          <input 
            type="range" 
            min="0" 
            max="50" 
            value={scoreRange[1]} 
            onChange={(e) => setScoreRange([scoreRange[0], Number(e.target.value)])} 
          />
        </div>
      )}
    </div>


          <div className="criteria-section">
            <button onClick={() => setShowCriteriaBox(!showCriteriaBox)}>Set At-Risk Criteria</button>
            {showCriteriaBox && (
              <div className="criteria-box" style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "5px" }}>
                <label>Severe At-Risk Attendance: {severeAttendance}</label>
            <input 
              type="range" 
              min="0" 
              max="9" 
              value={severeAttendance} 
              onChange={(e) => setSevereAttendance(Number(e.target.value))} 
            />

            <label>Severe At-Risk Score: {severeScore}</label>
            <input 
              type="range" 
              min="0" 
              max="50" 
              value={severeScore} 
              onChange={(e) => setSevereScore(Number(e.target.value))} 
            />

            <label>Slightly At-Risk Attendance: {slightlyAttendance}</label>
            <input 
              type="range" 
              min="0" 
              max="9" 
              value={slightlyAttendance} 
              onChange={(e) => setSlightlyAttendance(Number(e.target.value))} 
            />

            <label>Slightly At-Risk Score: {slightlyScore}</label>
            <input 
              type="range" 
              min="0" 
              max="50" 
              value={slightlyScore} 
              onChange={(e) => setSlightlyScore(Number(e.target.value))} 
            />

              </div>
            )}
          </div>
        </div>

        <div className="student-table">
          <table>
            <thead>
              <tr>
                <th style={{ width: "50px" }}></th>
                <th style={{ width: "100px" }}>Status</th>
                <th style={{ width: "120px" }} onClick={() => toggleSort("id")}>
                  Student ID <span>{sortField === "id" ? (sortOrder === "asc" ? "▲" : "▼") : ""}</span>
                </th>
                <th style={{ width: "180px" }} onClick={() => toggleSort("name")}>
                  Student Name <span>{sortField === "name" ? (sortOrder === "asc" ? "▲" : "▼") : ""}</span>
                </th>
                <th style={{ width: "120px" }} onClick={() => toggleSort("attendance")}>
                  Attendance (9) <span>{sortField === "attendance" ? (sortOrder === "asc" ? "▲" : "▼") : ""}</span>
                </th>
                <th style={{ width: "120px" }} onClick={() => toggleSort("score")}>
                  Score (50) <span>{sortField === "score" ? (sortOrder === "asc" ? "▲" : "▼") : ""}</span>
                </th>
                <th style={{ width: "120px" }} onClick={() => toggleSort("quiz")}>
                  Missing Quiz (10) <span>{sortField === "quiz" ? (sortOrder === "asc" ? "▲" : "▼") : ""}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedStudents.map((student) => (
                <tr key={student.id}>
                  <td>
                    <img src={student.image} width="25" height="25" style={{ borderRadius: "50%" }} />
                  </td>
                  <td>{getRiskStatus(student.attendance, student.score)}</td>
                  <td>{student.id}</td>
                  <td style={{ textAlign: "left" }}>
                    {student.link ? (
                      <a onClick={() => navigate(`/${student.id}/student-profile`)}>{student.name}</a>
                    ) : (
                      student.name
                    )}
                  </td>
                  <td>{student.attendance}</td>
                  <td>{student.score}</td>
                  <td>{student.quiz}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentList;

