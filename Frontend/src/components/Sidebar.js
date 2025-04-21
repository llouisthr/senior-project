import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { LogOut } from "lucide-react";

const Sidebar = () => {
  const navigate = useNavigate();
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [expandedSubmenus, setExpandedSubmenus] = useState([]);
  const [courses, setCourses] = useState([]);
  const [instructorName, setInstructorName] = useState("");

  const toggleMenu = (menu) => {
    setExpandedMenu(expandedMenu === menu ? null : menu);
  };

  const toggleSubmenu = (submenuId) => {
    if (expandedSubmenus.includes(submenuId)) {
      setExpandedSubmenus(expandedSubmenus.filter((id) => id !== submenuId)); // close
    } else {
      setExpandedSubmenus([...expandedSubmenus, submenuId]); // open
    }
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

    axios
      .get(`http://localhost:5000/sidebar/${instructorId}`)
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
    <div className="sidebar">
      <h2 className="sidebar-title" onClick={() => navigate("/")}>
        MUICT LEARNING
      </h2>

      <div className="menu-heading" onClick={() => toggleMenu("course")}>
        <span className="menu-icon">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13 9L10 12L7 9M19 10C19 5.02944 14.9706 1 10 1C5.02944 1 1 5.02944 1 10C1 14.9706 5.02944 19 10 19C14.9706 19 19 14.9706 19 10Z"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        Course
      </div>

      {expandedMenu === "course" && (
        <div className="submenu">
          {courses.map((course) => (
            <div key={course.course_id}>
              <a onClick={() => toggleSubmenu(course.course_id)}>
                <span className="menu-icon">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13 9L10 12L7 9M19 10C19 5.02944 14.9706 1 10 1C5.02944 1 1 5.02944 1 10C1 14.9706 5.02944 19 10 19C14.9706 19 19 14.9706 19 10Z"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                {course.course_id}
              </a>
              
              {expandedSubmenus.includes(course.course_id) && (
                <div className="nested-submenu">
                  <a
                    className="dashboard-link"
                    onClick={async () => {
                      try {
                        const instructorId =
                          localStorage.getItem("instructorId");
                        const res = await axios.get(
                          `http://localhost:5000/sidebar/${course.course_id}/${instructorId}/findmaxsem`
                        );
                        const { semester_id } = res.data;
                        navigate(
                          `/course/${course.course_id}/all/${semester_id}/dashboard`
                        );
                      } catch (err) {
                        console.error("Failed to fetch course details", err);
                      }
                    }}
                  >
                    Dashboard
                  </a>
                  <a
                    className="studentlist-link"
                    onClick={() =>
                      navigate(`/course/${course.course_id}/student-list`)
                    }
                  >
                    Student List
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="sidebar-footer">
        <span className="instructor-name">{instructorName}</span>
        <button className="logout-button" onClick={handleLogout}>
          <LogOut size={20} />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
