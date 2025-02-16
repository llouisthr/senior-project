import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import * as d3 from 'd3';
import './StudentProfileB.css';

const StudentProfileB = () => {
    const navigate = useNavigate();
    const [expandedMenu, setExpandedMenu] = useState(null);
    const [expandedSubmenu, setExpandedSubmenu] = useState(null);
    const [infoOption, setInfoOption] = useState("overall");

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
        subjectDonut: useRef(null),
        subjectBar: useRef(null),
        studentScoreGauge: useRef(null),
        averageScoreGauge: useRef(null)
    };

    const gradeTrendData = [
        { label: '1st year 1st sem', value: 4.00 },
        { label: '1st year 2nd sem', value: 3.56 },
        { label: '2nd year 1st sem', value: 3.72 },
        { label: '2nd year 2nd sem', value: 3.41 }
    ];

    const subjectScoreData = [
        { label: 'W1', value: 5 },
        { label: 'W2', value: 9 },
        { label: 'W3', value: 14 },
        { label: 'W4', value: 17 },
        { label: 'W5', value: 22 },
        { label: 'W6', value: 25 },
        { label: 'W7', value: 27 },
        { label: 'W8', value: 40 },
        { label: 'W9', value: 45 },
    ];

    const activityData = [
        { label: "Health", value: 10 },
        { label: "International", value: 8 },
        { label: "Digital", value: 12 },
        { label: "Environment", value: 9 },
        { label: "Financial", value: 11 }
    ];

    const skillsData = [
        { label: "Leadership", value: 16 },
        { label: "Communication", value: 14 },
        { label: "Creativity", value: 11 },
        { label: "Critical Thinking", value: 13 },
        { label: "Social", value: 9 }
    ];



    const assignmentData = [
        { label: 'On Time', value: 80 },
        { label: 'Late', value: 20 }
    ];

    const attendanceData = [
        { category: 'January', value1: 30, value2: 80, value3: 55 },
        { category: 'February', value1: 60, value2: 40, value3: 90 },
        { category: 'March', value1: 70, value2: 60, value3: 45 }
    ];

    const frequencyData = [
        { label: 'January', value: 40 },
        { label: 'February', value: 35 },
        { label: 'March', value: 44 },
        { label: 'April', value: 41 }
    ];

    const subjectAssignmentData = [
        { label: 'On Time', value: 55 },
        { label: 'Late', value: 45 }
    ];

    const subjectAttendanceData = [
        { category: 'January', value1: 30, value2: 80, value3: 55 },
        { category: 'February', value1: 60, value2: 40, value3: 90 },
        { category: 'March', value1: 70, value2: 60, value3: 45 }
    ];

    const studentScore = 44;
    const averageScore = 46;

    useEffect(() => {
        renderSecondLineChart(chartRefs.gradeChart, gradeTrendData);
        renderThirdLineChart(chartRefs.subjectScoreChart, subjectScoreData); // Make sure to pass the correct ref here

        if (chartRefs.activityRadarChart.current && chartRefs.skillsRadarChart.current) {
            renderRadarChart(chartRefs.activityRadarChart, activityData,
                activityData.map(d => d.label), "Activities");

            renderRadarChart(chartRefs.skillsRadarChart, skillsData,
                skillsData.map(d => d.label), "Skills");
        }

        renderDonutChart(chartRefs.assignmentDonut, assignmentData);
        renderTripleBarChart(chartRefs.attendanceChart, attendanceData);
        renderLineChart(chartRefs.frequencyLineChart, frequencyData);
        renderDonutChart(chartRefs.subjectDonut, subjectAssignmentData);
        renderTripleBarChart(chartRefs.subjectBar, subjectAttendanceData);
        renderGaugeChart(chartRefs.studentScoreGauge, studentScore, 100, "Current Score");
        renderGaugeChart(chartRefs.averageScoreGauge, averageScore, 100, "Average Score");
    }, [chartRefs]);


    const renderLineChart = (ref, data) => {
        const svg = d3.select(ref.current);
        svg.selectAll("*").remove();

        const width = 500, height = 300;
        const margin = { top: 25, right: 110, bottom: 100, left: 40 };

        const x = d3.scalePoint()
            .domain(data.map(d => d.label))
            .range([margin.left, width - margin.right]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.value)])
            .nice()
            .range([height - margin.bottom, margin.top]);

        const line = d3.line()
            .x(d => x(d.label))
            .y(d => y(d.value))
            .curve(d3.curveMonotoneX);

        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x));

        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));

        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2)
            .attr("d", line);

        // Add circular markers (plots)
        svg.selectAll(".dot")
            .data(data)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("cx", d => x(d.label))
            .attr("cy", d => y(d.value))
            .attr("r", 5) // Radius of the dots
            .attr("fill", "red")
            .attr("stroke", "black")
            .attr("stroke-width", 1);
    };

    const renderSecondLineChart = (ref, data) => {
        const svg = d3.select(ref.current);
        svg.selectAll("*").remove();

        const width = 500, height = 300;
        const margin = { top: 10, right: -140, bottom: 150, left: 300 };

        const x = d3.scalePoint()
            .domain(data.map(d => d.label))
            .range([margin.left, width - margin.right]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.value)])
            .nice()
            .range([height - margin.bottom, margin.top]);

        const line = d3.line()
            .x(d => x(d.label))
            .y(d => y(d.value))
            .curve(d3.curveMonotoneX);

        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x));

        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));

        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2)
            .attr("d", line);

        // Add circular markers (plots)
        svg.selectAll(".dot")
            .data(data)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("cx", d => x(d.label))
            .attr("cy", d => y(d.value))
            .attr("r", 5) // Radius of the dots
            .attr("fill", "red")
            .attr("stroke", "black")
            .attr("stroke-width", 1);
    };

    const renderThirdLineChart = (ref, data) => {
        console.log(ref, data); // Log the ref and data
        if (!data || data.length === 0) return;

        const svg = d3.select(ref.current);
        svg.selectAll("*").remove();  // Clear previous elements (including axes)

        const width = 500, height = 300;
        const margin = { top: 10, right: 10, bottom: 150, left: 200 }; // Adjusted margins

        const x = d3.scalePoint()
            .domain(data.map(d => d.label))
            .range([margin.left, width - margin.right]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.value)])
            .nice()
            .range([height - margin.bottom, margin.top]);

        const line = d3.line()
            .x(d => x(d.label))
            .y(d => y(d.value))
            .curve(d3.curveMonotoneX);

        // Add X-axis
        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x));

        // Add Y-axis
        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));

        // Add the line path
        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2)
            .attr("d", line);

        // Add circular markers (plots)
        svg.selectAll(".dot")
            .data(data)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("cx", d => x(d.label))
            .attr("cy", d => y(d.value))
            .attr("r", 5) // Radius of the dots
            .attr("fill", "red")
            .attr("stroke", "black")
            .attr("stroke-width", 1);
    };


    const renderRadarChart = (ref, data, labels, title) => {
        const width = 125;  // Increased width for better spacing
        const height = 125; // Increased height for better spacing
        const margin = 110;  // Added margin for proper alignment
        const radius = Math.min(width, height) / 2.5; // Keep chart properly centered
        const angleSlice = (Math.PI * 2) / data.length;

        // Clear any existing SVG content
        d3.select(ref.current).selectAll("*").remove();

        const svg = d3.select(ref.current)
            .append('svg')
            .attr('width', width + margin * 2)  // Add margin to width
            .attr('height', height + margin * 2) // Add margin to height
            .append('g')
            .attr('transform', `translate(${(width + margin) / 2}, ${(height + margin) / 2})`); // Center chart


        const radialScale = d3.scaleLinear()
            .domain([0, 20])
            .range([0, radius]);

        // Add grid lines and labels (0,5,10,15,20)
        const gridValues = [0, 5, 10, 15, 20];
        gridValues.forEach(d => {
            const gridPoints = labels.map((_, i) => {
                const x = radialScale(d) * Math.cos(angleSlice * i - Math.PI / 2);
                const y = radialScale(d) * Math.sin(angleSlice * i - Math.PI / 2);
                return [x, y];
            });

            svg.append('polygon')
                .attr('points', gridPoints.map(p => p.join(',')).join(' '))
                .attr('stroke', '#ddd')
                .attr('fill', 'none');

            svg.append('text')
                .attr('x', 0)
                .attr('y', -radialScale(d))
                .attr('text-anchor', 'middle')
                .style('font-size', '10px')
                .style('fill', '#333')
                .text(d);
        });

        // Add axes and labels at the outer edge
        labels.forEach((label, i) => {
            const x = (radius + 20) * Math.cos(angleSlice * i - Math.PI / 2); // Ensure label spacing
            const y = (radius + 20) * Math.sin(angleSlice * i - Math.PI / 2);

            svg.append('line')
                .attr('x1', 0)
                .attr('y1', 0)
                .attr('x2', x * 0.85)
                .attr('y2', y * 0.85)
                .attr('stroke', '#ddd');

            svg.append('text')
                .attr('x', x)
                .attr('y', y)
                .attr('text-anchor', x > 0 ? 'start' : 'end')
                .attr('dy', y > 0 ? '1em' : '-0.5em')
                .style('font-size', '6px')
                .style('fill', '#333')
                .text(label);
        });

        // Draw radar data
        const polygonPoints = data.map((d, i) => [
            radialScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2),
            radialScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2)
        ]);

        svg.append('polygon')
            .attr('points', polygonPoints.map(p => p.join(',')).join(' '))
            .attr('fill', 'rgba(0, 0, 255, 0.2)')
            .attr('stroke', 'blue')
            .attr('stroke-width', 2);

        svg.selectAll('.dot')
            .data(polygonPoints)
            .enter().append('circle')
            .attr('cx', d => d[0])
            .attr('cy', d => d[1])
            .attr('r', 4)
            .attr('fill', 'blue');
    };



    const renderDonutChart = (ref, data) => {
        const svg = d3.select(ref.current);
        svg.selectAll("*").remove();

        const width = 300, height = 300;
        const margin = { top: 30, right: 10, bottom: 50, left: 10 };

        const radius = Math.min(width, height) / 2 - margin.top;

        // Create a color scale
        const color = d3.scaleOrdinal()
            .domain(data.map(d => d.label))
            .range(d3.schemeSet2);

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
            .attr("fill", d => color(d.data.label));

        // Add labels to each slice
        slices.append("text")
            .attr("transform", d => `translate(${arcLabel.centroid(d)})`)
            .attr("dy", ".35em")
            .style("text-anchor", "middle")
            .text(d => `${d.data.label} (${((d.data.value / total) * 100).toFixed(1)}%)`);

        // Add an optional outer circle (border for the donut)
        g.append("circle")
            .attr("r", radius)
            .style("fill", "none")
            .style("stroke", "black")
            .style("stroke-width", 2);
    };

    const renderTripleBarChart = (ref, data) => {
        const svg = d3.select(ref.current);
        svg.selectAll("*").remove();

        const width = 400, height = 250;
        const margin = { top: 40, right: 100, bottom: 20, left: 20 };

        const x0 = d3.scaleBand()
            .domain(data.map(d => d.category))
            .range([margin.left, width - margin.right])
            .padding(0.1);

        const x1 = d3.scaleBand()
            .domain([0, 1, 2])  // For 3 different bars in each group
            .range([0, x0.bandwidth()])
            .padding(0.05);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d3.max([d.value1, d.value2, d.value3]))])
            .nice()
            .range([height - margin.bottom, margin.top]);

        const color = d3.scaleOrdinal()
            .domain([0, 1, 2])
            .range(["steelblue", "orange", "green"]);

        // Append the x-axis
        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x0));

        // Append the y-axis
        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));

        // Create the bars for each category
        svg.append("g")
            .selectAll("g")
            .data(data)
            .enter().append("g")
            .attr("transform", d => `translate(${x0(d.category)}, 0)`)
            .selectAll("rect")
            .data(d => [d.value1, d.value2, d.value3])
            .enter().append("rect")
            .attr("x", (d, i) => x1(i))  // Position the bars inside each group
            .attr("y", d => y(d))
            .attr("width", x1.bandwidth())
            .attr("height", d => height - margin.bottom - y(d))
            .attr("fill", (d, i) => color(i));  // Different colors for each bar
    };

    const renderGaugeChart = (chartRef, value, max = 100, label = "") => {
        const width = 200, height = 120;
        const minAngle = -90, maxAngle = 90;

        d3.select(chartRef.current).select("svg").remove();

        const svg = d3.select(chartRef.current)
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        const gaugeGroup = svg.append("g")
            .attr("transform", `translate(${width / 2}, ${height - 10})`);

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
            .attr("fill", "green");


        // Display Value Text
        gaugeGroup.append("text")
            .attr("x", 0)
            .attr("y", -18)  // Adjusted for better visibility
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .attr("font-weight", "bold")
            .text(`${value}`);

        // Label Text
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height - 2)  // Positioned below the gauge
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .text(label);
    };


    return (
        <div className="student-profile-page-b-container">
            <div className="sidebar">
                <h2 onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
                    MUICT LEARNING
                </h2>
                <div>
                    <div className="menu-heading" onClick={() => toggleMenu("course")} style={{ cursor: "pointer" }}>Course</div>
                    {expandedMenu === "course" && (
                        <div className="submenu">
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
                <h3>ITCS209 &gt; Student List &gt; u6800002</h3>

                <div className="student-head-box">
                    <span>Student Information</span>

                    {/* Dropdown with options */}
                    <select value={infoOption} onChange={(e) => setInfoOption(e.target.value)}>
                        <option value="overall">Overall</option>
                        <option value="thisSubject">This Subject</option>
                    </select>
                </div>

                {infoOption === "thisSubject" && (
                    <div>
                        <div className="info-container">
                            {/* Student Information */}
                            <div className="student-info">
                                <h2>Student Information</h2>
                                <p><strong>Name:</strong> Ms. Shania Fischer</p>
                                <p><strong>ID:</strong> u6800002</p>
                                <p><strong>Cumulative GPA:</strong> 3.37</p>
                                <p><strong>Email:</strong> shania@email.com</p>
                                <p><strong>Contact:</strong> +66 1234 5678</p>
                                <p><strong>High School:</strong> --- </p>
                                <p><strong>Final High School GPA:</strong> 3.68</p>
                            </div>

                            {/* Grade Trend */}
                            <div className="grade-trend">
                                <h2>Grade Trend</h2>
                                <svg ref={chartRefs.subjectScoreChart} width={500} height={190}></svg>

                            </div>
                        </div>
                        {/* First Row */}
                        <div className="chart-row">
                            <div className="chart-box">
                                <h3>Mycourse Access Frequency</h3>
                                <svg ref={chartRefs.frequencyLineChart} width={400} height={250}></svg>
                            </div>

                            <div className="chart-box">
                                <h3>Assignment Submission</h3>
                                <svg ref={chartRefs.subjectDonut} width={300} height={300}></svg>
                            </div>
                            <div className="chart-box">
                                <h3>Attendance</h3>
                                <svg ref={chartRefs.subjectBar} width={300} height={300}></svg>
                            </div>
                        </div>

                        {/* Second Row */}
                        <div className="chart-row">
                            {/* Left Box: Low-Scoring Quiz and Missing Assignment */}
                            <div className="chart-box">
                                <h3>Low-Scoring Quiz</h3>
                                <table ref={chartRefs.quizTable}>
                                    {/* Table data here */}
                                    <tr><td>Quiz 1</td><td>45%</td></tr>
                                    <tr><td>Quiz 2</td><td>50%</td></tr>
                                </table>
                            </div>
                            <div className="chart-box">
                                <h3>Missing Assignment</h3>
                                <table ref={chartRefs.missingAssignments}>
                                    {/* Table data here */}
                                    <tr><td>Assignment 1</td><td>Missing</td></tr>
                                    <tr><td>Assignment 2</td><td>Missing</td></tr>
                                </table>
                            </div>

                            {/* Middle Box: Current Score vs Class Average */}
                            <div className="chart-box">
                                <h3>Current Score VS Class Average</h3>
                                <div style={{ textAlign: "center" }}>
                                    <svg ref={chartRefs.studentScoreGauge} width={200} height={200}></svg>
                                    <p>compare with</p>
                                    <svg ref={chartRefs.averageScoreGauge} width={200} height={200}></svg>
                                </div>
                            </div>

                            {/* Right Box: Average Exit Ticket Score */}
                            <div className="chart-box">
                                <h3>Average Exit Ticket Score</h3>
                                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px", flexDirection: "column" }}>
                                    <div style={{ fontSize: "60px", fontWeight: "bold" }}>3</div>
                                    <div style={{ fontSize: "16px" }}>out of 5</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                {infoOption === "overall" && (
                    <div>
                        <div className="info-container">
                            {/* Student Information */}
                            <div className="student-info">
                                <h2>Student Information</h2>
                                <p><strong>Name:</strong> Ms. Shania Fischer</p>
                                <p><strong>ID:</strong> u6800002</p>
                                <p><strong>Cumulative GPA:</strong> 3.37</p>
                                <p><strong>Email:</strong> shania@email.com</p>
                                <p><strong>Contact:</strong> +66 1234 5678</p>
                                <p><strong>High School:</strong> --- </p>
                                <p><strong>Final High School GPA:</strong> 3.68</p>
                            </div>

                            {/* Grade Trend */}
                            <div className="grade-trend">
                                <h2>Grade Trend</h2>
                                <svg ref={chartRefs.gradeChart} width={700} height={190}></svg>
                            </div>
                        </div>
                        <div className="timeline-box">
                            <h3>ICT Activity</h3>
                            <div className="timeline-container">
                                <div className="timeline-line"></div> {/* Line for the timeline */}

                                {/* Timeline events */}
                                <div className="timeline-event" style={{ left: "0%" }}>
                                    <div className="dot"></div>
                                    <span className="event-label-2">Orientation</span>
                                    <span className="event-date-2">August 2025</span>
                                </div>

                                <div className="timeline-event" style={{ left: "20%" }}>
                                    <div className="dot"></div>
                                    <span className="event-label-1">Sairahus</span>
                                    <span className="event-date-1">August 2025</span>
                                </div>

                                <div className="timeline-event" style={{ left: "40%" }}>
                                    <div className="dot"></div>
                                    <span className="event-label-2">Open House</span>
                                    <span className="event-date-2">September 2025</span>
                                </div>

                                <div className="timeline-event" style={{ left: "60%" }}>
                                    <div className="dot"></div>
                                    <span className="event-label-1">Cable Management</span>
                                    <span className="event-date-1">August 2026</span>
                                </div>

                                <div className="timeline-event" style={{ left: "80%" }}>
                                    <div className="dot"></div>
                                    <span className="event-label-2">SCB Seminar</span>
                                    <span className="event-date-2">September 2027</span>
                                </div>

                                <div className="timeline-event" style={{ left: "100%" }}>
                                    <div className="dot"></div>
                                    <span className="event-label-1">German Internship</span>
                                    <span className="event-date-1">June-July 2028</span>
                                </div>
                            </div>
                        </div>

                        <div className="second-chart-row">
                            <div className="chart-box">
                                <h3>AT Related Skills</h3>
                                <div className="radar-charts-container">
                                    <svg ref={chartRefs.activityRadarChart} width={250} height={250}></svg>
                                    <svg ref={chartRefs.skillsRadarChart} width={250} height={250}></svg>
                                </div>
                            </div>


                            <div className="chart-box">
                                <div className="chart-container">
                                    <h3>Assignment Submission</h3>
                                    <svg ref={chartRefs.assignmentDonut} width={300} height={300}></svg>
                                </div>
                            </div>
                            <div className="chart-box">
                                <div className="chart-container">
                                    <h3>Attendance</h3>
                                    <svg ref={chartRefs.attendanceChart} width={300} height={300}></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default StudentProfileB;
