import React, { useEffect, useState } from "react";
import axios from "axios";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import "./StudentProfile.css";

const COLORS = ["#82ca9d", "#8884d8", "#ffc658"];

function StudentProfile({ studentId }) {
  const [info, setInfo] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [skillsData, setSkillsData] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const base = `http://localhost:3001/api/student/${studentId}`;
        const [infoRes, activityRes, skillsRes, subRes, attRes] = await Promise.all([
          axios.get(`${base}/info`),
          axios.get(`${base}/activity`),
          axios.get(`${base}/skills`),
          axios.get(`${base}/submissions`),
          axios.get(`${base}/attendance`)
        ]);

        setInfo(infoRes.data);
        setActivityData(activityRes.data);
        setSkillsData(skillsRes.data);
        setSubmissions(subRes.data);
        setAttendance(attRes.data);
      } catch (error) {
        console.error("Failed to fetch student profile data:", error);
      }
    }

    if (studentId) fetchData();
  }, [studentId]);

  return (
    <div className="student-profile">
      <h2>Student Profile</h2>
      {info && (
        <div className="info-box">
          <p><strong>Name:</strong> {info.name}</p>
          <p><strong>Email:</strong> {info.email}</p>
          <p><strong>Advisor:</strong> {info.advisor}</p>
          <p><strong>Staff:</strong> {info.staff}</p>
        </div>
      )}

      <div className="charts-row">
        <div className="radar-chart-box">
          <h3>Literacy Skills</h3>
          <RadarChart outerRadius={90} width={300} height={250} data={activityData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="label" />
            <PolarRadiusAxis angle={30} domain={[0, 10]} />
            <Radar name="Score" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
          </RadarChart>
        </div>

        <div className="radar-chart-box">
          <h3>Soft Skills</h3>
          <RadarChart outerRadius={90} width={300} height={250} data={skillsData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="label" />
            <PolarRadiusAxis angle={30} domain={[0, 10]} />
            <Radar name="Score" dataKey="value" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
          </RadarChart>
        </div>
      </div>

      <div className="charts-row">
        <div className="donut-chart-box">
          <h3>Assignment Submissions</h3>
          <PieChart width={300} height={250}>
            <Pie
              data={submissions}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}`}
            >
              {submissions.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>

        <div className="donut-chart-box">
          <h3>Attendance Record</h3>
          <PieChart width={300} height={250}>
            <Pie
              data={attendance}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#82ca9d"
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}`}
            >
              {attendance.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      </div>
    </div>
  );
}

export default StudentProfile;