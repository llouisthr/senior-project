import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import React from "react";
import './CourseDashboard.css';
import * as d3 from 'd3';
import axios from "axios";

const Dashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [expandedMenu, setExpandedMenu] = useState(null);
    const [expandedSubmenu, setExpandedSubmenu] = useState(null);
    const [instructorId, setInstructorId] = useState(""); 
    const [instructorCourses, setInstructorCourses] = useState([]);
    const [selectedSection, setSelectedSection] = useState("allsection");
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedSemester, setSelectedSemester] = useState("");
    const [data, setData] = useState({});
    const [riskStudents, setRiskStudents] = useState(0);
    const [lowScoringQuizzes, setLowScoringQuizzes] = useState([]);
    const [engagement, setEngagement] = useState(0);
    const [activeTab, setActiveTab] = useState("overview");
    const attendanceChartRef = useRef(null);
    const submissionChartRef = useRef(null);
    const scoreChartRef = useRef(null);
    const statsChartRef = useRef(null);

    useEffect(() => {
        const pathParts = location.pathname.split("/").filter(Boolean);
        if (pathParts.length >= 4 && pathParts[0] === "course") {
            const newCourse = pathParts[1].toUpperCase();  // Extract course name
            const newSection = pathParts[2];              // Extract section number
            const newSemester = pathParts[3];             // Extract semester
            setSelectedCourse(newCourse);
            setSelectedSection(newSection);
            setSelectedSemester(newSemester);
        }
    }, [location.pathname]);
    
    useEffect(() => {
        // Assume instructorId is already stored in localStorage during login
        const storedInstructorId = localStorage.getItem("instructorId");
        if (!storedInstructorId) return;
    
        setInstructorId(storedInstructorId);
    
        axios.get(`http://localhost:5000/home/${instructorId}/courses`)
            .then(res => {
                setInstructorCourses(res.data);
            })
            .catch(err => console.error("Error fetching instructor courses:", err));
    }, []);

    useEffect(() => {
        if (!selectedCourse) return;
        axios.get(`http://localhost:5000/course/${selectedCourse}/${selectedSection}/${selectedSemester}/dashboard/enroll`)
            .then(response => {
                setData({ enrollment: response.data.total });
            })
            .catch(error => console.error("Error fetching course data:", error));
    }, [selectedCourse, selectedSection, selectedSemester]);

    return (
        <div className="container">
            <div className="sidebar">
                <h2 onClick={() => navigate("/")} style={{ cursor: "pointer" }}>MUICT LEARNING</h2>
                <div>
                    <div className="menu-heading" onClick={() => setExpandedMenu("course")} style={{ cursor: "pointer" }}>Course</div>
                    {expandedMenu === "course" && (
                        <div className="submenu">
                            {instructorCourses.map((course) => (
                                <div key={course.course_id}>
                                    <a onClick={() => setExpandedSubmenu(course)}>{course}</a>
                                    {expandedSubmenu === course.course_id && (
                                        <div className="nested-submenu">
                                            <a onClick={() => navigate(`/course/${course.toLowerCase()}/all/${course.semester_id}/dashboard`)}>Dashboard</a>
                                            <a onClick={() => navigate(`/course/${course.toLowerCase()}/all/${course.semester_id}/student-list`)}>Student List</a>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="main-content">
                <h3>{selectedCourse ? `${selectedCourse} > Dashboard > Course Overview` : "Select a Course"}</h3>
                <div className="box">
                    <div className="box-left">Course Dashboard</div>
                    <div className="box-right">
                        <select className="dropdown" value={selectedSection} onChange={e => setSelectedSection(e.target.value)}>
                            <option value="allsection">All Sections</option>
                            <option value="section1">Section 1</option>
                            <option value="section2">Section 2</option>
                            <option value="section3">Section 3</option>
                        </select>
                        <select className="dropdown" value={selectedSemester} onChange={e => setSelectedSemester(e.target.value)}>
                            <option value=''>Semester 1 - 2025</option>
                            <option value=''>Semester 2 - 2025</option>
                        </select>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <span className="enrollment-icon">📚</span>
                        <span style={{ fontWeight: 'bold', fontSize: '24px' }}>{data.enrollment || 0} Students Enrolled</span>
                    </div>
                    <div className="first-row">
                        <div className="student-engagement">
                            <h3>Student Engagement in Attendance</h3>
                            <p className="engagement-percentage">{engagement}%</p>
                        </div>
                        <div className="chart-container">
                            <div className="chart" ref={attendanceChartRef}><h4>Attendance</h4></div>
                        </div>
                        <div className="chart-container">
                            <div className="chart" ref={submissionChartRef}><h4>Assignment Submissions</h4></div>
                        </div>
                    </div>
                    <div className="second-row">
                        <div className="at-risk-detect-container">
                            <div className="student-detect" onClick={() => setActiveTab("at-risk")}>
                                <h3>Student Detect</h3>
                                <div className="detect-box risk-student">
                                    <p className="detect-number">{riskStudents}</p>
                                    <p className="detect-label">At-Risk Students</p>
                                </div>
                            </div>
                            <div className="low-scoring-quiz">
                                <h4>Low Scoring Quizzes</h4>
                                <div className="quiz-table">
                                    <div className="quiz-list">
                                        {lowScoringQuizzes.length > 0 ? lowScoringQuizzes.map((quiz, index) => (
                                            <p key={index}>{quiz}</p>
                                        )) : <p>No quizzes available</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="score-distribution">
                            <h4>Score Distribution</h4>
                            <div className="charts-container">
                                <div className="chart small-chart" ref={scoreChartRef}></div>
                                <div className="chart small-chart" ref={statsChartRef}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
