import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Student from "../models/Student.js";
import Faculty from "../models/Faculty.js";

const createToken = (user) =>
  jwt.sign(
    { userId: user._id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET || "secretkey",
    { expiresIn: "7d" }
  );

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  status: user.status,
  lastLoginAt: user.lastLoginAt,
});

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const normalizedEmail = email.toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const isFirstUser = (await User.countDocuments()) === 0;
    if (!isFirstUser) {
      return res.status(403).json({
        message: "Self-signup is only available for the first admin account. Ask an admin to create your profile.",
      });
    }

    const newUser = await User.create({
      name,
      email: normalizedEmail,
      password: await bcrypt.hash(password, 10),
      role: "admin",
    });

    res.status(201).json({
      message: "Admin account created successfully",
      user: sanitizeUser(newUser),
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
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.status !== "active") {
      return res.status(403).json({ message: "This account is inactive. Contact admin." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    let profile = null;

    if (user.role === "student") {
      if (!rollno) {
        return res.status(400).json({ message: "Roll number required for student login" });
      }

      profile = await Student.findOne({ user_id: user._id, rollNo: rollno.toUpperCase() });
      if (!profile) {
        return res.status(400).json({ message: "Invalid roll number for this email" });
      }
    }

    if (user.role === "faculty") {
      profile = await Faculty.findOne({ user_id: user._id });
    }

    user.lastLoginAt = new Date();
    await user.save();

    res.status(200).json({
      message: "Login successful",
      token: createToken(user),
      role: user.role,
      user: sanitizeUser(user),
      profile,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let profile = null;
    if (user.role === "student") {
      profile = await Student.findOne({ user_id: user._id }).populate("advisorFacultyId");
    } else if (user.role === "faculty") {
      profile = await Faculty.findOne({ user_id: user._id });
    }

    res.status(200).json({ user, profile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch current user" });
  }
};

export const updateMe = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    await user.save();

    res.status(200).json({ message: "Profile updated", user: sanitizeUser(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};
