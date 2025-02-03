// Attendance Chart
const attendanceData = [
    { range: "0-2", students: 5 },
    { range: "3-5", students: 10 },
    { range: "6-8", students: 10 },
    { range: "9-11", students: 20 },
    { range: "12-15", students: 140 },
];

const submissionData = [
    { assignment: "Assg1", onTime: 200, late: 50 },
    { assignment: "Assg2", onTime: 180, late: 40 },
    { assignment: "Assg3", onTime: 190, late: 30 },
    { assignment: "Assg4", onTime: 170, late: 30 },
    { assignment: "Assg5", onTime: 160, late: 40 },
];

const scoreData = [
    { range: "40-49", students: 10 },
    { range: "50-59", students: 30 },
    { range: "60-69", students: 70 },
    { range: "70-79", students: 50 },
    { range: "80-89", students: 20 },
    { range: "90-100", students: 10 },
];

// Function to render a bar chart
function renderBarChart(data, containerId, xKey, yKey, title) {
    const width = 400;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 50, left: 50 };

    const svg = d3.select(containerId)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const xScale = d3.scaleBand()
        .domain(data.map(d => d[xKey]))
        .range([margin.left, width - margin.right])
        .padding(0.2);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[yKey])])
        .nice()
        .range([height - margin.bottom, margin.top]);

    svg.append("g")
        .selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d[xKey]))
        .attr("y", d => yScale(d[yKey]))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - margin.bottom - yScale(d[yKey]))
        .attr("fill", "steelblue");

    svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale));
}

// Render Attendance Chart
renderBarChart(attendanceData, "#attendance-chart", "range", "students", "Attendance");

// Render Assignment Submission Chart
const stackedData = submissionData.map(d => ({ x: d.assignment, y1: d.onTime, y2: d.late }));
const assignmentContainer = "#submission-chart";
renderBarChart(submissionData, assignmentContainer, "assignment", "onTime", "On Time");

// Render Score Distribution Chart
renderBarChart(scoreData, "#score-distribution-chart", "range", "students", "Score Distribution");
