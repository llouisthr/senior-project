CREATE DATABASE muict_studentdashboard;

-- 1. Students Table
CREATE TABLE Students (
    student_id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    contact_number VARCHAR(15)
);

-- 2. Skills Table
CREATE TABLE Skills (
    skill_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(10),
    skill_name VARCHAR(100),
    FOREIGN KEY (student_id) REFERENCES Students(student_id)
);

-- 3. ICT Activities Table
CREATE TABLE ICT_Activities (
    activity_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(10),
    activity_name VARCHAR(100),
    FOREIGN KEY (student_id) REFERENCES Students(student_id)
);

-- 4. Activity Transcript Table
CREATE TABLE Activity_Transcript (
    transcript_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(10),
    activity_type VARCHAR(50),
    hours INT,
    FOREIGN KEY (student_id) REFERENCES Students(student_id)
);

-- 5. Century Skills Table
CREATE TABLE Century_Skills (
    skill_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(10),
    skill_type VARCHAR(50),
    hours INT,
    FOREIGN KEY (student_id) REFERENCES Students(student_id)
);

-- 6. Grades Table
CREATE TABLE Grades (
    grade_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(10),
    semester VARCHAR(20),
    gpa DECIMAL(3, 2),
    FOREIGN KEY (student_id) REFERENCES Students(student_id)
);

-- 7. Course Access Table
CREATE TABLE Course_Access (
    access_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(10),
    month VARCHAR(20),
    access_count INT,
    FOREIGN KEY (student_id) REFERENCES Students(student_id)
);

-- 8. Assignment Submissions Table
CREATE TABLE Assignment_Submissions (
    submission_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(10),
    status VARCHAR(20), -- 'On Time' or 'Late'
    count INT,
    FOREIGN KEY (student_id) REFERENCES Students(student_id)
);

-- Inserts Students Table
INSERT INTO Students (student_id, name, email, contact_number)
VALUES ('u6800002', 'Tharich Haeng', 'th123456@gmail.com', '123-456-7890');

-- Inserts Skills
INSERT INTO Skills (student_id, skill_name)
VALUES 
('u6800002', 'Good leadership'),
('u6800002', 'Good communication'),
('u6800002', 'Python'),
('u6800002', 'Java');

-- Insert ICT Activities
INSERT INTO ICT_Activities (student_id, activity_name)
VALUES 
('u6800002', 'Orientation'),
('u6800002', 'Sairahus'),
('u6800002', 'Open House'),
('u6800002', 'Cable Management'),
('u6800002', 'SCB Seminar'),
('u6800002', 'German Internship');

-- Insert Activity Transcript
INSERT INTO Activity_Transcript (student_id, activity_type, hours)
VALUES 
('u6800002', 'Health Literacy', 10),
('u6800002', 'Internationalization', 5),
('u6800002', 'Digital Literacy', 12),
('u6800002', 'Environmental Literacy', 10),
('u6800002', 'Financial Literacy', 8);

-- Insert 21st Century Skills
INSERT INTO Century_Skills (student_id, skill_type, hours)
VALUES 
('u6800002', 'Critical Thinking', 10),
('u6800002', 'Creativity', 9),
('u6800002', 'Communication', 12),
('u6800002', 'Leadership', 13),
('u6800002', 'Social Skills', 8);

-- Insert Grade Trend
INSERT INTO Grades (student_id, semester, gpa)
VALUES 
('u6800002', '1yr 1st Sem', 3.6),
('u6800002', '1yr 2nd Sem', 2.8),
('u6800002', '2yr 1st Sem', 3.9),
('u6800002', '2yr 2nd Sem', 3.7),
('u6800002', '3yr 1st Sem', 3.8),
('u6800002', '3yr 2nd Sem', 4.0);

-- Insert Course Access Frequency
INSERT INTO Course_Access (student_id, month, access_count)
VALUES 
('u6800002', 'January', 10),
('u6800002', 'February', 15),
('u6800002', 'March', 20),
('u6800002', 'April', 22),
('u6800002', 'May', 18),
('u6800002', 'June', 12),
('u6800002', 'July', 25),
('u6800002', 'August', 22),
('u6800002', 'September', 24),
('u6800002', 'October', 23),
('u6800002', 'November', 20),
('u6800002', 'December', 15);

-- Insert Assignment Submission Data
INSERT INTO Assignment_Submissions (student_id, status, count)
VALUES 
('u6800002', 'On Time', 81),
('u6800002', 'Late', 19);
