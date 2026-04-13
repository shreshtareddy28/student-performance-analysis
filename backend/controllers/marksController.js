import Marks from "../models/Marks.js";
import Student from "../models/Student.js";

export const addMarks = async (req, res) => {
  try {
    const { student_id, subject, marks } = req.body;
    const faculty_id = req.user.userId; // Get faculty ID from authenticated user

    const newMarks = await Marks.create({ student_id, subject, marks, faculty_id });
    res.status(201).json({ message: "Marks added successfully", marks: newMarks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding marks", error: error.message });
  }
};

export const getMarks = async (req, res) => {
  try {
    // Faculty and admin can see all marks; students see only their own
    let query = {};
    if (req.user.role === "student") {
      // Get student_id from authenticated user
      const student = await Student.findOne({ user_id: req.user.userId });
      if (!student) {
        return res.status(404).json({ message: "Student record not found" });
      }
      query = { student_id: student._id };
    }
    const marks = await Marks.find(query).populate("student_id").populate("faculty_id", "email");
    res.status(200).json({ marks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching marks", error: error.message });
  }
};

export const getMarksByStudent = async (req, res) => {
  try {
    const { student_id } = req.params;
    
    // Students can only view their own marks; faculty/admin can view any student
    if (req.user.role === "student") {
      const student = await Student.findOne({ user_id: req.user.userId });
      if (!student) {
        return res.status(404).json({ message: "Student record not found" });
      }
      if (student._id.toString() !== student_id) {
        return res.status(403).json({ message: "Forbidden: You can only view your own marks" });
      }
    }
    
    const marks = await Marks.find({ student_id }).populate("student_id").populate("faculty_id", "email");
    if (marks.length === 0) {
      return res.status(404).json({ message: "No marks found for this student" });
    }
    res.status(200).json({ marks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching marks", error: error.message });
  }
};

export const updateMarks = async (req, res) => {
  try {
    const { id } = req.params;
    const { marks } = req.body;

    const existingMark = await Marks.findById(id);
    if (!existingMark) {
      return res.status(404).json({ message: "Marks record not found" });
    }

    const updatedMarks = await Marks.findByIdAndUpdate(id, { marks }, { new: true });
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