import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom"; // Import useNavigate
import './CourseDashboard.css';
import * as d3 from 'd3';

const CourseDashboard = () => {
    const navigate = useNavigate(); // Hook for navigation
    // ***DEFINE STATE VARIABLES HERE, BEFORE THEY ARE USED***
    const [selectedCourse, setSelectedCourse] = useState('Object Oriented Programming');
    const [enrollment, setEnrollment] = useState(200);
    const [averageScore, setAverageScore] = useState(67);
    const [topScores, setTopScores] = useState([
        { name: 'Mr. A', attendance: '15/15', score: 100, gpa: 3.91 },
        { name: 'Mr. B', attendance: '14/15', score: 99, gpa: 3.87 },
        { name: 'Mr. C', attendance: '13/15', score: 98, gpa: 3.84 },
        { name: 'Mr. D', attendance: '14/15', score: 99, gpa: 3.87 },
        { name: 'Mr. E', attendance: '13/15', score: 98, gpa: 3.84 },
    ]);
    const [leastScores, setLeastScores] = useState([
        { name: 'Ms. V', attendance: '8/15', score: 51, gpa: 2.15 },
        { name: 'Ms. W', attendance: '9/15', score: 53, gpa: 2.25 },
        { name: 'Ms. X', attendance: '9/15', score: 53, gpa: 2.25 },
        { name: 'Ms. Y', attendance: '9/15', score: 53, gpa: 2.25 },
        { name: 'Ms. Z', attendance: '9/15', score: 53, gpa: 2.25 },
    ]);

    const attendanceChartRef = useRef(null);
    const submissionChartRef = useRef(null);
    const scoreDistributionChartRef = useRef(null);

    // ***DEFINE THE FUNCTION HERE, BEFORE IT IS USED***
    const handleCourseChange = (event) => {
        setSelectedCourse(event.target.value);
    };

    useEffect(() => {
        renderAttendanceChart();
        renderSubmissionChart();
        renderScoreDistributionChart();
    }, []);

    const renderAttendanceChart = () => {
        const data = [
            { range: '0-2', count: 5 },
            { range: '3-5', count: 15 },
            { range: '6-8', count: 25 },
            { range: '9-11', count: 18 },
            { range: '12-15', count: 12 },
        ]; // Example data. Replace with your actual data.
    
        const margin = { top: 20, right: 30, bottom: 50, left: 60 },
            width = 400 - margin.left - margin.right,
            height = 250 - margin.top - margin.bottom;
    
        // Clear previous chart if exists
        d3.select(attendanceChartRef.current).select("svg").remove();
    
        const svg = d3.select(attendanceChartRef.current)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
    
        const x = d3.scaleBand()
            .domain(data.map(d => d.range))
            .range([0, width])
            .padding(0.1);
    
        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.count)])
            .nice()
            .range([height, 0]);
    
        // X-axis
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(0,10)")
            .style("text-anchor", "middle");
    
        // Y-axis
        svg.append("g")
            .call(d3.axisLeft(y));
    
        // Bars
        svg.selectAll(".bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.range))
            .attr("y", d => y(d.count))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d.count))
            .attr("fill", "steelblue");
    };    
    
    const renderSubmissionChart = () => {
        const data = [
            { assignment: 'Assignment 1', submissions: 180 },
            { assignment: 'Assignment 2', submissions: 150 },
            { assignment: 'Assignment 3', submissions: 120 },
            { assignment: 'Assignment 4', submissions: 190 },
            { assignment: 'Assignment 5', submissions: 160 },
        ];
    
        const margin = { top: 20, right: 30, bottom: 50, left: 60 },
            width = 400 - margin.left - margin.right,
            height = 250 - margin.top - margin.bottom;
    
        d3.select(submissionChartRef.current).select("svg").remove();
    
        const svg = d3.select(submissionChartRef.current)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
    
        const x = d3.scaleBand()
            .domain(data.map(d => d.assignment))
            .range([0, width])
            .padding(0.1);
        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.submissions)]).nice()
            .range([height, 0]);
    
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "rotate(-30)")
            .style("text-anchor", "end");
    
        svg.append("g")
            .call(d3.axisLeft(y));
    
        svg.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.assignment))
            .attr("width", x.bandwidth())
            .attr("y", d => y(d.submissions))
            .attr("height", d => height - y(d.submissions))
            .attr("fill", "skyblue");
    };
    
    const renderScoreDistributionChart = () => {
        const data = [
            { scoreRange: '0-20', count: 10 },
            { scoreRange: '21-40', count: 25 },
            { scoreRange: '41-60', count: 40 },
            { scoreRange: '61-80', count: 35 },
            { scoreRange: '81-100', count: 20 },
        ];
    
        const margin = { top: 20, right: 30, bottom: 50, left: 60 },
            width = 400 - margin.left - margin.right,
            height = 250 - margin.top - margin.bottom;
    
        d3.select(scoreDistributionChartRef.current).select("svg").remove();
    
        const svg = d3.select(scoreDistributionChartRef.current)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
    
        const x = d3.scaleBand()
            .domain(data.map(d => d.scoreRange))
            .range([0, width])
            .padding(0.1);
        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.count)]).nice()
            .range([height, 0]);
    
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "rotate(-30)")
            .style("text-anchor", "end");
    
        svg.append("g")
            .call(d3.axisLeft(y));
    
        svg.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.scoreRange))
            .attr("width", x.bandwidth())
            .attr("y", d => y(d.count))
            .attr("height", d => height - y(d.count))
            .attr("fill", "lightgreen");
    };    

    return (
        <div className="container">
            <div className="sidebar">
                <h2>MUICT LEARNING</h2>
                <div>
                <a href="importdata.html">Import Data</a>
                <div className="menu-heading">Dashboard</div>
                <a onClick={() => navigate("/")} className="active">
                    Course Overview
                </a>
                <a onClick={() => navigate("/student-list")}>Student Profile</a> {/* Updated Navigation */}
                </div>
                <div className="logout">
                    <a href="logout.html">
                        Logout
                    </a>
                </div>
            </div>
            <div className="main-content">
                <div className="header">
                <div className="dashboard-title">Dashboard &gt; Course Overview</div>
                    <select className="dropdown" value={selectedCourse} onChange={handleCourseChange}> {/* Now these are defined */}
                        <option>Object Oriented Programming</option>
                        <option>Data Structures and Algorithms</option>
                        <option>Web Development</option>
                    </select>
                </div>

                <div className="cards">
                    <div className="card">
                        <h3>Student Enrollment</h3>
                        <p><strong>{enrollment}</strong> Students Enrolled</p> {/* Now defined */}
                    </div>
                    <div className="card">
                        <h3>Class Average Score</h3>
                        <p><strong>{averageScore}/100</strong></p> {/* Now defined */}
                    </div>
                </div>

                <div className="chart-row">
                    <div className="chart" id="attendance-chart" ref={attendanceChartRef}>
                        <h3>Student Engagement</h3>
                    </div>
                    <div className="chart" id="submission-chart" ref={submissionChartRef}>
                        <h3>Assignment Submissions</h3>
                    </div>
                    <div className="chart" id="score-distribution-chart" ref={scoreDistributionChartRef}>
                        <h3>Score Distribution</h3>
                    </div>
                </div>

                <div className="double-cards">
                    <div className="table-card">
                        <h3>TOP 5 Scores</h3>
                        <table>
                        <thead>
                                <tr><th>Name</th><th>Attendance</th><th>Score</th><th>GPA</th></tr>
                            </thead>
                            <tbody>
                                {topScores.map((student, index) => ( // Now defined
                                    <tr key={index}>
                                        <td>{student.name}</td>
                                        <td>{student.attendance}</td>
                                        <td>{student.score}</td>
                                        <td>{student.gpa}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="table-card">
                        <h3>LEAST 5 Scores</h3>
                        <table>
                        <thead>
                                <tr><th>Name</th><th>Attendance</th><th>Score</th><th>GPA</th></tr>
                            </thead>
                            <tbody>
                                {leastScores.map((student, index) => ( // Now defined
                                    <tr key={index}>
                                        <td>{student.name}</td>
                                        <td>{student.attendance}</td>
                                        <td>{student.score}</td>
                                        <td>{student.gpa}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDashboard;