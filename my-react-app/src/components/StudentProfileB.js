import React, { useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import * as d3 from 'd3';
import './StudentProfileB.css';

const StudentProfileB = () => {
    const navigate = useNavigate();
    const chartRefs = {
        activityChart: useRef(null),
        skillsChart: useRef(null),
        gradeChart: useRef(null),
        accessChart: useRef(null),
        assignmentChart: useRef(null),
    };

    // Define sample data
    const activityData = [
        { label: 'Health', value: 10 },
        { label: 'International', value: 5 },
        { label: 'Digital', value: 12 },
        { label: 'Environment', value: 11 },
        { label: 'Financial', value: 9 }
    ];

    const skillsData = [
        { label: 'Critical', value: 10 },
        { label: 'Creativity', value: 9 },
        { label: 'Communication', value: 13 },
        { label: 'Leadership', value: 15 },
        { label: 'Social', value: 11 }
    ];

    const gradeTrendData = [
        { label: '1st year 1st sem', value: 4.00 },
        { label: '1st year 2nd sem', value: 3.56 },
        { label: '2nd year 1st sem', value: 3.72 },
        { label: '2nd year 2nd sem', value: 3.41 }
    ];

    const accessFrequencyData = [
        { label: 'Jan', value: 38 },
        { label: 'Feb', value: 31 },
        { label: 'Mar', value: 30 },
        { label: 'Apr', value: 35 },
        { label: 'May', value: 21 },
        { label: 'Jun', value: 10 },
        { label: 'Jul', value: 15 },
        { label: 'Aug', value: 40 },
        { label: 'Sep', value: 36 },
        { label: 'Oct', value: 34 },
        { label: 'Nov', value: 35 },
        { label: 'Dec', value: 28 }
    ];

    const assignmentData = [
        { label: 'On Time', value: 82 },
        { label: 'Late', value: 18 }
    ];

    useEffect(() => {
        renderPieChart(chartRefs.assignmentChart, assignmentData);
        renderPieChart(chartRefs.skillsChart, skillsData);
        renderBarChart(chartRefs.gradeChart, gradeTrendData);
        renderBarChart(chartRefs.accessChart, accessFrequencyData);
        renderPieChart(chartRefs.activityChart, activityData);
    }, []);

    const renderPieChart = (ref, data) => {
        const svg = d3.select(ref.current);
        svg.selectAll("*").remove();
    
        const width = 300, height = 250, radius = Math.min(width, height) / 2;
    
        const group = svg.append("g")
            .attr("transform", `translate(${width / 2},${radius})`);
    
        const pie = d3.pie().value(d => d.value);
        const arc = d3.arc().innerRadius(0).outerRadius(radius - 10);
        const color = d3.scaleOrdinal(d3.schemeCategory10);
    
        // Draw pie slices
        group.selectAll("path")
            .data(pie(data))
            .enter()
            .append("path")
            .attr("d", arc)
            .attr("fill", (d, i) => color(i));
    
        // Add percentage labels
        const textArc = d3.arc().innerRadius(0).outerRadius(radius - 40);
        group.selectAll("text")
            .data(pie(data))
            .enter()
            .append("text")
            .attr("transform", d => `translate(${textArc.centroid(d)})`)
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .attr("fill", "white")
            .text(d => `${Math.round((d.data.value / d3.sum(data, d => d.value)) * 100)}%`);
    
        // Centering the legend below the chart
        const legendSpacing = 30;
        const legendRows = Math.ceil(data.length / 3); // Split into 2 rows (3 in first, rest in second)
        const legend = svg.append("g")
            .attr("transform", `translate(${width / 100}, ${height - 0})`); // Adjusting Y position
    
        const legendItems = legend.selectAll(".legend-item")
            .data(data)
            .enter()
            .append("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => {
                const row = Math.floor(i / 3); // Row index (0 or 1)
                const col = i % 3; // Column index (0, 1, or 2)
                return `translate(${col * 100}, ${row * legendSpacing})`;
            });
    
        legendItems.append("rect")
            .attr("width", 14)
            .attr("height", 14)
            .attr("fill", (d, i) => color(i));
    
        legendItems.append("text")
            .attr("x", 20)
            .attr("y", 12)
            .attr("font-size", "14px")
            .text(d => d.label);
    };
    
    
    

    const renderBarChart = (ref, data) => {
        const svg = d3.select(ref.current);
        svg.selectAll("*").remove();
    
        const margin = { top: 20, right: 30, bottom: 50, left: 50 };
        const width = 450 - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;
    
        const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    
        const x = d3.scaleBand().domain(data.map(d => d.label)).range([0, width]).padding(0.2);
        const y = d3.scaleLinear().domain([0, d3.max(data, d => d.value)]).range([height, 0]);
    
        g.append("g").call(d3.axisBottom(x)).attr("transform", `translate(0,${height})`);
        g.append("g").call(d3.axisLeft(y));
    
        g.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", d => x(d.label))
            .attr("y", d => y(d.value))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d.value))
            .attr("fill", "steelblue");
    };

    return (
        <div className="student-profile-page-b-container">
            <div className="sidebar">
                <h2>MUICT LEARNING</h2>
                <a href="/importdata.html">Import Data</a>
                <div className="menu-heading">Dashboard</div>
                <a onClick={() => navigate("/")}>Course Overview</a>
                <a onClick={() => navigate("/student-list")}>Student Profile</a>
            </div>

            <div className="main-content">
                <div className="header">Dashboard &gt; Student Profile &gt; u6xxxx02</div>

                <div className="student-info-box">
                    <h3>Student Information</h3>
                    <p><strong>Name:</strong> Tharich Haeng</p>
                    <p><strong>ID:</strong> u6800002</p>
                    <p><strong>Email:</strong> tharich@example.com</p>
                    <p><strong>Contact:</strong> +66 1234 5678</p>
                </div>

                <div className="ict-activity-box">
                    <h3>ICT Activity</h3>
                    <p>Orientation → Sairahus → Open House → Cable Management → SCB Seminar → German Internship</p>
                </div>

                <div className="chart-row">
                    <div className="chart-box" style={{ textAlign: 'left' }}>
                        <h3>Skills</h3>
                        <ul>
                            <li>Good leadership</li>
                            <li>Good communication</li>
                            <li>Python</li>
                            <li>Java</li>
                        </ul>
                    </div>
                    <div className="chart-box">
                        <h3 style={{ textAlign: 'left' }}>AT (Activity Transcript)</h3>
                        <svg ref={chartRefs.activityChart} width={300} height={330}></svg>
                    </div>
                    <div className="chart-box">
                        <h3 style={{ textAlign: 'left' }}>21st Century Skills</h3>
                        <svg ref={chartRefs.skillsChart} width={300} height={330}></svg>
                    </div>
                </div>

                <div className="chart-row">
                    <div className="chart-box">
                        <h3 style={{ textAlign: 'left' }}>Grade Trend</h3>
                        <svg ref={chartRefs.gradeChart} width={450} height={300}></svg>
                    </div>
                    <div className="chart-box">
                        <h3 style={{ textAlign: 'left' }}>MyCourses Access Frequency</h3>
                        <svg ref={chartRefs.accessChart} width={450} height={300}></svg>
                    </div>
                    <div className="chart-box">
                        <h3 style={{ textAlign: 'left' }}>Assignment Submission</h3>
                        <svg ref={chartRefs.assignmentChart} width={300} height={330}></svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentProfileB;
