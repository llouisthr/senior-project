require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

db.connect((err) => {
  if (err) {
    console.error("Database connection error:", err.stack);
    process.exit(1);
  }
  console.log("Connected to MySQL database");
});

// Expose db globally
global.db = db;

// Modular routes
const loginRoutes = require("./api_routes/login.routes");
const dashboardRoutes = require("./api_routes/dashboard.routes");
const sidebarRoutes = require("./api_routes/sidebar.routes");
const studentListRoutes = require("./api_routes/studentList.routes");
const studentProfileRoutes = require("./api_routes/studentProfile.routes");

app.use("/login", loginRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/sidebar", sidebarRoutes);
app.use("/studentList", studentListRoutes);
app.use("/studentProfile", studentProfileRoutes);

// Root test
app.get("/", (req, res) => {
  res.send("API server is running");
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
