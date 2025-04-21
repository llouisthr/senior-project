import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from "react-router-dom";
import * as d3 from 'd3';
import personIcon from "./person.jpg";
import axios from "axios";
import './StudentProfile.css';

const StudentProfileB = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isCurrentCourse = location.pathname.includes("current-course");
    const [expandedMenu, setExpandedMenu] = useState(null);
    const [expandedSubmenu, setExpandedSubmenu] = useState(null);
    const [infoOption, setInfoOption] = useState("current-course");
    const [quizScores, setQuizScores] = useState([]);
    const [missingAssignments, setMissingAssignments] = useState([]);
    const [attendanceLine, setAttendanceLine] = useState([]);
    const [currentScore, setCurrentScore] = useState(null);
    const [avgScore, setAvgScore] = useState(null);
    const [submissionSummary, setSubmissionSummary] = useState(null);

    const toggleMenu = (menu) => {
        setExpandedMenu(expandedMenu === menu ? null : menu);
    };

    const toggleSubmenu = (submenu) => {
        setExpandedSubmenu(expandedSubmenu === submenu ? null : submenu);
    };
    const chartRefs = {
        activityRadarChart: useRef(null),
        skillsRadarChart: useRef(null),
        gradeChart: useRef(null),
        subjectScoreChart: useRef(null),
        assignmentDonut: useRef(null),
        attendanceChart: useRef(null),
        frequencyLineChart: useRef(null),
        attendanceLineChart: useRef(null),
        subjectDonut: useRef(null),
        subjectBar: useRef(null),
    };

    const [studentInfo, setStudentInfo] = useState(null); // for name, email, advisor, etc.
    // 🔹 Fetch MySQL data via API
    const { studentId, courseId } = useParams();

    useEffect(() => {
        if (!studentId) return;

        const fetchOverview = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/student-profile/${studentId}/${courseId}/current-course`);
                const { studentInfo, quizScores,
                    missingAssignments,
                    attendanceLine,
                    currentScore,
                    avgScore,
                    submissionSummary } = res.data;

                setStudentInfo(studentInfo);
                setQuizScores(quizScores);
                setMissingAssignments(missingAssignments);
                setAttendanceLine(attendanceLine);
                setCurrentScore(currentScore);
                setAvgScore(avgScore);
                setSubmissionSummary(submissionSummary);
            } catch (err) {
                console.error("Failed to fetch overview:", err);
            }
        };

        fetchOverview();
    }, [studentId]);

    useEffect(() => {
        console.log("submissionSummary", submissionSummary);
        if (submissionSummary && chartRefs.subjectDonut.current) {
            const data = [
                { label: "On Time", value: Number(submissionSummary.on_time || 0) },
                { label: "Late", value: Number(submissionSummary.late || 0) },
                { label: "No submission", value: Number(submissionSummary.no_submission || 0) }
            ];            
            renderDonutChart(chartRefs.subjectDonut, data);
        }
    }, [submissionSummary]);

    useEffect(() => {
        if (attendanceLine?.length && chartRefs.attendanceLineChart.current) {
            const formatted = attendanceLine.map(item => ({
                label: `W${item.attendance_week}`,
                value: item.attendance_status === "present" ? 1 : 0
            }));
            renderSecondLineChart(chartRefs.attendanceLineChart, formatted);
        }
    }, [attendanceLine]);

    const score = Number(currentScore);
    const average = Number(avgScore);

    const renderSecondLineChart = (ref, data) => {
        const svg = d3.select(ref.current);
        svg.selectAll("*").remove();

        const width = 250, height = 300;
        const margin = { top: 20, right: -40, bottom: 120, left: 30 };

        // Create x scale (using the week labels as the domain)
        const x = d3.scalePoint()
            .domain(data.map(d => d.label))  // Using 'label' (e.g., W1, W2, W3, etc.)
            .range([margin.left, width - margin.right]);

        // Create y scale (domain is [0, 1] since values are binary)
        const y = d3.scaleLinear()
            .domain([0, 1])  // Only 0 and 1
            .range([height - margin.bottom, margin.top]);

        const line = d3.line()
            .x(d => x(d.label))
            .y(d => y(d.value))
            .curve(d3.curveMonotoneX);

        // X axis with points for each week
        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x));

        // Y axis with ticks for 0 and 1, formatted as integers
        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y)
                .tickValues([0, 1])  // Show only 0 and 1 on the y-axis
                .tickFormat(d3.format("d"))  // Format ticks as integers (d stands for integer format)
            );

        // Line path
        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2)
            .attr("d", line);

        // Add circular markers (dots) for each data point
        svg.selectAll(".dot")
            .data(data)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("cx", d => x(d.label))
            .attr("cy", d => y(d.value))
            .attr("r", 5)  // Radius of the dots
            .attr("fill", "red")
            .attr("stroke", "black")
            .attr("stroke-width", 1);
    };

    const renderDonutChart = (ref, data) => {
        const svg = d3.select(ref.current);
        // Clear it
        svg.selectAll("*").remove();
        // Then draw on it
        svg.append("g")

        const width = 300, height = 300;
        const margin = { top: 30, right: 10, bottom: 50, left: 10 };

        const radius = Math.min(width, height) / 2 - margin.top;


        // Create a color scale
        const color = d3.scaleOrdinal()
            .domain(data.map(d => d.label))
            .range(d3.schemeSet2);

        // Modify the color of "No submission" specifically to red
        const getColor = (label) => {
            if (label === "No submission") {
                return "red";
            }
            return color(label); // Return default color for other labels
        };

        // Create a pie chart layout
        const pie = d3.pie()
            .value(d => d.value)
            .sort(null);

        const arc = d3.arc()
            .innerRadius(radius - 50)  // Set the inner radius to create the "hole"
            .outerRadius(radius);

        const arcLabel = d3.arc()
            .innerRadius(radius - 40)
            .outerRadius(radius - 40);

        const total = d3.sum(data, d => d.value);

        // Append a group element to the SVG to center the donut chart
        const g = svg.append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`);

        // Create the pie chart slices
        const slices = g.selectAll(".slice")
            .data(pie(data))
            .enter().append("g")
            .attr("class", "slice");

        // Draw the slices of the donut
        slices.append("path")
            .attr("d", arc)
            .attr("fill", d => getColor(d.data.label));

        // Add labels to each slice
        slices.append("text")
            .attr("transform", d => `translate(${arcLabel.centroid(d)})`)
            .attr("dy", ".15em")
            .style("text-anchor", "middle")
            .style("font-size", "15px")
            .text(d => `(${((d.data.value / total) * 100).toFixed(1)}%)`);

        // Add an optional outer circle (border for the donut)
        g.append("circle")
            .attr("r", radius)
            .style("fill", "none")
            .style("stroke", "black")
            .style("stroke-width", 2);

        // Add legend in the middle of the donut
        const legend = g.append("g")
            .attr("transform", "translate(0, 0)")
            .attr("text-anchor", "middle");

        data.forEach((d, i) => {
            const legendItem = legend.append("g")
                .attr("transform", `translate(0, ${i * 15 - (data.length * 7.5)})`);

            legendItem.append("rect")
                .attr("x", -50)
                .attr("y", -6)
                .attr("width", 12)
                .attr("height", 12)
                .style("fill", getColor(d.label));

            legendItem.append("text")
                .attr("x", 10)
                .attr("y", 0)
                .attr("dy", "0.3em")
                .style("font-size", "12px")
                .text(d.label);
        });
    };

    return (
        <div className="student-profile-page-b-container">
            <div className="main-content">
                <h3>
                    {courseId} &gt; Student List &gt; {studentId} &gt; {isCurrentCourse ? "Current Course" : "Overall"}
                </h3>

                <div className="student-head-box">
                    <span>Student Information</span>

                    {/* Dropdown with options */}
                    <div className="flex gap-4">
                    <select
                        value={infoOption}
                        onChange={(e) => {
                            const selected = e.target.value;
                            setInfoOption(selected);
                            if (selected === "overall") {
                            navigate(`/student-profile/${studentId}/${courseId}/overview`);
                            } else if (selected === "current-course") {
                            navigate(`/student-profile/${studentId}/${courseId}/current-course`);
                            }
                        }}
                        className="px-4 py-2 rounded border border-gray-300">
                        <option value="overall">Overview</option>
                        <option value="current-course">Current Course</option>
                        </select>
                    </div>
                </div>
                <div>
                    {/* Profile & Student Info */}
                    <div className="info-container">
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%"
                        }}>
                            <img
                                src={personIcon}
                                alt="Profile"
                                style={{
                                    width: "100px",
                                    height: "100px",
                                    borderRadius: "50%",
                                    objectFit: "cover"
                                }}
                            />
                        </div>

                        <div className="student-info" style={{marginLeft: "30px"}}>
                            <h2>Student Information</h2>
                            {studentInfo ? (
                                <>
                                    <p><strong>Name:</strong> {studentInfo.fname} {studentInfo.lname}</p>
                                    <p><strong>ID:</strong> {studentInfo.student_id}</p>
                                    <p><strong>Email:</strong> {studentInfo.email}</p>
                                    <p><strong>Advisor:</strong> {studentInfo.advisor}</p>
                                    <p><strong>Staff:</strong> {studentInfo.staff}</p>
                                </>
                            ) : (
                                <p>Loading student information...</p>
                            )}
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="chart-container" style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: "20px",
                        alignItems: "start"
                    }}>
                        {/* Quiz Table */}
                        <div className="chart-box" style={{ flex: 1, minHeight: "550px", minWidth: "340px", maxWidth: "52%"}}>
                            <h3>Quiz (10)</h3>
                            <table style={{ width: "100%", border: "1px solid #ddd" }}>
                                <thead>
                                    <tr><th>Quiz</th><th>Score</th></tr>
                                </thead>
                                <tbody>
                                    {Array.isArray(quizScores) && quizScores.length > 0 ? (
                                        quizScores.map((quiz, idx) => (
                                            <tr key={idx}>
                                                <td>{quiz.assess_item_name}</td>
                                                <td>{quiz.score}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="2">No quizzes available</td></tr>
                                    )}

                                </tbody>
                            </table>
                        </div>

                        {/* Missing Assignments */}
                        <div className="chart-box" style={{ flex: 1, minHeight: "550px",  minWidth: "340px", maxWidth: "48%"}}>
                            <h3>Missing Assignment</h3>
                            <table style={{ width: "100%", border: "1px solid #ddd", marginTop: "0", verticalAlign: "top" }}>
                                <thead>
                                    <tr><th>Assignment</th><th>Status</th></tr>
                                </thead>
                                <tbody>
                                    {missingAssignments.length === 0 ? (
                                        <tr><td colSpan="2">No missing assignments</td></tr>
                                    ) : (
                                        missingAssignments.map((assignment, idx) => (
                                            <tr key={idx}>
                                                <td>{assignment.assess_item_name}</td>
                                                <td>Missing</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Attendance + Score */}
                        <div className="chart-column" style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            gap: "20px"
                        }}>
                            <div className="chart-box" style={{ minHeight: "300px" ,  minWidth: "340px", maxWidth: "48%"}}>
                                <h3>Attendance</h3>
                                <svg ref={chartRefs.attendanceLineChart} width={300} height={200}></svg>
                            </div>

                            <div className="chart-box" style={{ minHeight: "200px", textAlign: "center" , marginTop: "-20px",  minWidth: "340px", maxWidth: "48%"}}>
                                <h3>Current Score</h3>
                                <p style={{
                                    fontSize: "36px",
                                    color: score >= average ? "green" : "red",
                                    fontWeight: "bold"
                                }}>
                                    {score || score === 0 ? score : "--"}
                                </p>
                                <p>Average is {average ?? "--"}</p>

                            </div>
                        </div>

                        {/* Donut Chart */}
                        <div className="chart-box" style={{ minHeight: "550px" }}>
                            <h3>Assignment Submission</h3>
                            <svg ref={chartRefs.subjectDonut} width={300} height={300}></svg>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default StudentProfileB;
