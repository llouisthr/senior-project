const express = require('express');
const router = express.Router();

router.get('/:studentId/:courseId/overview', async (req, res) => {
  const studentId = req.params.studentId;

  try {
    // Fetch student info
    const [studentInfo] = await db.promise().query(
      `SELECT s.student_id, s.fname, s.lname, s.email, s.advisor, s.staff
       FROM student s 
       LEFT JOIN instructor i ON s.advisor = i.instructor_id 
       WHERE s.student_id = ?`, [studentId]
    );

    // If no student info is found
    if (studentInfo.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Fetch activity timeline for the student
    const [activityTimeline] = await db.promise().query(
      `SELECT a.actname, a.date_start 
       FROM activity a
       WHERE a.student_id = ?
       ORDER BY a.date_start`, [studentId]
    );

    // Fetch skills for the student
    const [skills] = await db.promise().query(
      `SELECT skill_name, skill_category, SUM(hour_score) as total_hours 
      FROM activity 
      WHERE student_id = ?
      GROUP BY skill_name, skill_category
      `, [studentId]
    );    

    // Fetch assignment summary for the student
    const [assignmentSummary] = await db.promise().query(
      `SELECT 
         SUM(CASE WHEN s.submit_date IS NOT NULL AND s.submit_date <= s.due_date THEN 1 ELSE 0 END) AS on_time,
         SUM(CASE WHEN s.submit_date IS NOT NULL AND s.submit_date > s.due_date THEN 1 ELSE 0 END) AS late,
         SUM(CASE WHEN s.submit_date IS NULL THEN 1 ELSE 0 END) AS no_submission
       FROM assignment_submit s
       JOIN class_list cl ON s.class_list_id = cl.class_list_id
       WHERE cl.student_id = ?`, [studentId]
    );    

    // Fetch attendance summary for the student
    const [attendanceSummary] = await db.promise().query(
      `SELECT 
         SUM(CASE WHEN a.attendance_status = 'present' THEN 1 ELSE 0 END) AS present,
         SUM(CASE WHEN a.attendance_status = 'late' THEN 1 ELSE 0 END) AS late,
         SUM(CASE WHEN a.attendance_status = 'absent' THEN 1 ELSE 0 END) AS absent
       FROM attendance a
       JOIN class_list cl ON a.class_list_id = cl.class_list_id
       WHERE cl.student_id = ?`, [studentId]
    );    

    // Return the results if everything was successful
    res.json({
      studentInfo: studentInfo[0],
      activityTimeline,
      skills,
      assignmentSummary: assignmentSummary[0],
      attendanceSummary: attendanceSummary[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load student overview' });
  }
});

module.exports = router;
