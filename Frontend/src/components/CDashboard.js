import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { LogOut } from "lucide-react";
import axios from "axios";
import * as d3 from "d3";
import './CourseDashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [expandedMenu, setExpandedMenu] = useState(null);
    const [expandedSubmenu, setExpandedSubmenu] = useState(null);
    const [instructorName, setInstructorName] = useState("");
    const location = useLocation();
    const { course, section, semester } = useParams();
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedSection, setSelectedSection] = useState(section);
    const [selectedSemester, setSelectedSemester] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [data, setData] = useState({
        enrollment: 0,
        engagement: 0,
        lowScoringQuizzes: [],
        riskStudents: 0,
        atRiskStudentsName: [],
        rawScores: [],
        attendance: [],
        submission: []
    });

    const attendanceChartRef = useRef(null);
    const submissionChartRef = useRef(null);
    const scoreChartRef = useRef(null);
    const statsChartRef = useRef(null);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("instructorId");
        navigate("/login");
      };

    useEffect(() => {
        if (course && section && semester) {
          setSelectedCourse(course.toUpperCase());
          setSelectedSection(section);
          setSelectedSemester(semester);
        }
    }, [course, section, semester]);
      
    useEffect(() => {
        const instructorId = localStorage.getItem("instructorId");
        if (!instructorId) {
          navigate("/login");
          return;
        }
    
        setIsLoading(true);
        // Fetch instructor data related to courses
        axios.get(`http://localhost:5000/sidebar/${instructorId}`)
          .then((response) => {
            if (response.data && Array.isArray(response.data)) {
              setCourses(response.data);
              console.log("Courses:", response.data);
              // Get instructor name from the first course if available
              if (response.data.length > 0) {
                setInstructorName(response.data[0].Instructor);
              }
            } else {
              setError("Invalid data format received");
              setCourses([]);
            }
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
            setError("Failed to load courses");
            setCourses([]);
          })
          .finally(() => {
            setIsLoading(false);
          });
      }, [navigate]);

    useEffect(() => {
        if (!selectedCourse) return;

        const base = `http://localhost:5000/dashboard/${selectedCourse}/${selectedSection}/${selectedSemester}`;

        const fetchAll = async () => {
            try {
                const [enr, eng, att, sub, raw, risk, low] = await Promise.all([
                    axios.get(`${base}/enrollment`).then(res => res.data),
                    axios.get(`${base}/engagement`).then(res => res.data),
                    axios.get(`${base}/attendance`).then(res => res.data),
                    axios.get(`${base}/submissions`).then(res => res.data),
                    axios.get(`${base}/raw-scores`).then(res => res.data),
                    axios.get(`${base}/at-risk`).then(res => res.data),
                    axios.get(`${base}/low-scoring-quizzes`).then(res => res.data),
                ]);
            console.log("Test API enroll", enr);
                setData({
                    enrollment: enr.total_students || 0,
                    engagement: eng.engagement || 0,
                    attendance: att,
                    submission: sub,
                    rawScores: raw.rawScores,
                    rawStats: [
                        { label: "Max", value: raw.max_score },
                        { label: "Mean", value: raw.mean_score },
                        { label: "Median", value: raw.median_score }
                    ],
                    riskStudents: risk.riskStudents,
                    atRiskStudentsName: risk.atRiskStudentsName,
                    lowScoringQuizzes: low.lowScoringQuizzes || []
                });
            } catch (err) {
                console.error("Dashboard fetch error:", err);
            }
        };

        fetchAll();
    }, [selectedCourse, selectedSection, selectedSemester]);

    // Attendance Chart
    useEffect(() => {
        if (
          attendanceChartRef.current &&
          Array.isArray(data.attendance) &&
          data.attendance.length > 0
        ) {
          const svg = d3.select(attendanceChartRef.current);
          svg.selectAll("*").remove();
      
          const width = 500;
          const height = 250;
          const margin = { top: 30, right: 30, bottom: 40, left: 40 };
      
          const cleanedData = data.attendance
            .filter(d => d.attendance_week !== null)
            .map(d => ({
                week: d.attendance_week.toString(),
                students: +d.total_participated  // Use total_participated or total_present
            }));
      
          const x = d3.scalePoint()
            .domain(cleanedData.map(d => d.week))
            .range([margin.left, width - margin.right])
            .padding(0.5);
      
          const y = d3.scaleLinear()
            .domain([0, d3.max(cleanedData, d => d.students) || 100])
            .nice()
            .range([height - margin.bottom, margin.top]);
      
          const line = d3.line()
            .defined(d => d.students !== null && x(d.week) !== undefined)
            .x(d => x(d.week))
            .y(d => y(d.students));

          const tooltip = d3.select("body")
            .append("div")
            .attr("class", "d3-tooltip")
            .style("position", "absolute")
            .style("background", "#fff")
            .style("border", "1px solid #ccc")
            .style("padding", "6px 10px")
            .style("border-radius", "4px")
            .style("font-size", "12px")
            .style("pointer-events", "none")
            .style("opacity", 0);
      
          svg.append("path")
            .datum(cleanedData)
            .attr("fill", "none")
            .attr("stroke", "#4f8dfd")
            .attr("stroke-width", 2)
            .attr("d", line);
      
          svg.selectAll("circle")
            .data(cleanedData)
            .enter()
            .append("circle")
            .attr("cx", d => x(d.week))
            .attr("cy", d => y(d.students))
            .attr("r", 3)
            .attr("fill", "#4f8dfd")
            .on("mouseover", function (event, d) {
                tooltip
                  .style("opacity", 1)
                  .html(`Week ${d.week}<br/>Participants: ${d.students}`)
                  .style("left", (event.pageX + 10) + "px")
                  .style("top", (event.pageY - 28) + "px");
              })
              .on("mousemove", function (event) {
                tooltip
                  .style("left", (event.pageX + 10) + "px")
                  .style("top", (event.pageY - 28) + "px");
              })
              .on("mouseout", function () {
                tooltip.style("opacity", 0);
              });
      
          svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x))
            .call(g =>
              g.selectAll("text")
                .attr("transform", "rotate(-30)")
                .style("text-anchor", "end")
            );
      
          svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y).ticks(5));
        }
      }, [data.attendance]);
         
      
    useEffect(() => {
        // Submission Chart
        if (submissionChartRef.current && Array.isArray(data.submission) && data.submission.length > 0) {
            const container = d3.select(submissionChartRef.current);
            container.selectAll("svg").remove();

            const width = 400, height = 200, margin = { top: 30, right: 30, bottom: 50, left: 50 };
            const svg = container.append("svg").attr("width", width).attr("height", height);

            const x = d3.scaleBand()
                .domain(data.submission.map(d => d.assignment))
                .range([margin.left, width - margin.right])
                .padding(0.1);

            const y = d3.scaleLinear()
                .domain([0, d3.max(data.submission, d => d.late + d.onTime + d.nosub)])
                .range([height - margin.bottom, margin.top]);

            const keys = ["onTime", "late", "nosub"];
            const color = d3.scaleOrdinal()
                .domain(keys)
                .range(["green", "orange", "red"]);

            const stack = d3.stack().keys(keys);
            const stackedData = stack(data.submission);

            svg.append("g")
                .attr("transform", `translate(0,${height - margin.bottom})`)
                .call(d3.axisBottom(x));

            svg.append("g")
                .attr("transform", `translate(${margin.left},0)`)
                .call(d3.axisLeft(y));

            svg.selectAll("g.layer")
                .data(stackedData)
                .enter()
                .append("g")
                .attr("fill", d => color(d.key))
                .selectAll("rect")
                .data(d => d)
                .enter()
                .append("rect")
                .attr("x", d => x(d.data.assignment))
                .attr("y", d => y(d[1]))
                .attr("height", d => y(d[0]) - y(d[1]))
                .attr("width", x.bandwidth());
        }

        // Score Chart
        if (scoreChartRef.current && Array.isArray(data.rawScores) && data.rawScores.length > 0) {
            const container = d3.select(scoreChartRef.current);
            container.selectAll("svg").remove();

            const width = 300, height = 200, margin = { top: 20, right: 20, bottom: 40, left: 40 };
            const svg = container.append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left}, ${margin.top})`);

            const ranges = ["0-20", "21-40", "41-60", "61-80", "81-100"];
            const bins = ranges.map((r, i) => {
                const [min, max] = r.split("-").map(Number);
                const count = data.rawScores.filter(score => score >= min && score <= max).length;
                return { range: r, students: count };
            });

            const x = d3.scaleBand().domain(ranges).range([0, width]).padding(0.1);
            const y = d3.scaleLinear().domain([0, d3.max(bins, d => d.students)]).range([height, 0]);

            svg.append("g").call(d3.axisLeft(y));
            svg.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x));

            svg.selectAll("rect")
                .data(bins)
                .enter()
                .append("rect")
                .attr("x", d => x(d.range))
                .attr("y", d => y(d.students))
                .attr("width", x.bandwidth())
                .attr("height", d => height - y(d.students))
                .attr("fill", "steelblue");
        }

        // Stats Chart with labels
        console.log("rawStats:", data.rawStats);
        if (statsChartRef.current && Array.isArray(data.rawStats) && data.rawStats.length > 0) {
            const container = d3.select(statsChartRef.current);
            container.selectAll("svg").remove();

            const width = 300, height = 200, margin = { top: 20, right: 20, bottom: 40, left: 40 };
            const svg = container.append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left}, ${margin.top})`);

            const x = d3.scaleBand().domain(data.rawStats.map(d => d.label)).range([0, width]).padding(0.1);
            const y = d3.scaleLinear().domain([0, 100]).range([height, 0]);

            svg.append("g").call(d3.axisLeft(y));
            svg.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x));
            // Bars
            svg.selectAll("rect")
                .data(data.rawStats)
                .enter()
                .append("rect")
                .attr("x", d => x(d.label))
                .attr("y", d => y(d.value))
                .attr("width", x.bandwidth())
                .attr("height", d => height - y(d.value))
                .attr("fill", "orange");
            // Labels on the bars
            svg.selectAll("text.label")
                .data(data.rawStats)
                .enter()
                .append("text")
                .attr("class", "label")
                .text(d => d.value)
                .attr("x", d => x(d.label) + x.bandwidth() / 2)
                .attr("y", d => y(d.value) - 8)
                .attr("text-anchor", "middle")
                .attr("font-size", "12px")
                .attr("fill", "#333");
        }
    }, [data]);

    const toggleMenu = (menu) => {
        setExpandedMenu(expandedMenu === menu ? null : menu);
      };
    
      const toggleSubmenu = (submenu) => {
        setExpandedSubmenu(expandedSubmenu === submenu ? null : submenu);
      };
      
    return (
            <div>
                <h3>{selectedCourse ? `${selectedCourse} > Dashboard > Course Overview` : "Select a Course"}</h3>

                <div className="box">
                    <div className="box-left">Course Dashboard</div>
                    <div className="box-right">
                    <select className="dropdown"
                        value={selectedSection}
                        onChange={e => {
                            const newSection = e.target.value;
                            setSelectedSection(newSection);
                            navigate(`/course/${selectedCourse}/${newSection}/${selectedSemester}/dashboard`);
                    }}>
                            <option value="all">All Sections</option>
                            <option value="1">Section 1</option>
                            <option value="2">Section 2</option>
                            <option value="3">Section 3</option>
                        </select>
                        <select className="dropdown" disabled>
                            <option>{selectedSemester}</option>
                        </select>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <div className="enrollment">
                            <span className="enrollment-icon">📚</span>
                            <span className="enrollment-number">{data.enrollment} Students Enrolled</span>
                        </div>
                    </div>

                    <div className="first-row">
                        <div className="student-engagement">
                            <h3>Student Engagement in Attendance</h3>
                            <p className="engagement-percentage">{data.engagement}%</p>
                        </div>

                        <div className="chart-row">
                            <div className="chart-box">
                                <h4>Attendance</h4>
                                <svg ref={attendanceChartRef} width={450} height={250}></svg>
                            </div>

                            <div className="chart-box">
                                <h4>Assignment Submissions</h4>
                                <svg ref={submissionChartRef} width={450} height={250}></svg>
                            </div>
                        </div>
                    </div>

                    <div className="second-row">
                        <div className="at-risk-detect-container">
                            <div className="student-detect">
                                <h3>Student Detect</h3>
                                <div className="detect-box risk-student">
                                    <p className="detect-number">{data.riskStudents}</p>
                                    <p className="detect-label">At-Risk Students</p>
                                </div>
                            </div>

                            <div className="low-scoring-quiz">
                                <h4>Low Scoring Quizzes</h4>
                                <div className="quiz-list">
                                {Array.isArray(data.lowScoringQuizzes) && data.lowScoringQuizzes.length > 0 ? (
                                    data.lowScoringQuizzes.map((quiz, i) => (
                                        <p key={i}>{quiz.assess_item_name}: {quiz.lowScores}</p>
                                    ))
                                    ) : (
                                    <p>No low scoring quizzes found.</p>
                                )}
                                </div>
                            </div>
                        </div>

                        <div className="score-distribution">
                            <h4>Score Distribution</h4>
                            <div className="charts-container">
                                <div className="chart" ref={scoreChartRef}></div>
                                <div className="chart" ref={statsChartRef}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    );
};

export default Dashboard;
