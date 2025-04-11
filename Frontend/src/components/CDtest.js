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
    const [selectedSection, setSelectedSection] = useState("all");
    const [selectedSemester, setSelectedSemester] = useState("");

    const [data, setData] = useState({
        enrollment: 0,
        engagement: 0,
        lowScoringQuizzes: [],
        riskStudents: 0,
        atRiskStudentsName: [],
        rawScores: [],
        rawStats: [],
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
        axios.get(`http://localhost:5000/sidebar/${instructorId}`)
        .then((response) => {
            setCourses(response.data);
            if (response.data.length > 0) {
                setInstructorName(response.data[0].Instructor);
            }
        })
        .catch((err) => {
            console.error("Error fetching data:", err);
        })
    }, [navigate])

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

                setData({
                    enrollment: enr.enrollment || 0,
                    engagement: eng.engagement || 0,
                    attendance: att,
                    submission: sub,
                    rawScores: raw.rawScores,
                    rawStats: raw.rawStats,
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

    useEffect(() => {
        // Attendance Chart
        if (attendanceChartRef.current && data.attendance.length > 0) {
            const container = d3.select(attendanceChartRef.current);
            container.selectAll("svg").remove();

            const width = 400, height = 200;
            const svg = container.append("svg").attr("width", width).attr("height", height);

            const x = d3.scalePoint()
                .domain(data.attendance.map(d => d.week))
                .range([50, width - 50]);

            const y = d3.scaleLinear()
                .domain([0, d3.max(data.attendance, d => d.students)])
                .range([height - 40, 20]);

            const line = d3.line()
                .x(d => x(d.week))
                .y(d => y(d.students));

            svg.append("g")
                .attr("transform", `translate(0, ${height - 40})`)
                .call(d3.axisBottom(x));

            svg.append("g")
                .attr("transform", `translate(50, 0)`)
                .call(d3.axisLeft(y));

            svg.append("path")
                .datum(data.attendance)
                .attr("d", line)
                .attr("fill", "none")
                .attr("stroke", "black")
                .attr("stroke-width", 2);

            svg.selectAll("circle")
                .data(data.attendance)
                .enter()
                .append("circle")
                .attr("cx", d => x(d.week))
                .attr("cy", d => y(d.students))
                .attr("r", 4)
                .attr("fill", "red");
        }

        // Submission Chart
        if (submissionChartRef.current && data.submission.length > 0) {
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
        if (scoreChartRef.current && data.rawScores.length > 0) {
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
        if (statsChartRef.current && data.rawStats.length > 0) {
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
        <div className="container">
            <div className="sidebar">
                <h2 onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
                    MUICT LEARNING
                </h2>
                <div>
                    <div className="menu-heading" onClick={() => toggleMenu("course")} style={{ cursor: "pointer" }}>
                        Course
                    </div>
                    {/*Nested menu side bar*/}
                    {expandedMenu === "course" && (
                        <div className="submenu" style={{ cursor: "pointer" }}>
                        {courses.map((course) => (
                            <div key={course.course_id}>
                            <a onClick={() => toggleSubmenu(course.course_id)}>{course.course_id}</a>
                            {expandedSubmenu === course.course_id && (
                                <div className="nested-submenu" style={{ marginLeft: "20px", cursor: "pointer" }}>
                                    <a onClick={() => navigate(`/course/${course.course_id.toLowerCase().replace(/\s+/g, "")}/all/202402/dashboard`)} style={{ display: "block", marginBottom: "5px" }}>
                                        Dashboard
                                    </a>
                                    <a onClick={() => navigate(`/${course.course_id.toLowerCase().replace(/\s+/g, "")}/student-list`)} style={{ display: "block" }}>
                                        Student List
                                    </a>
                                </div>
                            )}
                            </div>
                        ))}
                        </div>
                    )}
                </div>
                <div className="sidebar-footer">
                    <span className="instructor-name">{instructorName}</span>
                    <button className="logout-button" onClick={handleLogout}>
                    <LogOut size={20} />
                    </button>
                </div>
            </div>

            <div className="main-content">
                <h3>{selectedCourse ? `${selectedCourse} > Dashboard > Course Overview` : "Select a Course"}</h3>

                <div className="box">
                    <div className="box-left">Course Dashboard</div>
                    <div className="box-right">
                        <select className="dropdown" value={selectedSection} onChange={e => setSelectedSection(e.target.value)}>
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

                        <div className="chart-box" ref={attendanceChartRef}>
                            <h4>Attendance</h4>
                        </div>

                        <div className="chart-box" ref={submissionChartRef}>
                            <h4>Assignment Submissions</h4>
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
                                    {data.lowScoringQuizzes.map((quiz, i) => (
                                        <p key={i}>{quiz}</p>
                                    ))}
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
        </div>
    );
};

export default Dashboard;
