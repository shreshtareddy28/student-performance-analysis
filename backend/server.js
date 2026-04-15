// server.js

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import {connectDB} from "./config/db.js";
import studentRoutes from "./routes/studentRoutes.js";
import marksRoutes from "./routes/marksRoutes.js";
import analysisRoutes from "./routes/analysisRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

// Load env variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/students", studentRoutes);
app.use("/api/marks", marksRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Test route (optional)
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Error Middleware (should be last)
import errorMiddleware from "./middleware/errorMiddleware.js";
app.use(errorMiddleware);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
