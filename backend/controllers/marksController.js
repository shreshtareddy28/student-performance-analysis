import Marks from "../models/Marks.js";
import Student from "../models/Student.js";

export const addMarks = async (req, res) => {
  try {
    const { studentRollNo, subject, examType, marksObtained, maxMarks, date } = req.body;

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
    if (!['mid1', 'mid2', 'endsem'].includes(examType.toLowerCase())) {
      return res.status(400).json({ message: "Exam type must be 'mid1', 'mid2', or 'endsem'" });
    }

    // Validate marks
    if (marksObtained < 0 || marksObtained > maxMarks) {
      return res.status(400).json({ message: "Marks obtained must be between 0 and max marks" });
    }

    // Check if student exists
    const student = await Student.findOne({ rollNo: studentRollNo.toUpperCase() });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const newMarks = await Marks.create({
      studentRollNo: studentRollNo.toUpperCase(),
      subject: subject.trim(),
      examType: examType.toLowerCase(),
      marksObtained,
      maxMarks,
      date: date || new Date()
    });

    res.status(201).json({ message: "Marks added successfully", marks: newMarks });
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
    const marks = await Marks.find(query).sort({ date: -1 });
    res.status(200).json({ marks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching marks", error: error.message });
  }
};

export const updateMarks = async (req, res) => {
  try {
    const { id } = req.params;
    const { marksObtained, maxMarks, date, examType, subject } = req.body;

    const existingMark = await Marks.findById(id);
    if (!existingMark) {
      return res.status(404).json({ message: "Marks record not found" });
    }

    // Validate examType if provided
    if (examType !== undefined && !['mid1', 'mid2', 'endsem'].includes(examType.toLowerCase())) {
      return res.status(400).json({ message: "Exam type must be 'mid1', 'mid2', or 'endsem'" });
    }

    // Validate marks if provided
    if (marksObtained !== undefined && (marksObtained < 0 || marksObtained > (maxMarks || existingMark.maxMarks))) {
      return res.status(400).json({ message: "Marks obtained must be between 0 and max marks" });
    }

    const updateData = {};
    if (marksObtained !== undefined) updateData.marksObtained = marksObtained;
    if (maxMarks !== undefined) updateData.maxMarks = maxMarks;
    if (date !== undefined) updateData.date = date;
    if (examType !== undefined) updateData.examType = examType.toLowerCase();
    if (subject !== undefined) updateData.subject = subject.trim();

    const updatedMarks = await Marks.findByIdAndUpdate(id, updateData, { new: true });
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
    const marks = await Marks.find({ studentRollNo: student_id.toUpperCase() }).sort({ date: -1 });
    if (!marks || marks.length === 0) {
      return res.status(404).json({ message: "No marks found for this student" });
    }
    res.status(200).json({ marks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching marks", error: error.message });
  }
};