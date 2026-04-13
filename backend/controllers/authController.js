import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

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
    const roleLower = role?.toLowerCase();
    const allowedRoles = ["admin", "faculty", "student"];

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userCount = await User.countDocuments();
    let assignedRole = userCount === 0 ? "admin" : "student";
    if (roleLower) {
      if (!allowedRoles.includes(roleLower)) {
        return res.status(400).json({ message: "Invalid role specified" });
      }
      assignedRole = roleLower;
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
    const { email, password } = req.body;

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
