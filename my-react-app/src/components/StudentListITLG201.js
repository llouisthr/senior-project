import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import './StudentListITLG201.css'; // Import CSS file
import personIcon from "./person.jpg";

const StudentListITLG201 = () => {const navigate = useNavigate(); // Hook for navigation
  const location = useLocation();
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [expandedSubmenu, setExpandedSubmenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("");
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

  const students = [
    { image: personIcon, id: 'u6800001', name: 'Ms. Mattie Khan', attendance: '9', score: '48', quiz: '0' },
    { image: personIcon, id: 'u6800002', name: 'Ms. Shania Fischer', attendance: '5', score: '27', quiz: '7', link: '/student-profile-B' },
    { image: personIcon, id: 'u6800003', name: 'Mr. Damian Burnett', attendance: '8', score: '44', quiz: '1' },
    { image: personIcon, id: 'u6800004', name: 'Mr. Clarence Welch', attendance: '8', score: '43', quiz: '2' },
    { image: personIcon, id: 'u6800005', name: 'Mr. Neil Pitts', attendance: '6', score: '32', quiz: '3' },
    { image: personIcon, id: 'u6800006', name: 'Mr. Albert Chang', attendance: '6', score: '34', quiz: '3' },
    { image: personIcon, id: 'u6800007', name: 'Mr. Jayden Armstrong', attendance: '8', score: '45', quiz: '2' },
    { image: personIcon, id: 'u6800008', name: 'Mr. Georgie Sheppard', attendance: '8', score: '45', quiz: '1' },
    { image: personIcon, id: 'u6800009', name: 'Ms. Carol Marquez', attendance: '8', score: '41', quiz: '2' },
    { image: personIcon, id: 'u6800010', name: 'Mr. Jay Small', attendance: '8', score: '40', quiz: '3' },
    { image: personIcon, id: 'u6800011', name: 'Ms. Annie Andrade', attendance: '7', score: '38', quiz: '3' },
    { image: personIcon, id: 'u6800012', name: 'Ms. Amelie Long', attendance: '7', score: '36', quiz: '4' },
    { image: personIcon, id: 'u6800013', name: 'Mr. Harold Stewart', attendance: '8', score: '39', quiz: '1' },
    { image: personIcon, id: 'u6800014', name: 'Mr. Erik Rivas', attendance: '8', score: '45', quiz: '0' },
    { image: personIcon, id: 'u6800015', name: 'Mr. Jacob Mcgowan', attendance: '5', score: '25', quiz: '5' },
    { image: personIcon, id: 'u6800016', name: "Ms. Amber Lee", attendance: "3", score: "22", quiz: '8' },
  ];

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
      <div className="sidebar">
        <h2 onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          MUICT LEARNING
        </h2>

        <div>
          <div className="menu-heading" onClick={() => toggleMenu("course")} style={{ cursor: "pointer" }}>
            Course
          </div>
          {expandedMenu === "course" && (
            <div className="submenu" style={{ cursor: "pointer" }}>
              {["ITCS209", "ITCS125", "ITLG201"].map((course) => (
                <div key={course}>
                  <a onClick={() => toggleSubmenu(course)}>{course}</a>
                  {expandedSubmenu === course && (
                    <div className="nested-submenu" style={{ marginLeft: "20px", cursor: "pointer" }}>
                      <a onClick={() => navigate(`/${course.toLowerCase()}/dashboard`)} style={{ display: "block", marginBottom: "5px" }}>
                        Dashboard
                      </a>
                      <a onClick={() => navigate(`/${course.toLowerCase()}/student-list`)} style={{ display: "block" }}>
                        Student List
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <div className="menu-heading" onClick={() => navigate("/powerbi")} style={{ cursor: "pointer" }}>
            Power BI
          </div>
        </div>
      </div>
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

          <div className="filter-section">
            <button onClick={() => setShowFilterBox(!showFilterBox)}>Filter by Attendance/Score</button>
            {showFilterBox && (
              <div className="filter-box" style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label>Attendance Range:</label>
                  <div style={{ display: "flex", gap: "5px" }}>
                    <input type="number" value={attendanceRange[0]} onChange={(e) => setAttendanceRange([Number(e.target.value), attendanceRange[1]])} />
                    <input type="number" value={attendanceRange[1]} onChange={(e) => setAttendanceRange([attendanceRange[0], Number(e.target.value)])} />
                  </div>

                  <label>Score Range:</label>
                  <div style={{ display: "flex", gap: "5px" }}>
                    <input type="number" value={scoreRange[0]} onChange={(e) => setScoreRange([Number(e.target.value), scoreRange[1]])} />
                    <input type="number" value={scoreRange[1]} onChange={(e) => setScoreRange([scoreRange[0], Number(e.target.value)])} />
                  </div>
              </div>
            )}
          </div>


          <div className="criteria-section">
            <button onClick={() => setShowCriteriaBox(!showCriteriaBox)}>Set At-Risk Criteria</button>
            {showCriteriaBox && (
              <div className="criteria-box" style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "5px" }}>
                <label>Severe At-Risk Attendance:</label>
                <input type="number" value={severeAttendance} onChange={(e) => setSevereAttendance(Number(e.target.value))} />

                <label>Severe At-Risk Score:</label>
                <input type="number" value={severeScore} onChange={(e) => setSevereScore(Number(e.target.value))} />

                <label>Slightly At-Risk Attendance:</label>
                <input type="number" value={slightlyAttendance} onChange={(e) => setSlightlyAttendance(Number(e.target.value))} />

                <label>Slightly At-Risk Score:</label>
                <input type="number" value={slightlyScore} onChange={(e) => setSlightlyScore(Number(e.target.value))} />

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
                      <a onClick={() => navigate(student.link)}>{student.name}</a>
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

export default StudentListITLG201;
