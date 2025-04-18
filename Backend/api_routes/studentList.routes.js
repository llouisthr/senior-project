const express = require("express");
const router = express.Router();

router.get('/:courseId', (req, res) => {
    const { courseId } = req.params;
  
    const sql = `
      SELECT 
        DISTINCT s.student_id,
        CONCAT(s.fname, ' ', s.lname) AS student_name,
        cl.at_risk_status,
        ROUND(SUM(CASE WHEN a.attendance_status = 'present' THEN 1 ELSE 0 END) / 9, 0) AS attendance,
        ROUND(AVG(asub.score), 0) AS average_score,
        COUNT(CASE WHEN asub.submit_date IS NULL THEN 1 END) AS missing_quizzes
      FROM student s
      JOIN class_list cl ON s.student_id = cl.student_id
      JOIN course_section cs ON cl.course_sect_id = cs.course_sect_id
      LEFT JOIN attendance a ON cl.class_list_id = a.class_list_id
      LEFT JOIN assignment_submit asub ON cl.class_list_id = asub.class_list_id
      WHERE cs.course_id = ?
        AND cs.semester_id = (
          SELECT MAX(semester_id)
          FROM course_section
          WHERE course_id = ?
        )
      GROUP BY s.student_id, cl.at_risk_status, s.fname, s.lname
    `;
  
    db.query(sql, [courseId, courseId], (err, results) => {
      if (err) {
        console.error("🔥 SQL ERROR:", err);
        return res.status(500).send("Database error");
      }
      res.json(results);
    });
  });
  

module.exports = router;
