import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Student from "../models/Student.js";

const createToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "secretkey",
    { expiresIn: "7d" }
  );
};

export const signup = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Auto-assign admin role to first user, otherwise default to provided role or 'student'
    const userCount = await User.countDocuments();
    let assignedRole = userCount === 0 ? "admin" : (role?.toLowerCase() || "student");
    
    const allowedRoles = ["admin", "faculty", "student"];
    if (!allowedRoles.includes(assignedRole)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    const newUser = await User.create({
      email,
      password: hashedPassword,
      role: assignedRole,
    });

    res.status(201).json({
      message: "User registered successfully",
      userId: newUser._id,
      role: newUser.role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const createUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const roleLower = role?.toLowerCase();
    const allowedRoles = ["admin", "faculty", "student"];

    if (!email || !password || !roleLower) {
      return res.status(400).json({ message: "Email, password and role are required" });
    }

    if (!allowedRoles.includes(roleLower)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      role: roleLower,
    });

    res.status(201).json({
      message: "User created successfully",
      userId: newUser._id,
      role: newUser.role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, rollno } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // For students, verify rollno
    if (user.role === 'student') {
      if (!rollno) {
        return res.status(400).json({ message: "Roll number required for student login" });
      }
      const student = await Student.findOne({ user_id: user._id, rollNumber: rollno });
      if (!student) {
        return res.status(400).json({ message: "Invalid roll number for this email" });
      }
    }

    const token = createToken(user);

    res.status(200).json({
      message: "Login successful",
      token,
      userId: user._id,
      role: user.role,
      email: user.email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
