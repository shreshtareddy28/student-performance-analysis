import bcrypt from "bcryptjs";
import Student from "../models/Student.js";
import User from "../models/User.js";
import Faculty from "../models/Faculty.js";
import Marks from "../models/Marks.js";
import Performance from "../models/Performance.js";

const studentPopulate = [
  { path: "user_id", select: "name email phone status role lastLoginAt" },
  { path: "advisorFacultyId", select: "employeeId name department designation" },
];

export const addStudent = async (req, res) => {
  try {
    const {
      name,
      rollNo,
      branch,
      semester,
      section,
      email,
      password,
      attendancePercentage,
      guardianName,
      guardianPhone,
      cgpaTarget,
      interests,
      advisorFacultyId,
    } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const existingStudent = await Student.findOne({ rollNo: rollNo.toUpperCase() });
    if (existingStudent) {
      return res.status(400).json({ message: "Student with this roll number already exists" });
    }

    if (advisorFacultyId) {
      const faculty = await Faculty.findById(advisorFacultyId);
      if (!faculty) {
        return res.status(400).json({ message: "Assigned faculty advisor not found" });
      }
    }

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: await bcrypt.hash(password, 10),
      role: 'student',
      phone: guardianPhone || "",
    });

    const student = await Student.create({
      rollNo: rollNo.toUpperCase(),
      name,
      branch: branch || 'CSE',
      semester: semester || 1,
      section: section || "A",
      user_id: newUser._id,
      attendancePercentage: attendancePercentage || 0,
      guardianName: guardianName || "",
      guardianPhone: guardianPhone || "",
      cgpaTarget: cgpaTarget || 8,
      interests: Array.isArray(interests) ? interests : [],
      advisorFacultyId: advisorFacultyId || null,
    });

    const createdStudent = await Student.findById(student._id).populate(studentPopulate);

    res.status(201).json({
      message: "Student added successfully",
      student: createdStudent,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding student", error: error.message });
  }
};

export const getStudentByRollNo = async (req, res) => {
  try {
    const { rollNo } = req.params;
    const normalizedRollNo = rollNo.toUpperCase();

    if (req.user.role === "student") {
      const myStudent = await Student.findOne({ user_id: req.user.userId });
      if (!myStudent || myStudent.rollNo !== normalizedRollNo) {
        return res.status(403).json({ message: "Forbidden: You can only view your own record" });
      }
    }

    const student = await Student.findOne({ rollNo: normalizedRollNo }).populate(studentPopulate);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const [marks, performance] = await Promise.all([
      Marks.find({ studentRollNo: normalizedRollNo }).sort({ date: -1 }).populate("faculty_id", "name email"),
      Performance.findOne({ studentRollNo: normalizedRollNo }),
    ]);

    res.status(200).json({
      student,
      marks,
      performance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching student", error: error.message });
  }
};

export const getMyStudent = async (req, res) => {
  try {
    const student = await Student.findOne({ user_id: req.user.userId }).populate(studentPopulate);
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
    const students = await Student.find().sort({ createdAt: -1 }).populate(studentPopulate);
    res.status(200).json({ students });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching students", error: error.message });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const { rollNo } = req.params;
    const normalizedRollNo = rollNo.toUpperCase();
    const {
      name,
      branch,
      semester,
      section,
      attendancePercentage,
      guardianName,
      guardianPhone,
      cgpaTarget,
      interests,
      advisorFacultyId,
      email,
      phone,
      status,
    } = req.body;

    const student = await Student.findOne({ rollNo: normalizedRollNo });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (advisorFacultyId) {
      const faculty = await Faculty.findById(advisorFacultyId);
      if (!faculty) {
        return res.status(400).json({ message: "Assigned faculty advisor not found" });
      }
      student.advisorFacultyId = advisorFacultyId;
    }

    if (name) student.name = name;
    if (branch) student.branch = branch;
    if (semester !== undefined) student.semester = Number(semester);
    if (section) student.section = section;
    if (attendancePercentage !== undefined) student.attendancePercentage = Number(attendancePercentage);
    if (guardianName !== undefined) student.guardianName = guardianName;
    if (guardianPhone !== undefined) student.guardianPhone = guardianPhone;
    if (cgpaTarget !== undefined) student.cgpaTarget = Number(cgpaTarget);
    if (interests !== undefined) student.interests = Array.isArray(interests) ? interests : [];
    await student.save();

    const linkedUser = await User.findById(student.user_id);
    if (linkedUser) {
      if (name) linkedUser.name = name;
      if (email) linkedUser.email = email.toLowerCase();
      if (phone !== undefined) linkedUser.phone = phone;
      if (status) linkedUser.status = status;
      await linkedUser.save();
    }

    const updatedStudent = await Student.findOne({ rollNo: normalizedRollNo }).populate(studentPopulate);
    res.status(200).json({ message: "Student updated successfully", student: updatedStudent });
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

    await Promise.all([
      Marks.deleteMany({ studentRollNo: normalizedRollNo }),
      Performance.deleteOne({ studentRollNo: normalizedRollNo }),
      student.user_id ? User.findByIdAndDelete(student.user_id) : Promise.resolve(),
      Student.findOneAndDelete({ rollNo: normalizedRollNo }),
    ]);

    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting student", error: error.message });
  }
};
