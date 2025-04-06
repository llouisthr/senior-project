import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import './StudentList.css'; // Import CSS file
import personIcon from "./person.jpg";

const studentData = {
  ITCS209: [
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
  ],
  ITCS125: [
    { image: personIcon, id: 'u6800001', name: 'Ms. Mattie Khan', attendance: '8', score: '45', quiz: '0' },
    { image: personIcon, id: 'u6800002', name: 'Ms. Shania Fischer', attendance: '4', score: '27', quiz: '7', link: '/student-profile-B' },
    { image: personIcon, id: 'u6800003', name: 'Mr. Damian Burnett', attendance: '7', score: '44', quiz: '1' },
    { image: personIcon, id: 'u6800004', name: 'Mr. Clarence Welch', attendance: '9', score: '43', quiz: '2' },
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
  ],
  ITLG201: [
    { image: personIcon, id: 'u6800001', name: 'Ms. Mattie Khan', attendance: '9', score: '47', quiz: '0' },
    { image: personIcon, id: 'u6800002', name: 'Ms. Shania Fischer', attendance: '5', score: '25', quiz: '7', link: '/student-profile-B' },
    { image: personIcon, id: 'u6800003', name: 'Mr. Damian Burnett', attendance: '9', score: '44', quiz: '1' },
    { image: personIcon, id: 'u6800004', name: 'Mr. Clarence Welch', attendance: '9', score: '43', quiz: '2' },
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
  ]
};

const StudentListTest = () => {
  const navigate = useNavigate(); // Hook for navigation
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
  const [filterAttendance, setFilterAttendance] = useState(true);
  const [filterScore, setFilterScore] = useState(true);
  const [attendanceRange, setAttendanceRange] = useState([0, 9]);
  const [scoreRange, setScoreRange] = useState([0, 50]);
  const [criteriaAttendance, setCriteriaAttendance] = useState(true);
  const [criteriaScore, setCriteriaScore] = useState(true);
  const [severeAttendance, setSevereAttendance] = useState(8);
  const [severeScore, setSevereScore] = useState(45);
  const [slightlyAttendance, setSlightlyAttendance] = useState(9);
  const [slightlyScore, setSlightlyScore] = useState(50);

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

  const toggleCourse = (course) => {
    setSelectedCourse(course);
    navigate(`/${course.toLowerCase()}/student-list`);
  };

  const students = studentData[selectedCourse] || [];

  const getRiskStatus = (attendance, score) => {
    if (attendance <= severeAttendance || score < severeScore) {
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

  const handleAttendanceChange = (index, value) => {
    const newRange = [...attendanceRange];
    newRange[index] = Number(value);
    setAttendanceRange(newRange);
  };

  const handleScoreChange = (index, value) => {
    const newRange = [...scoreRange];
    newRange[index] = Number(value);
    setScoreRange(newRange);
  };

  const handleRangeChange = (type, index, value) => {
    const newValue = Number(value);

    if (type === "attendance") {
      const updatedRange = [...attendanceRange];
      updatedRange[index] = newValue;
      if (updatedRange[0] > updatedRange[1]) updatedRange[0] = updatedRange[1] - 1;
      setAttendanceRange(updatedRange);
    } else if (type === "score") {
      const updatedRange = [...scoreRange];
      updatedRange[index] = newValue;
      if (updatedRange[0] > updatedRange[1]) updatedRange[0] = updatedRange[1] - 1;
      setScoreRange(updatedRange);
    }
  };

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
                      <a onClick={() => navigate(`/${course.toLowerCase()}/at-risk-setting`)} style={{ display: "block" }}>
                        Criteria Setting
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

          <div className="filter-section" style={{ position: "relative", display: "flex", flexDirection: "column" }}>
            <button onClick={() => setShowFilterBox(!showFilterBox)}>Filter by Attendance/Score</button>

            {showFilterBox && (
              <div
                className="filter-box"
                style={{
                  position: "absolute",
                  top: "40px",
                  left: "0",
                  background: "#fff",
                  padding: "10px",
                  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                  borderRadius: "5px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  width: "250px",
                }}
              >
                {/* Checkboxes for filtering options */}
                <label>
                  <input type="checkbox" checked={filterAttendance} onChange={() => setFilterAttendance(!filterAttendance)} /> Filter by Attendance
                </label>
                <label>
                  <input type="checkbox" checked={filterScore} onChange={() => setFilterScore(!filterScore)} /> Filter by Score
                </label>

                {/* Attendance Range */}
                {filterAttendance && (
                  <>
                    <label>Attendance Range: {attendanceRange[0]} - {attendanceRange[1]} times</label>
                    <div className="range-container">
                      <input type="range" min="0" max="9" value={attendanceRange[0]} onChange={(e) => handleRangeChange("attendance", 0, e.target.value)} />
                      <input type="range" min="0" max="9" value={attendanceRange[1]} onChange={(e) => handleRangeChange("attendance", 1, e.target.value)} />
                      <div
                        className="range-line"
                        style={{
                          left: `${(attendanceRange[0] / 9) * 100}%`,
                          width: `${((attendanceRange[1] - attendanceRange[0]) / 9) * 100}%`,
                        }}
                      />
                    </div>
                  </>
                )}

                {/* Score Range */}
                {filterScore && (
                  <>
                    <label>Score Range: {scoreRange[0]} - {scoreRange[1]} score</label>
                    <div className="range-container">
                      <input type="range" min="0" max="50" value={scoreRange[0]} onChange={(e) => handleRangeChange("score", 0, e.target.value)} />
                      <input type="range" min="0" max="50" value={scoreRange[1]} onChange={(e) => handleRangeChange("score", 1, e.target.value)} />
                      <div
                        className="range-line"
                        style={{
                          left: `${(scoreRange[0] / 50) * 100}%`,
                          width: `${((scoreRange[1] - scoreRange[0]) / 50) * 100}%`,
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>


          <div className="criteria-section" style={{ position: "relative", display: "flex", flexDirection: "column" }}>
            <button onClick={() => setShowCriteriaBox(!showCriteriaBox)}>Set At-Risk Criteria</button>
            {showCriteriaBox && (
              <div className="criteria-box" style={{
                position: "absolute",
                top: "40px",
                left: "-130px",
                background: "#fff",
                padding: "10px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                borderRadius: "5px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                width: "250px"
              }}>
                <style>
                  {`
              input[type="range"]::-webkit-slider-thumb {
                width: 15px;
                height: 15px;
                border-radius: 50%;
                cursor: pointer;
              }
              input[type="range"].severe::-webkit-slider-thumb {
                background-color: red;
              }
              input[type="range"].slightly::-webkit-slider-thumb {
                background-color: yellow;
              }
              input[type="range"]::-moz-range-thumb {
                width: 15px;
                height: 15px;
                border-radius: 50%;
                cursor: pointer;
              }
              input[type="range"].severe::-moz-range-thumb {
                background-color: red;
              }
              input[type="range"].slightly::-moz-range-thumb {
                background-color: yellow;
              }
              .range-line {
                position: absolute;
                height: 5px;
                top: 50%;
                transform: translateY(-50%);
              }
            `}
                </style>
                <label>
                  <input type="checkbox" checked={criteriaAttendance} onChange={() => setCriteriaAttendance(!criteriaAttendance)} /> Criteria for Attendance
                </label>
                <label>
                  <input type="checkbox" checked={criteriaScore} onChange={() => setCriteriaScore(!criteriaScore)} /> Criteria for Score
                </label>
                {criteriaAttendance && (
                  <>
                    <label><strong>Attendance (Times)</strong></label>
                    <div>
                      <span style={{ color: severeAttendance < slightlyAttendance ? "red" : "transparent", marginRight: "10px" }}>Severe ≤ {severeAttendance}</span>
                      <span style={{ color: "#D5B60A" }}>Slightly ≤ {slightlyAttendance}</span>
                    </div>
                    <div className="range-container" style={{ position: "relative", width: "100%" }}>
                      <div
                        className="range-line"
                        style={{
                          left: "0%",
                          width: `${(severeAttendance / 9) * 100}%`,
                          backgroundColor: "red",
                        }}
                      />
                      <input
                        type="range"
                        min="0"
                        max="9"
                        value={severeAttendance}
                        onChange={(e) => setSevereAttendance(Math.min(Number(e.target.value), slightlyAttendance - 1))}
                        className="severe"
                      />
                      <div
                        className="range-line"
                        style={{
                          left: `${(severeAttendance / 9) * 100}%`,
                          width: `${((slightlyAttendance - severeAttendance) / 9) * 100}%`,
                          backgroundColor: "yellow",
                        }}
                      />
                      <input
                        type="range"
                        min="0"
                        max="9"
                        value={slightlyAttendance}
                        onChange={(e) => setSlightlyAttendance(Math.max(Number(e.target.value), severeAttendance + 1))}
                        className="slightly"
                      />
                    </div>
                  </>
                )}

                {criteriaScore && (
                  <>
                    <label><strong>Score (Score)</strong></label>
                    <div>
                      <span style={{ color: severeScore < slightlyScore ? "red" : "transparent", marginRight: "10px" }}>Severe ≤ {severeScore}</span>
                      <span style={{ color: "#D5B60A" }}>Slightly ≤ {slightlyScore}</span>
                    </div>
                    <div className="range-container" style={{ position: "relative", width: "100%" }}>
                      <div
                        className="range-line"
                        style={{
                          left: "0%",
                          width: `${(severeScore / 50) * 100}%`,
                          backgroundColor: "red",
                        }}
                      />
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={severeScore}
                        onChange={(e) => setSevereScore(Math.min(Number(e.target.value), slightlyScore - 1))}
                        className="severe"
                      />
                      <div
                        className="range-line"
                        style={{
                          left: `${(severeScore / 50) * 100}%`,
                          width: `${((slightlyScore - severeScore) / 50) * 100}%`,
                          backgroundColor: "yellow",
                        }}
                      />
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={slightlyScore}
                        onChange={(e) => setSlightlyScore(Math.max(Number(e.target.value), severeScore + 1))}
                        className="slightly"
                      />

                    </div>
                  </>
                )}
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

export default StudentListTest;

