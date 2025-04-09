require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

// Configure CORS with specific options
app.use(cors({
    origin: 'http://localhost:3000',  // Your frontend URL
    credentials: true,                // Allow credentials
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());    // Enable JSON body parsing

// MySQL Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to MySQL database');
});

//API Handling login
app.post("/login", (req, res) => {
    const { instructorId, password } = req.body; 

    console.log("Received login attempt:", { instructorId, password }); // Debug

    if (!instructorId || !password) {
        return res.status(400).json({ error: "Instructor ID and password are required" });
    }

    const query = "SELECT * FROM instructor WHERE instructor_id = ?";
    db.query(query, [instructorId], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error" });
        }
        
        if (result.length === 0) {
            console.log("No instructor found with ID:", instructorId);
            return res.status(401).json({ error: "Invalid ID" });
        }

        const instructor = result[0];
        console.log("Found instructor:", instructor);

        bcrypt.compare(password, instructor.hashed_password, (err, isMatch) => {
            if (err) {
                console.error("Password comparison error:", err);
                return res.status(500).json({ error: "Error comparing passwords" });
            }
            
            if (!isMatch) {
                console.log("Password mismatch for instructor:", instructorId);
                return res.status(401).json({ error: "Invalid password" });
            }

            const token = jwt.sign(
                { instructorId: instructor.instructor_id },
                "your_secret_key",
                { expiresIn: "1h" }
            );

            console.log("Login successful for instructor:", instructorId);
            res.json({
                message: "Login successful",
                instructorId: instructor.instructor_id,
                token
            });
        });
    });
});

// API Route Example: Fetch total student in a course, section, semester
app.get('/course/:courseId/:sectionId/:semesterId/dashboard/enroll', (req, res) => {
    const { courseId, sectionId, semesterId } = req.params;

    let query;
    let queryParams;

    if (sectionId === "all") {
        query = `
            SELECT COUNT(student_id) AS total 
            FROM Course_Section 
            WHERE course_id = ? AND semester_id = ?
        `;
        queryParams = [courseId, semesterId];
    } else {
        query = `
            SELECT COUNT(student_id) AS total 
            FROM Course_Section 
            WHERE course_id = ? AND section = ? AND semester_id = ?
        `;
        queryParams = [courseId, sectionId, semesterId];
    }

    db.query(query, queryParams, (err, results) => {
        if (err) {
            console.error("Error fetching enrollment count:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results[0]);
    });
});

// API to get instructor details
app.get('/instructor/:instructorId', (req, res) => {
    const { instructorId } = req.params;
    const query = "SELECT fname FROM instructor WHERE instructor_id = ?";
    
    db.query(query, [instructorId], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ instructorName: result[0].fname });
    });
});

// server.js or routes/instructor.js
app.get("/home/:instructorId/courses", (req, res) => {
    const { instructorId } = req.params;
    const query = `
    SELECT DISTINCT 
        cs.course_id,
        c.course_name,
        c.credit,
        cs.section,
        co.semester_id,
        co.grade_type,
        CONCAT(inst.fname, ' ', inst.lname) AS Instructor
    FROM Course_Section cs
    JOIN Course c ON cs.course_id = c.course_id
    JOIN Course_Offering co ON cs.offer_id = co.offer_id
    JOIN Instructor inst ON cs.instructor_id = inst.instructor_id
    WHERE cs.instructor_id = ?;
    `;

    db.query(query, [instructorId], (err, results) => {
        if (err) {
            console.error("Error fetching instructor courses:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Successful connection! Server running on port ${PORT}`);
});
