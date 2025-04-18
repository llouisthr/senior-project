const express = require("express");
const router = express.Router();

// Student info route
router.get("/:studentId", (req, res) => {
  const { studentId } = req.params;
  const query = `
      SELECT student_id, CONCAT(fname, ' ', lname) AS name,
      email, advisor, staff
      FROM student WHERE student_id = ?;
      `;
  db.query(query, [studentId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

// Quizzes route
router.get("/:studentId/:courseId/quizzes", (req, res) => {
  const { studentId, courseId } = req.params;
  const query = `
    SELECT ai.assess_item_name, asub.score
    FROM assignment_submit asub
    JOIN assessment_item ai ON asub.assess_item_id = ai.assess_item_id
    WHERE asub.student_id = ? AND ai.course_id = ? AND ai.assess_item_name LIKE 'Quiz%'
  `;
  db.query(query, [studentId, courseId], (err, quizzes) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(quizzes);
  });
});

// Missing assignments route
router.get("/:studentId/:courseId/missing-assignments", (req, res) => {
  const { studentId, courseId } = req.params;
  const query = `
    SELECT ai.assess_item_name
    FROM assignment_submit asub
    JOIN assessment_item ai ON asub.assess_item_id = ai.assess_item_id
    WHERE asub.student_id = ? AND ai.course_id = ? AND asub.submit_date IS NULL
  `;
  db.query(query, [studentId, courseId], (err, missingAssignments) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(missingAssignments);
  });
});

// Attendance route
router.get("/:studentId/:courseId/attendance", (req, res) => {
  const { studentId, courseId } = req.params;
  const query = `
    SELECT attendance_week, attendance_status
    FROM attendance
    WHERE student_id = ? AND course_id = ?
  `;
  db.query(query, [studentId, courseId], (err, attendance) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(attendance);
  });
});

module.exports = router;