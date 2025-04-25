const express = require('express');
const router = express.Router();

router.get('/:studentId/:courseId/:sectionId/:semester/current-course', async (req, res) => {
  const { studentId, courseId, sectionId, semester } = req.params;

  try {
    const [studentInfo] = await db.promise().query(
      `SELECT s.student_id, s.fname, s.lname, s.email, s.advisor, s.staff
       FROM student s 
       LEFT JOIN instructor i ON s.advisor = i.instructor_id 
       WHERE s.student_id = ?`, [studentId]
    );

    let quizQuery = `
      SELECT ai.assess_item_name, sub.score
      FROM assessment_item ai
      JOIN assignment_submit sub ON ai.assess_item_id = sub.assess_item_id
      JOIN class_list cl ON cl.class_list_id = sub.class_list_id
      JOIN assessment a ON ai.assessment_id = a.assessment_id
      JOIN course_section cs ON cl.course_sect_id = cs.course_sect_id
      WHERE cl.student_id = ? AND cs.course_id = ?
      ${sectionId !== "all" ? "AND cs.section = ?" : ""}
      AND cs.semester_id = ?
    `;
    const quizParams = sectionId !== "all"
      ? [studentId, courseId, sectionId, semester]
      : [studentId, courseId, semester];

    const [quizScores] = await db.promise().query(quizQuery, quizParams);

    const [missingAssignments] = await db.promise().query(`
      SELECT ai.assess_item_name
      FROM assessment_item ai
      JOIN assignment_submit sub ON ai.assess_item_id = sub.assess_item_id
      JOIN class_list cl ON cl.class_list_id = sub.class_list_id
      JOIN assessment a ON ai.assessment_id = a.assessment_id
      WHERE cl.student_id = ? AND a.course_sect_id IN (
        SELECT course_sect_id FROM course_section WHERE course_id = ?
      ) AND sub.submit_date IS NULL
    `, [studentId, courseId]);

    let query = `
      SELECT a.attendance_week, a.attendance_status
      FROM attendance a
      JOIN class_list cl ON cl.class_list_id = a.class_list_id
      JOIN course_section cs ON cl.course_sect_id = cs.course_sect_id
      WHERE cl.student_id = ?
        AND cs.course_id = ?
        ${sectionId !== "all" ? "AND cs.section = ?" : ""}
        AND cs.semester_id = ?
      ORDER BY a.attendance_week ASC
    `;

    const queryParams = sectionId !== "all"
      ? [studentId, courseId, sectionId, semester]
      : [studentId, courseId, semester];

    const [attendanceLine] = await db.promise().query(query, queryParams);

    const currentScoreParams = sectionId !== "all"
  ? [studentId, courseId, sectionId, semester]
  : [studentId, courseId, semester];

    const [currentScoreResult] = await db.promise().query(`
      SELECT ROUND(SUM(weighted_score), 2) AS current_score
      FROM (
        SELECT ((sub.score / ai.max_score) * ai.weight) * a.weight * 100 AS weighted_score
        FROM assignment_submit sub
        JOIN assessment_item ai ON sub.assess_item_id = ai.assess_item_id
        JOIN assessment a ON ai.assessment_id = a.assessment_id
        JOIN class_list cl ON cl.class_list_id = sub.class_list_id
        JOIN course_section cs ON cl.course_sect_id = cs.course_sect_id
        WHERE cl.student_id = ? AND cs.course_id = ?
        ${sectionId !== "all" ? "AND cs.section = ?" : ""}
        AND cs.semester_id = ?
      ) AS subquery
    `, currentScoreParams);
    const currentScore = currentScoreResult[0]?.current_score || 0;

    let avgScoreQuery = `
      WITH StudentScores AS (
        SELECT inner_scores.student_id,
              SUM(inner_scores.weighted_score) AS total_score
        FROM (
          SELECT DISTINCT sub.submit_id, cl.student_id,
                ((sub.score / ai.max_score) * ai.weight) * a.weight * 100 AS weighted_score
          FROM assignment_submit sub
          JOIN assessment_item ai ON sub.assess_item_id = ai.assess_item_id
          JOIN assessment a ON ai.assessment_id = a.assessment_id
          JOIN class_list cl ON cl.class_list_id = sub.class_list_id
          JOIN course_section cs ON cl.course_sect_id = cs.course_sect_id
          WHERE cs.course_id = ?
          ${sectionId !== "all" ? "AND cs.section = ?" : ""}
          AND cs.semester_id = ?
        ) AS inner_scores
        GROUP BY inner_scores.student_id
      )
      SELECT ROUND(AVG(total_score), 2) AS avg_score FROM StudentScores;
    `;

    const avgScoreParams = sectionId !== "all"
      ? [courseId, sectionId, semester]
      : [courseId, semester];

    const [avgScoreResult] = await db.promise().query(avgScoreQuery, avgScoreParams);

    const rawAvg = avgScoreResult[0]?.avg_score;
    const avgScore = isNaN(rawAvg) ? 0 : Number(parseFloat(rawAvg).toFixed(2));

    const [submissionSummary] = await db.promise().query(`
      SELECT 
        SUM(CASE WHEN sub.submit_date IS NOT NULL AND sub.submit_date <= sub.due_date THEN 1 ELSE 0 END) AS on_time,
        SUM(CASE WHEN sub.submit_date IS NOT NULL AND sub.submit_date > sub.due_date THEN 1 ELSE 0 END) AS late,
        SUM(CASE WHEN sub.submit_date IS NULL THEN 1 ELSE 0 END) AS no_submission
      FROM assignment_submit sub
      JOIN class_list cl ON cl.class_list_id = sub.class_list_id
      JOIN assessment_item ai ON ai.assess_item_id = sub.assess_item_id
      JOIN assessment a ON ai.assessment_id = a.assessment_id
      WHERE cl.student_id = ? AND a.course_sect_id IN (
        SELECT course_sect_id FROM course_section WHERE course_id = ?
      )
    `, [studentId, courseId]);
    
    const submission = submissionSummary[0] || {
      on_time: 0,
      late: 0,
      no_submission: 0
    };

    res.json({
      studentInfo: studentInfo[0],
      quizScores,
      missingAssignments,
      attendanceLine,
      currentScore: Number(currentScore),
      avgScore: Number(avgScore.toFixed(2)),
      submissionSummary: submission
    });

  } catch (err) {
    console.error("Error fetching current course data:", err);
    res.status(500).json({ error: "Failed to load current course data" });
  }
});

module.exports = router;