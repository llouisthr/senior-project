import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import './CourseDashboard.css';
import * as d3 from 'd3';

const CourseDashboard = () => {
    const navigate = useNavigate();
    const [expandedMenu, setExpandedMenu] = useState(null);
    const [expandedSubmenu, setExpandedSubmenu] = useState(null);
    const [selectedSection, setSelectedSection] = useState("name");
    const [activeTab, setActiveTab] = useState('overview');

    const toggleMenu = (menu) => {
        setExpandedMenu(expandedMenu === menu ? null : menu);
    };

    const toggleSubmenu = (submenu) => {
        setExpandedSubmenu(expandedSubmenu === submenu ? null : submenu);
    };
    const [selectedSemester, setSelectedSemester] = useState('Semester 1 - 2024');
    const [enrollment, setEnrollment] = useState(60);
    const [riskStudents, setRiskStudents] = useState(6);
    const [outstandingStudents, setOutstandingStudents] = useState(5);

    const attendanceChartRef = useRef(null);
    const submissionChartRef = useRef(null);
    const scoreDistributionChartRef = useRef(null);
    const maxScoreRef = useRef(null);
    const medianScoreRef = useRef(null);
    const averageScoreRef = useRef(null);

    const maxScore = 69;
    const medianScore = 47;
    const averageScore = 43;



    useEffect(() => {
        renderAttendanceChart();
        renderSubmissionChart();
        renderScoreDistributionChart();
        renderGaugeChart(maxScoreRef, maxScore, 100, "Max Score", "green");
        renderGaugeChart(medianScoreRef, medianScore, 100, "Median Score", "blue");
        renderGaugeChart(averageScoreRef, averageScore, 100, "Average Score", "orange");
    }, [maxScore, medianScore, averageScore]);

    const renderAttendanceChart = () => {
        const data = [
            { week: 'W1', students: 60 },
            { week: 'W2', students: 56 },
            { week: 'W3', students: 53 },
            { week: 'W4', students: 51 },
            { week: 'W5', students: 47 },
            { week: 'W6', students: 45 },
            { week: 'W7', students: 53 },
            { week: 'W8', students: 60 },
            { week: 'W9', students: 52 }
        ];

        const width = 450, height = 250;
        d3.select(attendanceChartRef.current).select("svg").remove();
        const svg = d3.select(attendanceChartRef.current).append("svg")
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


    const renderSubmissionChart = () => {
        const data = [
            { assignment: 'A1', late: 5, onTime: 55 },
            { assignment: 'A2', late: 10, onTime: 50 },
            { assignment: 'A3', late: 13, onTime: 47 },
            { assignment: 'A4', late: 8, onTime: 52 }
        ];

        const width = 350, height = 250, margin = { top: 20, right: 80, bottom: 50, left: 50 };

        d3.select(submissionChartRef.current).select("svg").remove();
        const svg = d3.select(submissionChartRef.current).append("svg")
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


    const renderScoreDistributionChart = () => {
        const data = [
            { range: '0-20', count: 10 },
            { range: '21-40', count: 25 },
            { range: '41-60', count: 40 },
            { range: '61-80', count: 35 },
            { range: '81-100', count: 20 }
        ];

        const width = 350, height = 250;
        d3.select(scoreDistributionChartRef.current).select("svg").remove();
        const svg = d3.select(scoreDistributionChartRef.current).append("svg")
            .attr("width", width)
            .attr("height", height);

        const x = d3.scaleBand().domain(data.map(d => d.range)).range([50, width - 50]).padding(0.1);
        const y = d3.scaleLinear().domain([0, 50]).range([height - 50, 20]);

        // Add x-axis
        svg.append("g")
            .attr("transform", `translate(0, ${height - 50})`)
            .call(d3.axisBottom(x));

        // Add y-axis
        svg.append("g")
            .attr("transform", `translate(50, 0)`)
            .call(d3.axisLeft(y));

        svg.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", d => x(d.range))
            .attr("y", d => y(d.count))
            .attr("width", x.bandwidth())
            .attr("height", d => height - 50 - y(d.count))
            .attr("fill", "green");
    };

    const renderGaugeChart = (chartRef, value, max = 100, label = "", color = "green") => {
        const width = 250, height = 150;
        const minAngle = -90, maxAngle = 90;

        d3.select(chartRef.current).select("svg").remove();

        const svg = d3.select(chartRef.current)
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
            .endAngle((scale(value) * Math.PI) / 180);

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
            .text(`${value}`);

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
                    <div className="menu-heading" onClick={() => toggleMenu("course")} style={{ cursor: "pointer" }}>Course</div>
                    {expandedMenu === "course" && (
                        <div className="submenu" style={{ cursor: "pointer" }}>
                            {["ITCS209", "ITCS125", "ITLG201"].map((course) => (
                                <div key={course}>
                                    <a onClick={() => toggleSubmenu(course)}>{course}</a>
                                    {expandedSubmenu === course && (
                                        <div className="nested-submenu">
                                            <a onClick={() => navigate(`/${course.toLowerCase()}/dashboard`)} style={{ cursor: "pointer" }}>Dashboard</a>
                                            <a onClick={() => navigate(`/${course.toLowerCase()}/student-list`)} style={{ cursor: "pointer" }}>Student List</a>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div>
                    <div className="menu-heading" onClick={() => navigate("/powerbi")} style={{ cursor: "pointer" }}>Power BI</div>
                </div>
            </div>
            <div className="main-content">
                <h3>ITCS209 &gt; Dashboard &gt; Course Overview</h3>
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

                    <div className="card-header">
                        <div className="enrollment">
                            <span className="enrollment-icon">📚</span>
                            <span style={{ fontWeight: 'bold', fontSize: '24px' }}>
                                {enrollment} Students Enrolled
                            </span>
                        </div>
                        <select
                            value={selectedSection}
                            onChange={(e) => setSelectedSection(e.target.value)}
                            className="section-dropdown"
                        >
                            <option value="section1">Section 1</option>
                            <option value="section2">Section 2</option>
                            <option value="section3">Section 3</option>
                        </select>
                    </div>
                    <div className="first-row">
                        {activeTab === "overview" && (
                            <>
                                {/* Student Engagement */}
                                <div className="student-engagement">
                                    <h3>Student Engagement</h3>
                                    <p className="engagement-percentage">78%</p>
                                    <p className="engagement-text">
                                        From Attendance + Exit Ticket + Assignment Submissions
                                    </p>
                                </div>

                                {/* Attendance Line Chart */}
                                <div className="chart-container">
                                    <div className="chart" ref={attendanceChartRef}>
                                        <h4>Attendance</h4>
                                    </div>
                                </div>

                                {/* Assignment Submission Chart */}
                                <div className="chart-container">
                                    <div className="chart" ref={submissionChartRef}>
                                        <h4>Assignment Submissions</h4>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="second-row">
                        {activeTab === "overview" && (
                            <>

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
                                        <div className="quiz-header">
                                            <span>Quiz</span>
                                            <span>Average Score</span>
                                        </div>
                                        <div className="quiz-list">
                                            <p>Quiz 3 → 4/12</p>
                                            <p>Quiz 5 → 3/12</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Score Distribution with D3 Gauge Charts */}
                                <div className="score-distribution">
                                    <h4>Score Distribution</h4>

                                    <div className="gauge-container">
                                        <div ref={maxScoreRef}></div>
                                        <div ref={medianScoreRef}></div>
                                        <div ref={averageScoreRef}></div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {activeTab === "at-risk" && (
                        <div
                            className="content"
                            style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "50px", height: "900px" }}
                        >
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
                                        <tr><td>6xxxxxx</td><td>Ms. V</td><td>7/9</td><td>15/50</td><td>2.25</td><td>5/9</td></tr>
                                        <tr><td>6xxxxxx</td><td>Ms. W</td><td>5/9</td><td>11/50</td><td>2.37</td><td>3/9</td></tr>
                                        <tr><td>6xxxxxx</td><td>Mr. X</td><td>6/9</td><td>18/50</td><td>2.24</td><td>9/9</td></tr>
                                        <tr><td>6xxxxxx</td><td>Ms. Y</td><td>1/9</td><td>9/50</td><td>2.39</td><td>6/9</td></tr>
                                        <tr><td>6xxxxxx</td><td>Mr. Z</td><td>4/9</td><td>20/50</td><td>2.56</td><td>4/9</td></tr>
                                        <tr><td>6xxxxxx</td><td>Mr. K</td><td>3/9</td><td>13/50</td><td>2.41</td><td>7/9</td></tr>
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
                                        <tr><td>6xxxxxx</td><td>Mr. A</td><td>9/9</td><td>48/50</td><td>3.91</td><td>0/9</td></tr>
                                        <tr><td>6xxxxxx</td><td>Ms. B</td><td>8/9</td><td>45/50</td><td>3.87</td><td>1/9</td></tr>
                                        <tr><td>6xxxxxx</td><td>Ms. C</td><td>9/9</td><td>43/50</td><td>3.84</td><td>1/9</td></tr>
                                        <tr><td>6xxxxxx</td><td>Mr. D</td><td>8/9</td><td>44/50</td><td>3.78</td><td>1/9</td></tr>
                                        <tr><td>6xxxxxx</td><td>Mr. E</td><td>9/9</td><td>45/50</td><td>3.75</td><td>0/9</td></tr>
                                    </tbody>
                                </table>
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
        </div>
    );
};

export default CourseDashboard;
