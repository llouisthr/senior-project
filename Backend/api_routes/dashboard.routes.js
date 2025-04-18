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
      AND ai.assess_item_name NOT LIKE '%Midterm%'
      AND ai.assess_item_name NOT LIKE '%Final%'
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
             cl.student_id,
             SUM(((asb.score / ai.max_score) * ai.weight) * ass.weight * 100) AS total_score
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

  const isAllSections = sectionId === "all";

  const singleSectionQuery = `
    WITH StudentTotalScores AS (
      SELECT cl.student_id,
             SUM(((asb.score / ai.max_score) * ai.weight) * ass.weight * 100) AS total_score
      FROM class_list cl
      JOIN course_section cs ON cl.course_sect_id = cs.course_sect_id
      JOIN assignment_submit asb ON cl.class_list_id = asb.class_list_id
      JOIN assessment_item ai ON asb.assess_item_id = ai.assess_item_id
      JOIN assessment ass ON ai.assessment_id = ass.assessment_id
      WHERE cs.course_id = ? AND cs.semester_id = ? AND cs.section = ?
      GROUP BY cl.student_id
    ),
    Ranked AS (
      SELECT total_score,
             ROW_NUMBER() OVER (ORDER BY total_score) AS row_num,
             COUNT(*) OVER () AS total_count
      FROM StudentTotalScores
    )
    SELECT 
      MAX(total_score) AS max_score,
      AVG(total_score) AS mean_score,
      AVG(CASE
        WHEN total_count % 2 = 1 AND row_num = FLOOR((total_count + 1) / 2) THEN total_score
        WHEN total_count % 2 = 0 AND row_num IN (total_count / 2, total_count / 2 + 1) THEN total_score
      END) AS median_score
    FROM Ranked;
  `;

  const allSectionQuery = `
    WITH StudentTotalScores AS (
      SELECT cs.section,
             cl.student_id,
             SUM(((asb.score / ai.max_score) * ai.weight) * ass.weight * 100) AS total_score
      FROM class_list cl
      JOIN course_section cs ON cl.course_sect_id = cs.course_sect_id
      JOIN assignment_submit asb ON cl.class_list_id = asb.class_list_id
      JOIN assessment_item ai ON asb.assess_item_id = ai.assess_item_id
      JOIN assessment ass ON ai.assessment_id = ass.assessment_id
      WHERE cs.course_id = ? AND cs.semester_id = ?
      GROUP BY cs.section, cl.student_id
    ),
    SectionStats AS (
      SELECT section,
             MAX(total_score) AS max_score,
             AVG(total_score) AS mean_score,
             (
               SELECT AVG(score) FROM (
                 SELECT s.total_score AS score,
                        ROW_NUMBER() OVER (ORDER BY s.total_score) AS rn,
                        COUNT(*) OVER () AS cnt
                 FROM StudentTotalScores s
                 WHERE s.section = sts.section
               ) ranked
               WHERE 
                 (cnt % 2 = 1 AND rn = FLOOR((cnt + 1) / 2)) OR
                 (cnt % 2 = 0 AND rn IN (cnt / 2, cnt / 2 + 1))
             ) AS median_score
      FROM StudentTotalScores sts
      GROUP BY section
    )
    SELECT 
      ROUND(AVG(max_score), 2) AS max_score,
      ROUND(AVG(mean_score), 2) AS mean_score,
      ROUND(AVG(median_score), 2) AS median_score
    FROM SectionStats;
  `;

  const query = isAllSections ? allSectionQuery : singleSectionQuery;
  const params = isAllSections
    ? [courseId, semesterId]
    : [courseId, semesterId, sectionId];

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Error fetching raw score stats:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results[0]); // just return the 1 row of result
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
    SELECT 
    cs.course_id,
    cs.semester_id,
    cs.section,
    ai.assess_item_name, 
    ROUND(AVG(sub.score), 2) AS avg,
    ai.max_score
    FROM 
        assignment_submit sub
    JOIN 
        class_list cl ON sub.class_list_id = cl.class_list_id
    JOIN 
        assessment_item ai ON sub.assess_item_id = ai.assess_item_id
    JOIN 
        course_section cs ON cl.course_sect_id = cs.course_sect_id
    WHERE 
        LOWER(ai.assess_item_name) LIKE '%quiz%' AND cs.course_id = ? AND cs.semester_id = ?
        ${sectionId !== "all" ? "AND cs.section = ?" : ""}
    GROUP BY 
        cs.course_id, cs.semester_id, cs.section, ai.assess_item_name
    HAVING 
        AVG(sub.score) < (MAX(ai.max_score) * 0.5)
    ORDER BY 
    ai.assess_item_name ASC;
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

router.get("/semesters", (req, res) => {
  const query = "SELECT DISTINCT semester_id FROM semester ORDER BY semester_id DESC";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Semester fetch error:", err);
      return res.status(500).json({ error: "Failed to fetch semesters" });
    }
    res.json(results); // returns array of { semester_id }
  });
});

// Fetch available sections for a course and semester
router.get("/:course/:semester/sections", (req, res) => {
  const { course, semester } = req.params;
  const query = `
    SELECT DISTINCT section
    FROM course_section
    WHERE course_id = ? AND semester_id = ?
  `;

  db.query(query, [course, semester], (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch sections" });
    res.json(results.map(r => r.section));
  });
});


module.exports = router;