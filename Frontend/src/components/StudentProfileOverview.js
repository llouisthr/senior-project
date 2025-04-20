import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import * as d3 from 'd3';
import personIcon from "./person.jpg";
import axios from "axios";
import './StudentProfile.css';

const StudentProfileB = () => {
    const navigate = useNavigate();
    const [expandedMenu, setExpandedMenu] = useState(null);
    const [expandedSubmenu, setExpandedSubmenu] = useState(null);
    const [infoOption, setInfoOption] = useState("overall");
    const [skills, setSkills] = useState([]);
    const [assignmentSummary, setAssignmentSummary] = useState(null);
    const [attendanceSummary, setAttendanceSummary] = useState(null);
    const [quizScores, setQuizScores] = useState([]);
    const [missingAssignments, setMissingAssignments] = useState([]);
    const [attendanceLine, setAttendanceLine] = useState([]);
    const [currentScore, setCurrentScore] = useState(0);
    const [avgScore, setAvgScore] = useState(0);
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
    const [activityTimeline, setActivityTimeline] = useState([]);

    // 🔹 Fetch MySQL data via API
    const { studentId, courseId } = useParams();

    useEffect(() => {
        if (!studentId) return;

        const fetchOverview = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/student-profile/${studentId}/overview`);
                const { studentInfo, activityTimeline, skills, assignmentSummary, attendanceSummary } = res.data;

                setStudentInfo(studentInfo);
                setActivityTimeline(activityTimeline);
                setSkills(skills);
                setAssignmentSummary(assignmentSummary);
                setAttendanceSummary(attendanceSummary);
                // Add this if you fetched currentCourses
                // setCurrentCourses(currentCourses); 
            } catch (err) {
                console.error("Failed to fetch overview:", err);
            }
        };

        fetchOverview();
    }, [studentId]);

    useEffect(() => {
        if (!studentId || !courseId) return;
        const fetchCurrentCourseData = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/student-profile/${studentId}/${courseId}/current-course`);
                const {
                    studentInfo,
                    quizScores,
                    missingAssignments,
                    attendanceLine,
                    currentScore,
                    avgScore,
                    submissionSummary
                } = res.data;

                setStudentInfo(studentInfo);
                setQuizScores(quizScores);
                setMissingAssignments(missingAssignments);
                setAttendanceLine(attendanceLine);
                setCurrentScore(currentScore);
                setAvgScore(avgScore);
                setSubmissionSummary(submissionSummary);

            } catch (err) {
                console.error("❌ Failed to fetch current course data:", err);
            }
        };

        fetchCurrentCourseData();
    }, [studentId, courseId]);

    useEffect(() => {
        if (!studentId) return;

        const fetchActivities = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/student-profile/${studentId}/activities`);
                setActivityTimeline(res.data);
            } catch (err) {
                console.error("Failed to fetch activity timeline:", err);
            }
        };

        fetchActivities();
    }, [studentId]);


    useEffect(() => {
        if (skills.length && chartRefs.skillsRadarChart.current) {
            renderRadarChart(
                chartRefs.skillsRadarChart,
                skills.map(s => ({ label: s.skill_name, value: s.total_hours })),
                skills.map(s => s.skill_name),
                "Skills"
            );
        }
    }, [skills]);

    useEffect(() => {
        if (assignmentSummary) {
            const data = [
                { label: "On Time", value: assignmentSummary.on_time || 0 },
                { label: "Late", value: assignmentSummary.late || 0 },
                { label: "No submission", value: assignmentSummary.no_submission || 0 }
            ];
            renderDonutChart(chartRefs.assignmentDonut, data);
        }
    }, [assignmentSummary]);

    useEffect(() => {
        if (attendanceSummary) {
            const data = [
                { label: "Present", value: attendanceSummary.present || 0 },
                { label: "Late", value: attendanceSummary.late || 0 },
                { label: "Absent", value: attendanceSummary.absent || 0 }
            ];
            renderSecondDonutChart(chartRefs.attendanceChart, data);
        }
    }, [attendanceSummary]);

    useEffect(() => {
        console.log("submissionSummary", submissionSummary);
        if (submissionSummary && chartRefs.subjectDonut.current) {
            const data = [
                { label: "On Time", value: submissionSummary.on_time || 0 },
                { label: "Late", value: submissionSummary.late || 0 },
                { label: "No submission", value: submissionSummary.no_submission || 0 }
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



    const renderThirdLineChart = (ref, data) => {
        console.log(ref, data); // Log the ref and data
        if (!data || data.length === 0) return;

        const svg = d3.select(ref.current);
        svg.selectAll("*").remove();  // Clear previous elements (including axes)

        const width = 500, height = 300;
        const margin = { top: 10, right: 130, bottom: 80, left: 20 }; // Adjusted margins

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

    const renderSecondDonutChart = (ref, data) => {
        const svg = d3.select(ref.current);
        svg.selectAll("*").remove();

        const width = 300, height = 300;
        const margin = { top: 30, right: 10, bottom: 50, left: 10 };

        const radius = Math.min(width, height) / 2 - margin.top;


        // Create a color scale
        const color = d3.scaleOrdinal()
            .domain(data.map(d => d.label))
            .range(d3.schemeSet2);

        // Modify the color of "No submission" specifically to red
        const getColor = (label) => {
            if (label === "Absent") {
                return "red";
            }
            if (label === "Present") {
                return "green";
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

    return (
        <div className="student-profile-page-b-container">
            <div className="main-content">
                <h3>{courseId} &gt; Student List &gt; {studentId}</h3>
                <div className="student-head-box">
                    <span>Student Information</span>

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
                        <div className="info-container">
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
                                <img
                                    src={personIcon}
                                    alt="Profile"
                                    style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover" }}
                                />
                            </div>
                            {/* Student Information */}
                            <div className="student-info">
                                <h2>Student Information</h2>
                                {studentInfo && (
                                    <>
                                        <p><strong>Name:</strong> {studentInfo.fname} {studentInfo.lname}</p>
                                        <p><strong>ID:</strong> {studentInfo.student_id}</p>
                                        <p><strong>Email:</strong> {studentInfo.email}</p>
                                        <p><strong>Advisor:</strong> {studentInfo.advisor || "Not assigned"}</p>
                                        <p><strong>Staff:</strong> {studentInfo.staff || "Not assigned"}</p>
                                    </>
                                )}

                            </div>

                        </div>
                        <div className="timeline-box">
                            <h3>ICT Activity</h3>
                            <div className="timeline-container">
                                <div className="timeline-line"></div>
                                {Array.isArray(activityTimeline) && activityTimeline.map((activity, index) => {
                                    const percentage = (index / (activityTimeline.length - 1)) * 100;
                                    const date = new Date(activity.date_start);
                                    const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
                                    const labelClass = index % 2 === 0 ? "event-label-1" : "event-label-2";
                                    const dateClass = index % 2 === 0 ? "event-date-1" : "event-date-2";

                                    return (
                                        <div className="timeline-event" style={{ left: `${percentage}%` }} key={index}>
                                            <div className="dot"></div>
                                            <span className={labelClass}>{activity.actname}</span>
                                            <span className={dateClass}>{monthYear}</span>
                                        </div>
                                    );
                                })}
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
            </div>
        </div >
    );
};

export default StudentProfileB;
