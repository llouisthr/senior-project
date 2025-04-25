const express = require("express");
const router = express.Router();
console.log(process.env.NODE_ENV);
router.get("/:courseId/:sectionId/:semesterId", (req, res) => {
  const { courseId, sectionId, semesterId } = req.params;

  const sql = `
    SELECT 
      s.student_id,
      CONCAT(s.fname, ' ', s.lname) AS student_name,
      cl.at_risk_status,
      (
        SELECT COUNT(*) 
        FROM attendance a2
        WHERE a2.class_list_id = cl.class_list_id
          AND a2.attendance_status IN ('present', 'late')
      ) AS attendance,
      ROUND((
        SELECT SUM(((asub.score / ai.max_score) * ai.weight) * ass.weight)
        FROM assignment_submit asub
        JOIN assessment_item ai ON asub.assess_item_id = ai.assess_item_id
        JOIN assessment ass ON ai.assessment_id = ass.assessment_id
        WHERE asub.class_list_id = cl.class_list_id
      ) * 100, 0) AS total_score,
      (
        SELECT COUNT(*) 
        FROM assignment_submit asub2
        WHERE asub2.class_list_id = cl.class_list_id
          AND asub2.submit_date IS NULL
      ) AS missing_quizzes
    FROM student s
    JOIN class_list cl ON s.student_id = cl.student_id
    JOIN course_section cs ON cl.course_sect_id = cs.course_sect_id
    WHERE cs.course_id = ? AND cs.semester_id = ? ${
      sectionId !== "all" ? "AND cs.section = ?" : ""
    }
    GROUP BY s.student_id, s.fname, s.lname, cl.at_risk_status, cl.class_list_id
  `;

  db.query(sql, [courseId, semesterId, sectionId], (err, results) => {
    if (err) {
      console.error("🔥 SQL ERROR:", err);
      return res.status(500).send("Database error");
    }
    res.json(results);
  });
});

module.exports = router;
