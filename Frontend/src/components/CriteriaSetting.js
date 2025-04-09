import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from "react-router-dom";
import "./CourseDashboard.css";

const CriteriaSettingPage = ({ criteria, updateCriteria }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { course } = useParams(); // Get the course from the URL
    const [expandedMenu, setExpandedMenu] = useState(null);
    const [expandedSubmenu, setExpandedSubmenu] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState("");

    const [attendance, setAttendance] = useState({
        severe: criteria.severeAttendance || 0,
        slightly: criteria.slightlyAttendance || 0,
    });

    const [score, setScore] = useState({
        severe: criteria.severeScore || 0,
        slightly: criteria.slightlyScore || 0,
    });

    const [attendanceOperator, setAttendanceOperator] = useState({
        severe: criteria.severeAttendanceOperator || ">=",
        slightly: criteria.slightlyAttendanceOperator || ">=",
    });

    const [scoreOperator, setScoreOperator] = useState({
        severe: criteria.severeScoreOperator || ">=",
        slightly: criteria.slightlyScoreOperator || ">=",
    });

    const toggleMenu = (menu) => {
        setExpandedMenu(expandedMenu === menu ? null : menu);
    };

    const toggleSubmenu = (course) => {
        setExpandedSubmenu(expandedSubmenu === course ? null : course);
    };

    useEffect(() => {
        const pathParts = location.pathname.split("/").filter(Boolean);
        if (pathParts.length > 0) {
            const newCourse = pathParts[0].toUpperCase();
            if (["ITCS209", "ITCS125", "ITLG201"].includes(newCourse)) {
                setSelectedCourse(newCourse);
            }
        }
    }, [location.pathname]);

    const handleInputChange = (e, type) => {
        const { name, value } = e.target;
        if (type === "attendance") {
            setAttendance((prev) => ({
                ...prev,
                [name]: value,
            }));
        } else if (type === "score") {
            setScore((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleOperatorChange = (e, type) => {
        const { name, value } = e.target;
        if (type === "attendance") {
            setAttendanceOperator((prev) => ({
                ...prev,
                [name]: value,
            }));
        } else if (type === "score") {
            setScoreOperator((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateCriteria({
            severeAttendance: attendance.severe,
            severeScore: score.severe,
            slightlyAttendance: attendance.slightly,
            slightlyScore: score.slightly,
            severeAttendanceOperator: attendanceOperator.severe,
            slightlyAttendanceOperator: attendanceOperator.slightly,
            severeScoreOperator: scoreOperator.severe,
            slightlyScoreOperator: scoreOperator.slightly,
        });
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
                    {expandedMenu === "course" && (
                        <div className="submenu" style={{ cursor: "pointer" }}>
                            {["ITCS209", "ITCS125", "ITLG201"].map((course) => (
                                <div key={course}>
                                    <a
                                        onClick={() => {
                                            toggleSubmenu(course);
                                        }}
                                    >
                                        {course}
                                    </a>
                                    {expandedSubmenu === course && (
                                        <div className="nested-submenu" style={{ marginLeft: "20px", cursor: "pointer" }}>
                                            <a
                                                onClick={() => navigate(`/${course.toLowerCase()}/dashboard`)}
                                                style={{ display: "block", marginBottom: "5px" }}
                                            >
                                                Dashboard
                                            </a>
                                            <a
                                                onClick={() => navigate(`/${course.toLowerCase()}/student-list`)}
                                                style={{ display: "block" }}
                                            >
                                                Student List
                                            </a>
                                            <a
                                                onClick={() => navigate(`/${course.toLowerCase()}/at-risk-setting`)}
                                                style={{ display: "block" }}
                                            >
                                                Criteria Setting
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <div className="menu-heading" onClick={() => navigate("/powerbi")} style={{ cursor: "pointer" }}>
                        Power BI
                    </div>
                </div>
            </div>
            <div className="main-content">
                <h3>{selectedCourse ? `${selectedCourse} > Criteria Setting` : "Select a Course"}</h3>
                <div class="box">
                    <div class="box-left">Criteria Setting</div>
                </div>
                <div className="form" style={{ marginTop: "50px" }}>
                    <form onSubmit={handleSubmit}>
                        {/* Severe Criteria Card */}
                        <div className="criteria-card" style={{ marginBottom: "30px", padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
                            <h3>Severe Criteria 🔴</h3>

                            {/* Attendance Threshold */}
                            <div className="criteria-section" style={{ marginBottom: "20px" }}>
                                <label>
                                    Attendance Threshold (%):
                                    <div className="select-input-container" style={{ display: "flex", alignItems: "center" }}>
                                        <select
                                            name="severe"
                                            value={attendanceOperator.severe}
                                            onChange={(e) => handleOperatorChange(e, "attendance")}
                                            style={{ marginRight: "10px" }}
                                        >
                                            <option value=">=">≥</option>
                                            <option value="<=">≤</option>
                                            <option value="=">=</option>
                                        </select>
                                        <input
                                            type="number"
                                            name="severe"
                                            value={attendance.severe}
                                            onChange={(e) => handleInputChange(e, "attendance")}
                                            min="0"
                                            max="100"
                                            style={{ width: "60px" }}
                                        />
                                    </div>
                                </label>
                            </div>

                            {/* Score Threshold */}
                            <div className="criteria-section">
                                <label>
                                    Score Threshold (%):
                                    <div className="select-input-container" style={{ display: "flex", alignItems: "center" }}>
                                        <select
                                            name="severe"
                                            value={scoreOperator.severe}
                                            onChange={(e) => handleOperatorChange(e, "score")}
                                            style={{ marginRight: "10px" }}
                                        >
                                            <option value=">=">≥</option>
                                            <option value="<=">≤</option>
                                            <option value="=">=</option>
                                        </select>
                                        <input
                                            type="number"
                                            name="severe"
                                            value={score.severe}
                                            onChange={(e) => handleInputChange(e, "score")}
                                            min="0"
                                            max="100"
                                            style={{ width: "60px" }}
                                        />
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Slightly Criteria Card */}
                        <div className="criteria-card" style={{ marginBottom: "30px", padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
                            <h3>Slightly Criteria 🟡</h3>

                            {/* Attendance Threshold */}
                            <div className="criteria-section" style={{ marginBottom: "20px" }}>
                                <label>
                                    Attendance Threshold (%):
                                    <div className="select-input-container" style={{ display: "flex", alignItems: "center" }}>
                                        <select
                                            name="slightly"
                                            value={attendanceOperator.slightly}
                                            onChange={(e) => handleOperatorChange(e, "attendance")}
                                            style={{ marginRight: "10px" }}
                                        >
                                            <option value=">=">≥</option>
                                            <option value="<=">≤</option>
                                            <option value="=">=</option>
                                        </select>
                                        <input
                                            type="number"
                                            name="slightly"
                                            value={attendance.slightly}
                                            onChange={(e) => handleInputChange(e, "attendance")}
                                            min="0"
                                            max="100"
                                            style={{ width: "60px" }}
                                        />
                                    </div>
                                </label>
                            </div>

                            {/* Score Threshold */}
                            <div className="criteria-section">
                                <label>
                                    Score Threshold (%):
                                    <div className="select-input-container" style={{ display: "flex", alignItems: "center" }}>
                                        <select
                                            name="slightly"
                                            value={scoreOperator.slightly}
                                            onChange={(e) => handleOperatorChange(e, "score")}
                                            style={{ marginRight: "10px" }}
                                        >
                                            <option value=">=">≥</option>
                                            <option value="<=">≤</option>
                                            <option value="=">=</option>
                                        </select>
                                        <input
                                            type="number"
                                            name="slightly"
                                            value={score.slightly}
                                            onChange={(e) => handleInputChange(e, "score")}
                                            min="0"
                                            max="100"
                                            style={{ width: "60px" }}
                                        />
                                    </div>
                                </label>
                            </div>
                        </div>

                        <button type="submit">Set Criteria</button>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default CriteriaSettingPage;
