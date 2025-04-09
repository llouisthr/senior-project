import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./CourseDashboard.css";

const AtRiskSetting = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [expandedMenu, setExpandedMenu] = useState(null);
    const [expandedSubmenu, setExpandedSubmenu] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState("");

    // State to hold the criteria for each type
    const [attendanceCriteria, setAttendanceCriteria] = useState({
        severeOperator: "<",
        severeValue: 50,
        slightlyOperator: "<",
        slightlyValue: 60,
        enabled: false,
    });

    const [scoreCriteria, setScoreCriteria] = useState({
        severeOperator: "<",
        severeValue: 30,
        slightlyOperator: "<",
        slightlyValue: 40,
        enabled: false,
    });

    useEffect(() => {
        const pathParts = location.pathname.split("/").filter(Boolean);
        if (pathParts.length > 0) {
            const newCourse = pathParts[0].toUpperCase();
            if (["ITCS209", "ITCS125", "ITLG201"].includes(newCourse)) {
                setSelectedCourse(newCourse);
            }
        }
    }, [location.pathname]);

    useEffect(() => {
        if (selectedCourse) {
            const storedAttendanceCriteria = localStorage.getItem(
                `${selectedCourse}-attendanceCriteria`
            );
            if (storedAttendanceCriteria) {
                setAttendanceCriteria(JSON.parse(storedAttendanceCriteria));
            }
            const storedScoreCriteria = localStorage.getItem(
                `${selectedCourse}-scoreCriteria`
            );
            if (storedScoreCriteria) {
                setScoreCriteria(JSON.parse(storedScoreCriteria));
            }
        }
    }, [selectedCourse]);

    const handleSave = () => {
        if (selectedCourse) {
            localStorage.setItem(
                `${selectedCourse}-attendanceCriteria`,
                JSON.stringify(attendanceCriteria)
            );
            localStorage.setItem(
                `${selectedCourse}-scoreCriteria`,
                JSON.stringify(scoreCriteria)
            );
            alert("Criteria saved!");
            console.log("Saved Attendance Criteria:", attendanceCriteria);
            console.log("Saved Score Criteria:", scoreCriteria);
        } else {
            alert("Please select a course first.");
        }
    };

    const handleAttendanceChange = (field, value) => {
        setAttendanceCriteria((prev) => ({ ...prev, [field]: value }));
    };

    const handleScoreChange = (field, value) => {
        setScoreCriteria((prev) => ({ ...prev, [field]: value }));
    };

    const CardComponent = ({ attendanceCriteria, scoreCriteria, onChange }) => (
        <div>
            {/* Attendance Card */}
            <div
                style={{
                    backgroundColor: "#ffffff",
                    padding: "15px",
                    borderRadius: "10px",
                    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                    marginTop: "20px",
                    marginBottom: "10px",
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                }}
            >
                {/* Checkbox */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "50px",
                        marginRight: "10px",
                    }}
                >
                    <input
                        type="checkbox"
                        className="border p-2"
                        checked={attendanceCriteria.enabled}
                        onChange={(e) => onChange("attendance", "enabled", e.target.checked)}
                        style={{
                            transform: "scale(1.5)",
                            width: "20px",
                            height: "20px",
                            cursor: "pointer",
                        }}
                    />
                </div>
    
                {/* Main Card Content */}
                <div style={{ width: "100%" }}>
                    {/* First Row - IF, Attribute, Severe Condition */}
                    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ marginRight: "40px" }}>IF</span>
                        <span style={{ marginRight: "40px", fontWeight: "bold" }}>Attendance</span>
                        <select
                            className="border p-2"
                            style={{ marginRight: "10px", width: "70px" }}
                            value={attendanceCriteria.severeOperator}
                            onChange={(e) => onChange("attendance", "severeOperator", e.target.value)}
                            disabled={!attendanceCriteria.enabled}
                        >
                            <option value=">">&gt;</option>
                            <option value="<">&lt;</option>
                            <option value="=">=</option>
                            <option value="<=">≤</option>
                            <option value=">=">≥</option>
                        </select>
                        <input
                            type="number"
                            className="border p-2"
                            style={{ marginRight: "10px", width: "70px" }}
                            value={attendanceCriteria.severeValue}
                            onChange={(e) => onChange("attendance", "severeValue", parseInt(e.target.value) || 0)}
                            disabled={!attendanceCriteria.enabled}
                        />
                        <span>% is severe 🔴</span>
                    </div>
    
                    {/* Second Row - Slightly Condition */}
                    <div
                        style={{ display: "flex", alignItems: "center", marginTop: "10px", marginLeft: "204px" }}
                    >
                        <select
                            className="border p-2"
                            style={{ marginLeft: "-25px", marginRight: "10px", width: "70px" }}
                            value={attendanceCriteria.slightlyOperator}
                            onChange={(e) => onChange("attendance", "slightlyOperator", e.target.value)}
                            disabled={!attendanceCriteria.enabled}
                        >
                            <option value=">">&gt;</option>
                            <option value="<">&lt;</option>
                            <option value="=">=</option>
                            <option value="<=">≤</option>
                            <option value=">=">≥</option>
                        </select>
                        <input
                            type="number"
                            className="border p-2"
                            style={{ marginRight: "10px", width: "70px" }}
                            value={attendanceCriteria.slightlyValue}
                            onChange={(e) => onChange("attendance", "slightlyValue", parseInt(e.target.value) || 0)}
                            disabled={!attendanceCriteria.enabled}
                        />
                        <span>% is slightly 🟡</span>
                    </div>
                </div>
            </div>
    
            {/* Score Card */}
            <div
                style={{
                    backgroundColor: "#ffffff",
                    padding: "15px",
                    borderRadius: "10px",
                    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                    marginTop: "20px",
                    marginBottom: "10px",
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                }}
            >
                {/* Checkbox */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "50px",
                        marginRight: "10px",
                    }}
                >
                    <input
                        type="checkbox"
                        className="border p-2"
                        checked={scoreCriteria.enabled}
                        onChange={(e) => onChange("score", "enabled", e.target.checked)}
                        style={{
                            transform: "scale(1.5)",
                            width: "20px",
                            height: "20px",
                            cursor: "pointer",
                        }}
                    />
                </div>
    
                {/* Main Card Content */}
                <div style={{ width: "100%" }}>
                    {/* First Row - IF, Attribute, Severe Condition */}
                    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ marginRight: "40px" }}>IF</span>
                        <span style={{ marginRight: "40px", fontWeight: "bold" }}>Score</span>
                        <select
                            className="border p-2"
                            style={{ marginRight: "10px", width: "70px" }}
                            value={scoreCriteria.severeOperator}
                            onChange={(e) => onChange("score", "severeOperator", e.target.value)}
                            disabled={!scoreCriteria.enabled}
                        >
                            <option value=">">&gt;</option>
                            <option value="<">&lt;</option>
                            <option value="=">=</option>
                            <option value="<=">≤</option>
                            <option value=">=">≥</option>
                        </select>
                        <input
                            type="number"
                            className="border p-2"
                            style={{ marginRight: "10px", width: "70px" }}
                            value={scoreCriteria.severeValue}
                            onChange={(e) => onChange("score", "severeValue", parseInt(e.target.value) || 0)}
                            disabled={!scoreCriteria.enabled}
                        />
                        <span>% is severe 🔴</span>
                    </div>
    
                    {/* Second Row - Slightly Condition */}
                    <div
                        style={{ display: "flex", alignItems: "center", marginTop: "10px", marginLeft: "204px" }}
                    >
                        <select
                            className="border p-2"
                            style={{ marginLeft: "-65px", marginRight: "10px", width: "70px" }}
                            value={scoreCriteria.slightlyOperator}
                            onChange={(e) => onChange("score", "slightlyOperator", e.target.value)}
                            disabled={!scoreCriteria.enabled}
                        >
                            <option value=">">&gt;</option>
                            <option value="<">&lt;</option>
                            <option value="=">=</option>
                            <option value="<=">≤</option>
                            <option value=">=">≥</option>
                        </select>
                        <input
                            type="number"
                            className="border p-2"
                            style={{ marginRight: "10px", width: "70px" }}
                            value={scoreCriteria.slightlyValue}
                            onChange={(e) => onChange("score", "slightlyValue", parseInt(e.target.value) || 0)}
                            disabled={!scoreCriteria.enabled}
                        />
                        <span>% is slightly 🟡</span>
                    </div>
                </div>
            </div>
        </div>
    );

    // Usage example with sample criteria
    const handleChange = (type, field, value) => {
        if (type === "attendance") {
            // Update attendance criteria
        } else if (type === "score") {
            // Update score criteria
        }
    };

    const toggleMenu = (menu) => {
        setExpandedMenu(expandedMenu === menu ? null : menu);
    };

    const toggleSubmenu = (course) => {
        setExpandedSubmenu(expandedSubmenu === course ? null : course);
    };

    return (
        <div className="container">
            <div className="sidebar">
                <h2 onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
                    MUICT LEARNING
                </h2>

                <div>
                    <div
                        className="menu-heading"
                        onClick={() => toggleMenu("course")}
                        style={{ cursor: "pointer" }}
                    >
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
                    <div
                        className="menu-heading"
                        onClick={() => navigate("/powerbi")}
                        style={{ cursor: "pointer" }}
                    >
                        Power BI
                    </div>
                </div>
            </div>

            <div className="main-content">
                <h3>{selectedCourse ? `${selectedCourse} > Criteria Setting` : "Select a Course"}</h3>
                <div className="box">
                    <div className="box-left">Criteria Setting</div>
                </div>
                <div
                    className="card"
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "20px",
                        width: "100%",
                        padding: "20px",
                        borderRadius: "5px",
                        backgroundColor: "#ffffff",
                        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                        position: "relative",
                    }}
                >
                    <CardComponent
                        attendanceCriteria={attendanceCriteria}
                        scoreCriteria={scoreCriteria}
                        onChange={handleChange}
                    />

                    {/* Save Button at the bottom, centered */}
                    <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
                        <button
                            style={{
                                width: "100px",
                                height: "40px",
                                backgroundColor: "#28a745",
                                color: "white",
                                fontWeight: "bold",
                                border: "none",
                                cursor: "pointer",
                                borderRadius: "5px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                            onClick={handleSave}
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AtRiskSetting;