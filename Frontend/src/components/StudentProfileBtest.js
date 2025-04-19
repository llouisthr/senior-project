import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import * as d3 from 'd3';
import personIcon from "./person.jpg";
// import CalendarHeatmap from "react-calendar-heatmap";
// import "react-calendar-heatmap/dist/styles.css";
import './StudentProfile.css';

const StudentProfileB = () => {
    const navigate = useNavigate();
    const [expandedMenu, setExpandedMenu] = useState(null);
    const [expandedSubmenu, setExpandedSubmenu] = useState(null);
    const [infoOption, setInfoOption] = useState("overall");
    const [subjectData, setSubjectData] = useState({
        quizzes: [],
        missingAssignments: [],
        attendance: [],
        currentScore: null,
        avgScore: null,
        submissionStatus: {}, // e.g., { submitted: 5, late: 2, missing: 1 }
    });

    const [studentInfo, setStudentInfo] = useState({
        student_id: '',
        name: '',
        email: '',
        advisor: '',
        staff: '',
    });

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

    useEffect(() => {
        renderThirdLineChart(chartRefs.subjectScoreChart, subjectScoreData);
        renderSecondLineChart(chartRefs.attendanceLineChart, subjectAttendanceData)

        if (chartRefs.activityRadarChart.current && chartRefs.skillsRadarChart.current) {
            renderRadarChart(chartRefs.activityRadarChart, activityData,
                activityData.map(d => d.label), "Activities");

            renderRadarChart(chartRefs.skillsRadarChart, skillsData,
                skillsData.map(d => d.label), "Skills");
        }

        renderDonutChart(chartRefs.assignmentDonut, assignmentData);
        renderSecondDonutChart(chartRefs.attendanceChart, attendanceData);
        renderLineChart(chartRefs.frequencyLineChart, frequencyData);
        renderDonutChart(chartRefs.subjectDonut, subjectAssignmentData);
        renderTripleBarChart(chartRefs.subjectBar, subjectAttendanceData);
    }, [chartRefs]);

    // State to store data fetched from backend
    const [chartData, setChartData] = useState(null);

    // 🔹 Fetch MySQL data via API
    const { studentId, courseId } = useParams();
    const fetchQuizzes = async () => {
        try {
          const res = await fetch(`http://localhost:5000/studentProfile/${studentId}/${courseId}/quizzes`);
          const data = await res.json();
          setSubjectData((prevData) => ({ ...prevData, quizzes: data }));
        } catch (error) {
          console.error("Error fetching quizzes:", error);
        }
      };
    
      // Fetch attendance data
      const fetchAttendance = async () => {
        try {
          const res = await fetch(`http://localhost:5000/studentProfile/${studentId}/${courseId}/attendance`);
          const data = await res.json();
          setSubjectData((prevData) => ({ ...prevData, attendance: data }));
        } catch (error) {
          console.error("Error fetching attendance:", error);
        }
      };
    
      // Fetch missing assignments
      const fetchMissingAssignments = async () => {
        try {
          const res = await fetch(`http://localhost:5000/studentProfile/${studentId}/${courseId}/missing-assignments`);
          const data = await res.json();
          setSubjectData((prevData) => ({ ...prevData, missingAssignments: data }));
        } catch (error) {
          console.error("Error fetching missing assignments:", error);
        }
      };
    
      // Fetch current score
      const fetchCurrentScore = async () => {
        try {
          const res = await fetch(`http://localhost:5000/studentProfile/${studentId}/${courseId}/current-score`);
          const data = await res.json();
          setSubjectData((prevData) => ({ ...prevData, currentScore: data }));
        } catch (error) {
          console.error("Error fetching current score:", error);
        }
      };

    useEffect(() => {
        const fetchStudentInfo = async () => {
          try {
            const res = await fetch(`http://localhost:5000/studentProfile/${studentId}`);
            const data = await res.json();
            // Assuming the query response is an array with a single object, as you're using LIMIT 1
            if (data.length > 0) {
              const student = data[0];
              setStudentInfo({
                student_id: student.student_id,
                name: student.name,
                email: student.email,
                advisor: student.advisor,
                staff: student.staff
              });
            }
          } catch (error) {
            console.error("Error fetching student info:", error);
          }
        };
      
        if (studentId) {
          fetchStudentInfo();
        }
    }, [studentId]);

      useEffect(() => {
        if (studentId && courseId) {
          fetchQuizzes();
          fetchAttendance();
          fetchMissingAssignments();
          fetchCurrentScore();
        }
      }, [studentId, courseId]);

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

                    {/* Dropdown with options */}
                    <select value={infoOption} onChange={(e) => setInfoOption(e.target.value)}>
                        <option value="overall">Overall</option>
                        <option value="thisSubject">This Subject</option>
                    </select>
                </div>

                {infoOption === "overall" && (
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
                                <p><strong>Name:</strong> {studentInfo.name}</p>
                                <p><strong>ID:</strong> {studentInfo.student_id}</p>
                                <p><strong>Email:</strong> {studentInfo.email}</p>
                                <p><strong>Advisor:</strong> {studentInfo.advisor}</p>
                                <p><strong>Staff:</strong> {studentInfo.staff}</p>
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

                {infoOption === "thisSubject" && (
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
                                <p><strong>Name:</strong> {studentInfo.name}</p>
                                <p><strong>ID:</strong> {studentInfo.student_id}</p>
                                <p><strong>Email:</strong> {studentInfo.email}</p>
                                <p><strong>Advisor:</strong> {studentInfo.advisor}</p>
                                <p><strong>Staff:</strong> {studentInfo.staff}</p>
                            </div>
                        </div>
                        {/* Main Chart Container */}
                        <div className="chart-container" style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4, 1fr)",
                            gap: "20px",
                            alignItems: "start"
                        }}>
                            {/* Column 1: Quiz Table */}
                            <div className="chart-box" style={{ flex: 1, minHeight: "550px" }}>
                                <h3>Quiz (10)</h3>
                                <table ref={chartRefs.quizTable} style={{ width: "100%", border: "1px solid #ddd" }}>
                                    <tr><td>Quiz 1</td><td>9</td></tr>
                                    <tr><td>Quiz 2</td><td>8</td></tr>
                                    <tr><td>Quiz 3</td><td>7</td></tr>
                                    <tr><td>Quiz 4</td><td>6</td></tr>
                                </table>
                            </div>

                            {/* Column 2: Missing Assignment Table */}
                            <div className="chart-box" style={{ flex: 1, minHeight: "550px" }}>
                                <h3>Missing Assignment</h3>
                                <table ref={chartRefs.missingAssignments} style={{ width: "100%", border: "1px solid #ddd" }}>
                                    <tr><td>Assignment 1</td><td>Missing</td></tr>
                                    <tr><td>Assignment 2</td><td>Missing</td></tr>
                                    <tr><td>Assignment 3</td><td>Missing</td></tr>
                                </table>
                            </div>

                            {/* Column 3: Attendance (Top) & Current Score (Bottom) */}
                            <div className="chart-column" style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
                                <div className="chart-box" style={{ minHeight: "300px" }}>
                                    <h3>Attendance</h3>
                                    <svg ref={chartRefs.attendanceLineChart} width={300} height={200}></svg>
                                </div>

                                <div className="chart-box" style={{ minHeight: "200px" }}>
                                    <h3>Current Score</h3>
                                    <div style={{ textAlign: "center" }}>
                                        <p style={{ fontSize: "36px", color: "green", fontWeight: "bold" }}>43</p>
                                        <p>Average is 45</p>
                                    </div>
                                </div>
                            </div>

                            {/* Column 4: Assignment Submission Donut Chart */}
                            <div className="chart-box" style={{ minHeight: "550px" }}>
                                <h3>Assignment Submission</h3>
                                <svg ref={chartRefs.subjectDonut} width={300} height={300}></svg>
                            </div>

                        </div>
                    </div>

                )}

            </div>
        </div >
    );
};

export default StudentProfileB;
