import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, useParams } from "react-router-dom";
import './StudentList.css'; // Import CSS file
import personIcon from "./person.jpg";
import axios from "axios";

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
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [sortField, setSortField] = useState("id"); // or default field
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
  const [filterRed, setFilterRed] = useState(false);
  const [filterYellow, setFilterYellow] = useState(false);
  const [tempSevereAttendance, setTempSevereAttendance] = useState(severeAttendance);
  const [tempSlightlyAttendance, setTempSlightlyAttendance] = useState(slightlyAttendance);
  const [tempSevereScore, setTempSevereScore] = useState(severeScore);
  const [tempSlightlyScore, setTempSlightlyScore] = useState(slightlyScore);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleImageClick = () => {
    setIsExpanded(true);
  };

  const handleClose = () => {
    setIsExpanded(false);
  };

  const handleExport = () => {
    const headers = ["ID", "Name", "Attendance", "Score", "Quiz", "Status"];
    const rows = sortedStudents.map((student) => [
      student.id,
      student.name,
      student.attendance,
      student.score,
      student.quiz,
      getStudentStatus(student),
    ]);

    let csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "student_list.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const { courseId } = useParams();
  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (!courseId) return;

    axios.get(`http://localhost:5000/studentList/${courseId}`)
      .then(res => {
        const uniqueStudentsMap = new Map();
        res.data.forEach(student => {
          uniqueStudentsMap.set(student.student_id, {
            image: personIcon,
            id: student.student_id,
            name: student.student_name,
            attendance: student.attendance,
            score: student.average_score,
            quiz: student.missing_quizzes,
            link: `/student-profile/${student.student_id}`
          });
        });
        setStudents(Array.from(uniqueStudentsMap.values()));
      })
      .catch(err => console.error("Error loading students:", err));
  }, [courseId]);

  const getRiskStatus = (attendance, score) => {
    if (criteriaAttendance && !criteriaScore) {
      if (attendance <= severeAttendance) return "🔴";
      if (attendance <= slightlyAttendance) return "🟡";
    }

    if (criteriaScore && !criteriaAttendance) {
      if (score <= severeScore) return "🔴";
      if (score <= slightlyScore) return "🟡";
    }

    return " ";
  };


  const getStudentStatus = (student) => {
    if (criteriaAttendance && !criteriaScore) {
      if (student.attendance <= severeAttendance) return "🔴";
      if (student.attendance <= slightlyAttendance) return "🟡";
      return " ";
    }

    if (criteriaScore && !criteriaAttendance) {
      if (student.score <= severeScore) return "🔴";
      if (student.score <= slightlyScore) return "🟡";
      return " ";
    }

    // If both are selected or none, treat as Normal
    return " ";
  };


  const filteredStudents = students.filter((student) => {
    const riskStatus = getRiskStatus(student.attendance, student.score);

    // Filter by risk status only if either is selected
    if (filterRed || filterYellow) {
      if (filterRed && riskStatus !== "🔴") return false;
      if (filterYellow && riskStatus !== "🟡") return false;
    }

    // Attendance range
    if (filterAttendance && (student.attendance < attendanceRange[0] || student.attendance > attendanceRange[1])) return false;

    // Score range
    if (filterScore && (student.score < scoreRange[0] || student.score > scoreRange[1])) return false;

    // Search term (by name OR ID)
    const searchLower = searchTerm.toLowerCase();
    return (
      student.name.toLowerCase().includes(searchLower) ||
      String(student.id).includes(searchLower) // Convert ID to string for searching
    );
  });


  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedStudents = useMemo(() => {
    return [...filteredStudents].sort((a, b) => {
      let valueA = a[sortField];
      let valueB = b[sortField];

      const isNumericField = sortField === "id" || sortField === "attendance" || sortField === "score" || sortField === "quiz";

      if (isNumericField) {
        valueA = Number(valueA); // Ensure numeric comparison
        valueB = Number(valueB);
        return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
      }

      valueA = valueA?.toString().toLowerCase() || ""; // Ensure string comparison and case-insensitivity
      valueB = valueB?.toString().toLowerCase() || "";

      return sortOrder === "asc"
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    });
  }, [filteredStudents, sortField, sortOrder]);

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

  const severeCount = students.filter(
    (student) => getRiskStatus(Number(student.attendance), Number(student.score)) === "🔴"
  ).length;

  const slightCount = students.filter(
    (student) => getRiskStatus(Number(student.attendance), Number(student.score)) === "🟡"
  ).length;

  return (
    <div className="student-profile-container">
      <div className="main-content">
        <h3>{courseId ? `${courseId} > Student List` : "Select a Course"}</h3>

        {/* Top Right Search Box */}
        <div className="search-bar">
          <label>Search:</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter student name/ID..."
          />
        </div>
        <div className="risk-filter-container">
          <div className="risk-legend">
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <span>
                <strong>{severeCount + slightCount} Total At-Risk Students</strong>
              </span>
              <span>🔴 {severeCount} Severe At-Risk Student</span>
              <span>🟡 {slightCount} Slightly At-Risk Student</span>
            </div>

          </div>

          {/* Export Button */}
          <div style={{ marginTop: "0px", textAlign: "right" }}>
            <button
              onClick={handleExport}
              style={{
                padding: "8px 16px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Export CSV
            </button>
          </div>

          <div className="filter-section" style={{ position: "relative", display: "flex", flexDirection: "column" }}>
            <button onClick={() => setShowFilterBox(!showFilterBox)}>Filter</button>

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
                <label>
                  <input type="checkbox" checked={filterRed} onChange={() => setFilterRed(!filterRed)} />
                  🔴 Severe At-Risk
                </label>
                <label>
                  <input type="checkbox" checked={filterYellow} onChange={() => setFilterYellow(!filterYellow)} />
                  🟡 Slightly At-Risk
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
            <button onClick={() => setShowCriteriaBox(!showCriteriaBox)}>Criteria Setting</button>
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
  width: 16px;
  height: 16px;
  border-radius: 50%;
  cursor: pointer;
  margin-top: -6px;
}

input[type="range"].severe::-webkit-slider-thumb {
  background-color: red;
}

input[type="range"].slightly::-webkit-slider-thumb {
  background-color: yellow;
}

input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  cursor: pointer;
}

input[type="range"].severe::-moz-range-thumb {
  background-color: red;
}

input[type="range"].slightly::-moz-range-thumb {
  background-color: yellow;
}

        `}
                </style>

                {/* Attendance Criteria */}
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
                      <span style={{ color: tempSevereAttendance < tempSlightlyAttendance ? "red" : "#aaa", marginRight: "10px" }}>
                        Severe ≤ {tempSevereAttendance}
                      </span>
                      <span style={{ color: tempSlightlyAttendance > tempSevereAttendance ? "#D5B60A" : "#aaa" }}>
                        Slightly ≤ {tempSlightlyAttendance}
                      </span>
                    </div>
                    <div className="range-container" style={{ position: "relative", width: "100%", height: "20px", marginBottom: "20px" }}>
                      {/* Red Bar */}
                      {tempSevereAttendance < tempSlightlyAttendance && (
                        <div
                          className="range-line"
                          style={{
                            left: "0%",
                            width: `${(tempSevereAttendance / 9) * 100}%`,
                            backgroundColor: "red",
                          }}
                        />
                      )}
                      {/* Yellow Bar */}
                      {tempSlightlyAttendance > tempSevereAttendance && (
                        <div
                          className="range-line"
                          style={{
                            left: `${(tempSevereAttendance / 9) * 100}%`,
                            width: `${((tempSlightlyAttendance - tempSevereAttendance) / 9) * 100}%`,
                            backgroundColor: "yellow",
                          }}
                        />
                      )}

                      {/* Severe Slider */}
                      <input
                        type="range"
                        min="0"
                        max="9"
                        value={tempSevereAttendance}
                        onChange={(e) => setTempSevereAttendance(Number(e.target.value))}
                        className="severe"
                        style={{ width: "100%", position: "absolute", top: 0 }}
                      />

                      {/* Slightly Slider */}
                      <input
                        type="range"
                        min="0"
                        max="9"
                        value={tempSlightlyAttendance}
                        onChange={(e) => setTempSlightlyAttendance(Number(e.target.value))}
                        className="slightly"
                        style={{ width: "100%", position: "absolute", top: 0 }}
                      />
                    </div>
                  </>
                )}


                {/* Score Criteria */}
                {criteriaScore && (
                  <>
                    <label><strong>Score</strong></label>
                    <div>
                      <span style={{ color: tempSevereScore < tempSlightlyScore ? "red" : "#aaa", marginRight: "10px" }}>
                        Severe ≤ {tempSevereScore}
                      </span>
                      <span style={{ color: tempSlightlyScore > tempSevereScore ? "#D5B60A" : "#aaa" }}>
                        Slightly ≤ {tempSlightlyScore}
                      </span>
                    </div>
                    <div className="range-container" style={{ position: "relative", width: "100%", height: "20px", marginBottom: "20px" }}>
                      {/* Red Bar */}
                      {tempSevereScore < tempSlightlyScore && (
                        <div
                          className="range-line"
                          style={{
                            left: "0%",
                            width: `${(tempSevereScore / 50) * 100}%`,
                            backgroundColor: "red",
                          }}
                        />
                      )}
                      {/* Yellow Bar */}
                      {tempSlightlyScore > tempSevereScore && (
                        <div
                          className="range-line"
                          style={{
                            left: `${(tempSevereScore / 50) * 100}%`,
                            width: `${((tempSlightlyScore - tempSevereScore) / 50) * 100}%`,
                            backgroundColor: "yellow",
                          }}
                        />
                      )}

                      {/* Severe Slider */}
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={tempSevereScore}
                        onChange={(e) => setTempSevereScore(Number(e.target.value))}
                        className="severe"
                        style={{ width: "100%", position: "absolute", top: 0 }}
                      />

                      {/* Slightly Slider */}
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={tempSlightlyScore}
                        onChange={(e) => setTempSlightlyScore(Number(e.target.value))}
                        className="slightly"
                        style={{ width: "100%", position: "absolute", top: 0 }}
                      />
                    </div>
                  </>
                )}


                {/* Save Button */}
                <button
                  onClick={() => {
                    setSevereAttendance(tempSevereAttendance);
                    setSlightlyAttendance(tempSlightlyAttendance);
                    setSevereScore(tempSevereScore);
                    setSlightlyScore(tempSlightlyScore);
                  }}
                  style={{ marginTop: "10px", padding: "5px 10px" }}
                >
                  Save
                </button>
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
                  Attendance Max (9 Times) <span>{sortField === "attendance" ? (sortOrder === "asc" ? "▲" : "▼") : ""}</span>
                </th>
                <th style={{ width: "120px" }} onClick={() => toggleSort("score")}>
                  Score Max (50 Score) <span>{sortField === "score" ? (sortOrder === "asc" ? "▲" : "▼") : ""}</span>
                </th>
                <th style={{ width: "120px" }} onClick={() => toggleSort("quiz")}>
                  Missing Quizzes Max (10 Times) <span>{sortField === "quiz" ? (sortOrder === "asc" ? "▲" : "▼") : ""}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedStudents.map((student) => (
                <tr key={student.id}>
                  <td>
                    <img
                      src={student.image}
                      width="25"
                      height="25"
                      style={{
                        borderRadius: "50%",
                        cursor: "pointer",
                      }}
                      onClick={handleImageClick}
                    />

                    {isExpanded && (
                      <div
                        style={{
                          position: "fixed",
                          top: 0,
                          left: 0,
                          width: "100vw",
                          height: "100vh",
                          backgroundColor: "rgba(0, 0, 0, 0.1)", // soft transparent black tint
                          backdropFilter: "blur(4px)",           // subtle blur effect
                          WebkitBackdropFilter: "blur(4px)",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          zIndex: 2000,
                        }}
                        onClick={handleClose}
                      >
                        <img
                          src={student.image}
                          style={{
                            width: "200px",
                            height: "200px",
                            borderRadius: "10px",
                            backgroundColor: "#fff",
                            padding: "10px",
                            boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    )}
                  </td>
                  <td>{getStudentStatus(student)}</td>
                  <td>{student.id}</td>
                  <td style={{ textAlign: "left" }}>
                    <span
                      style={{
                        color: "blue",
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                      onClick={() => navigate(`/student-profile/${student.id}/${courseId}`)}
                    >
                      {student.name}
                    </span>
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

