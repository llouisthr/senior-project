import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import './StudentListITCS125.css'; // Import CSS file

const StudentListITCS125 = () => {
  const navigate = useNavigate(); // Hook for navigation
  const location = useLocation();
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [expandedSubmenu, setExpandedSubmenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOption, setFilterOption] = useState("attendance");
  const [sortOption, setSortOption] = useState("ascending");
  const [semesterOption, setSemesterOption] = useState("name");
  const [selectedCourse, setSelectedCourse] = useState("");

  useEffect(() => {
    // Extract course name from the URL (e.g., "/itcs209/dashboard" -> "ITCS209")
    const pathParts = location.pathname.split("/").filter(Boolean); // Remove empty strings
    if (pathParts.length > 1) {
        setSelectedCourse(pathParts[0].toUpperCase()); // Set course name
    }
}, [location.pathname]); // Run whenever the URL changes

  const toggleMenu = (menu) => {
    setExpandedMenu(expandedMenu === menu ? null : menu);
  };

  const toggleSubmenu = (course) => {
    setExpandedSubmenu(expandedSubmenu === course ? null : course);
  };

  const students = [
    { id: 'u6800001', name: 'Ms. Mattie Khan', attendance: '8/9', score: '45/50', quiz: '8/10', gpa: '3.84' },
    { id: 'u6800002', name: 'Ms. Shania Fischer', attendance: '5/9', score: '27/50', quiz: '4/10', gpa: '2.70', link: '/student-profile-B' },
    { id: 'u6800003', name: 'Mr. Damian Burnett', attendance: '8/9', score: '44/50', quiz: '9/10', gpa: '3.80' },
    { id: 'u6800004', name: 'Mr. Clarence Welch', attendance: '8/9', score: '43/50', quiz: '9/10', gpa: '3.75' },
    { id: 'u6800005', name: 'Mr. Neil Pitts', attendance: '6/9', score: '32/50', quiz: '6/10', gpa: '3.01' },
    { id: 'u6800006', name: 'Mr. Albert Chang', attendance: '6/9', score: '34/50', quiz: '7/10', gpa: '3.05' },
    { id: 'u6800007', name: 'Mr. Jayden Armstrong', attendance: '8/9', score: '45/50', quiz: '9/10', gpa: '3.64' },
    { id: 'u6800008', name: 'Mr. Georgie Sheppard', attendance: '8/9', score: '45/50', quiz: '9/10', gpa: '3.68' },
    { id: 'u6800009', name: 'Ms. Carol Marquez', attendance: '8/9', score: '41/50', quiz: '8/10', gpa: '3.61' },
    { id: 'u6800010', name: 'Mr. Jay Small', attendance: '8/9', score: '40/50', quiz: '7/10', gpa: '3.59' },
    { id: 'u6800011', name: 'Ms. Annie Andrade', attendance: '7/9', score: '38/50', quiz: '7/10', gpa: '3.28' },
    { id: 'u6800012', name: 'Ms. Amelie Long', attendance: '7/9', score: '36/50', quiz: '6/10', gpa: '3.25' },
    { id: 'u6800013', name: 'Mr. Harold Stewart', attendance: '8/9', score: '39/50', quiz: '8/10', gpa: '3.39' },
    { id: 'u6800014', name: 'Mr. Erik Rivas', attendance: '8/9', score: '42/50', quiz: '9/10', gpa: '3.48' },
    { id: 'u6800015', name: 'Mr. Jacob Mcgowan', attendance: '5/9', score: '25/50', quiz: '5/10', gpa: '2.68' },
  ];

  // Function to convert attendance to a number for sorting purposes (percentage)
  const getAttendanceValue = (attendance) => {
    const [present, total] = attendance.split('/').map(Number);
    return present / total;
  };

  // Function to handle sorting based on selected filter and order
  const sortStudents = (students) => {
    return students.sort((a, b) => {
      let valueA, valueB;

      if (filterOption === "attendance") {
        valueA = getAttendanceValue(a.attendance);
        valueB = getAttendanceValue(b.attendance);
      } else if (filterOption === "score") {
        valueA = a.score;
        valueB = b.score;
      } else if (filterOption === "cumuGPA") {
        valueA = a.gpa;
        valueB = b.gpa;
      } else if (filterOption === "quiz") {
        valueA = a.quiz;
        valueB = b.quiz;
      }

      if (sortOption === "ascending") {
        return valueA - valueB;
      } else {
        return valueB - valueA;
      }
    });
  };

  const filteredAndSortedStudents = sortStudents(
    students.filter(student => {
      if (!searchTerm) return true;
      return student.name.toLowerCase().includes(searchTerm.toLowerCase());
    })
  );

  return (
    <div className="student-profile-container">
      <div className="sidebar">
        <h2 onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          MUICT LEARNING
        </h2>
        <div>
          <div className="menu-heading" onClick={() => toggleMenu("course")}>Course</div>
          {expandedMenu === "course" && (
            <div className="submenu">
              {["ITCS209", "ITCS125", "ITLG201"].map((course) => (
                <div key={course}>
                  <a onClick={() => toggleSubmenu(course)}>{course}</a>
                  {expandedSubmenu === course && (
                    <div className="nested-submenu">
                      <a onClick={() => navigate(`/${course.toLowerCase()}/dashboard`)}>Dashboard</a>
                      <a onClick={() => navigate(`/${course.toLowerCase()}/student-list`)}>Student List</a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <div className="menu-heading" onClick={() => navigate("/powerbi")}>Power BI</div>
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
            placeholder="Enter course name..."
          />
        </div>

        <div className="student-list-box">
          <span>Student List</span>

          {/* Filter Box */}
          <div className="filter-box">
            <span>Filter:</span>
            <select value={filterOption} onChange={(e) => setFilterOption(e.target.value)}>
              <option value="attendance">Attendance</option>
              <option value="score">Score</option>
              <option value="cumuGPA">Cumulative GPA</option>
              <option value="quiz">Quiz</option>
            </select>
          </div>

          {/* Sort Box */}
          <div className="sort-box">
            <span>Sort:</span>
            <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
              <option value="ascending">Ascending</option>
              <option value="descending">Descending</option>
            </select>
          </div>

          {/* Semester Box */}
          <div className="semester-box">
            <span>Semester:</span>
            <select value={semesterOption} onChange={(e) => setSemesterOption(e.target.value)}>
              <option value="semester1">Semester 1 - 2025</option>
              <option value="semester2">Semester 2 - 2025</option>
            </select>
          </div>
        </div>

        <div className="student-table">
          <table>
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Student Name</th>
                <th>Attendance</th>
                <th>Score</th>
                <th>Quiz</th>
                <th>Cumu GPA</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedStudents.map((student) => {
                const attendanceValue = getAttendanceValue(student.attendance);
                let rowClass = '';
                if (attendanceValue <= 0.56) rowClass = 'red'; // 5/9 or lower
                else if (attendanceValue <= 0.67) rowClass = 'orange'; // 6/9
                else if (attendanceValue <= 0.78) rowClass = 'yellow'; // 7/9

                return (
                  <tr key={student.id} className={rowClass}>
                    <td>{student.id}</td>
                    <td>
                      {student.link ? (
                        <a onClick={() => navigate(student.link)}>{student.name}</a>
                      ) : (
                        student.name
                      )}
                    </td>
                    <td>{student.attendance}</td>
                    <td>{student.score}</td>
                    <td>{student.quiz}</td>
                    <td>{student.gpa}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentListITCS125;
