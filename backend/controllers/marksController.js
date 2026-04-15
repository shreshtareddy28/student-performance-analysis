import Marks from "../models/Marks.js";
import Student from "../models/Student.js";

const marksPopulate = [{ path: "faculty_id", select: "name email role" }];
const validExamTypes = ["mid1", "mid2", "endsem", "quiz", "assignment", "lab"];

export const addMarks = async (req, res) => {
  try {
    const { studentRollNo, subject, examType, marksObtained, maxMarks, date, semester, academicYear } = req.body;
    const normalizedExamType = String(examType || "").toLowerCase();
    const normalizedRollNo = studentRollNo?.toUpperCase();

    // Validate required fields
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

    // Validate exam type
    if (!validExamTypes.includes(normalizedExamType)) {
      return res.status(400).json({ message: "Unsupported exam type" });
    }

    // Validate marks
    if (marksObtained < 0 || marksObtained > maxMarks) {
      return res.status(400).json({ message: "Marks obtained must be between 0 and max marks" });
    }

    // Check if student exists
    const student = await Student.findOne({ rollNo: normalizedRollNo });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const newMarks = await Marks.create({
      studentRollNo: normalizedRollNo,
      subject: subject.trim(),
      examType: normalizedExamType,
      marksObtained: Number(marksObtained),
      maxMarks: Number(maxMarks),
      semester: semester || student.semester || 1,
      academicYear: academicYear || "",
      faculty_id: req.user.userId,
      date: date || new Date()
    });

    const createdMarks = await Marks.findById(newMarks._id).populate(marksPopulate);
    res.status(201).json({ message: "Marks added successfully", marks: createdMarks });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Marks for this student, subject, and exam type already exist" });
    }
    res.status(500).json({ message: "Error adding marks", error: error.message });
  }
};

export const getMarks = async (req, res) => {
  try {
    // Faculty and admin can see all marks; students see only their own
    let query = {};
    if (req.user.role === "student") {
      // Get student rollNo from authenticated user
      const student = await Student.findOne({ user_id: req.user.userId });
      if (!student) {
        return res.status(404).json({ message: "Student record not found" });
      }
      query = { studentRollNo: student.rollNo };
    }
    const marks = await Marks.find(query).sort({ date: -1 }).populate(marksPopulate);
    res.status(200).json({ marks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching marks", error: error.message });
  }
};

export const updateMarks = async (req, res) => {
  try {
    const { id } = req.params;
    const { marksObtained, maxMarks, date, examType, subject, semester, academicYear } = req.body;

    const existingMark = await Marks.findById(id);
    if (!existingMark) {
      return res.status(404).json({ message: "Marks record not found" });
    }

    if (marksObtained !== undefined) existingMark.marksObtained = Number(marksObtained);
    if (maxMarks !== undefined) existingMark.maxMarks = Number(maxMarks);
    if (date !== undefined) existingMark.date = date;
    if (examType !== undefined) {
      const normalizedExamType = examType.toLowerCase();
      if (!validExamTypes.includes(normalizedExamType)) {
        return res.status(400).json({ message: "Unsupported exam type" });
      }
      existingMark.examType = normalizedExamType;
    }
    if (subject !== undefined) existingMark.subject = subject.trim();
    if (semester !== undefined) existingMark.semester = Number(semester);
    if (academicYear !== undefined) existingMark.academicYear = academicYear;
    existingMark.faculty_id = req.user.userId;

    await existingMark.save();
    const updatedMarks = await Marks.findById(id).populate(marksPopulate);
    res.status(200).json({ message: "Marks updated successfully", marks: updatedMarks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating marks", error: error.message });
  }
};

export const deleteMarks = async (req, res) => {
  try {
    const { id } = req.params;
    const existingMark = await Marks.findById(id);
    if (!existingMark) {
      return res.status(404).json({ message: "Marks record not found" });
    }

    await Marks.findByIdAndDelete(id);
    res.status(200).json({ message: "Marks deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting marks", error: error.message });
  }
};

export const getMarksByStudent = async (req, res) => {
  try {
    const { student_id } = req.params;

    // For students, only allow access to their own marks
    if (req.user.role === "student") {
      const student = await Student.findOne({ user_id: req.user.userId });
      if (!student) {
        return res.status(404).json({ message: "Student record not found" });
      }
      // Check if the requested student_id matches the logged-in student's rollNo
      if (student.rollNo !== student_id.toUpperCase()) {
        return res.status(403).json({ message: "Access denied. You can only view your own marks." });
      }
    }

    // Find marks by student roll number
    const marks = await Marks.find({ studentRollNo: student_id.toUpperCase() }).sort({ date: -1 }).populate(marksPopulate);
    res.status(200).json({ marks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching marks", error: error.message });
  }
};
