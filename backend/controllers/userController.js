import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Faculty from "../models/Faculty.js";
import Student from "../models/Student.js";

export const getFaculty = async (_req, res) => {
  try {
    const faculty = await Faculty.find()
      .sort({ createdAt: -1 })
      .populate("user_id", "name email phone status lastLoginAt role");
    res.status(200).json({ faculty });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch faculty" });
  }
};

export const createFaculty = async (req, res) => {
  try {
    const { employeeId, name, department, designation, email, password, phone, expertise } = req.body;

    if (!employeeId || !name || !email || !password) {
      return res.status(400).json({ message: "Employee ID, name, email and password are required" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const existingFaculty = await Faculty.findOne({ employeeId: employeeId.toUpperCase() });
    if (existingFaculty) {
      return res.status(400).json({ message: "Faculty with this employee ID already exists" });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: await bcrypt.hash(password, 10),
      role: "faculty",
      phone: phone || "",
    });

    const faculty = await Faculty.create({
      employeeId: employeeId.toUpperCase(),
      name,
      department: department || "CSE",
      designation: designation || "Faculty",
      expertise: Array.isArray(expertise) ? expertise : [],
      user_id: user._id,
    });

    const populatedFaculty = await Faculty.findById(faculty._id).populate("user_id", "name email phone status role");
    res.status(201).json({ message: "Faculty created successfully", faculty: populatedFaculty });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create faculty" });
  }
};

export const updateFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId, name, department, designation, email, phone, status, expertise } = req.body;
    const faculty = await Faculty.findById(id);

    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    if (employeeId) faculty.employeeId = employeeId.toUpperCase();
    if (name) faculty.name = name;
    if (department) faculty.department = department;
    if (designation) faculty.designation = designation;
    if (expertise !== undefined) faculty.expertise = Array.isArray(expertise) ? expertise : [];
    await faculty.save();

    const user = await User.findById(faculty.user_id);
    if (user) {
      if (name) user.name = name;
      if (email) user.email = email.toLowerCase();
      if (phone !== undefined) user.phone = phone;
      if (status) user.status = status;
      await user.save();
    }

    const updatedFaculty = await Faculty.findById(id).populate("user_id", "name email phone status role lastLoginAt");
    res.status(200).json({ message: "Faculty updated successfully", faculty: updatedFaculty });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update faculty" });
  }
};

export const deleteFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    await Student.updateMany({ advisorFacultyId: faculty._id }, { $set: { advisorFacultyId: null } });
    await Promise.all([User.findByIdAndDelete(faculty.user_id), Faculty.findByIdAndDelete(faculty._id)]);
    res.status(200).json({ message: "Faculty deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete faculty" });
  }
};
