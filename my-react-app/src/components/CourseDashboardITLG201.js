import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import './CourseDashboardITLG201.css';
import * as d3 from 'd3';

const ITLG201CourseDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [expandedMenu, setExpandedMenu] = useState(null);
    const [expandedSubmenu, setExpandedSubmenu] = useState(null);
    const [selectedSection, setSelectedSection] = useState("section1");
    const [activeTab, setActiveTab] = useState("overview");
    const [selectedCourse, setSelectedCourse] = useState("");
    const [data, setData] = useState({});
    const [enrollment, setEnrollment] = useState(0);
    const [engagement, setEngagement] = useState(0);
    const [lowScoringQuizzes, setlowScoringQuizzes] = useState(0);
    const [riskStudents, setRiskStudents] = useState(0);
    const [outstandingStudents, setOutstandingStudents] = useState(0);
    const [atRiskStudentsName, setAtRiskStudentsName] = useState([]);
    const [outstandingStudentsName, setOutstandingStudentsName] = useState([]);

    const toggleMenu = (menu) => {
        setExpandedMenu(expandedMenu === menu ? null : menu);
    };

    const toggleSubmenu = (course) => {
        setExpandedSubmenu(expandedSubmenu === course ? null : course);
    };

    const handleSectionChange = (e) => {
        const newSection = e.target.value;
        console.log("New Section Selected:", newSection);
        setSelectedSection(newSection);
    };

    const fetchData = (section) => {
        const sectionData = {
            section1: {
                enrollment: 60,
                engagement: 78,
                attendance: [
                    { week: "W1", students: 60 },
                    { week: "W2", students: 59 },
                    { week: "W3", students: 55 },
                    { week: "W4", students: 54 },
                    { week: "W5", students: 52 },
                    { week: "W6", students: 45 },
                    { week: "W7", students: 53 },
                    { week: "W8", students: 56 },
                    { week: "W9", students: 52 }
                ],
                submissions: [
                    { assignment: "A1", late: 8, onTime: 52 },
                    { assignment: "A2", late: 10, onTime: 50 },
                    { assignment: "A3", late: 3, onTime: 57 },
                    { assignment: "A4", late: 15, onTime: 15 }
                ],
                riskStudents: 5,
                outstandingStudents: 3,
                lowScoringQuizzes: ["Quiz 3 → 4/12", "Quiz 5 → 3/12"],
                maxScore: 50,
                medianScore: 40,
                averageScore: 35,
                atRiskStudentsName: [
                    { id: "6800015", name: "Mr. Jacob Mcgowan", attendance: "5/9", score: "25/50", gpa: "2.68", lateAssignment: "5/9" },
                    { id: "6800002", name: "Ms. Shania Fischer", attendance: "5/9", score: "27/50", gpa: "2.70", lateAssignment: "3/9" },
                    // ... other students ...
                ],
                outstandingStudentsName: [
                    { id: "6800001", name: "Ms. Mattie Khan", attendance: "9/9", score: "48/50", gpa: "3.91", lateAssignment: "0/9" },
                    { id: "6800014", name: "Mr. Erik Rivas", attendance: "8/9", score: "45/50", gpa: "3.87", lateAssignment: "1/9" },
                    // ... other students ...
                ],
            },
            section2: {
                enrollment: 90,
                engagement: 75,
                attendance: [
                    { week: "W1", students: 50 },
                    { week: "W2", students: 52 },
                    { week: "W3", students: 48 },
                    { week: "W4", students: 44 },
                    { week: "W5", students: 46 },
                    { week: "W6", students: 50 },
                    { week: "W7", students: 51 },
                    { week: "W8", students: 53 },
                    { week: "W9", students: 49 }
                ],
                submissions: [
                    { assignment: "A1", late: 8, onTime: 50 },
                    { assignment: "A2", late: 15, onTime: 45 },
                    { assignment: "A3", late: 12, onTime: 48 },
                    { assignment: "A4", late: 9, onTime: 51 }
                ],
                riskStudents: 5,
                outstandingStudents: 3,
                lowScoringQuizzes: ["Quiz 1 → 3/12", "Quiz 6 → 2/12"],
                maxScore: 48,
                medianScore: 37,
                averageScore: 36,
                atRiskStudentsName: [
                    { id: "6800016", name: "Ms. Amber Lee", attendance: "4/9", score: "22/50", gpa: "2.50", lateAssignment: "6/9" },
                    // ... other students ...
                ],
                outstandingStudentsName: [
                    { id: "6800017", name: "Mr. John Doe", attendance: "9/9", score: "49/50", gpa: "3.95", lateAssignment: "0/9" },
                    // ... other students ...
                ],
            },
            section3: {
                enrollment: 90,
                engagement: 78,
                attendance: [
                    { week: "W1", students: 50 },
                    { week: "W2", students: 52 },
                    { week: "W3", students: 48 },
                    { week: "W4", students: 44 },
                    { week: "W5", students: 46 },
                    { week: "W6", students: 50 },
                    { week: "W7", students: 51 },
                    { week: "W8", students: 53 },
                    { week: "W9", students: 49 }
                ],
                submissions: [
                    { assignment: "A1", late: 8, onTime: 50 },
                    { assignment: "A2", late: 15, onTime: 45 },
                    { assignment: "A3", late: 12, onTime: 48 },
                    { assignment: "A4", late: 9, onTime: 51 }
                ],
                riskStudents: 2,
                outstandingStudents: 6,
                lowScoringQuizzes: ["Quiz 2 → 5/12", "Quiz 4 → 6/12"],
                maxScore: 45,
                medianScore: 36,
                averageScore: 34,
                atRiskStudentsName: [
                    { id: "6800016", name: "Ms. Amber Lee", attendance: "4/9", score: "22/50", gpa: "2.50", lateAssignment: "6/9" },
                    // ... other students ...
                ],
                outstandingStudentsName: [
                    { id: "6800017", name: "Mr. John Doe", attendance: "9/9", score: "49/50", gpa: "3.95", lateAssignment: "0/9" },
                    // ... other students ...
                ],
            }
        };
        return sectionData[section] || {};
    };


    const [selectedSemester, setSelectedSemester] = useState('Semester 1 - 2024');

    const attendanceChartRef = useRef(null);
    const submissionChartRef = useRef(null);
    const maxScoreRef = useRef(null);
    const medianScoreRef = useRef(null);
    const averageScoreRef = useRef(null);

    const maxScore = 69;
    const medianScore = 47;
    const averageScore = 43;


    useEffect(() => {
        console.log("Selected Section Changed:", selectedSection);

        const newData = fetchData(selectedSection);
        setData(newData);

        renderAttendanceChart(attendanceChartRef, newData.attendance);
        renderSubmissionChart(submissionChartRef, newData.submissions);
        renderGaugeChart(maxScoreRef, newData.maxScore, 100, "Max Score", "green");
        renderGaugeChart(medianScoreRef, newData.medianScore, 100, "Median Score", "blue");
        renderGaugeChart(averageScoreRef, newData.averageScore, 100, "Average Score", "orange");

        const pathParts = location.pathname.split("/").filter(Boolean); // Remove empty strings
        if (pathParts.length > 1) {
            setSelectedCourse(pathParts[0].toUpperCase()); // Set course name
        }

        setEnrollment(newData.enrollment || 0);
        setEngagement(newData.engagement || 0);
        setlowScoringQuizzes(newData.lowScoringQuizzes || 0);
        setRiskStudents(newData.riskStudents || 0);
        setOutstandingStudents(newData.outstandingStudents || 0);
        setAtRiskStudentsName(newData.atRiskStudentsName || []);
        setOutstandingStudentsName(newData.outstandingStudentsName || []);
    }, [maxScore, medianScore, averageScore, location.pathname, selectedSection]);


    const renderAttendanceChart = (ref, data) => {
        const width = 450, height = 250;
        d3.select(ref.current).select("svg").remove();
        const svg = d3.select(ref.current).append("svg")
            .attr("width", width)
            .attr("height", height);

        const x = d3.scalePoint().domain(data.map(d => d.week)).range([50, width - 50]);
        const y = d3.scaleLinear().domain([0, 60]).range([height - 50, 20]);

        const line = d3.line()
            .x(d => x(d.week))
            .y(d => y(d.students));

        // Add x-axis
        svg.append("g")
            .attr("transform", `translate(0, ${height - 50})`)
            .call(d3.axisBottom(x));

        // Add y-axis
        svg.append("g")
            .attr("transform", `translate(50, 0)`)
            .call(d3.axisLeft(y));

        // Draw the line
        svg.append("path")
            .datum(data)
            .attr("d", line)
            .attr("stroke", "black")
            .attr("fill", "none")
            .attr("stroke-width", 2);

        // Add plot points (circles)
        svg.selectAll(".dot")
            .data(data)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("cx", d => x(d.week))
            .attr("cy", d => y(d.students))
            .attr("r", 5) // Size of the dot
            .attr("fill", "red"); // Color of the dot
    };

    const renderSubmissionChart = (ref, data) => {
        const width = 350, height = 250, margin = { top: 20, right: 80, bottom: 50, left: 50 };

        d3.select(ref.current).select("svg").remove();
        const svg = d3.select(ref.current).append("svg")
            .attr("width", width)
            .attr("height", height);

        const x = d3.scaleBand()
            .domain(data.map(d => d.assignment))
            .range([margin.left, width - margin.right])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.late + d.onTime)]) // Ensure enough space for bars
            .range([height - margin.bottom, margin.top]);

        // Stack data
        const stack = d3.stack()
            .keys(["onTime", "late"])
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetNone);

        const stackedData = stack(data);

        const color = d3.scaleOrdinal()
            .domain(["onTime", "late"])
            .range(["steelblue", "red"]);

        // Add x-axis
        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x));

        // Add y-axis
        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));

        // Create bars
        svg.selectAll("g.layer")
            .data(stackedData)
            .enter()
            .append("g")
            .attr("class", "layer")
            .attr("fill", d => color(d.key))
            .selectAll("rect")
            .data(d => d)
            .enter()
            .append("rect")
            .attr("x", d => x(d.data.assignment))
            .attr("y", d => y(d[1]))
            .attr("height", d => y(d[0]) - y(d[1]))
            .attr("width", x.bandwidth());

        // Add legend
        const legend = svg.append("g")
            .attr("transform", `translate(${width - 80},${margin.top})`);

        ["On Time", "Late"].forEach((label, i) => {
            const legendRow = legend.append("g")
                .attr("transform", `translate(0, ${i * 20})`);

            legendRow.append("rect")
                .attr("width", 15)
                .attr("height", 15)
                .attr("fill", color(label.toLowerCase().replace(" ", "")));

            legendRow.append("text")
                .attr("x", 20)
                .attr("y", 12)
                .attr("text-anchor", "start")
                .style("font-size", "12px")
                .text(label);
        });
    };


    const renderGaugeChart = (ref, data, max = 100, label = "", color = "green") => {
        const width = 250, height = 150;
        const minAngle = -90, maxAngle = 90;

        d3.select(ref.current).select("svg").remove();

        const svg = d3.select(ref.current)
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        const gaugeGroup = svg.append("g")
            .attr("transform", `translate(${width / 2}, ${height - 15})`);

        const scale = d3.scaleLinear().domain([0, max]).range([minAngle, maxAngle]);

        // Background Arc
        const arc = d3.arc()
            .innerRadius(40)
            .outerRadius(50)
            .startAngle((minAngle * Math.PI) / 180)
            .endAngle((maxAngle * Math.PI) / 180);

        gaugeGroup.append("path")
            .attr("d", arc())
            .attr("fill", "#ddd");

        // Foreground Arc (Value Indicator)
        const arcValue = d3.arc()
            .innerRadius(40)
            .outerRadius(50)
            .startAngle((minAngle * Math.PI) / 180)
            .endAngle((scale(data) * Math.PI) / 180);

        gaugeGroup.append("path")
            .attr("d", arcValue())
            .attr("fill", color);

        // Display Value Text
        gaugeGroup.append("text")
            .attr("x", 0)
            .attr("y", -20)  // Adjusted for better visibility
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .attr("font-weight", "bold")
            .text(`${data}`);

        // Label Text
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height - 2)  // Positioned below the gauge
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .text(label);
    };


    return (
        <div className="container">
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
                <h3>{`ITLG201 > Dashboard > Course Overview`}</h3>
                <div class="box">
                    <div class="box-left">
                        Course Dashboard
                    </div>
                    <div class="box-right">
                        <select class="dropdown">
                            <option>Semester 1 - 2025</option>
                            <option>Semester 2 - 2025</option>
                        </select>
                    </div>
                </div>
                <div className="card">
                    {activeTab === "overview" && (
                        <>
                            <div className="card-header">
                                <div className="enrollment">
                                    <span className="enrollment-icon">📚</span>
                                    <span style={{ fontWeight: 'bold', fontSize: '24px' }}>
                                        {enrollment} Students Enrolled
                                    </span>
                                </div>

                                <select
                                    value={selectedSection}
                                    onChange={handleSectionChange}
                                    className="section-dropdown"
                                >
                                    <option value="section1">Section 1</option>
                                    <option value="section2">Section 2</option>
                                    <option value="section3">Section 3</option>
                                </select>
                            </div>

                            {/* Student Engagement */}
                            <div className="first-row">
                                <div className="student-engagement">
                                    <h3>Student Engagement</h3>
                                    <p className="engagement-percentage">{engagement}</p>
                                    <p className="engagement-text">
                                        From Attendance + Exit Ticket + Assignment Submissions
                                    </p>
                                </div>

                                {/* Attendance Chart */}
                                <div className="chart-container">
                                    <div className="chart" ref={attendanceChartRef}>
                                        <h4>Attendance</h4>
                                    </div>
                                </div>

                                {/* Assignment Submissions Chart */}
                                <div className="chart-container">
                                    <div className="chart" ref={submissionChartRef}>
                                        <h4>Assignment Submissions</h4>
                                    </div>
                                </div>
                            </div>
                            <div className="second-row">
                                {/* Student Detect */}
                                <div className="student-detect">
                                    <h3>Student Detect</h3>
                                    <div className="detect-container">
                                        <div className="detect-box risk-student">
                                            <p className="detect-number">{riskStudents}</p>
                                            <p className="detect-label">At-Risk Students</p>
                                        </div>
                                        <div className="detect-box outstanding-student">
                                            <p className="detect-number" style={{ color: 'green' }}>{outstandingStudents}</p>
                                            <p className="detect-label">Outstanding Students</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Low Scoring Quiz */}
                                <div className="low-scoring-quiz">
                                    <h4>Low Scoring Quizzes</h4>
                                    <div className="quiz-table">
                                        <div className="quiz-list">
                                            {Array.isArray(lowScoringQuizzes) ? (
                                                lowScoringQuizzes.map((quiz, index) => (
                                                    <p key={index}>{quiz}</p>
                                                ))
                                            ) : (
                                                <p>No quizzes available</p> // Fallback if data is not an array
                                            )}
                                        </div>


                                    </div>
                                </div>

                                <div className="score-distribution">
                                    <h4>Score Distribution</h4>

                                    <div className="gauge-container">
                                        <div ref={maxScoreRef}></div>
                                        <div ref={medianScoreRef}></div>
                                        <div ref={averageScoreRef}></div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}


                    {activeTab === "at-risk" && (
                        <div className="content" style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "900px" }}>

                            {/* Card Header with Enrollment and Section Dropdown */}
                            <div className="card-header" style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px", backgroundColor: "#f8f8f8" }}>
                                <div className="enrollment">
                                    <span className="enrollment-icon">📚</span>
                                    <span style={{ fontWeight: 'bold', fontSize: '24px' }}>
                                        {enrollment} Students Enrolled
                                    </span>
                                </div>

                                <select
                                    value={selectedSection}
                                    onChange={handleSectionChange}
                                    className="section-dropdown"
                                >
                                    <option value="section1">Section 1</option>
                                    <option value="section2">Section 2</option>
                                    <option value="section3">Section 3</option>
                                </select>
                            </div>

                            {/* At-Risk and Outstanding Students Tables */}
                            <div style={{ display: "flex", justifyContent: "center", gap: "50px", width: "100%", flexGrow: 1 }}>

                                {/* At-Risk Students Table */}
                                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <h3 style={{ color: "red", textAlign: "center" }}>At-risk Students</h3>
                                    <table border="1" width="80%" style={{ textAlign: "center" }}>
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Name</th>
                                                <th>Attendance</th>
                                                <th>Score</th>
                                                <th>GPA</th>
                                                <th>Late Assignment</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {atRiskStudentsName.map(student => (
                                                <tr key={student.id}>
                                                    <td>{student.id}</td>
                                                    <td>{student.name}</td>
                                                    <td>{student.attendance}</td>
                                                    <td>{student.score}</td>
                                                    <td>{student.gpa}</td>
                                                    <td>{student.lateAssignment}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Outstanding Students Table */}
                                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <h3 style={{ color: "green", textAlign: "center" }}>Outstanding Students</h3>
                                    <table border="1" width="80%" style={{ textAlign: "center" }}>
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Name</th>
                                                <th>Attendance</th>
                                                <th>Score</th>
                                                <th>GPA</th>
                                                <th>Late Assignment</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {outstandingStudentsName.map(student => (
                                                <tr key={student.id}>
                                                    <td>{student.id}</td>
                                                    <td>{student.name}</td>
                                                    <td>{student.attendance}</td>
                                                    <td>{student.score}</td>
                                                    <td>{student.gpa}</td>
                                                    <td>{student.lateAssignment}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}




                    {/* Tabs at bottom left */}
                    <div className="tabs">
                        <button
                            className={`tab ${activeTab === "overview" ? "active" : ""}`}
                            onMouseDown={() => setActiveTab("overview")}
                        >
                            Overview
                        </button>
                        <button
                            className={`tab ${activeTab === "at-risk" ? "active" : ""}`}
                            onMouseDown={() => setActiveTab("at-risk")}
                        >
                            At-risk & Outstanding
                        </button>
                    </div>


                </div>
            </div>
        </div >
    );
};

export default ITLG201CourseDashboard;
