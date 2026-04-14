import mongoose from "mongoose";

const performanceSchema = new mongoose.Schema(
  {
    studentRollNo: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      ref: "Student"
    },
    totalObtained: {
      type: Number,
      required: true,
      min: 0
    },
    totalMax: {
      type: Number,
      required: true,
      min: 1
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    grade: {
      type: String,
      required: true,
      enum: ['A', 'B', 'C', 'F']
    },
    subjectWise: [{
      subject: { type: String, required: true },
      obtained: { type: Number, required: true },
      max: { type: Number, required: true },
      percentage: { type: Number, required: true, min: 0, max: 100 },
      strength: { type: String, enum: ['Strong', 'Average', 'Weak'] },
      trend: { type: String, enum: ['improving', 'stable', 'declining'] }
    }],
    consistencyScore: {
      type: Number,
      min: 0,
      max: 100
    },
    riskLevel: {
      type: String,
      required: true,
      enum: ['Low', 'Medium', 'High']
    },
    rank: {
      type: Number,
      min: 1
    },
    prediction: {
      nextScore: { type: Number, min: 0, max: 100 },
      confidence: { type: Number, min: 0, max: 100 }
    },
    recommendations: [{
      type: String,
      required: true
    }],
    lastCalculated: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default mongoose.model("Performance", performanceSchema);
