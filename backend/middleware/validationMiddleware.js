const validDepartments = ["CSE", "ECE", "ME", "CE", "EE", "IT", "AIML", "DS"];
const validExamTypes = ["mid1", "mid2", "endsem", "quiz", "assignment", "lab"];

export const validateStudent = (req, res, next) => {
  const { name, rollNo, branch, email, password, semester } = req.body;

  if (!name || !rollNo) {
    return res.status(400).json({
      message: "Validation failed",
      errors: {
        name: !name ? "Name is required" : null,
        rollNo: !rollNo ? "Roll number is required" : null,
      }
    });
  }

  if (typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ message: "Name must be a non-empty string" });
  }

  if (typeof rollNo !== 'string' || rollNo.trim() === '') {
    return res.status(400).json({ message: "Roll number must be a non-empty string" });
  }

  if (email !== undefined && (!email || typeof email !== "string")) {
    return res.status(400).json({ message: "Email must be a valid string" });
  }

  if (password !== undefined && String(password).trim().length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  if (branch && !validDepartments.includes(branch)) {
    return res.status(400).json({ message: "Branch must be a valid department" });
  }

  if (semester !== undefined && (Number(semester) < 1 || Number(semester) > 8)) {
    return res.status(400).json({ message: "Semester must be between 1 and 8" });
  }

  next();
};

export const validateMarks = (req, res, next) => {
  const { studentRollNo, subject, examType, marksObtained, maxMarks, semester } = req.body;

  if (!studentRollNo || !subject || !examType || marksObtained === undefined || !maxMarks) {
    return res.status(400).json({
      message: "Validation failed",
      errors: {
        studentRollNo: !studentRollNo ? "Student roll number is required" : null,
        subject: !subject ? "Subject is required" : null,
        examType: !examType ? "Exam type is required" : null,
        marksObtained: marksObtained === undefined ? "Marks obtained is required" : null,
        maxMarks: !maxMarks ? "Max marks is required" : null,
      }
    });
  }

  if (typeof subject !== 'string' || subject.trim() === '') {
    return res.status(400).json({ message: "Subject must be a non-empty string" });
  }

  if (!validExamTypes.includes(String(examType).toLowerCase())) {
    return res.status(400).json({ message: "Unsupported exam type" });
  }

  if (Number(marksObtained) < 0 || Number(maxMarks) <= 0 || Number(marksObtained) > Number(maxMarks)) {
    return res.status(400).json({ message: "Marks must be between 0 and max marks" });
  }

  if (semester !== undefined && (Number(semester) < 1 || Number(semester) > 8)) {
    return res.status(400).json({ message: "Semester must be between 1 and 8" });
  }

  next();
};
