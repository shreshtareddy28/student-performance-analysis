import Student from "../models/Student.js";

export const addStudent = async (req, res) => {
  try {
    const { name, rollNumber, class: studentClass, branch, attendancePercentage, user_id } = req.body;

    const student = await Student.create({
      user_id,
      name,
      rollNumber,
      class: studentClass,
      branch: branch || 'CSE',
      attendancePercentage: attendancePercentage || 100,
    });
    res.status(201).json({ message: "Student added successfully", student });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding student", error: error.message });
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
    const students = await Student.find();
    res.status(200).json({ students });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching students", error: error.message });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json({ student });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching student", error: error.message });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, rollNumber, class: studentClass, branch, attendancePercentage } = req.body;

    const student = await Student.findByIdAndUpdate(
      id,
      { name, rollNumber, class: studentClass, branch, attendancePercentage },
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
    const { id } = req.params;
    const student = await Student.findByIdAndDelete(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting student", error: error.message });
  }
};