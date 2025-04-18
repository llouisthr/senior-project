import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { LogOut } from "lucide-react";

const Sidebar = () => {
  const navigate = useNavigate();
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [expandedSubmenu, setExpandedSubmenu] = useState(null);
  const [courses, setCourses] = useState([]);
  const [instructorName, setInstructorName] = useState("");

  const toggleMenu = (menu) => {
    setExpandedMenu(expandedMenu === menu ? null : menu);
  };

  const toggleSubmenu = (submenu) => {
    setExpandedSubmenu(expandedSubmenu === submenu ? null : submenu);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("instructorId");
    navigate("/login");
  };

  useEffect(() => {
    const instructorId = localStorage.getItem("instructorId");
    if (!instructorId) {
      navigate("/login");
      return;
    }

    axios.get(`http://localhost:5000/sidebar/${instructorId}`)
      .then((response) => {
        if (response.data && Array.isArray(response.data)) {
          setCourses(response.data);
          if (response.data.length > 0) {
            setInstructorName(response.data[0].Instructor);
          }
        }
      })
      .catch((error) => {
        console.error("Failed to fetch sidebar courses", error);
      });
  }, [navigate]);

  return (
    <div className="sidebar" style={{
      width: "250px", background: "#000fdf", color: "#fff", padding: "16px", height: "100vh", boxSizing: "border-box",
      display: "flex", flexDirection: "column"
    }}>
      <h2 onClick={() => navigate("/")} style={{ cursor: "pointer", marginBottom: "30px" }}>
        MUICT LEARNING
      </h2>

      <div>
        <div className="menu-heading" onClick={() => toggleMenu("course")} style={{ cursor: "pointer", fontWeight: "bold" }}>
          Course
        </div>
        {expandedMenu === "course" && (
          <div className="submenu" style={{ cursor: "pointer" }}>
            {courses.map((course) => (
              <div key={course.course_id}>
                <a onClick={() => toggleSubmenu(course.course_id)}
                  style={{ display: "block", marginLeft: "15px", padding: "5px 0" }}
                  >{course.course_id}</a>
                {expandedSubmenu === course.course_id && (
                  <div className="nested-submenu" style={{ marginLeft: "20px" }}>
                    <a
                      onClick={async () => {
                        try {
                          const instructorId = localStorage.getItem("instructorId");
                          const res = await axios.get(`http://localhost:5000/sidebar/${course.course_id}/${instructorId}/findmaxsem`);
                          const { semester_id } = res.data;
                          navigate(`/course/${course.course_id}/all/${semester_id}/dashboard`);
                        } catch (err) {
                          console.error("Failed to fetch course details", err);
                        }
                      }}
                      style={{ display: "block", marginBottom: "5px" }}
                    >
                      Dashboard
                    </a>
                    <a onClick={() => navigate(`/course/${course.course_id}/student-list`)} style={{ display: "block" }}>
                      Student List
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="sidebar-footer" style={{ marginTop: "auto", paddingTop: "10px", borderTop: "1px solid #ccc" }}>
        <span className="instructor-name">{instructorName}</span>
        <button className="logout-button" onClick={handleLogout} style={{
          background: "none", border: "none", cursor: "pointer", color: "#e9ecef", marginLeft: "10px"
        }}>
          <LogOut size={20} />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
