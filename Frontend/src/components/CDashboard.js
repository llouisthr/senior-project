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
    const [availableSemesters, setAvailableSemesters] = useState([]);
    const [availableSections, setAvailableSections] = useState([]);
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
      }, [navigate]);

    useEffect(() => {
        axios.get("http://localhost:5000/dashboard/semesters")
          .then(res => {
            if (Array.isArray(res.data)) {
              setAvailableSemesters(res.data);
            }
          })
          .catch(err => console.error("Failed to fetch semesters:", err));
      }, []);

      useEffect(() => {
        if (!selectedCourse || !selectedSemester) return;
        axios.get(`http://localhost:5000/dashboard/${selectedCourse}/${selectedSemester}/sections`)
          .then(res => {
            if (Array.isArray(res.data)) {
              // Sort sections in ascending order
              const sortedSections = res.data.sort((a, b) => {
                // Check if they are numbers or strings and sort accordingly
                return a.localeCompare(b, undefined, { numeric: true });
              });
              setAvailableSections(sortedSections);
            }
          })
          .catch(err => console.error("Failed to fetch sections:", err));
      }, [selectedCourse, selectedSemester]);
      

    useEffect(() => {
        if (!selectedCourse) return;

        const base = `http://localhost:5000/dashboard/${selectedCourse}/${selectedSection}/${selectedSemester}`;

        const fetchAll = async () => {
            try {
                const [enr, eng, att, sub, raw, rawStats, risk, low] = await Promise.all([
                    axios.get(`${base}/enrollment`).then(res => res.data),
                    axios.get(`${base}/engagement`).then(res => res.data),
                    axios.get(`${base}/attendance`).then(res => res.data),
                    axios.get(`${base}/submissions`).then(res => res.data),
                    axios.get(`${base}/raw-scores`).then(res => res.data),
                    axios.get(`${base}/raw-stats`).then(res => res.data),
                    axios.get(`${base}/at-risk`).then(res => res.data),
                    axios.get(`${base}/low-scoring-quizzes`).then(res => res.data),
                ]);
            console.log("Test API enroll", enr);
                setData({
                    enrollment: enr.total_students || 0,
                    engagement: eng.engagement || 0,
                    attendance: att,
                    submission: sub,
                    rawScores: raw,
                    rawStats: [
                        { label: "Max", value: Number(rawStats.max_score) || 0 },
                        { label: "Mean", value: Number(rawStats.mean_score) || 0 },
                        { label: "Median", value: Number(rawStats.median_score) || 0 }
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
        if (attendanceChartRef.current && Array.isArray(data.attendance) && data.attendance.length > 0) {
            const width = attendanceChartRef.current.clientWidth;
            const height = attendanceChartRef.current.clientHeight;
            const svg = d3.select(attendanceChartRef.current);
            svg.selectAll("*").remove();
            svg.append("svg")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .style("width", "100%")
            .style("height", "auto");            

          const margin = { top: 30, right: 30, bottom: 40, left: 40 };
      
          const cleanedData = data.attendance
            .filter(d => d.attendance_week !== null)
            .map(d => ({
                axisLabel: `W${d.attendance_week}`,     // for x-axis
                tooltipLabel: `Week ${d.attendance_week}`, // for tooltip
                students: +d.total_participated
            }));
      
          const x = d3.scalePoint()
            .domain(cleanedData.map(d => d.axisLabel))
            .range([margin.left, width - margin.right])
            .padding(0.5);
      
          const y = d3.scaleLinear()
            .domain([0, d3.max(cleanedData, d => d.students) || 100])
            .nice()
            .range([height - margin.bottom, margin.top]);
      
          const line = d3.line()
            .defined(d => d.students !== null && x(d.axisLabel) !== undefined)
            .x(d => x(d.axisLabel))
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
            .attr("cx", d => x(d.axisLabel))
            .attr("cy", d => y(d.students))
            .attr("r", 6)
            .attr("fill", "#4f8dfd")
            .on("mouseover", function (event, d) {
                tooltip
                  .style("opacity", 1)
                  .html(`${d.tooltipLabel}<br/>Participants: ${d.students}`)
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
                .style("font-size", "14px")
                .style("font-weight", "normal")
            );
      
          svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y).ticks(5))
            .selectAll("text")
            .style("font-size", "14px")
            .style("font-weight", "normal")
            .style("fill", "#333"); 
        }
      }, [data.attendance]);

    useEffect(() => {
        // Submission Chart
        if (submissionChartRef.current && Array.isArray(data.submission) && data.submission.length > 0) {
            const container = d3.select(submissionChartRef.current);
            container.selectAll("svg").remove();

            const width = 800, height = 400;
            const margin = { top: 20, right: 20, bottom: 50, left: 40 };

            const svg = container.append("svg")
                .attr("viewBox", `0 0 ${width} ${height}`)
                .attr("preserveAspectRatio", "xMidYMid meet")
                .style("width", "100%")
                .style("height", "auto");

            const filtered = data.submission.filter(d =>
                !/midterm|final/i.test(d.assignment)
            );

            const keys = ["onTime", "late", "nosub"];
            const colors = {
                onTime: "#c3f7c0",   // light green
                late: "#fcdcd1",     // soft orange
                nosub: "#d3d3d3"     // gray
            };

            const x = d3.scaleBand()
                .domain(filtered.map(d => d.assignment))
                .range([margin.left, width - margin.right])
                .padding(0.2);

            const y = d3.scaleLinear()
                .domain([0, d3.max(filtered, d => (+d.onTime || 0) + (+d.late || 0) + (+d.nosub || 0))])
                .nice()
                .range([height - margin.bottom, margin.top]);

            const stack = d3.stack().keys(keys);
            const stackedData = stack(filtered);

            const group = svg.selectAll("g.layer")
                .data(stackedData)
                .enter()
                .append("g")
                .attr("fill", d => colors[d.key]);

            group.selectAll("rect")
                .data(d => d)
                .enter()
                .append("rect")
                .attr("x", d => x(d.data.assignment))
                .attr("y", d => y(d[1]))
                .attr("height", d => y(d[0]) - y(d[1]))
                .attr("width", x.bandwidth());

            // Text labels for each segment
            group.selectAll("text")
                .data(d => d)
                .enter()
                .append("text")
                .text(d => {
                    const val = d[1] - d[0];
                    return val > 0 ? val : '';
                })
                .attr("x", d => x(d.data.assignment) + x.bandwidth() / 2)
                .attr("y", d => y(d[1]) + (y(d[0]) - y(d[1])) / 2)
                .attr("text-anchor", "middle")
                .attr("font-size", "24px")
                .attr("font-weight", "bold")
                .attr("fill", "#333");

            // X-axis
            svg.append("g")
                .attr("transform", `translate(0,${height - margin.bottom})`)
                .call(d3.axisBottom(x))
                .selectAll("text")
                .attr("font-size", "20px")
                .attr("transform", "rotate(-25)")
                .style("text-anchor", "end");

            // Y-axis
            svg.append("g")
                .attr("transform", `translate(${margin.left},0)`)
                .call(d3.axisLeft(y).ticks(5))
                .selectAll("text")
                .style("font-size", "20px")
                .style("font-weight", "500");             
        }

        // Score Chart
        if (scoreChartRef.current && data.rawScores && Object.keys(data.rawScores).length > 0) {
            const width = 400;
            const height = 220;
            const margin = { top: 20, right: 20, bottom: 40, left: 40 };
            const container = d3.select(scoreChartRef.current);
            container.selectAll("svg").remove(); // Clear previous chart    
            const svg = container.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

            const bins = [
            { range: "0-20", students: data.rawScores.range_0_20 || 0 },
            { range: "21-40", students: data.rawScores.range_21_40 || 0 },
            { range: "41-60", students: data.rawScores.range_41_60 || 0 },
            { range: "61-80", students: data.rawScores.range_61_80 || 0 },
            { range: "81-100", students: data.rawScores.range_81_100 || 0 }
            ];

            const x = d3.scaleBand().domain(bins.map(d => d.range)).range([0, width]).padding(0.1);
            const rawMax = d3.max(bins, d => d.students) || 10;
            const yMax = Math.ceil(rawMax / 10) * 10;  // Round up to nearest 10
            const y = d3.scaleLinear()
                .domain([0, yMax])             // 👈 fixed Y-axis range
                .range([height, 0])
                .nice();

            // Y axis
            svg.append("g")
            .call(d3.axisLeft(y).ticks(yMax / 10))
            .selectAll("text")
            .style("font-size", "12px")
            .style("font-weight", "normal");

            // X axis
            svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("font-size", "12px")
            .style("font-weight", "normal");

            // Y axis label
            svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -margin.left + 10)
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .attr("fill", "#333")
            .text("Number of Students");

            // Bars
            svg.selectAll("rect")
            .data(bins)
            .enter()
            .append("rect")
            .attr("x", d => x(d.range))
            .attr("y", d => y(d.students))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d.students))
            .attr("fill", "#000fdf");

            // Value labels inside bars
            svg.selectAll("text.bar-label")
            .data(bins)
            .enter()
            .append("text")
            .attr("class", "bar-label")
            .text(d => d.students > 0 ? d.students : "")
            .attr("x", d => x(d.range) + x.bandwidth() / 2)
            .attr("y", d => y(d.students) + (height - y(d.students)) / 2)  // vertical center of the bar
            .attr("text-anchor", "middle")
            .style("dominant-baseline", "middle")  // ✅ aligns text to vertical center
            .attr("fill", "#fff")
            .attr("font-size", "12px")
            .attr("font-weight", "bold");
        }

        // Stats Chart with labels
        if (statsChartRef.current && data.rawStats) {
            const container = d3.select(statsChartRef.current);
            container.selectAll("svg").remove();
          
            const width = 300;
            const height = 220;
            const margin = { top: 20, right: 20, bottom: 40, left: 40 };
          
            const svg = container.append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", `translate(${margin.left},${margin.top})`);
          
            const bars = data.rawStats || [];
          
            const x = d3.scaleBand()
              .domain(bars.map(d => d.label))
              .range([0, width])
              .padding(0.3);
          
            const y = d3.scaleLinear()
              .domain([0, 100])  // scores are percentages
              .range([height, 0])
              .nice();
          
            // Axes
            svg.append("g")
              .call(d3.axisLeft(y).ticks(5));
          
            svg.append("g")
              .attr("transform", `translate(0,${height})`)
              .call(d3.axisBottom(x));
          
            // Bars
            svg.selectAll("rect")
              .data(bars)
              .enter()
              .append("rect")
              .attr("x", d => x(d.label))
              .attr("y", d => y(d.value))
              .attr("width", x.bandwidth())
              .attr("height", d => height - y(d.value))
              .attr("fill", "#00bcd4");
          
            // Value labels inside bars
            svg.selectAll("text.stat-label")
              .data(bars)
              .enter()
              .append("text")
              .attr("class", "stat-label")
              .text(d => d.value.toFixed(1))
              .attr("x", d => x(d.label) + x.bandwidth() / 2)
              .attr("y", d => y(d.value) + (height - y(d.value)) / 2)
              .attr("text-anchor", "middle")
              .style("dominant-baseline", "middle")
              .attr("fill", "#fff")
              .attr("font-size", "12px")
              .attr("font-weight", "bold");
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
                        onChange={(e) => {
                            setSelectedSection(e.target.value);
                            navigate(`/course/${selectedCourse}/${e.target.value}/${selectedSemester}/dashboard`);
                        }}
                        >
                        <option value="all">All Sections</option>
                        {availableSections.map((section, i) => (
                            <option key={i} value={section}>{section}</option>
                        ))}
                    </select>
                    <select className="dropdown" value={selectedSemester}
                            onChange={(e) => {
                                const newSemester = e.target.value;
                                setSelectedSemester(newSemester);
                                navigate(`/course/${selectedCourse}/${selectedSection}/${newSemester}/dashboard`);
                        }}>{availableSemesters.map((sem, i) => (
                                <option key={i} value={sem.semester_id}>
                                    Semester {sem.semester_id % 100} / {Math.floor(sem.semester_id / 100)}
                                </option>
                            ))}
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
                            <h3>Attendance</h3>
                            <p className="engagement-percentage">{data.engagement}%</p>
                        </div>

                        <div className="chart-box">
                            <h4>Attendance</h4>
                            <svg ref={attendanceChartRef} className="chart-container-svg"></svg>
                        </div>

                        <div className="chart-box">
                            <h4>Assignment Submissions</h4>
                            <svg ref={submissionChartRef} className="chart-container-svg"></svg>
                            <div className="submission-legend" style={{ display: 'flex', gap: '16px', marginTop: '5px' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span style={{ width: '16px', height: '16px', backgroundColor: '#c3f7c0', marginRight: '6px', borderRadius: '3px' }}></span>
                                    <span>On Time</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span style={{ width: '16px', height: '16px', backgroundColor: '#fcdcd1', marginRight: '6px', borderRadius: '3px' }}></span>
                                    <span>Late</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span style={{ width: '16px', height: '16px', backgroundColor: '#a0a0a0', marginRight: '6px', borderRadius: '3px' }}></span>
                                    <span>No Submission</span>
                                </div>
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
                                <h3>Low Scoring Quizzes</h3>
                                <div className="quiz-list">
                                {Array.isArray(data.lowScoringQuizzes) && data.lowScoringQuizzes.length > 0 ? (
                                    data.lowScoringQuizzes.map((quiz, i) => (
                                        <p key={i}>{quiz.assess_item_name}: {quiz.avg} / {quiz.max_score}</p>
                                    ))
                                    ) : (
                                    <p>No low scoring quizzes found.</p>
                                )}
                                </div>
                            </div>
                        </div>

                        <div className="chart-box">
                            <h4>Score Distribution</h4>
                            <div ref={scoreChartRef}></div>
                        </div>
                        
                        <div className="chart-box">
                            <h4>Stats</h4>
                            <div ref={statsChartRef}></div>
                        </div>
                    </div>
                </div>
            </div>
    );
};

export default Dashboard;
