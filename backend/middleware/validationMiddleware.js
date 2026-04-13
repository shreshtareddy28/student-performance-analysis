// Validation functions for different entities

export const validateStudent = (req, res, next) => {
  const { name, rollNumber, class: studentClass } = req.body;

  if (!name || !rollNumber || !studentClass) {
    return res.status(400).json({ 
      message: "Validation failed", 
      errors: {
        name: !name ? "Name is required" : null,
        rollNumber: !rollNumber ? "Roll number is required" : null,
        class: !studentClass ? "Class is required" : null,
      }
    });
  }

  if (typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ message: "Name must be a non-empty string" });
  }

  if (typeof rollNumber !== 'string' || rollNumber.trim() === '') {
    return res.status(400).json({ message: "Roll number must be a non-empty string" });
  }

  next();
};

export const validateMarks = (req, res, next) => {
  const { student_id, subject, marks } = req.body;

  if (!student_id || !subject || marks === undefined) {
    return res.status(400).json({ 
      message: "Validation failed", 
      errors: {
        student_id: !student_id ? "Student ID is required" : null,
        subject: !subject ? "Subject is required" : null,
        marks: marks === undefined ? "Marks are required" : null,
      }
    });
  }

  if (typeof subject !== 'string' || subject.trim() === '') {
    return res.status(400).json({ message: "Subject must be a non-empty string" });
  }

  if (typeof marks !== 'number' || marks < 0 || marks > 100) {
    return res.status(400).json({ message: "Marks must be a number between 0 and 100" });
  }

  next();
};

export const validatePerformance = (req, res, next) => {
  const { student_id } = req.body;

  if (!student_id) {
    return res.status(400).json({ message: "Student ID is required" });
  }

  next();
};
