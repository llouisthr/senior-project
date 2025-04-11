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

// Sidebar APIs
app.get('/sidebar/:instructorId', (req, res) => {
    const { instructorId } = req.params;
    const query = `
        SELECT DISTINCT 
			concat(i.fname, ' ', i.lname) as Instructor,
            c.course_id, 
            c.course_name 
        FROM Course_Section cs
        JOIN Course c ON cs.course_id = c.course_id
        JOIN instructor i ON i.instructor_id = cs.instructor_id
        WHERE cs.instructor_id = ?;
    `;

    db.query(query, [instructorId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});
//fetching max semester
app.get('/sidebar/:courseId/:instructorId/findmaxsem', (req, res) => {
    const { courseId, instructorId } = req.params;

    const query = `
        SELECT MAX(co.semester_id) AS latest_semester
        FROM Course_Section cs
        JOIN Course_Offering co ON cs.offer_id = co.offer_id
        WHERE cs.course_id = ? AND cs.instructor_id = ?
    `;

    db.query(query, [courseId, instructorId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        const semester_id = result[0].latest_semester;
        res.json({ section: 'all', semester_id });
    });
});

// Dashboard APIs
// 1. Get enrollment count
app.get('/dashboard/:courseId/:sectionId/:semesterId/enrollment', (req, res) => {
    const { courseId, sectionId, semesterId } = req.params;

    const query = sectionId === "all"
        ? `SELECT COUNT(*) AS enrollment FROM Class_List WHERE course_id = ? AND semester_id = ?`
        : `SELECT COUNT(*) AS enrollment FROM Class_List WHERE course_id = ? AND semester_id = ? AND section = ?`;

    const params = sectionId === "all" ? [courseId, semesterId] : [courseId, semesterId, sectionId];

    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results[0]);
    });
});

// 2. Attendance data by week
app.get('/dashboard/:courseId/:sectionId/:semesterId/attendance', (req, res) => {
    const { courseId, sectionId, semesterId } = req.params;
    const query = `
        SELECT A.attendance_week AS week, COUNT(*) AS students
        FROM Attendance A
        JOIN Class_List CL ON A.class_list_id = CL.class_list_id
        WHERE CL.course_id = ? AND CL.semester_id = ?
        ${sectionId !== "all" ? "AND CL.section = ?" : ""}
        GROUP BY A.attendance_week
        ORDER BY A.attendance_week;
    `;
    const params = sectionId !== "all" ? [courseId, semesterId, sectionId] : [courseId, semesterId];

    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 3. Submission breakdown (onTime, late, noSubmission)
app.get('/dashboard/:courseId/:sectionId/:semesterId/submissions', (req, res) => {
    const { courseId, sectionId, semesterId } = req.params;
    const query = `
        SELECT
            assignment.assess_name AS assignment,
            SUM(CASE WHEN submit_date IS NULL THEN 1 ELSE 0 END) AS nosub,
            SUM(CASE WHEN submit_date IS NOT NULL AND submit_date <= due_date THEN 1 ELSE 0 END) AS onTime,
            SUM(CASE WHEN submit_date IS NOT NULL AND submit_date > due_date THEN 1 ELSE 0 END) AS late
        FROM Assignment_Submit sub
        JOIN Class_List cl ON sub.class_list_id = cl.class_list_id
        JOIN Assessment assignment ON sub.assess_id = assignment.assessment_id
        WHERE cl.course_id = ? AND cl.semester_id = ?
        ${sectionId !== "all" ? "AND cl.section = ?" : ""}
        GROUP BY assignment.assess_name;
    `;
    const params = sectionId !== "all" ? [courseId, semesterId, sectionId] : [courseId, semesterId];

    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 4. Raw scores + statistics
app.get('/dashboard/:courseId/:sectionId/:semesterId/raw-scores', (req, res) => {
    const { courseId, sectionId, semesterId } = req.params;
    const query = `
        SELECT CAST(score AS UNSIGNED) AS score
        FROM Assignment_Submit sub
        JOIN Class_List cl ON sub.class_list_id = cl.class_list_id
        WHERE cl.course_id = ? AND cl.semester_id = ?
        ${sectionId !== "all" ? "AND cl.section = ?" : ""};
    `;
    const params = sectionId !== "all" ? [courseId, semesterId, sectionId] : [courseId, semesterId];

    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        const rawScores = results.map(r => r.score);
        rawScores.sort((a, b) => a - b);

        const mean = rawScores.reduce((a, b) => a + b, 0) / rawScores.length;
        const median = rawScores.length % 2 === 0
            ? (rawScores[rawScores.length/2 - 1] + rawScores[rawScores.length/2]) / 2
            : rawScores[Math.floor(rawScores.length/2)];
        const max = Math.max(...rawScores);

        res.json({ rawScores, rawStats: [
            { label: 'Max', value: max },
            { label: 'Mean', value: Math.round(mean) },
            { label: 'Median', value: Math.round(median) }
        ] });
    });
});

// 5. At-risk student list
app.get('/dashboard/:courseId/:sectionId/:semesterId/at-risk', (req, res) => {
    const { courseId, sectionId, semesterId } = req.params;
    const query = `
        SELECT s.student_id, s.fname, s.lname, cl.at_risk_status
        FROM Class_List cl
        JOIN Student s ON cl.student_id = s.student_id
        WHERE cl.course_id = ? AND cl.semester_id = ?
        ${sectionId !== "all" ? "AND cl.section = ?" : ""} AND cl.at_risk_status IN ('severe', 'slightly')
    `;
    const params = sectionId !== "all" ? [courseId, semesterId, sectionId] : [courseId, semesterId];

    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        res.json({
            riskStudents: results.length,
            atRiskStudentsName: results.map(r => ({ id: r.student_id, name: `${r.fname} ${r.lname}` }))
        });
    });
});

// 6. Low Scoring Quizzes (example threshold: score < 50%)
app.get('/dashboard/:courseId/:sectionId/:semesterId/low-scoring-quizzes', (req, res) => {
    const { courseId, sectionId, semesterId } = req.params;
    const query = `
        SELECT ai.assess_item_name, COUNT(*) AS lowScores
        FROM Assignment_Submit sub
        JOIN Class_List cl ON sub.class_list_id = cl.class_list_id
        JOIN Assessment_Item ai ON ai.assess_item_id = sub.assess_id
        WHERE cl.course_id = ? AND cl.semester_id = ?
        ${sectionId !== "all" ? "AND cl.section = ?" : ""} AND CAST(sub.score AS UNSIGNED) < 50
        GROUP BY ai.assess_item_name
        ORDER BY lowScores DESC
        LIMIT 5
    `;
    const params = sectionId !== "all" ? [courseId, semesterId, sectionId] : [courseId, semesterId];

    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        const quizzes = results.map(r => `${r.assess_item_name} → ${r.lowScores}`);
        res.json({ lowScoringQuizzes: quizzes });
    });
});

// 7. Engagement Score (based on attendance + submission weights)
app.get('/dashboard/:courseId/:sectionId/:semesterId/engagement', (req, res) => {
    const { courseId, sectionId, semesterId } = req.params;
    const query = `
        SELECT
            COUNT(CASE WHEN A.attendance_status = 'present' THEN 1 END) AS present,
            COUNT(*) AS totalAttendance,
            SUM(CASE WHEN sub.submit_date IS NOT NULL THEN 1 ELSE 0 END) AS submitted,
            COUNT(sub.submit_id) AS totalSubmits
        FROM Class_List cl
        LEFT JOIN Attendance A ON cl.class_list_id = A.class_list_id
        LEFT JOIN Assignment_Submit sub ON cl.class_list_id = sub.class_list_id
        WHERE cl.course_id = ? AND cl.semester_id = ?
        ${sectionId !== "all" ? "AND cl.section = ?" : ""};
    `;
    const params = sectionId !== "all" ? [courseId, semesterId, sectionId] : [courseId, semesterId];

    db.query(query, params, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        const { present, totalAttendance, submitted, totalSubmits } = result[0];

        const attendanceRatio = totalAttendance ? present / totalAttendance : 0;
        const submissionRatio = totalSubmits ? submitted / totalSubmits : 0;
        const engagement = Math.round((attendanceRatio * 0.6 + submissionRatio * 0.4) * 100);

        res.json({ engagement });
    });
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Successful connection! Server running on port ${PORT}`);
});
