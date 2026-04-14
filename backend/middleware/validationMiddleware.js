export const validateStudent = (req, res, next) => {
  const { name, rollNo, branch } = req.body;

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

  if (branch && !['CSE', 'ECE', 'ME', 'CE', 'EE'].includes(branch)) {
    return res.status(400).json({ message: "Branch must be one of: CSE, ECE, ME, CE, EE" });
  }

  next();
};

export const validateMarks = (req, res, next) => {
  const { studentRollNo, subject, examType, marksObtained, maxMarks } = req.body;

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

  if (!['mid1', 'mid2', 'endsem'].includes(examType.toLowerCase())) {
    return res.status(400).json({ message: "Exam type must be 'mid1', 'mid2', or 'endsem'" });
  }

  if (typeof marksObtained !== 'number' || marksObtained < 0) {
    return res.status(400).json({ message: "Marks obtained must be a non-negative number" });
  }

  if (typeof maxMarks !== 'number' || maxMarks <= 0) {
    return res.status(400).json({ message: "Max marks must be a positive number" });
  }

  if (marksObtained > maxMarks) {
    return res.status(400).json({ message: "Marks obtained cannot exceed max marks" });
  }

  next();
};
