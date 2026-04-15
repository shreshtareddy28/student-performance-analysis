import mongoose from "mongoose";

const performanceSchema = new mongoose.Schema(
  {
    studentRollNo: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    totalObtained: {
      type: Number,
      required: true,
      min: 0,
    },
    totalMax: {
      type: Number,
      required: true,
      min: 1,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    grade: {
      type: String,
      required: true,
      enum: ["A+", "A", "B", "C", "D", "F"],
    },
    subjectWise: [
      {
        subject: { type: String, required: true },
        obtained: { type: Number, required: true },
        max: { type: Number, required: true },
        percentage: { type: Number, required: true, min: 0, max: 100 },
        strength: { type: String, enum: ["Strong", "Average", "Weak"] },
        trend: { type: String, enum: ["improving", "stable", "declining"] },
        focusArea: { type: String, default: "" },
      },
    ],
    semesterWise: [
      {
        semester: { type: Number, required: true },
        obtained: { type: Number, required: true },
        max: { type: Number, required: true },
        percentage: { type: Number, required: true, min: 0, max: 100 },
        suggestions: { type: String, default: "" },
      },
    ],
    consistencyScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    riskLevel: {
      type: String,
      required: true,
      enum: ["Low", "Moderate", "High", "Critical"],
    },
    attendanceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    improvementIndex: {
      type: Number,
      default: 0,
    },
    rank: {
      type: Number,
      min: 1,
    },
    percentile: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    interventionPriority: {
      type: String,
      enum: ["Monitor", "Support", "Urgent"],
      default: "Monitor",
    },
    prediction: {
      nextScore: { type: Number, min: 0, max: 100 },
      confidence: { type: Number, min: 0, max: 100 },
    },
    badges: [
      {
        type: String,
      },
    ],
    recommendations: [
      {
        type: String,
        required: true,
      },
    ],
    studyPlan: [
      {
        title: { type: String, required: true },
        action: { type: String, required: true },
      },
    ],
    lastCalculated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Performance", performanceSchema);
