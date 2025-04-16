const express = require("express");
const router = express.Router();

// 1. Get all courses taught by an instructor
router.get("/:instructorId", (req, res) => {
  const { instructorId } = req.params;
  const query = `
    SELECT DISTINCT
      CONCAT(i.fname, ' ', i.lname) AS Instructor,
      cs.course_id,
      c.course_name
    FROM course_section cs
    JOIN instructor i ON cs.instructor_id = i.instructor_id
    JOIN course c ON cs.course_id = c.course_id
    WHERE cs.instructor_id = ?
  `;
  db.query(query, [instructorId], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// 2. Get the latest semester an instructor taught a specific course
router.get("/:courseId/:instructorId/findmaxsem", (req, res) => {
  const { courseId, instructorId } = req.params;
  const query = `
    SELECT MAX(semester_id) AS semester_id
    FROM course_section
    WHERE course_id = ? AND instructor_id = ?
  `;
  db.query(query, [courseId, instructorId], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0 || results[0].semester_id === null) {
      return res.status(404).json({ error: "No semester found" });
    }
    res.json({ semester_id: results[0].semester_id });
  });
});

// 3. Get all sections an instructor teaches for a course
router.get("/:courseId/:instructorId/findsections", (req, res) => {
  const { courseId, instructorId } = req.params;
  const query = `
    SELECT DISTINCT section
    FROM course_section
    WHERE course_id = ? AND instructor_id = ?
    ORDER BY section
  `;
  db.query(query, [courseId, instructorId], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    const sections = results.map(row => row.section);
    res.json(sections);
  });
});

module.exports = router;
