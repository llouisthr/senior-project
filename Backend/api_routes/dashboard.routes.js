const express = require("express");
const router = express.Router();

router.get("/:courseId/:sectionId/:semesterId/enrollment", (req, res) => {
    const { courseId, sectionId, semesterId } = req.params;
    const query = sectionId === "all"
      ? `SELECT COUNT(*) AS total_students
         FROM class_list cl
         JOIN course_section cs ON cl.course_sect_id = cs.course_sect_id
         WHERE cs.course_id = ? AND cs.semester_id = ?`
      : `SELECT COUNT(*) AS total_students
         FROM class_list cl
         JOIN course_section cs ON cl.course_sect_id = cs.course_sect_id
         WHERE cs.course_id = ? AND cs.section = ? AND cs.semester_id = ?`;
    const params = sectionId === "all"
      ? [courseId, semesterId]
      : [courseId, sectionId, semesterId];
    db.query(query, params, (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results[0]);
    });
  });
  
router.get("/:courseId/:sectionId/:semesterId/attendance", (req, res) => {
    const { courseId, sectionId, semesterId } = req.params;
    const query = `
      SELECT a.attendance_week,
             COUNT(*) AS total_attendance_records,
             SUM(CASE WHEN a.attendance_status = 'present' THEN 1 ELSE 0 END) AS total_present,
             SUM(CASE WHEN a.attendance_status = 'absent' THEN 1 ELSE 0 END) AS total_absent,
             SUM(CASE WHEN a.attendance_status = 'late' THEN 1 ELSE 0 END) AS total_late,
             SUM(CASE WHEN a.attendance_status IN ('present', 'late') THEN 1 ELSE 0 END) AS total_participated
      FROM attendance a
      JOIN class_list cl ON a.class_list_id = cl.class_list_id
      JOIN course_section cs ON cl.course_sect_id = cs.course_sect_id
      WHERE cs.course_id = ? AND cs.semester_id = ?
      ${sectionId !== "all" ? "AND cs.section = ?" : ""}
      GROUP BY a.attendance_week
      ORDER BY a.attendance_week
    `;
    const params = sectionId !== "all" ? [courseId, semesterId, sectionId] : [courseId, semesterId];
    db.query(query, params, (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
});

router.get("/:courseId/:sectionId/:semesterId/submissions", (req, res) => {
    const { courseId, sectionId, semesterId } = req.params;
    const query = `
      SELECT ai.assess_item_name AS assignment,
             SUM(CASE WHEN sub.submit_date IS NULL THEN 1 ELSE 0 END) AS nosub,
             SUM(CASE WHEN sub.submit_date IS NOT NULL AND sub.submit_date <= sub.due_date THEN 1 ELSE 0 END) AS onTime,
             SUM(CASE WHEN sub.submit_date IS NOT NULL AND sub.submit_date > sub.due_date THEN 1 ELSE 0 END) AS late
      FROM assignment_submit sub
      JOIN assessment_item ai ON sub.assess_item_id = ai.assess_item_id
      JOIN class_list cl ON sub.class_list_id = cl.class_list_id
      JOIN course_section cs ON cl.course_sect_id = cs.course_sect_id
      WHERE cs.course_id = ? AND cs.semester_id = ?
      ${sectionId !== "all" ? "AND cs.section = ?" : ""}
      GROUP BY ai.assess_item_name
    `;
    const params = sectionId !== "all" ? [courseId, semesterId, sectionId] : [courseId, semesterId];
    db.query(query, params, (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
});

router.get("/:courseId/:sectionId/:semesterId/raw-scores", (req, res) => {
    const { courseId, sectionId, semesterId } = req.params;
    const query = `
      WITH StudentTotalScores AS (
        SELECT cs.course_id, cs.semester_id, cs.section,
               SUM((CAST(asb.score AS DECIMAL) * ai.weight) * ass.weight) AS total_score
        FROM class_list cl
        JOIN course_section cs ON cl.course_sect_id = cs.course_sect_id
        JOIN assignment_submit asb ON cl.class_list_id = asb.class_list_id
        JOIN assessment_item ai ON asb.assess_item_id = ai.assess_item_id
        JOIN assessment ass ON ai.assessment_id = ass.assessment_id
        WHERE cs.course_id = ? AND cs.semester_id = ?
        ${sectionId !== "all" ? "AND cs.section = ?" : ""}
        GROUP BY cl.student_id, cs.course_id, cs.semester_id, cs.section
      )
      SELECT course_id, semester_id, section,
             SUM(CASE WHEN total_score BETWEEN 0 AND 20 THEN 1 ELSE 0 END) AS range_0_20,
             SUM(CASE WHEN total_score BETWEEN 21 AND 40 THEN 1 ELSE 0 END) AS range_21_40,
             SUM(CASE WHEN total_score BETWEEN 41 AND 60 THEN 1 ELSE 0 END) AS range_41_60,
             SUM(CASE WHEN total_score BETWEEN 61 AND 80 THEN 1 ELSE 0 END) AS range_61_80,
             SUM(CASE WHEN total_score BETWEEN 81 AND 100 THEN 1 ELSE 0 END) AS range_81_100
      FROM StudentTotalScores
      GROUP BY course_id, semester_id, section
    `;
    const params = sectionId !== "all" ? [courseId, semesterId, sectionId] : [courseId, semesterId];
    db.query(query, params, (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results[0]);
    });
});

router.get("/:courseId/:sectionId/:semesterId/raw-stats", (req, res) => {
    const { courseId, sectionId, semesterId } = req.params;
    const query = `
      WITH RankedScores AS (
        SELECT cs.course_id, cs.semester_id, cs.section,
               CAST(asb.score AS DECIMAL) AS score,
               ROW_NUMBER() OVER (PARTITION BY cs.course_id, cs.semester_id, cs.section ORDER BY CAST(asb.score AS DECIMAL)) AS row_num,
               COUNT(*) OVER (PARTITION BY cs.course_id, cs.semester_id, cs.section) AS total_count
        FROM class_list cl
        JOIN course_section cs ON cl.course_sect_id = cs.course_sect_id
        JOIN assignment_submit asb ON cl.class_list_id = asb.class_list_id
        WHERE cs.course_id = ? AND cs.semester_id = ?
        ${sectionId !== "all" ? "AND cs.section = ?" : ""}
      )
      SELECT course_id, semester_id, section,
             MAX(score) AS max_score,
             AVG(score) AS mean_score,
             (
               SELECT score
               FROM RankedScores r2
               WHERE r2.row_num = CEIL(r2.total_count / 2.0)
                 AND r2.course_id = r1.course_id
                 AND r2.semester_id = r1.semester_id
                 AND r2.section = r1.section
             ) AS median_score
      FROM RankedScores r1
      GROUP BY course_id, semester_id, section
    `;
    const params = sectionId !== "all" ? [courseId, semesterId, sectionId] : [courseId, semesterId];
    db.query(query, params, (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results[0]);
    });
});

router.get("/:courseId/:sectionId/:semesterId/at-risk", (req, res) => {
    const { courseId, sectionId, semesterId } = req.params;
    const query = `
      SELECT COUNT(*) AS riskStudents,
             GROUP_CONCAT(CONCAT(s.fname, ' ', s.lname)) AS atRiskStudentsName
      FROM class_list cl
      JOIN student s ON cl.student_id = s.student_id
      JOIN course_section cs ON cl.course_sect_id = cs.course_sect_id
      WHERE cs.course_id = ? AND cs.semester_id = ? AND cl.at_risk_status != 'normal'
      ${sectionId !== "all" ? "AND cs.section = ?" : ""}
    `;
    const params = sectionId !== "all" ? [courseId, semesterId, sectionId] : [courseId, semesterId];
    db.query(query, params, (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        riskStudents: results[0].riskStudents || 0,
        atRiskStudentsName: results[0].atRiskStudentsName?.split(",") || []
      });
    });
});

router.get("/:courseId/:sectionId/:semesterId/low-scoring-quizzes", (req, res) => {
    const { courseId, sectionId, semesterId } = req.params;
    const query = `
      SELECT ai.assess_item_name,
             COUNT(*) AS lowScores
      FROM assignment_submit sub
      JOIN class_list cl ON sub.class_list_id = cl.class_list_id
      JOIN assessment_item ai ON sub.assess_item_id = ai.assess_item_id
      JOIN course_section cs ON cl.course_sect_id = cs.course_sect_id
      WHERE cs.course_id = ? AND cs.semester_id = ? AND CAST(sub.score AS UNSIGNED) < 50
      ${sectionId !== "all" ? "AND cs.section = ?" : ""}
      GROUP BY ai.assess_item_name
      ORDER BY lowScores DESC
    `;
    const params = sectionId !== "all" ? [courseId, semesterId, sectionId] : [courseId, semesterId];
    db.query(query, params, (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ lowScoringQuizzes: results });
    });
});

router.get("/:courseId/:sectionId/:semesterId/engagement", (req, res) => {
    const { courseId, sectionId, semesterId } = req.params;
    const query = `
      SELECT ROUND(
        100.0 * COUNT(CASE WHEN A.attendance_status = 'present' THEN 1 END) /
        NULLIF(COUNT(A.attendance_id), 0), 2
      ) AS engagement
      FROM class_list cl
      LEFT JOIN attendance A ON cl.class_list_id = A.class_list_id
      JOIN course_section cs ON cl.course_sect_id = cs.course_sect_id
      WHERE cs.course_id = ? AND cs.semester_id = ?
      ${sectionId !== "all" ? "AND cs.section = ?" : ""}
    `;
    const params = sectionId !== "all" ? [courseId, semesterId, sectionId] : [courseId, semesterId];
    db.query(query, params, (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results[0] || { engagement: 0 });
    });
});

module.exports = router;