import React from "react";
import Sidebar from "./Sidebar"; 
import Timeline from "./Timeline";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";

const skillsData = [
  { skill: "Health", value: 75 },
  { skill: "International", value: 60 },
  { skill: "Social", value: 80 },
  { skill: "Leadership", value: 70 },
  { skill: "Communication", value: 85 },
  { skill: "Creativity", value: 65 },
  { skill: "Critical Thinking", value: 90 },
  { skill: "Digital", value: 78 },
  { skill: "Environmental", value: 55 },
  { skill: "Financial", value: 72 },
];

const assignmentData = [
  { name: "No Submission", value: 18, color: "#f87171" },
  { name: "Late", value: 8, color: "#fbbf24" },
  { name: "On Time", value: 73, color: "#60a5fa" },
];

const attendanceData = [
  { name: "Absent", value: 19, color: "#f87171" },
  { name: "Late", value: 8, color: "#fbbf24" },
  { name: "Present", value: 73, color: "#60a5fa" },
];

const StudentInfo = () => {
  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Breadcrumb Navigation */}
        <nav className="text-blue-600 text-sm mb-4">
          <span>ITLG201 &gt; Student List &gt; u6xxxx02</span>
        </nav>

        {/* Student Information Card */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Student Information</h2>
          <div className="flex">
            {/* Placeholder Profile Picture */}
            <div className="w-20 h-20 bg-gray-300 rounded-full mr-4"></div>
            {/* Student Details */}
            <div>
              <p><strong>Student Name:</strong> G</p>
              <p><strong>ID:</strong> u6xxxx07</p>
              <p><strong>Email:</strong> xx@student.mahidol.ac.th</p>
              <p><strong>Advisor:</strong> Aj. K (aj.k@mahidol.ac.th)</p>
              <p><strong>Staff:</strong> Mr. S (mr.s@mahidol.ac.th)</p>
              <p><strong>Probation:</strong> --</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">ICT Activity</h2>
          <Timeline />
        </div>

        {/* Skills & Performance Section */}
        <div className="grid grid-cols-3 gap-4">
          {/* Skills Chart */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h3 className="text-md font-semibold mb-2">AT Related Skills</h3>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart outerRadius="70%" data={skillsData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Skill Level" dataKey="value" stroke="#3b82f6" fill="#93c5fd" fillOpacity={0.6} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Assignment Submission Chart */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h3 className="text-md font-semibold mb-2">Assignment Submission</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={assignmentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60}>
                  {assignmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Attendance Chart */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h3 className="text-md font-semibold mb-2">Attendance</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={attendanceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60}>
                  {attendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentInfo;
