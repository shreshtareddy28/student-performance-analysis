import Student from "../models/Student.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const addStudent = async (req, res) => {
  try {
    const { name, rollNo, branch, email, password } = req.body;


    // Check if user with email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Check if student with rollNo exists
    const existingStudent = await Student.findOne({ rollNo: rollNo.toUpperCase() });
    if (existingStudent) {
      return res.status(400).json({ message: "Student with this roll number already exists" });
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      email,
      password: hashedPassword,
      role: 'student',
    });

    // Create student
    const student = await Student.create({
      rollNo: rollNo.toUpperCase(),
      name,
      branch: branch || 'CSE',
      user_id: newUser._id,
    });

    res.status(201).json({
      message: "Student added successfully",
      student: {
        rollNo: student.rollNo,
        name: student.name,
        branch: student.branch
      },
      userId: newUser._id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding student", error: error.message });
  }
};

export const getStudentByRollNo = async (req, res) => {
  try {
    const { rollNo } = req.params;
    const student = await Student.findOne({ rollNo: rollNo.toUpperCase() });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Get all marks for this student
    const Marks = (await import("../models/Marks.js")).default;
    const marks = await Marks.find({ studentRollNo: rollNo.toUpperCase() })
      .sort({ date: -1 })
      .populate('studentRollNo', 'name branch');

    res.status(200).json({
      student: {
        rollNo: student.rollNo,
        name: student.name,
        branch: student.branch,
        createdAt: student.createdAt
      },
      marks
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching student", error: error.message });
  }
};

export const getMyStudent = async (req, res) => {
  try {
    const student = await Student.findOne({ user_id: req.user.userId });
    if (!student) {
      return res.status(404).json({ message: "Student record not found" });
    }
    res.status(200).json({ student });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching student", error: error.message });
  }
};

export const getStudents = async (req, res) => {
  try {
    const students = await Student.find().populate('user_id', 'email');
    res.status(200).json({ students });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching students", error: error.message });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const { rollNo } = req.params;
    const { name, branch, attendancePercentage } = req.body;

    // Validate attendance percentage if provided
    if (attendancePercentage !== undefined && (attendancePercentage < 0 || attendancePercentage > 100)) {
      return res.status(400).json({ message: "Attendance percentage must be between 0 and 100" });
    }

    const updateData = { name, branch };
    if (attendancePercentage !== undefined) {
      updateData.attendancePercentage = Number(attendancePercentage);
    }

    const student = await Student.findOneAndUpdate(
      { rollNo: rollNo.toUpperCase() },
      updateData,
      { new: true, runValidators: true }
    );
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json({ message: "Student updated successfully", student });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating student", error: error.message });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const { rollNo } = req.params;
    const normalizedRollNo = rollNo.toUpperCase();

    const student = await Student.findOne({ rollNo: normalizedRollNo });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Remove all marks for this student
    const Marks = (await import("../models/Marks.js")).default;
    await Marks.deleteMany({ studentRollNo: normalizedRollNo });

    // Remove the associated user account if present
    if (student.user_id) {
      await User.findByIdAndDelete(student.user_id);
    }

    await Student.findOneAndDelete({ rollNo: normalizedRollNo });

    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting student", error: error.message });
  }
};