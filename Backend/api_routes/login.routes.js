const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// POST /login
router.post("/", (req, res) => {
  const { instructorId, password } = req.body;

  if (!instructorId || !password) {
    return res.status(400).json({ error: "Instructor ID and password are required" });
  }

  const query = "SELECT * FROM instructor WHERE instructor_id = ?";
  db.query(query, [instructorId], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (result.length === 0) return res.status(401).json({ error: "Invalid ID" });

    const instructor = result[0];
    bcrypt.compare(password, instructor.hashed_password, (err, isMatch) => {
      if (err || !isMatch) return res.status(401).json({ error: "Invalid password" });

      const token = jwt.sign(
        { instructorId: instructor.instructor_id },
        "your_secret_key", // Consider using process.env.JWT_SECRET
        { expiresIn: "1h" }
      );

      res.json({
        message: "Login successful",
        instructorId: instructor.instructor_id,
        token
      });
    });
  });
});

module.exports = router;
