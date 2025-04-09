import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import './CourseDashboard.css';

const coursesData = {
    ITCS209: {
        allsection: {
            atRiskStudentsName: [{ id: "6800003", name: "Alice Brown", attendance: 45, score: 40, profilePhoto: "profile.jpg", missingQuiz: 2, advisor: "Dr. Smith", staff: "Ms. Johnson" }]
        },
        section1: {
            atRiskStudentsName: [{ id: "6800003", name: "Alice Brown", attendance: 45, score: 40, profilePhoto: "profile.jpg", missingQuiz: 2, advisor: "Dr. Smith", staff: "Ms. Johnson" }]
        },
        section2: {
            atRiskStudentsName: [{ id: "6800003", name: "Alice Brown", attendance: 45, score: 40, profilePhoto: "profile.jpg", missingQuiz: 2, advisor: "Dr. Smith", staff: "Ms. Johnson" }]
        },
        section3: {
            atRiskStudentsName: [{ id: "6800003", name: "Alice Brown", attendance: 45, score: 40, profilePhoto: "profile.jpg", missingQuiz: 2, advisor: "Dr. Smith", staff: "Ms. Johnson" }]
        }
    },
    // Add data for other courses here (ITCS125, ITLG201)
};

const AtRiskStudentTable = ({ criteria: propCriteria }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { course } = useParams(); // Get the course from the URL
    const [expandedMenu, setExpandedMenu] = useState(null);
    const [expandedSubmenu, setExpandedSubmenu] = useState(null);
    const [selectedSection, setSelectedSection] = useState("section1");
    const [selectedCourse, setSelectedCourse] = useState("");
    const [localCriteria, setLocalCriteria] = useState(null); // State to hold criteria loaded from local storage
    const [data, setData] = useState({
        atRiskStudentsName: []
    });

    // Determine which criteria to use: prop if available, otherwise local storage
    const criteriaToUse = propCriteria || localCriteria;

    const newData = coursesData[selectedCourse]?.[selectedSection] || {
        atRiskStudentsName: []
    };
    
    setData(newData);

    useEffect(() => {
        if (!selectedCourse) return;
    
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/students/${selectedCourse}/${selectedSection}`);
                const result = await response.json();
                setData(result);
            } catch (error) {
                console.error("Error fetching student data:", error);
                setData({ atRiskStudentsName: [] });
            }
        };
    
        fetchData();
    }, [location.pathname, selectedCourse, selectedSection]);
    

    // CheckStatus function should be updated to use the criteria dynamically
    const checkStatus = (student) => {
        if (!criteriaToUse) return "Pass"; // If no criteria available, return "Pass"

        const { severeAttendance, slightlyAttendance, severeScore, slightlyScore } = criteriaToUse;

        // Check for severe status (attendance or score below severe threshold)
        if ((severeAttendance !== undefined && student.attendance < severeAttendance) ||
            (severeScore !== undefined && student.score < severeScore)) {
            return "Severe";
        }

        // Check for slightly status (attendance or score below slightly threshold)
        if ((slightlyAttendance !== undefined && student.attendance < slightlyAttendance) ||
            (slightlyScore !== undefined && student.score < slightlyScore)) {
            return "Slightly";
        }

        return "Pass"; // Default is Pass
    };

    const atRiskStudentsWithStatus = data.atRiskStudentsName.map(student => {
        // Using the checkStatus function to determine the status
        const status = checkStatus(student);

        // Set the status color based on the status returned from checkStatus
        let statusColor = "green"; // Default to "green"
        if (status === "Severe") {
            statusColor = "red"; // Severe students
        } else if (status === "Slightly") {
            statusColor = "yellow"; // Slightly at-risk students
        }

        // Return the student with updated status and statusColor
        return { ...student, status, statusColor };
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

    useEffect(() => {
        const loadCriteria = () => {
            if (course) {
                const storedAttendanceCriteria = localStorage.getItem(`${course.toUpperCase()}-attendanceCriteria`);
                const storedScoreCriteria = localStorage.getItem(`${course.toUpperCase()}-scoreCriteria`);

                if (storedAttendanceCriteria && storedScoreCriteria) {
                    const attendanceData = JSON.parse(storedAttendanceCriteria);
                    const scoreData = JSON.parse(storedScoreCriteria);
                    setLocalCriteria({
                        severeAttendance: attendanceData.enabled ? attendanceData.severeValue : undefined,
                        slightlyAttendance: attendanceData.enabled ? attendanceData.slightlyValue : undefined,
                        severeScore: scoreData.enabled ? scoreData.severeValue : undefined,
                        slightlyScore: scoreData.enabled ? scoreData.slightlyValue : undefined,
                    });
                } else {
                    setLocalCriteria(null); // Reset if no criteria found
                }
            }
        };

        loadCriteria(); // Initial load

        // Just re-run loadCriteria when event is triggered
        window.addEventListener("criteriaUpdated", loadCriteria);

        return () => {
            window.removeEventListener("criteriaUpdated", loadCriteria);
        };
    }, [course]);

    useEffect(() => {
        if (!selectedCourse) return;

        const newData = coursesData[selectedCourse]?.[selectedSection] || {
            atRiskStudentsName: []
        };

        setData(newData);
    }, [location.pathname, selectedCourse, selectedSection]);

    if (!criteriaToUse) {
        return <p>Criteria not set for this course.</p>; // Or some other appropriate message
    }

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
                <h3>{selectedCourse ? `${selectedCourse} > Dashboard > Course Overview` : "Select a Course"}</h3>
                <div class="box">
                    <div class="box-left">Course Dashboard</div>
                    <div class="box-right" style={{ display: 'flex', gap: '10px' }}>

                        <select className="dropdown" value={selectedSection} onChange={e => setSelectedSection(e.target.value)}>
                            <option value="allsection">All Sections</option>
                            <option value="section1">Section 1</option>
                            <option value="section2">Section 2</option>
                            <option value="section3">Section 3</option>
                        </select>
                        <select class="dropdown">
                            <option>Semester 1 - 2025</option>
                            <option>Semester 2 - 2025</option>
                        </select>
                    </div>
                </div>

                <div className="card">
                    <div className="content" style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "900px", width: "100%" }}>
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", width: "100%", padding: "20px" }}>
                            <h3 style={{ color: "red", textAlign: "center" }}>At-risk Students</h3>
                            <table border="1" width="90%" style={{ textAlign: "center" }}>
                                <thead>
                                    <tr>
                                        <th>Profile</th>
                                        <th>Status</th>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Attendance (9)</th>
                                        <th>Score (50)</th>
                                        <th>Missing Quiz (10)</th>
                                        <th>Advisor</th>
                                        <th>Staff</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {atRiskStudentsWithStatus.map(student => (
                                        <tr key={student.id}>
                                            <td>
                                                <img src={student.profilePhoto} alt="Profile" width="40" height="40" style={{ borderRadius: "50%" }} />
                                            </td>
                                            <td style={{ color: student.statusColor }}>
                                                ●
                                            </td>
                                            <td>{student.id}</td>
                                            <td>{student.name}</td>
                                            <td>{student.attendance}</td>
                                            <td>{student.score}</td>
                                            <td>{student.missingQuiz}</td>
                                            <td>{student.advisor}</td>
                                            <td>{student.staff}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AtRiskStudentTable;
