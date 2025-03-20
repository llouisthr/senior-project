import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

import oopImage from "./java.png";
import statsImage from "./stat.png";
import readingImage from "./read.png";


const courses = [
  {
    title: "ITCS209_Object Oriented Programming",
    description: "The course will involve problem solving, designing algorithms, and developing programs in the Java language",
    image: oopImage, // Replace with actual image URL
    route: "/itcs209/dashboard",
  },
  {
    title: "ITCS125_Applied Statistics For Computing",
    description: "Applying statistical techniques for solving computing problem using statistical packages.",
    image: statsImage, // Replace with actual image URL
    route: "/itcs125/dashboard"
  },
  {
    title: "ITLG201_Reading Skills",
    description: "Reading Skills is an EAP course that aims to improve students’ abilities to analyze English readings within a learning environment that utilizes the five areas of language acquisition in order to enable MUICT students to be more effective readers, writers, and researchers (CEFR B1). ",
    image: readingImage, // Replace with actual image URL
    route: "/itlg201/dashboard"
  },
];

const Home = () => {
  const navigate = useNavigate();
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [expandedSubmenu, setExpandedSubmenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("name");

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
          {expandedMenu === "course" && (
            <div className="submenu" style={{ cursor: "pointer" }}>
              {["ITCS209", "ITCS125", "ITLG201"].map((course) => (
                <div key={course}>
                  <a onClick={() => toggleSubmenu(course)}>{course}</a>
                  {expandedSubmenu === course && (
                    <div className="nested-submenu" style={{ marginLeft: "20px", cursor: "pointer" }}>
                      <a onClick={() => navigate(`/${course.toLowerCase()}/dashboard`)} style={{ display: "block", marginBottom: "5px" }}>
                        Dashboard
                      </a>
                      <a onClick={() => navigate(`/${course.toLowerCase()}/student-list`)} style={{ display: "block" }}>
                        Student List
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
        <div className="courses">
          {courses.map((course, index) => (
            <div
              key={index}
              className={`course-card ${course.route ? "clickable" : ""}`}
              onClick={() => course.route && navigate(course.route)} // Navigate if route exists
              style={{ cursor: "pointer" }}>
              <img src={course.image} alt={course.title} />
              <h4>{course.title}</h4>
              <p>{course.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
