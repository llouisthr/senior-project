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

  const toggleMenu = (menu) => {
    setExpandedMenu(expandedMenu === menu ? null : menu);
  };

  const toggleSubmenu = (submenu) => {
    setExpandedSubmenu(expandedSubmenu === submenu ? null : submenu);
  };

  return (
    <div className="home-wrapper">
      {/* Main Content */}
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
                onClick={async () => {
                  try {
                    const instructorId = localStorage.getItem("instructorId");
                    const res = await axios.get(`http://localhost:5000/sidebar/${course.course_id}/${instructorId}/findmaxsem`);
                    const { semester_id } = res.data;
                    navigate(`/course/${course.course_id}/all/${semester_id}/dashboard`);
                  } catch (err) {
                    console.error("Error fetching course details", err);
                  }
                }}                
                style={{ cursor: "pointer" }}>
                <div className="course-info">{course.course_id} {course.course_name}</div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
};

export default Home;
