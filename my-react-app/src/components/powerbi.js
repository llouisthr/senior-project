import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./powerbi.css";


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
          <div className="menu-heading" onClick={() => toggleMenu("course")} style={{ cursor: "pointer" }}>Course</div>
          {expandedMenu === "course" && (
            <div className="submenu" style={{ cursor: "pointer" }}>
              {["ITCS209", "ITCS125", "ITLG201"].map((course) => (
                <div key={course}>
                  <a onClick={() => toggleSubmenu(course)}>{course}</a>
                  {expandedSubmenu === course && (
                    <div className="nested-submenu">
                      <a onClick={() => navigate(`/${course.toLowerCase()}/dashboard`)} style={{ cursor: "pointer" }}>Dashboard</a>
                      <a onClick={() => navigate(`/${course.toLowerCase()}/student-list`)} style={{ cursor: "pointer" }}>Student List</a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <div className="menu-heading" onClick={() => navigate("/powerbi")} style={{ cursor: "pointer" }}>Power BI</div>
        </div>
      </div>

          

      {/* Main Content */}
      <div className="main-content">
        <h3>Power BI</h3>
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
      </div>
    </div>
  );
};

export default Home;
