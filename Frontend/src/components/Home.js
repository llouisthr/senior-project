import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Home.css";
import { LogOut } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [expandedSubmenu, setExpandedSubmenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("name");
  const [courses, setCourses] = useState([]);
  const [instructorName, setInstructorName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

    setIsLoading(true);
    // Fetch instructor data related to courses
    axios.get(`http://localhost:5000/home/${instructorId}/courses`)
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

  const toggleMenu = (menu) => {
    setExpandedMenu(expandedMenu === menu ? null : menu);
  };

  const toggleSubmenu = (submenu) => {
    setExpandedSubmenu(expandedSubmenu === submenu ? null : submenu);
  };

  return (
    <div className="home-container">
      {/* Sidebar */}
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
                      <a onClick={() => navigate(`/course/${course.course_id.toLowerCase().replace(/\s+/g, "")}/:section/:semester/dashboard`)} style={{ display: "block", marginBottom: "5px" }}>
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

        {/* Instructor Name and Logout Section */}
        <div className="sidebar-footer">
          <span className="instructor-name">{instructorName}</span>
          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <h3>Courses</h3>
        {/* Top Right Search Box */}
        <div className="search-bar">
          <label>Search via Name:</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter course name..."
          />
        </div>
        {/* Registered Courses Box */}
        <div className="registered-courses-box">
          <span>Registered Courses</span>
          <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
            <option value="name">Sort by Name</option>
            <option value="date">Sort by Date</option>
          </select>
        </div>
        
        {isLoading ? (
          <div className="loading-message">Loading courses...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="courses">
            {courses.map((course, index) => (
              <div
                key={index}
                className="course-card clickable"
                onClick={() => navigate(`/${course.course_id.toLowerCase().replace(/\s+/g, "")}/dashboard`)}
                style={{ cursor: "pointer" }}>
                <div className="course-info">{course.course_id} {course.course_name}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
